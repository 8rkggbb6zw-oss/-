// Everdawn — a cozy 3D garden island.
// three.js is loaded by a <script> tag in index.html, so no imports are needed.
// If it's missing for some reason, it gets loaded here automatically.

var toastTimer = 0;
function showToast(message, ms) {
  var box = document.getElementById('toast');
  box.textContent = message;
  box.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { box.classList.remove('show'); }, ms || 1800);
}

// Everdawn is split over two files (script.js, then script2.js), loaded in that order by index.html, because
// CodePen won't save a file bigger than 1 MB. Each file adds its half of the game to EVERDAWN_PARTS, and script2.js
// joins them back together into one game and starts it.

var EVERDAWN_PARTS = [];

// ---------- Part 1 of 2 ----------
EVERDAWN_PARTS.push(function (THREE) {
  var canvas = document.getElementById('game');
  var ui = {
    clock: document.getElementById('clock'),
    day: document.getElementById('day'),
    mana: document.getElementById('mana'),
    manaNum: document.getElementById('manaNum'),
    btnAct: document.getElementById('btnAct'),
    btnSpell: document.getElementById('btnSpell')
  };
  canvas.tabIndex = 0;
  canvas.style.outline = 'none';

  // ---------- Settings ----------
  var TILE = 1.3, COLS = 6, ROWS = 4, FARM_X = 5.5, FARM_Z = -3.5;
  var WALK_R = 16;  // the middle of the island, where the first scenery was planted
  var ISLAND = 34;  // half the width of the whole island, which is a square with softly rounded corners
  var SQUARENESS = 8; // 2 would be a circle; the bigger this is, the squarer the island
  // Like distance from the middle, but measured in the island's rounded-square shape: ISLAND at the edge
  function islandR(x, z) {
    return Math.pow(Math.pow(Math.abs(x), SQUARENESS) + Math.pow(Math.abs(z), SQUARENESS), 1 / SQUARENESS);
  }
  // How far the island's edge is from the middle, in direction a
  function islandEdge(a) {
    return ISLAND / Math.pow(Math.pow(Math.abs(Math.cos(a)), SQUARENESS) + Math.pow(Math.abs(Math.sin(a)), SQUARENESS), 1 / SQUARENESS);
  }
  // Can you stand here? (inside the island, a little back from the edge)
  function onIsland(x, z) { return islandR(x, z) < ISLAND - 1.5; }
  var TREE_X = -24, TREE_Z = -24, TREE_ZONE = 3; // the Dawn Tree, just in from the top-left corner
  var LAKE_X = 20, LAKE_Z = 2, LAKE_R = 8.5;
  var HOUSE_X = 12, HOUSE_Z = -28;                                   // the witchy farmhouse, up near the top, a bit to the right
  var HOUSE_TURN = 0;                                                // squared up with the island, its door facing down toward the middle
  // the farmhouse porch: [top height, from, to (distance out from the front wall), width] for the landing and each step
  var PORCH_STEPS = [[0.45, 0, 0.55, 1.6], [0.3, 0.55, 0.88, 1.5], [0.15, 0.88, 1.2, 1.4]];
  function porchHeight(x, z) {                                        // how high the porch is under a spot (0 if it isn't on the porch)
    var lx = x - HOUSE_X, lz = z - (HOUSE_Z + 1.9);                   // the house faces straight down the island, its front wall 1.9 out
    for (var i = 0; i < PORCH_STEPS.length; i++) {
      var st = PORCH_STEPS[i];
      if (lz >= st[1] && lz < st[2] && Math.abs(lx) < st[3] / 2) return st[0];
    }
    return 0;
  }
  var IN_X = 0, IN_Z = 1000;                                          // where the inside of the farmhouse is built, far away from the island
  var HOUSE_DOOR_X = HOUSE_X + Math.sin(HOUSE_TURN) * 3.4, HOUSE_DOOR_Z = HOUSE_Z + Math.cos(HOUSE_TURN) * 3.4; // just outside the front door
  var MAX_MANA = 100, SPELL_COST = 35;
  var GROW_DAYS = 4;               // watered days for a moonbloom to grow from seed to flower
  var STAGE_ON_DAY = [0, 1, 1, 2, 3]; // which growth stage it shows after each watered day: sprout, young, young, bud, bloom
  var SPEED = 4.4;
  var GAME_MINUTES_PER_SECOND = 10 / 11; // every 10 in-game minutes take 11 real seconds (one in-game day = 26.4 real minutes)

  var MAX_STAMINA = 450;                                              // how much stamina you wake up with each morning (and the most you can have)
  var STAMINA_COST = { axe: 2, pickaxe: 2, trimmers: 1, hoe: 3, water: 2 };   // what each swing or job costs
  var state = { mana: MAX_MANA, stamina: MAX_STAMINA, harvest: 0, coins: 0, time: 0, minutes: 6 * 60, day: 1, inTreeZone: false };
  // the stamina bar, next to the mana bar in the top bar
  (function () {
    var manaWrap = document.querySelector('.mana-wrap');
    if (!manaWrap) return;
    var wrap = document.createElement('div'); wrap.className = 'mana-wrap stamina-wrap';
    wrap.innerHTML = '<div class="mana" title="Stamina"><div class="mana-fill" id="stamina" style="background:linear-gradient(90deg,#7fd38a,#c6e26a 60%,#ffd36e)"></div><span>Stamina</span></div><div class="mana-num" id="staminaNum" style="color:#4f9a52">450 / 450</div>';
    manaWrap.parentNode.insertBefore(wrap, manaWrap.nextSibling);
    ui.stamina = wrap.querySelector('#stamina'); ui.staminaNum = wrap.querySelector('#staminaNum');
  })();

  // Same "random" island every time
  var seed = 12345;
  function rand() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }
  var outerSeed = 20240;
  function outerRand() { // used for everything on the outer land
    outerSeed = (outerSeed * 16807) % 2147483647;
    return (outerSeed - 1) / 2147483646;
  }
  // A random spot on the outer land (outside the middle of the island)
  function outerSpot(margin) {
    for (var i = 0; i < 40; i++) {
      var x = (outerRand() * 2 - 1) * ISLAND, z = (outerRand() * 2 - 1) * ISLAND;
      if (dist(x, z, HOUSE_X, HOUSE_Z) < 6.2) continue; // nothing grows through the farmhouse
      if (islandR(x, z) < ISLAND - margin && Math.sqrt(x * x + z * z) > 16.5) return { x: x, z: z };
    }
    return null;
  }

  // ---------- Renderer, scene, camera ----------
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9fd8ff);
  scene.fog = new THREE.Fog(0x9fd8ff, 40, 110);

  var camera = new THREE.PerspectiveCamera(50, 1.5, 0.1, 200);
  var cam = { yaw: 0, pitch: 0.75, dist: 14, target: new THREE.Vector3() };

  function resize() {
    var w = canvas.clientWidth || 800;
    var h = canvas.clientHeight || Math.round(w / 1.5);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);

  var hemi = new THREE.HemisphereLight(0xfff1e0, 0x8a6fb8, 0.7);
  scene.add(hemi);
  var sun = new THREE.DirectionalLight(0xffe2c4, 1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -16; sun.shadow.camera.right = 16;
  sun.shadow.camera.top = 16; sun.shadow.camera.bottom = -16;
  sun.shadow.camera.far = 60;
  sun.shadow.bias = -0.0008;
  scene.add(sun);
  scene.add(sun.target);

  // ---------- Helpers ----------
  function mat(color, glowColor, glow) {
    var m = new THREE.MeshStandardMaterial({ color: color, roughness: 0.85 });
    if (glowColor) { m.emissive = new THREE.Color(glowColor); m.emissiveIntensity = glow; }
    return m;
  }
  function place(mesh, x, y, z, parent) {
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    (parent || scene).add(mesh);
    return mesh;
  }
  function dist(x1, z1, x2, z2) { return Math.sqrt((x1 - x2) * (x1 - x2) + (z1 - z2) * (z1 - z2)); }

  var M = {
    cliff: mat(0xc9a27e), garden: mat(0xb9cf86),
    soilDry: mat(0x9a6b47), soilWet: mat(0x5e3f2b),
    stem: mat(0x5cb85c), leaf: mat(0x7ed37a), bud: mat(0xf7a8d8),
    petal: mat(0xffb3e6, 0xff6fcf, 0.35), center: mat(0xffe27a, 0xffc94d, 0.4),
    robe: mat(0xb48cff), skin: mat(0xffe0c7), hat: mat(0x7b4fd6), eye: mat(0x3b2b55),
    star: mat(0xffd75e, 0xffb64d, 0.8), drop: mat(0x7cc7ff, 0x3d9bff, 0.5),
    trunk: mat(0x8a5a8c), canopy: mat(0xffc3f2, 0xff7fd8, 0.45)
  };

  // ---------- Shape of the land ----------
  var WATER_Y = -0.12; // height of the lake's surface

  // Smooth wobbly noise, roughly -1..1, used for colours, rocks and the lake bed
  function noise(x, z) {
    return Math.sin(x * 0.9 + Math.sin(z * 0.7) * 1.3) * Math.cos(z * 1.1 - Math.sin(x * 0.5)) * 0.5 +
      Math.sin(x * 2.3 - z * 1.9) * 0.25 + Math.cos(x * 4.1 + z * 3.7) * 0.12;
  }
  function lakeRadius(a) { return LAKE_R * (1 + 0.08 * Math.sin(3 * a) + 0.04 * Math.sin(5 * a + 1)); }
  // A point on the lake's edge (pushed out by `extra`), kept on the island
  function lakeEdge(a, extra, limit) {
    var r = lakeRadius(a) + extra;
    var x = Math.cos(a) * r, z = -Math.sin(a) * r;
    var wx = LAKE_X + x, wz = LAKE_Z + z, wd = Math.sqrt(wx * wx + wz * wz);
    if (wd > limit) { x = wx * limit / wd - LAKE_X; z = wz * limit / wd - LAKE_Z; }
    return { x: x, z: z };
  }
  // 0 at the middle of the lake, 1 at its edge
  function lakeQ(x, z) {
    var lx = x - LAKE_X, lz = z - LAKE_Z;
    return Math.sqrt(lx * lx + lz * lz) / lakeRadius(Math.atan2(-lz, lx));
  }
  // How high the ground is anywhere on the island: flat, except the bowl the lake sits in
  function groundHeight(x, z) {
    var q = lakeQ(x, z);
    if (q >= 1.15) return 0;
    var t = Math.min(1, (1.15 - q) / 1.15);
    t = t * t * (3 - 2 * t);
    var rim = Math.min(1, Math.max(0, (ISLAND - 0.5 - islandR(x, z)) / 2.5)); // rise back up at the island's edge
    return (-1.2 * t + noise(x * 1.5, z * 1.5) * 0.06 * t) * rim;
  }

  // The wooden dock points from the shore toward where you start
  var DOCK_A = Math.atan2(-((FARM_Z + 5) - LAKE_Z), FARM_X - LAKE_X);
  var DOCK_LEN = 5.8, DOCK_W = 2.2, DOCK_Y = 0.3;
  var dockIn = { x: -Math.cos(DOCK_A), z: Math.sin(DOCK_A) }; // direction out over the water
  var dockStart = {
    x: LAKE_X + Math.cos(DOCK_A) * (lakeRadius(DOCK_A) + 0.8),
    z: LAKE_Z - Math.sin(DOCK_A) * (lakeRadius(DOCK_A) + 0.8)
  };
  function dockCoords(x, z) {
    var rx = x - dockStart.x, rz = z - dockStart.z;
    return { along: rx * dockIn.x + rz * dockIn.z, across: -rx * dockIn.z + rz * dockIn.x };
  }
  // Where you can walk on the dock (keeps you clear of the posts and lamps at its edges)
  function onDock(x, z) {
    var d = dockCoords(x, z);
    return d.along > -0.2 && d.along < DOCK_LEN - 0.25 && Math.abs(d.across) < DOCK_W / 2 - 0.4;
  }
  // Everywhere the dock covers, so grass and lily pads stay out from under it
  function underDock(x, z) {
    var d = dockCoords(x, z);
    return d.along > -0.4 && d.along < DOCK_LEN + 0.4 && Math.abs(d.across) < DOCK_W / 2 + 0.4;
  }
  function nearDock(a) {
    return Math.abs(Math.atan2(Math.sin(a - DOCK_A), Math.cos(a - DOCK_A))) < 0.3;
  }
  function inLake(x, z) { return !onDock(x, z) && groundHeight(x, z) < WATER_Y - 0.05; }
  function nearLake(x, z) { return lakeQ(x, z) < 1.2; }

  // ---------- Island ----------
  // The island's sides follow its rounded-square shape: a grassy edge, then cliffs tapering into the sea
  function islandBand(sTop, sBot, yTop, yBot) {
    var SEG = 256, pos = [], idx = [];
    for (var i = 0; i <= SEG; i++) {
      var a = (i / SEG) * Math.PI * 2, e = islandEdge(a);
      pos.push(Math.cos(a) * e * sTop, yTop, Math.sin(a) * e * sTop, Math.cos(a) * e * sBot, yBot, Math.sin(a) * e * sBot);
    }
    for (var j = 0; j < SEG; j++) { var k = j * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  var sideMat = mat(0x6f9e4f), cliffMat = M.cliff.clone();
  sideMat.side = cliffMat.side = THREE.DoubleSide;
  var islandSide = place(new THREE.Mesh(islandBand(1.03, 0.92, 0, -2.4), sideMat), 0, 0, 0);
  islandSide.castShadow = false;
  place(new THREE.Mesh(islandBand(0.92, 0.3, -2.4, -8.4), cliffMat), 0, 0, 0).castShadow = false;
  var sea = new THREE.Mesh(new THREE.CircleGeometry(260, 64),
    new THREE.MeshStandardMaterial({ color: 0x8fd3ff, transparent: true, opacity: 0.85, roughness: 0.3 }));
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -1.4;
  // (no sea: the islands and the bridge float in the open sky)

  // A fine grass texture painted once, so the ground has detail up close; it tiles with no seams
  var groundCanvas = document.createElement('canvas');
  groundCanvas.width = groundCanvas.height = 256;
  (function (g) {
    g.fillStyle = '#dedede';
    g.fillRect(0, 0, 256, 256);
    g.lineCap = 'round';
    for (var i = 0; i < 4200; i++) { // thousands of tiny blades of grass, light and dark
      var x = Math.random() * 256, y = Math.random() * 256, len = 3 + Math.random() * 6, ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      var ex = Math.cos(ang) * len, ey = Math.sin(ang) * len;
      g.strokeStyle = Math.random() < 0.5 ? 'rgba(255,255,255,' + (0.3 + Math.random() * 0.4) + ')' : 'rgba(70,80,60,' + (0.15 + Math.random() * 0.3) + ')';
      g.lineWidth = 0.8 + Math.random() * 1.2;
      for (var ox = -256; ox <= 256; ox += 256) {
        for (var oy = -256; oy <= 256; oy += 256) {
          g.beginPath(); g.moveTo(x + ox, y + oy); g.lineTo(x + ox + ex, y + oy + ey); g.stroke();
        }
      }
    }
  })(groundCanvas.getContext('2d'));
  var groundTex = new THREE.CanvasTexture(groundCanvas);
  groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping;

  // How far a point is from the line between two points: used for the worn paths
  function segDist(px, pz, ax, az, bx, bz) {
    var dx = bx - ax, dz = bz - az;
    var t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
    return dist(px, pz, ax + dx * t, az + dz * t);
  }

  // The one worn dirt path: from the opening in the farmhouse's front gate, along the top of the island to the Dawn Tree
  var PATH_PTS = [[HOUSE_X, HOUSE_Z + 4.9], [HOUSE_X, HOUSE_Z + 5.6], [HOUSE_X - 3, HOUSE_Z + 7.4], [HOUSE_X - 9, HOUSE_Z + 7.8], [HOUSE_X - 15, HOUSE_Z + 7.2],
    [HOUSE_X - 21, HOUSE_Z + 7.7], [HOUSE_X - 27, HOUSE_Z + 7.0], [HOUSE_X - 32, HOUSE_Z + 5.4], [TREE_X, TREE_Z]];
  // How far a point is from the path, a little wobbly
  function pathDist(x, z) {
    var best = 99;
    for (var i = 0; i < PATH_PTS.length - 1; i++) best = Math.min(best, segDist(x, z, PATH_PTS[i][0], PATH_PTS[i][1], PATH_PTS[i + 1][0], PATH_PTS[i + 1][1]));
    return best + noise(x * 1.3, z * 1.3) * 0.18;
  }
  var PATH_W = 0.75; // half the width of the paths

  // The ground: a round grid that follows groundHeight, coloured grass → mud → lake bed,
  // with lush and sunny patches and softly worn paths to the dock and the Dawn Tree
  function terrainGeometry() {
    var RINGS = 150, SEG = 360;
    var pos = [], col = [], uv = [], idx = [], c = new THREE.Color();
    var grassA = new THREE.Color(0x8fcb68), grassB = new THREE.Color(0x5a9643), lush = new THREE.Color(0x4a8a3a);
    var sunny = new THREE.Color(0xb8cf72), path = new THREE.Color(0xa88a5c), pathEdge = new THREE.Color(0x8a9a52);
    var mud = new THREE.Color(0x75704f), bedShallow = new THREE.Color(0x7a7a55), bedDeep = new THREE.Color(0x2c4a4a);
    function vertex(x, z) {
      var h = groundHeight(x, z);
      pos.push(x, h, z);
      uv.push(x * 0.55, z * 0.55);
      c.copy(grassA).lerp(grassB, noise(x * 0.8, z * 0.8) * 0.5 + 0.5);
      var lushy = noise(x * 0.45 - 7, z * 0.45 + 2);                 // big patches of deep, lush grass
      if (lushy > 0.15) c.lerp(lush, Math.min(0.7, (lushy - 0.15) * 1.4));
      var patch = noise(x * 2.7 + 5, z * 2.7 - 3);                    // small sun-warmed patches
      if (patch > 0.3) c.lerp(sunny, Math.min(0.8, (patch - 0.3) * 1.5));
      c.multiplyScalar(0.94 + noise(x * 9, z * 9) * 0.06);             // fine mottling
      if (h > -0.02) { // worn dirt paths: bare packed earth in the middle, trampled grass at the edges
        var dp = pathDist(x, z);
        if (dp < PATH_W + 0.45) c.lerp(pathEdge, Math.min(1, (PATH_W + 0.45 - dp) / 0.45) * 0.6);
        if (dp < PATH_W) {
          c.copy(path).lerp(pathEdge, Math.max(0, dp / PATH_W - 0.75) * 2);
          c.multiplyScalar(0.92 + noise(x * 6, z * 6) * 0.1);
        }
      }
      if (h < -0.02) c.lerp(mud, Math.min(1, (-h - 0.02) / 0.1) * 0.85);
      if (h < WATER_Y) c.copy(bedShallow).lerp(bedDeep, Math.min(1, (WATER_Y - h) / 0.8));
      col.push(c.r, c.g, c.b);
    }
    vertex(0, 0);
    for (var r = 1; r <= RINGS; r++) {
      for (var s = 0; s < SEG; s++) {
        var a = (s / SEG) * Math.PI * 2, rr = (r / RINGS) * islandEdge(a) * 1.03;
        vertex(Math.cos(a) * rr, Math.sin(a) * rr);
      }
    }
    for (var s2 = 0; s2 < SEG; s2++) idx.push(0, 1 + (s2 + 1) % SEG, 1 + s2);
    for (var r2 = 1; r2 < RINGS; r2++) {
      var in0 = 1 + (r2 - 1) * SEG, out0 = 1 + r2 * SEG;
      for (var s3 = 0; s3 < SEG; s3++) {
        var ia = in0 + s3, ib = in0 + (s3 + 1) % SEG, oc = out0 + s3, od = out0 + (s3 + 1) % SEG;
        idx.push(ia, ib, oc, ib, od, oc);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  var terrain = new THREE.Mesh(terrainGeometry(), new THREE.MeshStandardMaterial({
    vertexColors: true, map: groundTex, bumpMap: groundTex, bumpScale: 0.015, roughness: 0.95
  }));
  terrain.receiveShadow = true;
  scene.add(terrain);

  var solids = []; // things you bump into: {x, z, r}

  // Rocks: a ball chipped flat on a few sides like real stone, bumpy and weathered,
  // speckled grain, darker underneath, with patches of moss on top
  var rockCanvas = document.createElement('canvas');
  rockCanvas.width = rockCanvas.height = 256;
  (function (g) {
    g.fillStyle = '#d6d4cf';
    g.fillRect(0, 0, 256, 256);
    function wrapped(draw) { // draw at every wrapped position so the texture tiles with no seams
      for (var ox = -256; ox <= 256; ox += 256) for (var oy = -256; oy <= 256; oy += 256) draw(ox, oy);
    }
    for (var i = 0; i < 2600; i++) { // grain and speckles
      var x = Math.random() * 256, y = Math.random() * 256, r = 0.6 + Math.random() * 1.8;
      g.fillStyle = Math.random() < 0.55 ? 'rgba(70,66,60,' + (0.15 + Math.random() * 0.3) + ')' : 'rgba(255,255,250,' + (0.2 + Math.random() * 0.35) + ')';
      wrapped(function (ox, oy) { g.fillRect(x + ox, y + oy, r, r); });
    }
    for (var j = 0; j < 40; j++) { // soft blotches
      var bx = Math.random() * 256, by = Math.random() * 256, br = 10 + Math.random() * 30, dark = Math.random() < 0.5;
      wrapped(function (ox, oy) {
        var grad = g.createRadialGradient(bx + ox, by + oy, 0, bx + ox, by + oy, br);
        grad.addColorStop(0, dark ? 'rgba(90,85,78,0.18)' : 'rgba(255,255,255,0.18)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grad;
        g.fillRect(bx + ox - br, by + oy - br, br * 2, br * 2);
      });
    }
    g.lineCap = 'round';
    for (var k = 0; k < 14; k++) { // fine cracks
      var cx = Math.random() * 256, cy = Math.random() * 256, pts = [];
      for (var c = 0; c < 6; c++) { pts.push([cx, cy]); cx += (Math.random() - 0.5) * 22; cy += 4 + Math.random() * 10; }
      wrapped(function (ox, oy) {
        g.strokeStyle = 'rgba(50,46,42,0.35)';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(pts[0][0] + ox, pts[0][1] + oy);
        for (var q = 1; q < pts.length; q++) g.lineTo(pts[q][0] + ox, pts[q][1] + oy);
        g.stroke();
      });
    }
  })(rockCanvas.getContext('2d'));
  var rockTex = new THREE.CanvasTexture(rockCanvas);
  rockTex.wrapS = rockTex.wrapT = THREE.RepeatWrapping;
  rockTex.repeat.set(3, 2);

  var ROCK_TINTS = [0x9c9a93, 0x8f949a, 0xa59c8e, 0x8d9288, 0x99999a, 0xa29589];
  function boulderGeometry(shift, n) {
    function hash(k) { var x = Math.sin(k * 12.9898 + shift * 78.233) * 43758.5453; return x - Math.floor(x); }
    var g = new THREE.IcosahedronGeometry(1, 3);
    var p = g.attributes.position, colors = [], v = new THREE.Vector3(), c = new THREE.Color();
    // flat chipped faces: a few planes that slice off the round sides
    var cuts = [];
    for (var k = 0; k < 8; k++) {
      var ca = hash(k) * Math.PI * 2, cy = hash(k + 10) * 1.4 - 0.4;
      cuts.push({ n: new THREE.Vector3(Math.cos(ca), cy, Math.sin(ca)).normalize(), d: 0.6 + hash(k + 20) * 0.22 });
    }
    var tint = new THREE.Color(ROCK_TINTS[n % ROCK_TINTS.length]);
    var dark = tint.clone().multiplyScalar(0.55), light = tint.clone().lerp(new THREE.Color(0xffffff), 0.18);
    var moss = new THREE.Color(0x5f7f3a), mossLight = new THREE.Color(0x86a24f);
    for (var i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      v.multiplyScalar(1 + noise(v.x * 1.8 + shift, v.z * 1.8 + v.y * 1.5) * 0.16);
      cuts.forEach(function (cut) {
        var over = v.dot(cut.n) - cut.d;
        if (over > 0) v.addScaledVector(cut.n, -over);
      });
      v.multiplyScalar(1 + noise(v.x * 7 + shift, v.y * 7 + v.z * 3) * 0.025); // small bumps
      if (v.y < -0.3) v.y = -0.3 + (v.y + 0.3) * 0.3; // flatter bottom so it sits on the ground
      p.setXYZ(i, v.x, v.y, v.z);
      var shade = Math.min(1, Math.max(0, 0.3 - v.y * 0.55 + noise(v.x * 4 + shift, v.z * 4) * 0.2));
      c.copy(light).lerp(dark, shade);
      var mossy = (v.y - 0.5) * 2 + noise(v.x * 3.5 + shift, v.z * 3.5 - shift) * 0.8; // patchy moss on top
      if (mossy > 0) c.lerp(noise(v.x * 9, v.z * 9) > 0 ? mossLight : moss, Math.min(0.7, mossy * 1.5));
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    // smooth normals, so edges look weathered and rounded instead of faceted
    var sums = {}, a = new THREE.Vector3(), b2 = new THREE.Vector3(), cc = new THREE.Vector3(), fn = new THREE.Vector3();
    function key(i) { return Math.round(p.getX(i) * 1e4) + ',' + Math.round(p.getY(i) * 1e4) + ',' + Math.round(p.getZ(i) * 1e4); }
    for (var f = 0; f < p.count; f += 3) {
      a.fromBufferAttribute(p, f); b2.fromBufferAttribute(p, f + 1); cc.fromBufferAttribute(p, f + 2);
      fn.subVectors(cc, b2).cross(a.sub(b2));
      for (var j = 0; j < 3; j++) {
        var kk = key(f + j);
        if (!sums[kk]) sums[kk] = new THREE.Vector3();
        sums[kk].add(fn);
      }
    }
    var normals = [];
    for (var m = 0; m < p.count; m++) {
      fn.copy(sums[key(m)]).normalize();
      normals.push(fn.x, fn.y, fn.z);
    }
    g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    return g;
  }
  var boulderGeos = [0, 3.7, 7.4, 11.1, 14.8, 18.5].map(boulderGeometry);
  var stoneMat = new THREE.MeshStandardMaterial({ map: rockTex, bumpMap: rockTex, bumpScale: 0.025, vertexColors: true, roughness: 0.95 });
  function boulder(x, z, size, squash, parent) {
    var b = place(new THREE.Mesh(boulderGeos[Math.floor(rand() * boulderGeos.length)], stoneMat), x, 0, z, parent);
    b.scale.set(size, size * squash, size * (0.75 + rand() * 0.4));
    b.rotation.y = rand() * Math.PI * 2;
    return b;
  }

  // ---------- The glowing Dawn Tree ----------
  // A huge magical blossom tree: twisted trunk with glowing veins, curving branches,
  // pink and lavender blossoms, hanging glowing strands and orbs, drifting petals and a rune circle
  var seedBeforeDawn = seed;
  seed = 4242; // the Dawn Tree has its own random numbers, so it never moves the rest of the scenery
  var tree = new THREE.Group();
  tree.position.set(TREE_X, 0, TREE_Z);
  tree.rotation.y = 0.4;

  function dawnPaint(w, h, paint) {
    var cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    paint(cv.getContext('2d'), w, h);
    return new THREE.CanvasTexture(cv);
  }
  // Soft see-through textures (glows, smoke, steam, glass sheen) are built pixel by pixel instead of drawn on a canvas:
  // canvas gradients get tiny random noise on some screens (like iPhones), which shows up as rainbow-coloured dots
  // in the faint, almost-invisible parts. Here every pixel is pure white and only how see-through it is changes.
  function alphaTex(w, h, alphaAt) {
    var data = new Uint8Array(w * h * 4);
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var i = (y * w + x) * 4, a = alphaAt((x + 0.5) / w, (y + 0.5) / h);
      data[i] = data[i + 1] = data[i + 2] = 255;
      data[i + 3] = Math.round(Math.max(0, Math.min(1, a)) * 255);
    }
    var tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
    tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.generateMipmaps = true;
    tex.needsUpdate = true;
    return tex;
  }
  function stopsAt(t, stops) {                                         // a smooth step between [position, value] pairs, like a gradient
    if (t <= stops[0][0]) return stops[0][1];
    for (var i = 1; i < stops.length; i++) if (t <= stops[i][0]) {
      var k = (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]);
      return stops[i - 1][1] + (stops[i][1] - stops[i - 1][1]) * k;
    }
    return stops[stops.length - 1][1];
  }
  function radialAlphaTex(stops) { return alphaTex(64, 64, function (u, v) { return stopsAt(Math.sqrt((u - 0.5) * (u - 0.5) + (v - 0.5) * (v - 0.5)) * 2, stops); }); }
  var dawnBark = dawnPaint(128, 256, function (g, w, h) {
    g.fillStyle = '#7a5478';
    g.fillRect(0, 0, w, h);
    for (var i = 0; i < 260; i++) { // long twisting ridges in the bark
      var x = Math.random() * w, y = Math.random() * h, len = 30 + Math.random() * 90, end = (Math.random() - 0.5) * 6;
      g.strokeStyle = Math.random() < 0.55 ? 'rgba(45,22,48,0.55)' : 'rgba(205,165,205,0.3)';
      g.lineWidth = 1 + Math.random() * 3;
      for (var ox = -w; ox <= w; ox += w) for (var oy = -h; oy <= h; oy += h) { // drawn again across every edge, so the bark repeats with no seam
        g.beginPath();
        g.moveTo(x + ox, y + oy);
        g.bezierCurveTo(x + ox + 6, y + oy + len * 0.33, x + ox - 6, y + oy + len * 0.66, x + ox + end, y + oy + len);
        g.stroke();
      }
    }
  });
  var dawnVeins = dawnPaint(128, 256, function (g, w, h) {
    g.fillStyle = '#000';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#fff';
    g.shadowColor = '#fff';
    g.shadowBlur = 6;
    for (var i = 0; i < 6; i++) { // glowing magic veins winding up the bark
      var x0 = Math.random() * w, p1 = Math.random() * 6.28, p2 = Math.random() * 6.28, p3 = Math.random() * 6.28;
      var jag = [];                                  // little zigzags, the same at the top and bottom so the vein joins up
      for (var j = 0; j < h / 16; j++) jag.push((Math.random() - 0.5) * 8);
      g.lineWidth = 1.5 + Math.random() * 2;
      for (var ox = -w; ox <= w; ox += w) {          // drawn again across the side edges, so it wraps round the trunk
        g.beginPath();
        for (var y = -32; y <= h + 32; y += 16) {    // the wiggle repeats exactly every h pixels: no seam where the picture tiles
          var k = y / h * Math.PI * 2, n = ((y / 16) % jag.length + jag.length) % jag.length;
          var x = x0 + ox + Math.sin(k + p1) * 12 + Math.sin(k * 2 + p2) * 6 + Math.sin(k * 3 + p3) * 3 + jag[n];
          if (y === -32) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.stroke();
      }
    }
  });
  dawnBark.wrapS = dawnBark.wrapT = dawnVeins.wrapS = dawnVeins.wrapT = THREE.RepeatWrapping;
  dawnBark.repeat.set(3, 2);
  var dawnBarkMat = new THREE.MeshStandardMaterial({
    map: dawnBark, bumpMap: dawnBark, bumpScale: 0.05, roughness: 0.9,
    emissive: 0xff8fe6, emissiveMap: dawnVeins, emissiveIntensity: 0.5
  });

  // All the wood is built from pieces, then joined into one mesh so it stays fast
  var dawnWood = [], dawnM = new THREE.Matrix4(), dawnQ = new THREE.Quaternion(), dawnS = new THREE.Vector3(), DAWN_UP = new THREE.Vector3(0, 1, 0);
  function dawnPiece(geo, pos, dir, scale) {
    dawnQ.setFromUnitVectors(DAWN_UP, dir);
    dawnS.set(scale, scale, scale);
    dawnM.compose(pos, dawnQ, dawnS);
    geo.applyMatrix4(dawnM);
    dawnWood.push(geo);
  }
  // A curved branch that tapers from r0 to r1 along the points given; returns its curve
  function dawnLimb(points, r0, r1) {
    var curve = new THREE.CatmullRomCurve3(points), N = 8, prev = curve.getPoint(0);
    for (var i = 1; i <= N; i++) {
      var p = curve.getPoint(i / N), d = p.clone().sub(prev), len = d.length();
      var ra = r0 + (r1 - r0) * (i - 1) / N, rb = r0 + (r1 - r0) * i / N;
      var seg = new THREE.CylinderGeometry(rb, ra, len, 10, 1, true);
      seg.translate(0, len / 2, 0);
      dawnPiece(seg, prev, d.normalize(), 1);
      dawnPiece(new THREE.SphereGeometry(rb, 10, 6), p, DAWN_UP, 1); // smooth knuckle where the pieces meet
      prev = p;
    }
    return curve;
  }
  function mergeWood(parts) {
    var pos = [], nor = [], uv = [], idx = [], off = 0;
    parts.forEach(function (g) {
      var p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
      for (var i = 0; i < p.count; i++) {
        pos.push(p.getX(i), p.getY(i), p.getZ(i));
        nor.push(n.getX(i), n.getY(i), n.getZ(i));
        uv.push(u.getX(i), u.getY(i));
      }
      if (g.index) { for (var j = 0; j < g.index.count; j++) idx.push(g.index.getX(j) + off); }
      else { for (var k = 0; k < p.count; k++) idx.push(k + off); }
      off += p.count;
    });
    var m = new THREE.BufferGeometry();
    m.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    m.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    m.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    m.setIndex(idx);
    return m;
  }

  // Twisted trunk with a wide flared base and spiral ridges
  var TRUNK_H = 4.4, trunkProfile = [];
  for (var tpi = 0; tpi <= 18; tpi++) {
    var ty = (tpi / 18) * TRUNK_H;
    trunkProfile.push(new THREE.Vector2(0.6 * (1 - 0.4 * ty / TRUNK_H) + 0.8 * Math.exp(-ty * 2.4), ty));
  }
  var dawnTrunk = new THREE.LatheGeometry(trunkProfile, 28);
  var dtp = dawnTrunk.attributes.position;
  for (var dv = 0; dv < dtp.count; dv++) {
    var vx = dtp.getX(dv), vy = dtp.getY(dv), vz = dtp.getZ(dv);
    var vr = Math.sqrt(vx * vx + vz * vz), va = Math.atan2(vz, vx);
    vr *= 1 + 0.12 * Math.sin(va * 6 + vy * 1.6); // ridges
    va += vy * 0.35;                               // twist
    dtp.setXYZ(dv, Math.cos(va) * vr, vy, Math.sin(va) * vr);
  }
  dawnTrunk.computeVertexNormals();
  dawnWood.push(dawnTrunk);

  // Big roots curling out over the ground
  for (var dr = 0; dr < 7; dr++) {
    var ra = (dr / 7) * Math.PI * 2 + rand() * 0.4, rl = 2.0 + rand() * 0.9;
    var rx = Math.cos(ra), rz = Math.sin(ra);
    dawnLimb([
      new THREE.Vector3(rx * 0.45, 0.6, rz * 0.45),
      new THREE.Vector3(rx * 1.1, 0.16, rz * 1.1),
      new THREE.Vector3(rx * rl * 0.75, 0.02, rz * rl * 0.75 + (rand() - 0.5) * 0.4),
      new THREE.Vector3(rx * rl, -0.12, rz * rl)
    ], 0.3, 0.05);
  }

  // Branches: a leader going up, and wide curving limbs with smaller branches; blossoms go at their ends
  var clumps = [];
  var leader = dawnLimb([new THREE.Vector3(0, 4.0, 0), new THREE.Vector3(0.3, 5.4, 0.1), new THREE.Vector3(0.1, 6.6, -0.2)], 0.36, 0.1);
  clumps.push({ p: leader.getPoint(1), r: 1.5 }, { p: leader.getPoint(0.6), r: 1.2 });
  var hangPoints = [];
  var LIMBS = 7;
  for (var li = 0; li < LIMBS; li++) {
    var la = (li / LIMBS) * Math.PI * 2 + rand() * 0.5, lx = Math.cos(la), lz = Math.sin(la);
    var y0 = 3.3 + rand() * 1.0, reach = 2.6 + rand() * 0.7;
    var limb = dawnLimb([
      new THREE.Vector3(lx * 0.2, y0, lz * 0.2),
      new THREE.Vector3(lx * 1.2, y0 + 0.8, lz * 1.2),
      new THREE.Vector3(lx * reach * 0.8, y0 + 1.3, lz * reach * 0.8),
      new THREE.Vector3(lx * reach, y0 + 1.5 + rand() * 0.5, lz * reach)
    ], 0.34, 0.09);
    var tipP = limb.getPoint(1);
    clumps.push({ p: tipP, r: 1.3 + rand() * 0.3 }, { p: limb.getPoint(0.55), r: 1.0 });
    hangPoints.push(limb.getPoint(0.75));
    for (var sb = 0; sb < 2; sb++) {
      var sa = la + (sb ? 0.7 : -0.7) + (rand() - 0.5) * 0.3, from = limb.getPoint(0.6 + sb * 0.2);
      var sl = 1.0 + rand() * 0.5;
      var sub = dawnLimb([
        from,
        new THREE.Vector3(from.x + Math.cos(sa) * sl * 0.5, from.y + 0.5, from.z + Math.sin(sa) * sl * 0.5),
        new THREE.Vector3(from.x + Math.cos(sa) * sl, from.y + 0.7 + rand() * 0.4, from.z + Math.sin(sa) * sl)
      ], 0.12, 0.04);
      clumps.push({ p: sub.getPoint(1), r: 1.0 + rand() * 0.3 });
    }
  }
  var dawnWoodMesh = place(new THREE.Mesh(mergeWood(dawnWood), dawnBarkMat), 0, 0, 0, tree);

  // Blossoms: painted clusters of five-petal flowers, pink with some lavender, see-through round the edge
  var blossomTex = dawnPaint(256, 256, function (g) {
    var i, a, r, x, y;
    for (i = 0; i < 60; i++) { // a few leaves peeking out underneath
      a = Math.random() * Math.PI * 2; r = Math.pow(Math.random(), 0.6) * 100;
      x = 128 + Math.cos(a) * r; y = 128 + Math.sin(a) * r;
      g.save(); g.translate(x, y); g.rotate(Math.random() * 6.28);
      g.fillStyle = 'hsl(' + (95 + Math.random() * 25) + ',35%,' + (32 + Math.random() * 12) + '%)';
      g.beginPath(); g.ellipse(0, 0, 9, 4, 0, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    for (i = 0; i < 230; i++) {
      a = Math.random() * Math.PI * 2; r = Math.pow(Math.random(), 0.6) * 104;
      x = 128 + Math.cos(a) * r; y = 128 + Math.sin(a) * r * 0.92;
      var s = 7 + Math.random() * 7, spin = Math.random() * 6.28;
      var sunny = Math.max(0, Math.min(1, 0.55 - ((x - 128) + (y - 128)) / 300));
      var hue = Math.random() < 0.25 ? 275 + Math.random() * 20 : 318 + Math.random() * 22;
      g.fillStyle = 'hsl(' + hue + ',' + (78 + Math.random() * 15) + '%,' + (56 + sunny * 22 + Math.random() * 6) + '%)';
      for (var k = 0; k < 5; k++) {
        var pa = spin + (k / 5) * Math.PI * 2;
        g.beginPath();
        g.ellipse(x + Math.cos(pa) * s * 0.55, y + Math.sin(pa) * s * 0.55, s * 0.55, s * 0.38, pa, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = '#fff2b0';
      g.beginPath(); g.arc(x, y, s * 0.22, 0, Math.PI * 2); g.fill();
    }
  });
  // Hanging strands of glowing blossoms, getting smaller and more lavender toward the tip
  var strandTex = dawnPaint(64, 256, function (g) {
    for (var y = 6; y < 250; y += 7) {
      var f = y / 256, s = 11 * (1 - f * 0.7);
      for (var k = 0; k < 3; k++) {
        g.fillStyle = 'hsl(' + (325 - f * 50) + ',85%,' + (72 + f * 12) + '%)';
        g.beginPath();
        g.arc(32 + (Math.random() - 0.5) * 18 * (1 - f * 0.5), y + Math.random() * 4, s * (0.5 + Math.random() * 0.4), 0, Math.PI * 2);
        g.fill();
      }
    }
  });
  function blossomMaterial(tex, glow) {
    var m = new THREE.MeshStandardMaterial({
      map: tex, emissive: 0xff7fd8, emissiveMap: tex, emissiveIntensity: glow,
      alphaTest: 0.3, transparent: true, side: THREE.DoubleSide, roughness: 0.8
    });
    m.onBeforeCompile = function (shader) { // light every card as if it faced the sky, so their backs don't go dark
      shader.vertexShader = shader.vertexShader.replace('#include <defaultnormal_vertex>', 'vec3 transformedNormal = normalMatrix * vec3(0.0, 1.0, 0.0);');
      shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_begin>', 'float faceDirection = 1.0;\nvec3 normal = normalize(vNormal);\nvec3 geometryNormal = normal;');
    };
    return m;
  }
  var blossomMat = blossomMaterial(blossomTex, 0.3), strandMat = blossomMaterial(strandTex, 0.6);
  function cardBatch(geo, tex, m, max) {
    var b = new THREE.InstancedMesh(geo, m, max);
    b.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.3 });
    b.castShadow = true;
    b.n = 0;
    return b;
  }
  var blossomCards = cardBatch(new THREE.PlaneGeometry(1, 1), blossomTex, blossomMat, 1200);
  var strandGeo = new THREE.PlaneGeometry(0.32, 1.5);
  strandGeo.translate(0, -0.75, 0); // hangs down from where it's attached
  var strandCards = cardBatch(strandGeo, strandTex, strandMat, 200);
  var cardM = new THREE.Matrix4(), cardQ = new THREE.Quaternion(), cardE = new THREE.Euler(), cardP = new THREE.Vector3(), cardS = new THREE.Vector3(), cardC = new THREE.Color();
  function addDawnCard(b, shade) {
    if (b.n >= b.instanceMatrix.count) return;
    cardM.compose(cardP, cardQ, cardS);
    b.setMatrixAt(b.n, cardM);
    cardC.setRGB(shade, shade, shade);
    b.setColorAt(b.n, cardC);
    b.n++;
  }
  clumps.forEach(function (c) {
    for (var i = 0; i < 26; i++) {
      cardP.set(rand() - 0.5, (rand() - 0.35) * 0.8, rand() - 0.5).normalize().multiplyScalar(c.r * (0.35 + rand() * 0.5)).add(c.p);
      cardE.set(rand() * 6.28, rand() * 6.28, rand() * 6.28);
      cardQ.setFromEuler(cardE);
      var s = c.r * (1.1 + rand() * 0.5);
      cardS.set(s, s, s);
      var lift = Math.max(0, Math.min(1, (cardP.y - c.p.y) / c.r * 0.6 + 0.5));
      addDawnCard(blossomCards, 0.72 + lift * 0.3 + rand() * 0.06);
    }
    for (var h = 0; h < 4; h++) { // strands hanging from the underside of each clump
      cardP.set((rand() - 0.5) * c.r * 1.3, -c.r * 0.35, (rand() - 0.5) * c.r * 1.3).add(c.p);
      cardE.set((rand() - 0.5) * 0.15, rand() * 6.28, (rand() - 0.5) * 0.15);
      cardQ.setFromEuler(cardE);
      var hs = 0.7 + rand() * 0.6;
      cardS.set(1, hs, 1);
      addDawnCard(strandCards, 1);
      cardE.y += Math.PI / 2; // a second card crossing the first, so the strand looks round
      cardQ.setFromEuler(cardE);
      addDawnCard(strandCards, 1);
    }
  });
  [blossomCards, strandCards].forEach(function (b) {
    b.count = b.n;
    b.instanceMatrix.needsUpdate = true;
    if (b.instanceColor) b.instanceColor.needsUpdate = true;
    tree.add(b);
  });

  // Soft glows: inside the canopy, and on glowing orbs hanging from the branches
  var dawnGlowTex = radialAlphaTex([[0, 1], [0.35, 0.45], [1, 0]]);
  function dawnGlow(color, size, opacity) {
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: dawnGlowTex, color: color, transparent: true, opacity: opacity,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    sp.scale.set(size, size, 1);
    return sp;
  }
  var canopyGlows = [];
  for (var cg = 0; cg < 6; cg++) {
    var glow = dawnGlow(cg % 2 ? 0xc9a0ff : 0xff9be0, 3.5, 0.2);
    var gcl = clumps[cg * 3 % clumps.length].p;
    glow.position.set(gcl.x * 0.7, gcl.y - 0.3, gcl.z * 0.7);
    tree.add(glow);
    canopyGlows.push(glow);
  }
  var orbMat = new THREE.MeshBasicMaterial({ color: 0xfff1c4 });
  var threadMat = new THREE.MeshBasicMaterial({ color: 0xffd6f4 });
  var dawnOrbs = [];
  hangPoints.forEach(function (hp, n) {
    var pivot = new THREE.Group();
    pivot.position.copy(hp);
    var drop = 0.7 + rand() * 0.6;
    var thread = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, drop, 4), threadMat);
    thread.position.y = -drop / 2;
    pivot.add(thread);
    var orb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), orbMat);
    orb.position.y = -drop - 0.1;
    pivot.add(orb);
    var halo = dawnGlow(n % 2 ? 0xffd27a : 0xff9be0, 0.9, 0.7);
    halo.position.copy(orb.position);
    pivot.add(halo);
    tree.add(pivot);
    dawnOrbs.push({ pivot: pivot, halo: halo, p: rand() * 6.28 });
  });

  // Little glowing mushrooms tucked between the roots
  var mushStem = new THREE.MeshStandardMaterial({ color: 0xf4ecf7, roughness: 0.7 });
  var mushCap = new THREE.MeshStandardMaterial({ color: 0x9fe6ff, emissive: 0x58c8ff, emissiveIntensity: 0.4, roughness: 0.5 });
  var capGeo = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  for (var mu = 0; mu < 9; mu++) {
    var ma = (mu / 9) * Math.PI * 2 + 0.45 + rand() * 0.3, md = 1.3 + rand() * 0.9, ms = 0.6 + rand() * 0.7;
    var mx = Math.cos(ma) * md, mz = Math.sin(ma) * md;
    place(new THREE.Mesh(new THREE.CylinderGeometry(0.035 * ms, 0.05 * ms, 0.22 * ms, 8), mushStem), mx, 0.11 * ms, mz, tree);
    place(new THREE.Mesh(capGeo, mushCap), mx, 0.2 * ms, mz, tree).scale.set(0.12 * ms, 0.08 * ms, 0.12 * ms);
  }

  // Petals drifting down from the blossoms
  var PETALS = 70;
  var petalTex = dawnPaint(32, 32, function (g) {
    g.fillStyle = '#fff';
    g.beginPath(); g.ellipse(16, 16, 12, 7, 0.6, 0, Math.PI * 2); g.fill();
  });
  var petalGeo = new THREE.BufferGeometry();
  petalGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PETALS * 3), 3));
  var petals = new THREE.Points(petalGeo, new THREE.PointsMaterial({ map: petalTex, color: 0xffb8ec, size: 0.14, transparent: true, alphaTest: 0.3, depthWrite: false }));
  tree.add(petals);
  var petalState = [];
  function resetPetal(pt, anywhere) {
    var a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 3.4;
    pt.x = Math.cos(a) * r; pt.z = Math.sin(a) * r;
    pt.y = anywhere ? rand() * 5.5 : 4.5 + rand() * 1.5;
    pt.speed = 0.25 + rand() * 0.25; pt.p = rand() * 6.28;
  }
  for (var pe = 0; pe < PETALS; pe++) { var pt = {}; resetPetal(pt, true); petalState.push(pt); }

  var treeLight = new THREE.PointLight(0xffa8ee, 1.2, 16, 2);
  treeLight.position.set(0, 4.8, 0);
  tree.add(treeLight);

  // Sparkles scattered over the ground round the tree mark where your mana refills
  var GROUND_SPARKS = 140;
  var groundSparkGeo = new THREE.BufferGeometry();
  groundSparkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(GROUND_SPARKS * 3), 3));
  groundSparkGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(GROUND_SPARKS * 3), 3));
  var groundSparks = new THREE.Points(groundSparkGeo, new THREE.PointsMaterial({
    map: dawnGlowTex, size: 0.38, vertexColors: true, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  tree.add(groundSparks);
  var sparkTints = [new THREE.Color(0xff9be0), new THREE.Color(0xffe08a), new THREE.Color(0xc9a0ff), new THREE.Color(0xffffff)];
  var groundSparkState = [];
  function resetGroundSpark(sk, anyHeight) {
    var a = rand() * Math.PI * 2, r = 1.3 + Math.sqrt(rand()) * (TREE_ZONE - 1.1);
    sk.x = Math.cos(a) * r; sk.z = Math.sin(a) * r;
    sk.y = anyHeight ? rand() * 1.2 : 0.05;
    sk.rise = 0.12 + rand() * 0.2; sk.p = rand() * 6.28; sk.speed = 2 + rand() * 3;
    sk.tint = sparkTints[Math.floor(rand() * sparkTints.length)];
  }
  for (var gs = 0; gs < GROUND_SPARKS; gs++) { var sk = {}; resetGroundSpark(sk, true); groundSparkState.push(sk); }
  scene.add(tree);
  solids.push({ x: TREE_X, z: TREE_Z, r: 1.2 });
  seed = seedBeforeDawn;
  // fallen blossom petals round the Dawn Tree: soft drifts of curled petals, whole little blossoms here and there,
  // and petals still floating down from the branches. They glow softly, brighter at night.
  var groundPetalGeo = (function () {                                  // a cherry-blossom petal: rounded, with a little notch at the tip, curled up at the edges
    var sh = new THREE.Shape();
    sh.moveTo(0, -0.06);
    sh.bezierCurveTo(0.03, -0.055, 0.07, -0.01, 0.06, 0.035); sh.quadraticCurveTo(0.05, 0.065, 0.02, 0.062);
    sh.quadraticCurveTo(0.008, 0.06, 0, 0.045);                        // the notch
    sh.quadraticCurveTo(-0.008, 0.06, -0.02, 0.062); sh.quadraticCurveTo(-0.05, 0.065, -0.06, 0.035);
    sh.bezierCurveTo(-0.07, -0.01, -0.03, -0.055, 0, -0.06);
    var g = new THREE.ShapeGeometry(sh, 8), p = g.attributes.position, cols = [];
    for (var i = 0; i < p.count; i++) {
      var px = p.getX(i), py = p.getY(i), k = (py + 0.06) / 0.125, edge = Math.min(1, Math.abs(px) / 0.06);
      p.setXYZ(i, px, py, px * px * 7 + k * k * 0.018);                // cupped, with the tip lifting off the ground
      var c = [0.86 + k * 0.14, 0.42 + k * 0.5, 0.68 + k * 0.28];      // rosy at the base, pearly pale at the tip
      cols.push(c[0] - edge * 0.04, c[1] + edge * 0.05, c[2] + edge * 0.03);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    g.rotateX(-Math.PI / 2);
    g.computeVertexNormals();
    return g;
  })();
  var groundPetalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.4, side: THREE.DoubleSide, emissive: 0xff4fa8, emissiveIntensity: 0.4 });
  var PETAL_TINTS = [0xffffff, 0xffe0f0, 0xffc8e6, 0xf6d8ff, 0xffd0dc];
  function petalHash(n) { var x = Math.sin(n) * 43758.5453; return x - Math.floor(x); }
  var petalSpots = [];                                                 // where petals land: soft drifts round the roots and out along the ground
  for (var dr = 0; dr < 26; dr++) {
    var da = petalHash(dr * 3.1) * Math.PI * 2, dd = 1.3 + Math.pow(petalHash(dr * 7.7), 1.3) * 4.6;
    petalSpots.push([TREE_X + Math.cos(da) * dd, TREE_Z + Math.sin(da) * dd, 0.5 + petalHash(dr * 5.3) * 0.7, 30 + Math.floor(petalHash(dr * 2.9) * 40)]);
  }
  for (var rg = 0; rg < 14; rg++) { var ra = rg / 14 * Math.PI * 2; petalSpots.push([TREE_X + Math.cos(ra) * 1.6, TREE_Z + Math.sin(ra) * 1.6, 0.6, 40]); } // a ring round the roots
  var PETALS_ON_GROUND = 0;
  petalSpots.forEach(function (sp) { PETALS_ON_GROUND += sp[3]; });
  PETALS_ON_GROUND += 260;                                             // plus a light sprinkle everywhere in between
  var groundPetals = new THREE.InstancedMesh(groundPetalGeo, groundPetalMat, PETALS_ON_GROUND);
  var gpM = new THREE.Matrix4(), gpQ = new THREE.Quaternion(), gpE = new THREE.Euler(), gpP = new THREE.Vector3(), gpS = new THREE.Vector3(), gpC = new THREE.Color();
  var gpCount = 0, gpN = 0;
  function dropPetal(px, pz, size) {
    if (dist(px, pz, TREE_X, TREE_Z) < 1.05) return;                 // not inside the trunk
    gpN++;
    var h1 = petalHash(gpN * 1.37), h2 = petalHash(gpN * 2.71), h3 = petalHash(gpN * 4.13);
    gpE.set((h1 - 0.5) * 0.7, h2 * Math.PI * 2, (h3 - 0.5) * 0.7);    // each one lies at its own tilt and turn
    gpQ.setFromEuler(gpE);
    gpS.set(size, size, size);
    gpP.set(px, groundHeight(px, pz) + 0.015 + h3 * 0.02, pz);
    gpM.compose(gpP, gpQ, gpS);
    groundPetals.setMatrixAt(gpCount, gpM);
    groundPetals.setColorAt(gpCount, gpC.setHex(PETAL_TINTS[Math.floor(h1 * 97) % PETAL_TINTS.length]));
    gpCount++;
  }
  petalSpots.forEach(function (sp, si) {
    for (var k = 0; k < sp[3]; k++) {
      var a = petalHash(si * 91 + k * 1.3) * Math.PI * 2, r = Math.pow(petalHash(si * 37 + k * 2.1), 0.7) * sp[2];
      dropPetal(sp[0] + Math.cos(a) * r, sp[1] + Math.sin(a) * r * 0.8, 0.8 + petalHash(k * 3.3 + si) * 0.6);
    }
  });
  for (var sk2 = 0; sk2 < 260; sk2++) {
    var sa2 = petalHash(sk2 * 6.1) * Math.PI * 2, sd2 = 1.2 + petalHash(sk2 * 8.3) * 6;
    dropPetal(TREE_X + Math.cos(sa2) * sd2, TREE_Z + Math.sin(sa2) * sd2, 0.7 + petalHash(sk2) * 0.5);
  }
  groundPetals.count = gpCount;
  groundPetals.receiveShadow = true;
  scene.add(groundPetals);
  // a few whole fallen blossoms: five petals round a golden heart
  var blossomHeartMat = new THREE.MeshStandardMaterial({ color: 0xffe08a, emissive: 0xffb040, emissiveIntensity: 0.5, roughness: 0.5 });
  for (var fb = 0; fb < 22; fb++) {
    var fa = petalHash(fb * 11.7) * Math.PI * 2, fd = 1.4 + Math.pow(petalHash(fb * 13.1), 1.2) * 4.2;
    var fx = TREE_X + Math.cos(fa) * fd, fz = TREE_Z + Math.sin(fa) * fd;
    var flower = new THREE.Group();
    flower.position.set(fx, groundHeight(fx, fz) + 0.03, fz);
    flower.rotation.set((petalHash(fb) - 0.5) * 0.4, petalHash(fb * 3) * 6.28, (petalHash(fb * 5) - 0.5) * 0.4);
    for (var fp = 0; fp < 5; fp++) {
      var pet = new THREE.Mesh(groundPetalGeo, groundPetalMat);
      pet.rotation.y = fp / 5 * Math.PI * 2;
      pet.position.set(Math.sin(fp / 5 * Math.PI * 2) * 0.05, 0.005, Math.cos(fp / 5 * Math.PI * 2) * 0.05);
      pet.rotation.x = -0.25;
      flower.add(pet);
    }
    var fh = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), blossomHeartMat); fh.scale.y = 0.6; fh.position.y = 0.012; flower.add(fh);
    flower.scale.setScalar(1.2 + petalHash(fb * 7) * 0.5);
    scene.add(flower);
  }
  // a soft pink shimmer over the petal drifts
  var petalGlowPos = [];
  petalSpots.forEach(function (sp) { petalGlowPos.push(sp[0], groundHeight(sp[0], sp[1]) + 0.08, sp[1]); });
  var petalGlowGeo = new THREE.BufferGeometry();
  petalGlowGeo.setAttribute('position', new THREE.Float32BufferAttribute(petalGlowPos, 3));
  var petalGlowMat = new THREE.PointsMaterial({ map: dawnGlowTex, color: 0xff7fd0, size: 1.4, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false });
  scene.add(new THREE.Points(petalGlowGeo, petalGlowMat));
  // petals drifting down from the branches, fluttering as they fall
  var fallingPetals = [];
  for (var fpI = 0; fpI < 40; fpI++) {
    var fm = new THREE.Mesh(groundPetalGeo, groundPetalMat);
    fm.scale.setScalar(1.1);
    scene.add(fm);
    fallingPetals.push({ m: fm, t: petalHash(fpI * 9.1), a: petalHash(fpI * 4.4) * Math.PI * 2, r: 1 + petalHash(fpI * 6.6) * 4, sp: 0.06 + petalHash(fpI * 2.2) * 0.05, ph: fpI });
  }
  function updateFallingPetals(dt, t) {
    fallingPetals.forEach(function (f) {
      f.t += dt * f.sp;
      if (f.t > 1) { f.t -= 1; f.a = Math.random() * Math.PI * 2; f.r = 1 + Math.random() * 4; }
      var x = TREE_X + Math.cos(f.a) * f.r + Math.sin(t * 0.9 + f.ph) * 0.4 * f.t;
      var z = TREE_Z + Math.sin(f.a) * f.r + Math.cos(t * 0.7 + f.ph) * 0.4 * f.t;
      var y = 5.5 - f.t * 5.5 + groundHeight(x, z);
      f.m.position.set(x, Math.max(y, groundHeight(x, z) + 0.03), z);
      f.m.rotation.set(Math.sin(t * 3 + f.ph) * 1.2, t * 1.5 + f.ph, Math.cos(t * 2.4 + f.ph) * 1.0); // tumbling and fluttering
      f.m.visible = f.t < 0.97;
    });
  }


  // Twinkle, sway and drift: called every frame from updateWorld
  var canopyFade = 1;
  function updateDawnTree(dt, t, night, pulse) {
    dawnBarkMat.emissiveIntensity = 0.3 + night * 1.2 + pulse * 0.5;
    blossomMat.emissiveIntensity = 0.22 + night * 0.5 + pulse * 0.1;
    strandMat.emissiveIntensity = 0.45 + night * 0.8 + pulse * 0.2;
    mushCap.emissiveIntensity = 0.3 + night * 1.4;
    treeLight.intensity = 0.9 + night * 1.6 + pulse * 0.3;
    var gp = groundSparkGeo.attributes.position, gc = groundSparkGeo.attributes.color;
    groundSparkState.forEach(function (sk, n) {
      sk.y += sk.rise * dt;
      if (sk.y > 1.3) resetGroundSpark(sk, false);
      var fade = Math.min(1, sk.y * 6) * (1 - sk.y / 1.3);        // fade in near the ground, out as it rises
      var twinkle = Math.max(0, Math.sin(t * sk.speed + sk.p));   // each sparkle blinks on and off
      var bright = fade * twinkle * (1.3 + pulse * 0.4 + night * 0.5);
      gp.setXYZ(n, sk.x + Math.sin(t * 0.8 + sk.p) * 0.05, sk.y, sk.z);
      gc.setXYZ(n, sk.tint.r * bright, sk.tint.g * bright, sk.tint.b * bright);
    });
    gp.needsUpdate = true;
    gc.needsUpdate = true;
    canopyGlows.forEach(function (g, n) { g.material.opacity = 0.12 + night * 0.25 + pulse * 0.06 + Math.sin(t * 1.3 + n) * 0.03; });
    dawnOrbs.forEach(function (o) {
      o.pivot.rotation.z = Math.sin(t * 1.1 + o.p) * 0.08;
      o.pivot.rotation.x = Math.cos(t * 0.8 + o.p) * 0.06;
      o.halo.material.opacity = 0.5 + night * 0.4 + Math.sin(t * 2.2 + o.p) * 0.12;
    });
    var pp = petalGeo.attributes.position;
    petalState.forEach(function (pt, n) {
      pt.y -= pt.speed * dt;
      pt.x += Math.sin(t * 1.2 + pt.p) * dt * 0.25;
      pt.z += Math.cos(t * 0.9 + pt.p) * dt * 0.25;
      if (pt.y < 0.05) resetPetal(pt, false);
      pp.setXYZ(n, pt.x, pt.y, pt.z);
    });
    pp.needsUpdate = true;
    // see-through blossoms when you walk under the tree, so they never hide you
    var near = dist(player.position.x, player.position.z, TREE_X, TREE_Z) < 4.5;
    canopyFade += ((near ? 0.45 : 1) - canopyFade) * Math.min(1, dt * 4);
    blossomMat.opacity = strandMat.opacity = canopyFade;
  }

  // ---------- The lake ----------
  // A random spot in water at least `minDepth` deep
  function waterSpot(minDepth) {
    for (var i = 0; i < 50; i++) {
      var e = lakeEdge(rand() * Math.PI * 2, 0, ISLAND - 1.3), f = rand() * 0.85;
      var x = LAKE_X + e.x * f, z = LAKE_Z + e.z * f;
      if (groundHeight(x, z) < WATER_Y - minDepth && !underDock(x, z)) return { x: x, z: z };
    }
    return { x: LAKE_X, z: LAKE_Z };
  }
  // Water surface: rings out from the lake's middle; each point knows how deep the water is there
  function waterGeometry() {
    var RINGS = 30, SEG = 128, pos = [], depth = [], idx = [];
    function vertex(x, z) {
      pos.push(x - LAKE_X, 0, z - LAKE_Z);
      depth.push(Math.max(0, WATER_Y - groundHeight(x, z)));
    }
    vertex(LAKE_X, LAKE_Z);
    for (var r = 1; r <= RINGS; r++) {
      for (var s = 0; s < SEG; s++) {
        var e = lakeEdge((s / SEG) * Math.PI * 2, 1.2, ISLAND - 0.4), f = r / RINGS;
        vertex(LAKE_X + e.x * f, LAKE_Z + e.z * f);
      }
    }
    for (var s2 = 0; s2 < SEG; s2++) idx.push(0, 1 + s2, 1 + (s2 + 1) % SEG);
    for (var r2 = 1; r2 < RINGS; r2++) {
      var in0 = 1 + (r2 - 1) * SEG, out0 = 1 + r2 * SEG;
      for (var s3 = 0; s3 < SEG; s3++) {
        var a = in0 + s3, b = in0 + (s3 + 1) % SEG, c = out0 + s3, d = out0 + (s3 + 1) % SEG;
        idx.push(a, c, b, b, c, d);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('depth', new THREE.Float32BufferAttribute(depth, 1));
    g.setIndex(idx);
    return g;
  }

  // Water that reflects the sky, catches sun glints, and gets bluer the deeper it is
  var waterUniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    uTime: { value: 0 },
    uNight: { value: 0 },
    uShallow: { value: new THREE.Color(0x4fb3b8) },
    uDeep: { value: new THREE.Color(0x14496e) },
    uSky: { value: new THREE.Color(0x9fd8ff) },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uSunColor: { value: new THREE.Color(0xffffff) }
  }]);
  var waterMat = new THREE.ShaderMaterial({
    uniforms: waterUniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: true,
    vertexShader: [
      'attribute float depth;',
      'varying float vDepth;',
      'varying vec3 vWorld;',
      '#include <fog_pars_vertex>',
      'void main() {',
      '  vDepth = depth;',
      '  vec4 world = modelMatrix * vec4(position, 1.0);',
      '  vWorld = world.xyz;',
      '  vec4 mvPosition = viewMatrix * world;',
      '  gl_Position = projectionMatrix * mvPosition;',
      '  #include <fog_vertex>',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform float uTime;',
      'uniform float uNight;',
      'uniform vec3 uShallow;',
      'uniform vec3 uDeep;',
      'uniform vec3 uSky;',
      'uniform vec3 uSunDir;',
      'uniform vec3 uSunColor;',
      'varying float vDepth;',
      'varying vec3 vWorld;',
      '#include <fog_pars_fragment>',
      'float waves(vec2 p) {',
      '  return 0.025 * sin(dot(p, vec2(1.0, 0.6)) * 2.3 + uTime * 1.4)',
      '       + 0.020 * sin(dot(p, vec2(-0.7, 1.0)) * 3.1 + uTime * 1.9)',
      '       + 0.012 * sin(dot(p, vec2(0.3, -1.0)) * 5.7 + uTime * 2.6)',
      '       + 0.008 * sin(dot(p, vec2(-1.0, -0.4)) * 9.3 + uTime * 3.3);',
      '}',
      'void main() {',
      '  vec2 p = vWorld.xz;',
      '  float h = waves(p);',
      '  vec3 n = normalize(vec3(-(waves(p + vec2(0.05, 0.0)) - h) / 0.05, 1.0, -(waves(p + vec2(0.0, 0.05)) - h) / 0.05));',
      '  vec3 v = normalize(cameraPosition - vWorld);',
      '  float fres = 0.04 + 0.96 * pow(1.0 - max(dot(n, v), 0.0), 5.0);',
      '  float d = smoothstep(0.0, 0.9, vDepth);',
      '  vec3 col = mix(uShallow, uDeep, d);',
      '  col = mix(col, mix(uSky, vec3(1.0), 0.2), fres * 0.85);',
      '  float spec = pow(max(dot(n, normalize(uSunDir + v)), 0.0), 180.0) * 1.5;',
      '  col += uSunColor * spec;',
      '  float foam = smoothstep(0.05, 0.0, vDepth) * (0.6 + 0.4 * sin(p.x * 7.0 + p.y * 5.0 + uTime * 2.0));',
      '  col = mix(col, vec3(0.93, 0.97, 0.97), clamp(foam, 0.0, 1.0) * 0.55);',
      '  col *= mix(1.0, 0.6, uNight);',
      '  float alpha = clamp(mix(0.3, 0.93, smoothstep(0.0, 0.6, vDepth)) + fres * 0.3 + spec + foam * 0.4, 0.0, 1.0);',
      '  gl_FragColor = vec4(col, alpha);',
      '  #include <fog_fragment>',
      '}'
    ].join('\n')
  });
  var water = new THREE.Mesh(waterGeometry(), waterMat);
  water.position.set(LAKE_X, WATER_Y, LAKE_Z);
  water.renderOrder = 1;
  scene.add(water);

  // Rocks on the lake bed, seen through the water
  for (var ur = 0; ur < 14; ur++) {
    var us = waterSpot(0.55); // deep enough that the rock stays fully under the surface
    var under = boulder(us.x, us.z, 0.4 + rand() * 0.5, 0.4);
    under.position.y = groundHeight(us.x, us.z);
    under.castShadow = false;
  }

  // Boulders scattered along the shore
  for (var sb = 0; sb < 34; sb++) {
    var sa = (sb / 34) * Math.PI * 2 + rand() * 0.12;
    if (nearDock(sa) || rand() < 0.35) continue; // leave gaps so it looks natural
    var se = lakeEdge(sa, -0.6 + rand() * 1.2, ISLAND - 1.1), ss = 0.3 + rand() * 0.55;
    var sx = LAKE_X + se.x, sz = LAKE_Z + se.z;
    boulder(sx, sz, ss, 0.7).position.y = groundHeight(sx, sz) + ss * 0.1;
    solids.push({ x: sx, z: sz, r: ss * 0.6 });
  }

  // Reeds and cattails growing in the shallows
  var reedGeo = new THREE.ConeGeometry(0.03, 0.9, 4);
  reedGeo.translate(0, 0.45, 0);
  var cattailGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.18, 6);
  var reedMat = mat(0x4f7d3c), cattailMat = mat(0x6e4a2a);
  for (var rc = 0; rc < 10; rc++) {
    var ra0 = rand() * Math.PI * 2;
    if (nearDock(ra0)) continue;
    var re = lakeEdge(ra0, -0.9, 16.6);
    for (var rd = 0; rd < 9; rd++) {
      var rx = LAKE_X + re.x + (rand() - 0.5) * 0.8, rz = LAKE_Z + re.z + (rand() - 0.5) * 0.8;
      var reed = place(new THREE.Mesh(reedGeo, reedMat), rx, groundHeight(rx, rz), rz);
      reed.scale.y = 0.8 + rand() * 0.7;
      reed.rotation.set((rand() - 0.5) * 0.25, 0, (rand() - 0.5) * 0.25);
      if (rd % 3 === 0) place(new THREE.Mesh(cattailGeo, cattailMat), 0, 0.82, 0, reed);
    }
  }

  // ---------- Lily pads ----------
  // A round pad with a V-shaped slit, curled-up rim, veins, spots and a yellowish edge
  function lilyPadGeometry(shift) {
    var RINGS = 6, SEG = 32, NOTCH = 0.4;
    var pos = [0, 0.003, 0], col = [], idx = [], c = new THREE.Color();
    var base = new THREE.Color(0x3d7a36), dark = new THREE.Color(0x24532a), vein = new THREE.Color(0x7aa54e);
    var rim = new THREE.Color(0x9aa23e), spot = new THREE.Color(0x6e5a2c);
    c.copy(base).lerp(vein, 0.4);
    col.push(c.r, c.g, c.b);
    for (var r = 1; r <= RINGS; r++) {
      var f = r / RINGS;
      for (var s = 0; s <= SEG; s++) {
        var a = NOTCH / 2 + (s / SEG) * (Math.PI * 2 - NOTCH);
        var rad = f * (1 + noise(Math.cos(a) * 3 + shift, Math.sin(a) * 3) * 0.07);
        var x = Math.cos(a) * rad, z = Math.sin(a) * rad;
        var y = f * f * f * 0.07 + Math.sin(a * 7 + shift) * 0.015 * f * f; // rim curls up and waves
        pos.push(x, y, z);
        c.copy(base).lerp(dark, Math.min(1, Math.max(0, noise(x * 7 + shift, z * 7) * 0.4 + 0.3)));
        var veinLine = Math.pow(Math.abs(Math.cos(a * 6.5)), 24);
        c.lerp(vein, veinLine * 0.6 * (1 - f * 0.6));
        if (f > 0.75) c.lerp(rim, (f - 0.75) * 1.4);
        if (noise(x * 13 + shift, z * 13 - shift) > 0.55) c.lerp(spot, 0.45);
        col.push(c.r, c.g, c.b);
      }
    }
    for (var s2 = 0; s2 < SEG; s2++) idx.push(0, 2 + s2, 1 + s2);
    for (var r2 = 1; r2 < RINGS; r2++) {
      var in0 = 1 + (r2 - 1) * (SEG + 1), out0 = 1 + r2 * (SEG + 1);
      for (var s3 = 0; s3 < SEG; s3++) {
        var ia = in0 + s3, ib = in0 + s3 + 1, oc = out0 + s3, od = out0 + s3 + 1;
        idx.push(ia, ib, oc, ib, od, oc);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  var padGeos = [0, 2.3, 4.6, 6.9].map(lilyPadGeometry);
  var padMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, side: THREE.DoubleSide });

  // Water lily flower: three rings of pointed petals around a yellow centre
  var lilyPetalGeo = new THREE.SphereGeometry(1, 10, 6);
  lilyPetalGeo.translate(0, 0, 1); // petal grows outward from its base
  var lilyWhite = new THREE.MeshStandardMaterial({ color: 0xfbf4f6, roughness: 0.6, emissive: 0x332229, emissiveIntensity: 0.15 });
  var lilyPink = new THREE.MeshStandardMaterial({ color: 0xf5aecb, roughness: 0.6, emissive: 0x3a1a28, emissiveIntensity: 0.15 });
  var lilyCenterMat = mat(0xf2c94c, 0xd9a520, 0.3);
  function waterLily(x, z, pink) {
    var flower = new THREE.Group();
    [[9, 0, 0.3, 1], [9, Math.PI / 9, 0.75, 0.85], [6, 0.2, 1.2, 0.6]].forEach(function (ringDef) {
      for (var i = 0; i < ringDef[0]; i++) {
        var holder = new THREE.Group();
        holder.rotation.y = ringDef[1] + (i / ringDef[0]) * Math.PI * 2;
        var petal = place(new THREE.Mesh(lilyPetalGeo, pink ? lilyPink : lilyWhite), 0, 0, 0, holder);
        petal.scale.set(0.055 * ringDef[3], 0.018, 0.13 * ringDef[3]);
        petal.rotation.x = -ringDef[2]; // tilt the petal up out of the water
        flower.add(holder);
      }
    });
    place(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.05, 10), lilyCenterMat), 0, 0.04, 0, flower);
    flower.position.set(x, WATER_Y + 0.03, z);
    scene.add(flower);
    return flower;
  }
  // A closed bud poking up out of the water
  function lilyBud(x, z) {
    var bud = place(new THREE.Mesh(lilyPetalGeo, lilyPink), x, WATER_Y, z);
    bud.scale.set(0.06, 0.06, 0.14);
    bud.rotation.x = -Math.PI / 2 + 0.2;
    return bud;
  }

  var lilyPads = [], lilyFlowers = [];
  for (var lc = 0; lc < 8; lc++) {
    // Small groups spaced evenly around the lake
    var ce = lakeEdge((lc / 8) * Math.PI * 2 + rand() * 0.4, 0, ISLAND - 1.3), cf = 0.3 + rand() * 0.45;
    var cs = { x: LAKE_X + ce.x * cf, z: LAKE_Z + ce.z * cf };
    var count = 2 + Math.floor(rand() * 3);
    for (var lpad = 0; lpad < count; lpad++) {
      var lx = cs.x + (rand() - 0.5) * 2.6, lz = cs.z + (rand() - 0.5) * 2.6;
      if (groundHeight(lx, lz) > WATER_Y - 0.1 || underDock(lx, lz)) continue;
      var pad = place(new THREE.Mesh(padGeos[Math.floor(rand() * 4)], padMat), lx, WATER_Y + 0.01, lz);
      pad.scale.setScalar(0.25 + rand() * 0.35);
      pad.rotation.y = rand() * Math.PI * 2;
      pad.castShadow = false;
      lilyPads.push(pad);
      if (lpad === 0 && lc % 3 === 0) lilyFlowers.push(waterLily(lx, lz, lc % 2 === 1));
      if (lpad === 1 && lc % 4 === 1) lilyBud(lx + 0.25, lz + 0.1);
    }
  }
  var rippleTimer = 0;

  // ---------- The dock ----------
  var dock = new THREE.Group();
  dock.position.set(dockStart.x, 0, dockStart.z);
  dock.rotation.y = Math.atan2(-dockIn.z, dockIn.x); // the dock's x axis points out over the water
  // How deep the lake bed is under a spot on the dock (dock-local x along, z across)
  function bedBelow(px, pz) {
    return groundHeight(dockStart.x + dockIn.x * px - dockIn.z * pz, dockStart.z + dockIn.z * px + dockIn.x * pz);
  }

  // Deck: long boards running the length of the dock in warm, sunny wood tones
  var woodTones = [mat(0xc89d6e), mat(0xb98b5c), mat(0xd2a877), mat(0xbf9363)];
  var trimWood = mat(0x8a6040), darkWood = mat(0x5e4029);
  var BOARDS = 9, boardW = DOCK_W / BOARDS;
  for (var bd = 0; bd < BOARDS; bd++) {
    place(new THREE.Mesh(new THREE.BoxGeometry(DOCK_LEN, 0.06, boardW - 0.015), woodTones[Math.floor(rand() * 4)]),
      DOCK_LEN / 2, DOCK_Y - 0.03, -DOCK_W / 2 + boardW * (bd + 0.5), dock);
  }
  var trimGeo = new THREE.BoxGeometry(DOCK_LEN, 0.1, 0.1);
  place(new THREE.Mesh(trimGeo, trimWood), DOCK_LEN / 2, DOCK_Y - 0.02, DOCK_W / 2 - 0.05, dock);
  place(new THREE.Mesh(trimGeo, trimWood), DOCK_LEN / 2, DOCK_Y - 0.02, -DOCK_W / 2 + 0.05, dock);
  place(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, DOCK_W), trimWood), DOCK_LEN - 0.06, DOCK_Y - 0.02, 0, dock);
  // Frame and pilings underneath, reaching down to the lake bed
  for (var fb = 0.6; fb < DOCK_LEN; fb += 1.3) {
    place(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, DOCK_W), darkWood), fb, DOCK_Y - 0.12, 0, dock);
    [-1, 1].forEach(function (sideSign) {
      var pz = sideSign * (DOCK_W / 2 - 0.2), bottom = bedBelow(fb, pz) - 0.1, top = DOCK_Y - 0.1;
      if (top - bottom > 0.05) {
        place(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, top - bottom, 8), darkWood), fb, (top + bottom) / 2, pz, dock);
      }
    });
  }

  // Mooring posts down one side, with dark caps and a rope band
  var POST_X = [0.3, 1.65, 3.0, 4.35, DOCK_LEN - 0.2], POST_Z = DOCK_W / 2 - 0.05, POST_TOP = DOCK_Y + 0.45;
  var postMat = mat(0x8a5e3c), capMat = mat(0x3e2b1f), bandMat = mat(0xd9c9a3), swagMat = mat(0x3a2d24);
  var redMat = mat(0xd9443a), whiteMat = mat(0xf4f1ea);
  POST_X.forEach(function (px, i) {
    var bottom = bedBelow(px, POST_Z) - 0.1;
    place(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, POST_TOP - bottom, 10), postMat), px, (POST_TOP + bottom) / 2, POST_Z, dock);
    place(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.07, 12), capMat), px, POST_TOP + 0.03, POST_Z, dock);
    place(new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), capMat), px, POST_TOP + 0.06, POST_Z, dock);
    place(new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.022, 6, 16), bandMat), px, POST_TOP - 0.12, POST_Z, dock).rotation.x = Math.PI / 2;

    // Red-and-white striped buoy hanging over the side
    var buoy = new THREE.Group();
    place(new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.32, 12), whiteMat), 0, 0, 0, buoy);
    place(new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.06, 12), redMat), 0, 0.09, 0, buoy);
    place(new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.06, 12), redMat), 0, -0.09, 0, buoy);
    place(new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 6), redMat), 0, -0.16, 0, buoy);
    place(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.25, 4), bandMat), 0, 0.28, 0, buoy);
    buoy.position.set(px + 0.25, DOCK_Y - 0.12, POST_Z + 0.12);
    buoy.rotation.set(0.15, 0, (i % 2 ? 1 : -1) * 0.08);
    dock.add(buoy);

    // Rope hanging in a loop to the next post
    if (i < POST_X.length - 1) {
      var nx = POST_X[i + 1];
      var curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(px, POST_TOP - 0.12, POST_Z + 0.1),
        new THREE.Vector3((px + nx) / 2, POST_TOP - 0.75, POST_Z + 0.16),
        new THREE.Vector3(nx, POST_TOP - 0.12, POST_Z + 0.1));
      place(new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.022, 6, false), swagMat), 0, 0, 0, dock);
    }
  });

  // Curly iron lamp posts down the other side, with two glowing globes each
  var ironMat = new THREE.MeshStandardMaterial({ color: 0x4a5058, roughness: 0.4, metalness: 0.6 });
  var globeMat = new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: 0xffd9a0, emissiveIntensity: 0.4, roughness: 0.3 });
  var dockLights = [];
  [1.0, 3.7].forEach(function (lx0) {
    var lamp = new THREE.Group();
    lamp.position.set(lx0, DOCK_Y, -DOCK_W / 2 + 0.18);
    place(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.14, 12), ironMat), 0, 0.07, 0, lamp);
    place(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.75, 8), ironMat), 0, 0.92, 0, lamp);
    place(new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.015, 6, 12), ironMat), 0, 0.5, 0, lamp);
    place(new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), ironMat), 0, 1.82, 0, lamp);
    [-1, 1].forEach(function (sideSign) {
      // A half-circle arm curling over from the pole, with a globe hanging from its end
      place(new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.018, 6, 16, Math.PI), ironMat), sideSign * 0.17, 1.5, 0, lamp);
      place(new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 12, Math.PI * 1.5), ironMat), sideSign * 0.08, 1.38, 0, lamp);
      place(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.06, 12), ironMat), sideSign * 0.34, 1.44, 0, lamp);
      place(new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), globeMat), sideSign * 0.34, 1.32, 0, lamp).castShadow = false;
    });
    var glow = new THREE.PointLight(0xffd9a0, 0, 7, 2);
    glow.position.set(0, 1.3, 0);
    lamp.add(glow);
    dockLights.push(glow);
    dock.add(lamp);
  });
  scene.add(dock);

  // ---------- Little rowboat tied to the end of the dock ----------
  var BOAT_L = 2.4, BOAT_W = 0.34, BOAT_D = 0.3;
  function hullHalfWidth(t) { return BOAT_W * Math.pow(Math.max(0, 1 - t * t), 0.5); }        // pointed at both ends
  function hullRise(t) { return 0.12 * t * t * t * t + (t > 0 ? 0.1 * t * t * t : 0); }       // ends sweep up, the front more
  function hullDepth(t) { return BOAT_D * (1 - 0.4 * t * t); }
  // A point on the hull: t runs -1 (back) to 1 (front), a runs 0..PI around the cross-section, s shrinks it inward
  function hullPoint(t, a, s) {
    s = s || 1;
    var y = hullRise(t) - hullDepth(t) * Math.pow(Math.sin(a), 0.8) * s; // slightly flatter bottom
    return new THREE.Vector3(t * BOAT_L / 2 * (s < 1 ? 0.97 : 1), y, hullHalfWidth(t) * Math.cos(a) * s);
  }
  // Hull skin with planks: outer = red paint, inner = natural wood
  function hullGeometry(s, plankA, plankB, seam) {
    var N = 32, R = 14, pos = [], col = [], idx = [], c = new THREE.Color();
    for (var i = 0; i <= N; i++) {
      for (var j = 0; j <= R; j++) {
        var a = (j / R) * Math.PI, p = hullPoint(-1 + 2 * i / N, a, s);
        pos.push(p.x, p.y, p.z);
        var band = (a / Math.PI) * 7;
        c.copy(Math.floor(band) % 2 ? plankA : plankB);
        if (Math.abs(band - Math.round(band)) < 0.08) c.lerp(seam, 0.35); // faint lines between planks
        col.push(c.r, c.g, c.b);
      }
    }
    for (var i2 = 0; i2 < N; i2++) {
      for (var j2 = 0; j2 < R; j2++) {
        var p0 = i2 * (R + 1) + j2, p1 = p0 + 1, p2 = p0 + R + 1, p3 = p2 + 1;
        idx.push(p0, p2, p1, p1, p2, p3);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  function boatTube(points, radius, material, closed) {
    return place(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, closed), points.length * 4, radius, 6, closed), material), 0, 0, 0, boat);
  }

  var boat = new THREE.Group();
  var hullMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, side: THREE.DoubleSide }); // varnished shine
  var rimWood = mat(0xa95e3c), ribWood = mat(0x4f2c1a), seatWood = mat(0xc79a6a);
  place(new THREE.Mesh(hullGeometry(1, new THREE.Color(0x9a4e33), new THREE.Color(0x8f4730), new THREE.Color(0x6a3322)), hullMat), 0, 0, 0, boat);
  place(new THREE.Mesh(hullGeometry(0.9, new THREE.Color(0x6b3f28), new THREE.Color(0x5f3722), new THREE.Color(0x3f2416)), hullMat), 0, 0, 0, boat);

  // Invisible "water blocker" just above the waterline, shaped like the inside of the boat.
  // It is drawn after the boat but before the lake, so the lake can't show through the hull.
  var keepDry = new THREE.Shape();
  for (var wi = 0; wi <= 32; wi++) {
    var wt = -0.97 + (wi / 32) * 1.94;
    if (wi === 0) keepDry.moveTo(wt * BOAT_L / 2, hullHalfWidth(wt) * 0.9);
    else keepDry.lineTo(wt * BOAT_L / 2, hullHalfWidth(wt) * 0.9);
  }
  for (var wj = 32; wj >= 0; wj--) {
    var wt2 = -0.97 + (wj / 32) * 1.94;
    keepDry.lineTo(wt2 * BOAT_L / 2, -hullHalfWidth(wt2) * 0.9);
  }
  var dryGeo = new THREE.ShapeGeometry(keepDry);
  dryGeo.rotateX(-Math.PI / 2);
  var dryPatch = new THREE.Mesh(dryGeo, new THREE.MeshBasicMaterial({
    colorWrite: false, depthWrite: true, transparent: true, opacity: 0, side: THREE.DoubleSide
  }));
  dryPatch.position.y = WATER_Y + 0.05 - (WATER_Y + 0.17); // a little above the water, in the boat's own space
  dryPatch.renderOrder = 0; // the lake uses renderOrder 1, so this goes first
  boat.add(dryPatch);

  // Thick rim all the way round the top edge
  var rimPoints = [];
  for (var bi = 0; bi <= 24; bi++) rimPoints.push(hullPoint(-0.98 + bi * 1.96 / 24, 0));
  for (var bj = 23; bj >= 1; bj--) rimPoints.push(hullPoint(-0.98 + bj * 1.96 / 24, Math.PI));
  boatTube(rimPoints, 0.04, rimWood, true);

  // Keel strip along the bottom, curling up into a tall prow at the front and a short post at the back
  var keelPoints = [];
  for (var kk = 0; kk <= 12; kk++) keelPoints.push(hullPoint(-1 + kk / 6, Math.PI / 2).add(new THREE.Vector3(0, -0.02, 0)));
  var bowTip = hullPoint(1, 0), sternTip = hullPoint(-1, 0);
  // the prow curls up and back over itself into a little scroll
  keelPoints.push(new THREE.Vector3(bowTip.x + 0.09, bowTip.y + 0.1, 0), new THREE.Vector3(bowTip.x + 0.11, bowTip.y + 0.22, 0),
    new THREE.Vector3(bowTip.x + 0.04, bowTip.y + 0.29, 0), new THREE.Vector3(bowTip.x - 0.03, bowTip.y + 0.24, 0));
  keelPoints.unshift(new THREE.Vector3(sternTip.x - 0.06, sternTip.y + 0.1, 0));
  boatTube(keelPoints, 0.04, rimWood, false);
  place(new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), rimWood), bowTip.x - 0.03, bowTip.y + 0.23, 0, boat);

  // Ribs, floorboards and two seats inside
  [-0.65, -0.35, 0, 0.35, 0.65].forEach(function (t) {
    var ribPoints = [];
    for (var k = 0; k <= 8; k++) ribPoints.push(hullPoint(t, (k / 8) * Math.PI, 0.9));
    boatTube(ribPoints, 0.016, ribWood, false);
  });
  [-0.08, 0.08].forEach(function (fz) {
    place(new THREE.Mesh(new THREE.BoxGeometry(BOAT_L * 0.55, 0.02, 0.1), ribWood), 0, -BOAT_D * 0.78, fz, boat);
  });
  [-0.35, 0.3].forEach(function (t) {
    var sx = t * BOAT_L / 2, sy = hullRise(t) - 0.07;
    place(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, hullHalfWidth(t) * 1.8), seatWood), sx, sy, 0, boat);
  });

  // Float it just past the end of the dock, nose pointing back at the dock
  var BOAT_Y = WATER_Y + 0.17;
  boat.position.set(DOCK_LEN + BOAT_L / 2 + 0.25, BOAT_Y, 0.35);
  boat.rotation.y = Math.PI + 0.12;
  dock.add(boat);

  // Rope from the last mooring post to the tip of the prow
  var prowTop = new THREE.Vector3(bowTip.x + 0.1, bowTip.y + 0.18, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), boat.rotation.y).add(boat.position);
  var lastPost = new THREE.Vector3(POST_X[POST_X.length - 1], POST_TOP - 0.12, POST_Z);
  place(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(
    lastPost, new THREE.Vector3((lastPost.x + prowTop.x) / 2, BOAT_Y - 0.05, (lastPost.z + prowTop.z) / 2), prowTop), 16, 0.02, 6, false), bandMat), 0, 0, 0, dock);

  // Clear any lily pads that ended up under the boat
  dock.updateMatrixWorld(true);
  var boatWorld = dock.localToWorld(boat.position.clone());
  lilyPads.concat(lilyFlowers).forEach(function (item) {
    if (dist(item.position.x, item.position.z, boatWorld.x, boatWorld.z) < BOAT_L * 0.75) item.visible = false;
  });

  // ---------- Magical koi ----------
  // Real-looking fish (shaped body, scales, koi patches, swimming wave) with a touch of magic:
  // see-through fins that shift colour, glowing rune-dots, sparkles and a soft glow that brightens at night.
  var FISH_Y = WATER_Y - 0.12; // swimming depth, just under the surface
  var FISH_LEN = 0.62;
  var FISH_KINDS = [
    { back: 0xdfe8f0, belly: 0xffffff, patch: 0x5aa8e6, fin: 0xcfeaff, glow: 0x3fd8ff, hue: 0.53 }, // moon koi
    { back: 0xf3ece4, belly: 0xffffff, patch: 0xe8532a, fin: 0xffe0c8, glow: 0xffb83f, hue: 0.09 }, // ember koi
    { back: 0x3b3f8f, belly: 0xb9a6ff, patch: 0x7c5cff, fin: 0xd8ccff, glow: 0x8a5cff, hue: 0.74 }, // twilight koi
    { back: 0xffd6e6, belly: 0xfff4f8, patch: 0xe8508f, fin: 0xffd9ec, glow: 0xff5fc4, hue: 0.92 }  // rose koi
  ];

  // Soft round glow texture, drawn once on a little canvas
  var glowTexture = radialAlphaTex([[0, 1], [0.35, 0.4], [1, 0]]);

  // Fish body radius along its length: u = 0 at the tail, 1 at the nose
  function fishRadius(u) { return 0.012 + 0.085 * Math.pow(Math.sin(Math.PI * u), 0.8) * (0.55 + 0.45 * u); }
  function fishBodyGeometry(kind, shift) {
    var N = 22, R = 16, pos = [], col = [], idx = [], c = new THREE.Color();
    var back = new THREE.Color(kind.back), belly = new THREE.Color(kind.belly), patch = new THREE.Color(kind.patch);
    for (var i = 0; i <= N; i++) {
      var u = i / N, r = i === N ? 0 : fishRadius(u), x = (u - 0.5) * FISH_LEN;
      for (var j = 0; j < R; j++) {
        var a = (j / R) * Math.PI * 2, y = Math.cos(a) * r * 1.2, z = Math.sin(a) * r * 0.75;
        pos.push(x, y, z);
        c.copy(belly).lerp(back, Math.min(1, Math.max(0, Math.cos(a) * 0.8 + 0.5)));       // dark back, pale belly
        if (Math.cos(a) > -0.2 && noise(x * 16 + shift, Math.abs(z) * 10 + y * 12 + shift) > 0.2) c.lerp(patch, 0.85); // koi patches
        c.multiplyScalar(0.9 + 0.1 * Math.abs(Math.sin(x * 140) * Math.sin(a * 9)));      // scale shimmer
        col.push(c.r, c.g, c.b);
      }
    }
    for (var i2 = 0; i2 < N; i2++) {
      for (var j2 = 0; j2 < R; j2++) {
        var p0 = i2 * R + j2, p1 = i2 * R + (j2 + 1) % R, p2 = p0 + R, p3 = p1 + R;
        idx.push(p0, p2, p1, p1, p2, p3);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  // Fin shapes (drawn flat, then turned to face the right way)
  function finGeometry(points) {
    var shape = new THREE.Shape();
    shape.moveTo(points[0], points[1]);
    for (var i = 2; i < points.length; i += 4) shape.quadraticCurveTo(points[i], points[i + 1], points[i + 2], points[i + 3]);
    return new THREE.ShapeGeometry(shape, 10);
  }
  var tailGeo = finGeometry([0, 0, -0.12, 0.12, -0.3, 0.17, -0.2, 0.06, -0.24, 0, -0.2, -0.06, -0.3, -0.17, -0.12, -0.12, 0, 0]);
  var dorsalGeo = finGeometry([0.1, 0, 0.02, 0.1, -0.14, 0.05, -0.16, 0.02, -0.14, 0, -0.02, 0, 0.1, 0]);
  var sideFinGeo = finGeometry([0, 0, -0.03, 0.08, -0.11, 0.07, -0.07, 0.01, 0, 0]);
  var fishEyeGeo = new THREE.SphereGeometry(0.016, 8, 6);
  var fishEyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 });
  var runeGeo = new THREE.SphereGeometry(0.013, 6, 4);

  function makeFish(kind, shift) {
    var bodyGeo = fishBodyGeometry(kind, shift);
    var bodyMat = new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 0.3, metalness: 0.15,
      emissive: kind.glow, emissiveIntensity: 0.18, transparent: true, opacity: 0.92
    });
    var finMat = new THREE.MeshStandardMaterial({
      color: kind.fin, emissive: kind.glow, emissiveIntensity: 0.55, roughness: 0.3,
      transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false
    });
    var runeMat = new THREE.MeshBasicMaterial({ color: kind.glow, transparent: true, opacity: 0.6 });
    var fish = new THREE.Group();
    fish.add(new THREE.Mesh(bodyGeo, bodyMat));
    var tail = new THREE.Mesh(tailGeo, finMat);
    tail.position.x = -FISH_LEN / 2;
    fish.add(tail);
    var dorsal = new THREE.Mesh(dorsalGeo, finMat);
    dorsal.position.set(0.02, 0.085, 0);
    fish.add(dorsal);
    var sideFins = [-1, 1].map(function (side) {
      var fin = new THREE.Mesh(sideFinGeo, finMat);
      fin.position.set(0.1, -0.04, side * 0.05);
      fin.rotation.x = side * Math.PI / 2.6;
      fish.add(fin);
      return fin;
    });
    [-1, 1].forEach(function (side) {
      var eye = new THREE.Mesh(fishEyeGeo, fishEyeMat);
      eye.position.set(0.22, 0.025, side * 0.035);
      fish.add(eye);
      for (var k = 0; k < 4; k++) { // glowing rune-dots along each side
        var rune = new THREE.Mesh(runeGeo, runeMat);
        var rx = 0.12 - k * 0.055;
        rune.position.set(rx, 0.005, side * fishRadius(0.5 + rx / FISH_LEN) * 0.76);
        fish.add(rune);
      }
    });
    // Glowing koi whiskers trailing from the mouth
    var whiskerMat = new THREE.MeshBasicMaterial({ color: kind.glow, transparent: true, opacity: 0.85 });
    [-1, 1].forEach(function (side) {
      var whisker = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0.29, -0.01, side * 0.02),
        new THREE.Vector3(0.27, -0.03, side * 0.09),
        new THREE.Vector3(0.18, -0.02, side * 0.12));
      fish.add(new THREE.Mesh(new THREE.TubeGeometry(whisker, 8, 0.004, 4, false), whiskerMat));
    });
    // A soft magical aura around the whole fish
    var aura = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture, color: kind.glow, transparent: true, opacity: 0.4,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    aura.scale.set(0.9, 0.45, 1);
    fish.add(aura);
    fish.traverse(function (o) { o.renderOrder = 2; }); // drawn after the water so you can see them through it
    scene.add(fish);

    // A soft glow on the water above the fish (faint by day, brighter at night)
    var halo = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({
      map: glowTexture, color: kind.glow, transparent: true, opacity: 0.2,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    halo.rotation.x = -Math.PI / 2;
    halo.renderOrder = 2;
    scene.add(halo);

    return {
      group: fish, bodyGeo: bodyGeo, basePos: new Float32Array(bodyGeo.attributes.position.array),
      tail: tail, sideFins: sideFins, bodyMat: bodyMat, finMat: finMat, runeMat: runeMat, halo: halo, aura: aura, kind: kind
    };
  }

  // Water spray when a fish leaps (one shared pool, drawn in a single go)
  var SPARKS = 120;
  var sparkPos = new Float32Array(SPARKS * 3), sparkCol = new Float32Array(SPARKS * 3);
  var sparkInfo = [];
  for (var sp0 = 0; sp0 < SPARKS; sp0++) {
    sparkPos[sp0 * 3 + 1] = -100;
    sparkInfo.push({ life: 0, max: 1, vx: 0, vy: 0, vz: 0, color: new THREE.Color() });
  }
  var sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkCol, 3));
  var fishSparkles = new THREE.Points(sparkGeo, new THREE.PointsMaterial({
    size: 0.07, map: glowTexture, vertexColors: true, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  fishSparkles.renderOrder = 3;
  scene.add(fishSparkles);
  var nextSpark = 0;
  function sparkle(x, y, z, color, spread, rise) {
    var s = sparkInfo[nextSpark];
    sparkPos[nextSpark * 3] = x; sparkPos[nextSpark * 3 + 1] = y; sparkPos[nextSpark * 3 + 2] = z;
    s.vx = (Math.random() - 0.5) * spread; s.vz = (Math.random() - 0.5) * spread; s.vy = rise * (0.5 + Math.random());
    s.max = s.life = 0.8 + Math.random() * 0.8;
    s.color.set(color);
    nextSpark = (nextSpark + 1) % SPARKS;
  }

  // Each fish swims a lazy figure-of-eight around its own spot in deep, open water
  function loopPoint(f, a) {
    var lx = Math.cos(a) * f.rx, lz = Math.sin(2 * a) * f.rz * 0.5;
    return {
      x: f.hx + lx * Math.cos(f.turn) - lz * Math.sin(f.turn),
      z: f.hz + lx * Math.sin(f.turn) + lz * Math.cos(f.turn)
    };
  }
  function loopIsClear(f) {
    for (var i = 0; i < 24; i++) {
      var p = loopPoint(f, (i / 24) * Math.PI * 2);
      if (groundHeight(p.x, p.z) > WATER_Y - 0.3 || underDock(p.x, p.z)) return false;
      if (typeof boatWorld !== 'undefined' && dist(p.x, p.z, boatWorld.x, boatWorld.z) < 1.8) return false;
    }
    return true;
  }
  var fishes = [];
  var seedBeforeFish = seed; // so adding fish doesn't move the rest of the scenery
  for (var fi = 0; fi < 7; fi++) {
    var f = makeFish(FISH_KINDS[fi % FISH_KINDS.length], fi * 3.1);
    var placed = false;
    for (var tries = 0; tries < 40 && !placed; tries++) {
      var home = waterSpot(0.5);
      f.hx = home.x; f.hz = home.z;
      f.rx = 2.4 - tries * 0.05; f.rz = 1.8 - tries * 0.04;
      f.turn = rand() * Math.PI * 2;
      placed = loopIsClear(f);
    }
    f.speed = (0.3 + rand() * 0.2) * (rand() < 0.5 ? 1 : -1);
    f.phase = rand() * Math.PI * 2;
    f.jumpIn = 4 + rand() * 8; // seconds until its next leap
    f.jump = -1;                // -1 = swimming, 0..1 = mid-leap
    f.sparkIn = rand() * 2;
    fishes.push(f);
  }
  seed = seedBeforeFish;

  // How far the body bends sideways: none at the nose, most at the tail
  function swimBend(f, tailness, t, n) { return Math.sin(t * 6 + n - tailness * 4.5) * 0.045 * tailness * tailness; }

  function updateFish(dt, t, night) {
    fishes.forEach(function (f, n) {
      var a = t * f.speed + f.phase;
      var p = loopPoint(f, a), ahead = loopPoint(f, a + 0.05 * (f.speed > 0 ? 1 : -1));
      var g = f.group;
      g.position.x = p.x;
      g.position.z = p.z;
      g.rotation.y = Math.atan2(-(ahead.z - p.z), ahead.x - p.x); // face the way it's swimming

      // Swimming wave down the body
      var pos = f.bodyGeo.attributes.position, base = f.basePos;
      for (var i = 0; i < pos.count; i++) {
        var tailness = 0.5 - base[i * 3] / FISH_LEN; // 0 at the nose, 1 at the tail
        pos.array[i * 3 + 2] = base[i * 3 + 2] + swimBend(f, tailness, t, n);
      }
      pos.needsUpdate = true;
      var tipBend = swimBend(f, 1, t, n), nearTip = swimBend(f, 0.85, t, n);
      f.tail.position.z = tipBend;
      f.tail.rotation.y = Math.atan2(tipBend - nearTip, 0.15 * FISH_LEN) * 2.5;
      f.sideFins[0].rotation.z = Math.sin(t * 5 + n) * 0.35;
      f.sideFins[1].rotation.z = -Math.sin(t * 5 + n) * 0.35;

      // Now and then, a sparkly leap out of the water
      var y = FISH_Y + Math.sin(t * 1.3 + n) * 0.025, pitch = 0;
      f.jumpIn -= dt;
      if (f.jump < 0 && f.jumpIn <= 0) {
        f.jump = 0;
        ripple(p.x, p.z, 0xffffff, 0.9, 1.0);
        for (var b = 0; b < 18; b++) sparkle(p.x, WATER_Y + 0.05, p.z, 0xe8f6ff, 1.3, 0.9);   // a splash of water spray
      }
      if (f.jump >= 0) {
        f.jump += dt / 1.1;
        y += Math.sin(Math.PI * Math.min(f.jump, 1)) * 0.7;
        pitch = Math.cos(Math.PI * Math.min(f.jump, 1)) * 0.9;
        if (f.jump >= 1) {
          f.jump = -1;
          f.jumpIn = 6 + Math.random() * 8;
          ripple(p.x, p.z, 0xffffff, 1.1, 1.2);
          for (var b2 = 0; b2 < 24; b2++) sparkle(p.x, WATER_Y + 0.05, p.z, 0xe8f6ff, 1.5, 1.1);
        }
      }
      g.position.y = y;
      g.rotation.z = pitch;

      // Magic: fins slowly shift colour, rune-dots pulse, everything glows brighter at night
      var pulse = 0.5 + 0.5 * Math.sin(t * 2.2 + n);
      f.finMat.emissive.setHSL((f.kind.hue + Math.sin(t * 0.6 + n) * 0.18 + 1) % 1, 0.9, 0.6); // rainbow sheen
      f.finMat.emissiveIntensity = 0.55 + night * 0.9;
      f.bodyMat.emissiveIntensity = 0.15 + pulse * 0.08 + night * 0.6;
      f.runeMat.opacity = 0.6 + 0.4 * pulse;
      f.aura.material.opacity = 0.3 + pulse * 0.15 + night * 0.4;
      f.halo.position.set(p.x, WATER_Y + 0.01, p.z);
      f.halo.material.opacity = (0.35 + pulse * 0.1 + night * 0.5) * (f.jump >= 0 ? 0.4 : 1);

    });

    // Move and fade the sparkles
    for (var i = 0; i < SPARKS; i++) {
      var s = sparkInfo[i];
      if (s.life <= 0) { sparkPos[i * 3 + 1] = -100; continue; }
      s.life -= dt;
      sparkPos[i * 3] += s.vx * dt;
      sparkPos[i * 3 + 1] += s.vy * dt;
      sparkPos[i * 3 + 2] += s.vz * dt;
      var fade = Math.max(0, s.life / s.max);
      sparkCol[i * 3] = s.color.r * fade; sparkCol[i * 3 + 1] = s.color.g * fade; sparkCol[i * 3 + 2] = s.color.b * fade;
    }
    sparkGeo.attributes.position.needsUpdate = true;
    sparkGeo.attributes.color.needsUpdate = true;
  }

  // ---------- Grass, rocks and bushes ----------
  function freeSpot(padding) {
    for (var i = 0; i < 60; i++) {
      var a = rand() * Math.PI * 2, r = 3 + rand() * (WALK_R - 2.5);
      var x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (Math.abs(x - FARM_X) < COLS * TILE / 2 + padding && Math.abs(z - FARM_Z) < ROWS * TILE / 2 + padding) continue;
      if (dist(x, z, TREE_X, TREE_Z) < TREE_ZONE + 1.5) continue;
      if (nearLake(x, z)) continue;
      if (dist(x, z, FARM_X, FARM_Z + 5) < 2) continue;
      var blocked = false; // keep clear of rocks, bushes and anything else already placed
      for (var s = 0; s < solids.length; s++) {
        if (dist(x, z, solids[s].x, solids[s].z) < solids[s].r + padding) { blocked = true; break; }
      }
      if (blocked) continue;
      return { x: x, z: z };
    }
    return null;
  }

  // Thousands of grass tufts, drawn in one go so it stays fast. Each tuft is five curved,
  // tapering blades, dark at the base and light at the tips, and they sway in the breeze
  function tuftGeometry() {
    var pos = [], col = [], idx = [], base = 0, c = new THREE.Color();
    var dark = new THREE.Color(0x2f5a22), light = new THREE.Color(0xd2ec92);
    for (var b = 0; b < 5; b++) {
      var ang = (b / 5) * Math.PI * 2 + b * 0.7, lean = 0.1 + (b % 3) * 0.08;
      var dx = Math.cos(ang), dz = Math.sin(ang), px = -dz, pz = dx;  // which way it leans, and its width
      var ox = dx * 0.04, oz = dz * 0.04, h = 0.3 + (b % 2) * 0.14, w = 0.032;
      for (var i = 0; i <= 3; i++) {
        var f = i / 3, y = f * h, bend = lean * f * f * h * 2.4, ww = w * (1 - f * 0.9);
        var cx = ox + dx * bend, cz = oz + dz * bend;
        pos.push(cx - px * ww, y, cz - pz * ww, cx + px * ww, y, cz + pz * ww);
        c.copy(dark).lerp(light, Math.pow(f, 0.8));
        col.push(c.r, c.g, c.b, c.r, c.g, c.b);
      }
      for (var k = 0; k < 3; k++) {
        var a = base + k * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      base += 8;
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  var grassMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.9 });
  grassMat.onBeforeCompile = function (shader) {
    shader.uniforms.uGrassTime = forestTime;
    shader.vertexShader = 'uniform float uGrassTime;\n' + shader.vertexShader
      // light each blade like the ground under it, so tufts blend into the field
      .replace('#include <defaultnormal_vertex>', 'vec3 transformedNormal = normalMatrix * vec3(0.0, 1.0, 0.0);')
      // tips sway in the breeze, bases stay put
      .replace('#include <project_vertex>', [
        'vec4 mvPosition = instanceMatrix * vec4(transformed, 1.0);',
        'float tip = transformed.y * transformed.y * 6.0;',
        'mvPosition.x += sin(uGrassTime * 1.8 + mvPosition.x * 0.7 + mvPosition.z * 0.5) * tip * 0.05;',
        'mvPosition.z += cos(uGrassTime * 1.4 + mvPosition.x * 0.4 + mvPosition.z * 0.3) * tip * 0.035;',
        'mvPosition = modelViewMatrix * mvPosition;',
        'gl_Position = projectionMatrix * mvPosition;'
      ].join('\n'));
    shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_begin>',
      'float faceDirection = 1.0;\nvec3 normal = normalize(vNormal);\nvec3 geometryNormal = normal;');
  };
  var BLADES = 3000, OUTER_BLADES = 9000, GARDEN_BLADES = 260;
  var grass = new THREE.InstancedMesh(tuftGeometry(), grassMat, BLADES + OUTER_BLADES + GARDEN_BLADES);
  var gMatrix = new THREE.Matrix4(), gQuat = new THREE.Quaternion(), gEuler = new THREE.Euler();
  var gScale = new THREE.Vector3(), gPos = new THREE.Vector3(), gColor = new THREE.Color();
  var blades = 0;
  for (var gi = 0; gi < BLADES * 3 && blades < BLADES; gi++) {
    var ga = rand() * Math.PI * 2, gr = Math.sqrt(rand()) * 17.3;
    var gx = Math.cos(ga) * gr, gz = Math.sin(ga) * gr;
    if (Math.abs(gx - FARM_X) < COLS * TILE / 2 + 0.5 && Math.abs(gz - FARM_Z) < ROWS * TILE / 2 + 0.5) continue;
    if (groundHeight(gx, gz) < -0.04 || underDock(gx, gz) || dist(gx, gz, TREE_X, TREE_Z) < 1.6) continue;
    gEuler.set((rand() - 0.5) * 0.5, rand() * Math.PI, (rand() - 0.5) * 0.5);
    gQuat.setFromEuler(gEuler);
    var gs = 0.6 + rand() * 0.9;
    gScale.set(gs, gs * (0.6 + rand() * 0.9), gs);
    gPos.set(gx, groundHeight(gx, gz), gz);
    gMatrix.compose(gPos, gQuat, gScale);
    grass.setMatrixAt(blades, gMatrix);
    gColor.setHSL(0.24 + rand() * 0.07, 0.35 + rand() * 0.2, 0.55 + rand() * 0.2);
    grass.setColorAt(blades, gColor);
    blades++;
  }
  for (var ob = 0; ob < OUTER_BLADES; ob++) { // grass across the outer land
    var os = outerSpot(0.6);
    if (!os || groundHeight(os.x, os.z) < -0.04 || underDock(os.x, os.z)) continue;
    gEuler.set((outerRand() - 0.5) * 0.5, outerRand() * Math.PI, (outerRand() - 0.5) * 0.5);
    gQuat.setFromEuler(gEuler);
    var ogs = 0.6 + outerRand() * 0.9;
    gScale.set(ogs, ogs * (0.6 + outerRand() * 0.9), ogs);
    gPos.set(os.x, groundHeight(os.x, os.z), os.z);
    gMatrix.compose(gPos, gQuat, gScale);
    grass.setMatrixAt(blades, gMatrix);
    gColor.setHSL(0.24 + outerRand() * 0.07, 0.35 + outerRand() * 0.2, 0.55 + outerRand() * 0.2);
    grass.setColorAt(blades, gColor);
    blades++;
  }
  for (var gb2 = 0; gb2 < GARDEN_BLADES; gb2++) { // grass over the old garden patch, with its own random numbers so nothing else moves
    var gh = function (k) { var v = Math.sin((gb2 + 1) * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
    var gpx = FARM_X + (gh(1) - 0.5) * (COLS * TILE + 1), gpz = FARM_Z + (gh(2) - 0.5) * (ROWS * TILE + 1);
    gEuler.set((gh(3) - 0.5) * 0.5, gh(4) * Math.PI, (gh(5) - 0.5) * 0.5);
    gQuat.setFromEuler(gEuler);
    var pgs = 0.6 + gh(6) * 0.9;
    gScale.set(pgs, pgs * (0.6 + gh(7) * 0.9), pgs);
    gPos.set(gpx, groundHeight(gpx, gpz), gpz);
    gMatrix.compose(gPos, gQuat, gScale);
    grass.setMatrixAt(blades, gMatrix);
    gColor.setHSL(0.24 + gh(8) * 0.07, 0.35 + gh(9) * 0.2, 0.55 + gh(10) * 0.2);
    grass.setColorAt(blades, gColor);
    blades++;
  }
  grass.count = blades;
  grass.instanceMatrix.needsUpdate = true;
  if (grass.instanceColor) grass.instanceColor.needsUpdate = true;
  grass.receiveShadow = true;
  scene.add(grass);

  // Little wildflowers dotted through the grass: a thin stem with a tiny flower head
  var FLOWERS = 360, OUTER_FLOWERS = 1000;
  var stemGeoW = new THREE.CylinderGeometry(0.006, 0.008, 0.22, 4);
  stemGeoW.translate(0, 0.11, 0);
  var headGeoW = new THREE.IcosahedronGeometry(0.035, 0);
  headGeoW.scale(1, 0.55, 1);
  headGeoW.translate(0, 0.23, 0);
  var flowerStems = new THREE.InstancedMesh(stemGeoW, new THREE.MeshStandardMaterial({ color: 0x4f8a3a, roughness: 0.9 }), FLOWERS + OUTER_FLOWERS);
  var flowerHeads = new THREE.InstancedMesh(headGeoW, new THREE.MeshStandardMaterial({ roughness: 0.6 }), FLOWERS + OUTER_FLOWERS);
  var FLOWER_COLORS = [0xffffff, 0xfff3a8, 0xffc4e8, 0xc9b3ff, 0xffd27a].map(function (c) { return new THREE.Color(c); });
  var wfM = new THREE.Matrix4(), wfQ = new THREE.Quaternion(), wfE = new THREE.Euler(), wfP = new THREE.Vector3(), wfS = new THREE.Vector3();
  var wildflowers = 0;
  for (var wf = 0; wf < FLOWERS * 4 && wildflowers < FLOWERS; wf++) {
    var h1 = Math.sin(wf * 12.9898) * 43758.5453, h2 = Math.sin(wf * 78.233) * 12345.6789, h3 = Math.sin(wf * 39.425) * 24634.6345;
    h1 -= Math.floor(h1); h2 -= Math.floor(h2); h3 -= Math.floor(h3);
    // flowers grow in little drifts: more where this noise is high
    var wa = h1 * Math.PI * 2, wr = Math.sqrt(h2) * 16.8, wx = Math.cos(wa) * wr, wz = Math.sin(wa) * wr;
    if (noise(wx * 0.6 + 3, wz * 0.6 - 1) < 0.05 + h3 * 0.2) continue;
    if (Math.abs(wx - FARM_X) < COLS * TILE / 2 + 0.6 && Math.abs(wz - FARM_Z) < ROWS * TILE / 2 + 0.6) continue;
    if (groundHeight(wx, wz) < -0.03 || underDock(wx, wz) || dist(wx, wz, TREE_X, TREE_Z) < 2.2 || pathDist(wx, wz) < PATH_W + 0.2) continue;
    wfE.set((h3 - 0.5) * 0.3, h1 * 6.28, (h2 - 0.5) * 0.3);
    wfQ.setFromEuler(wfE);
    var wsz = 0.8 + h3 * 0.6;
    wfS.set(wsz, wsz, wsz);
    wfP.set(wx, groundHeight(wx, wz), wz);
    wfM.compose(wfP, wfQ, wfS);
    flowerStems.setMatrixAt(wildflowers, wfM);
    flowerHeads.setMatrixAt(wildflowers, wfM);
    flowerHeads.setColorAt(wildflowers, FLOWER_COLORS[Math.floor(h2 * 997) % FLOWER_COLORS.length]);
    wildflowers++;
  }
  for (var of = 0; of < OUTER_FLOWERS * 3 && wildflowers < FLOWERS + OUTER_FLOWERS; of++) { // and across the outer land
    var ofs = outerSpot(1), oh = outerRand();
    if (!ofs || noise(ofs.x * 0.6 + 3, ofs.z * 0.6 - 1) < 0.05 + oh * 0.2) continue;
    if (groundHeight(ofs.x, ofs.z) < -0.03 || underDock(ofs.x, ofs.z)) continue;
    wfE.set((oh - 0.5) * 0.3, outerRand() * 6.28, (outerRand() - 0.5) * 0.3);
    wfQ.setFromEuler(wfE);
    var owsz = 0.8 + oh * 0.6;
    wfS.set(owsz, owsz, owsz);
    wfP.set(ofs.x, groundHeight(ofs.x, ofs.z), ofs.z);
    wfM.compose(wfP, wfQ, wfS);
    flowerStems.setMatrixAt(wildflowers, wfM);
    flowerHeads.setMatrixAt(wildflowers, wfM);
    flowerHeads.setColorAt(wildflowers, FLOWER_COLORS[Math.floor(outerRand() * FLOWER_COLORS.length)]);
    wildflowers++;
  }
  flowerStems.count = flowerHeads.count = wildflowers;
  scene.add(flowerStems);
  scene.add(flowerHeads);

  // ---------- The second island: a grassy island out to sea, past the front of yours ----------
  // Not joined to your island yet; one day it'll be the town square. For now it's open grass and wildflowers
  var ISLE2_X = 0, ISLE2_Z = 121, ISLE2 = 42, ISLE2_SQ = 6;          // its middle, half its width, and how square it is (its near edge still meets the bridge)
  var SHOP_X = ISLE2_X - 8, SHOP_Z = 104, SHOP_TURN = Math.PI + 0.45, SHOP_HW = 4.6, SHOP_HD = 3.2; // the seed shop, off to one side, its door turned toward the bridge
  // the stone path from the end of the bridge to Whimsy & Bloom's front steps: a gentle curve through these points
  var SP_PTS = [[0, 80.6], [-0.2, 84.5], [-1.6, 89], [-4.4, 93.4], [-7.6, 96.9], [SHOP_X + Math.sin(SHOP_TURN) * (SHOP_HD + 0.62), SHOP_Z + Math.cos(SHOP_TURN) * (SHOP_HD + 0.62)]];
  var SP_W = 0.95;                                                     // half the width of the path
  // the doctor's office: across the square from Whimsy & Bloom, on the right as you come off the bridge, its door turned toward the bridge
  var CLINIC_X = ISLE2_X + 13, CLINIC_Z = 113, CLINIC_TURN = Math.PI + 0.3, CLINIC_HW = 5, CLINIC_HD = 3.8;
  function clinicFront(d) { return { x: CLINIC_X + Math.sin(CLINIC_TURN) * (CLINIC_HD + d), z: CLINIC_Z + Math.cos(CLINIC_TURN) * (CLINIC_HD + d) }; }
  function clinicLocal(x, z) {                                         // a spot in the clinic's own directions: x across its front, z out of its door
    var dx = x - CLINIC_X, dz = z - CLINIC_Z, c = Math.cos(CLINIC_TURN), si = Math.sin(CLINIC_TURN);
    return [dx * c - dz * si, dx * si + dz * c];
  }
  function onClinicLot(x, z, m) { var l = clinicLocal(x, z); return Math.abs(l[0]) < CLINIC_HW + 0.95 + m && l[1] > -CLINIC_HD - 0.95 - m && l[1] < CLINIC_HD + (Math.abs(l[0]) < 1.8 ? 1.9 : 0.95) + m; }   // the building, its porch and its flower beds
  // a second stone path, branching off the first just past the bridge and curving across to the clinic's front steps
  var CP_PTS = [[-0.05, 83.2], [2.6, 87.3], [6.2, 92.6], [8.9, 98.2], [10.3, 103.4], [clinicFront(1.75).x, clinicFront(1.75).z]];
  function stoneCurve(pts, n) {                                        // a curve through the points, cut into many short steps
    var c = new THREE.CatmullRomCurve3(pts.map(function (q) { return new THREE.Vector3(q[0], 0, q[1]); }));
    return c.getSpacedPoints(n).map(function (v) { return [v.x, v.z]; });
  }
  // the animal shop on the Western Isle, and its stone path from the west bridge to its doors (the bridge lands at x -80.5, z 6)
  var ANIMAL_X = -110, ANIMAL_Z = -6, ANIMAL_TURN = Math.PI / 2 + 0.25, ANIMAL_HW = 4, ANIMAL_HD = 5;   // its doors face back toward the bridge
  function animalFront(d) { return { x: ANIMAL_X + Math.sin(ANIMAL_TURN) * (ANIMAL_HD + d), z: ANIMAL_Z + Math.cos(ANIMAL_TURN) * (ANIMAL_HD + d) }; }
  function onAnimalLot(x, z, m) {                                      // the barn, its pen and the clutter out front
    var dx = x - ANIMAL_X, dz = z - ANIMAL_Z, c = Math.cos(ANIMAL_TURN), si = Math.sin(ANIMAL_TURN), lx = dx * c - dz * si, lz = dx * si + dz * c;
    return lx > -ANIMAL_HW - 0.6 - m && lx < ANIMAL_HW + 1.7 + m && lz > -ANIMAL_HD - 0.6 - m && lz < ANIMAL_HD + 1.4 + m;
  }
  var AP_PTS = [[-81.2, 6], [-85, 5.7], [-89.5, 4.6], [-94, 3.0], [-98.5, 1.0], [animalFront(1.6).x, animalFront(1.6).z]];
  var spLine = stoneCurve(SP_PTS, 160), cpLine = stoneCurve(CP_PTS, 170), apLine = stoneCurve(AP_PTS, 160);
  function lineBox(line) {                                             // the box round a path, so far-off spots can skip the sums
    var b = [1e9, -1e9, 1e9, -1e9];
    line.forEach(function (q) { b[0] = Math.min(b[0], q[0] - 3); b[1] = Math.max(b[1], q[0] + 3); b[2] = Math.min(b[2], q[1] - 3); b[3] = Math.max(b[3], q[1] + 3); });
    return b;
  }
  var spBox = lineBox(spLine), cpBox = lineBox(cpLine), apBox = lineBox(apLine);
  function lineDist(line, box, x, z) {
    if (x < box[0] || x > box[1] || z < box[2] || z > box[3]) return 99;   // nowhere near it
    var best = 1e9;
    for (var i = 0; i < line.length - 1; i++) {
      var ax = line[i][0], az = line[i][1], dx = line[i + 1][0] - ax, dz = line[i + 1][1] - az;
      var t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
      var ex = x - ax - dx * t, ez = z - az - dz * t, dd = ex * ex + ez * ez;
      if (dd < best) best = dd;
    }
    return Math.sqrt(best);
  }
  function stonePathDist(x, z) { return Math.min(lineDist(spLine, spBox, x, z), lineDist(cpLine, cpBox, x, z), lineDist(apLine, apBox, x, z)); }   // how far to the nearest stone path
  function isle2Edge(a) { return ISLE2 / Math.pow(Math.pow(Math.abs(Math.cos(a)), ISLE2_SQ) + Math.pow(Math.abs(Math.sin(a)), ISLE2_SQ), 1 / ISLE2_SQ); }
  function isle2Hash(n) { var v = Math.sin(n * 12.9898 + 4.1) * 43758.5453; return v - Math.floor(v); } // its own random numbers, so nothing on your island moves
  function isle2Band(sTop, sBot, yTop, yBot) {                        // its grassy rim and cliffs, like your island's
    var SEG = 160, pos = [], idx = [];
    for (var i = 0; i <= SEG; i++) {
      var a = (i / SEG) * Math.PI * 2, e = isle2Edge(a);
      pos.push(ISLE2_X + Math.cos(a) * e * sTop, yTop, ISLE2_Z + Math.sin(a) * e * sTop, ISLE2_X + Math.cos(a) * e * sBot, yBot, ISLE2_Z + Math.sin(a) * e * sBot);
    }
    for (var j = 0; j < SEG; j++) { var k = j * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  scene.add(new THREE.Mesh(isle2Band(1.03, 0.92, 0, -2.4), sideMat));
  scene.add(new THREE.Mesh(isle2Band(0.92, 0.3, -2.4, -12), cliffMat));
  var isle2Top = (function () {                                       // the grassy top, coloured like your island's grass
    var RINGS = 70, SEG = 200, pos = [], col = [], uv = [], idx = [], c = new THREE.Color();
    var grassA = new THREE.Color(0x8fcb68), grassB = new THREE.Color(0x5a9643), lush = new THREE.Color(0x4a8a3a), sunny = new THREE.Color(0xb8cf72);
    for (var r = 0; r <= RINGS; r++) {
      for (var sg = 0; sg <= SEG; sg++) {
        var a = (sg / SEG) * Math.PI * 2, rr = (r / RINGS) * isle2Edge(a) * 1.03;
        var x = ISLE2_X + Math.cos(a) * rr, z = ISLE2_Z + Math.sin(a) * rr;
        pos.push(x, 0, z);
        uv.push(x * 0.55, z * 0.55);
        c.copy(grassA).lerp(grassB, noise(x * 0.8, z * 0.8) * 0.5 + 0.5);
        var lushy = noise(x * 0.45 - 7, z * 0.45 + 2);
        if (lushy > 0.15) c.lerp(lush, Math.min(0.7, (lushy - 0.15) * 1.4));
        var patch = noise(x * 2.7 + 5, z * 2.7 - 3);
        if (patch > 0.3) c.lerp(sunny, Math.min(0.8, (patch - 0.3) * 1.5));
        c.multiplyScalar(0.94 + noise(x * 9, z * 9) * 0.06);
        col.push(c.r, c.g, c.b);
      }
    }
    for (var r2 = 0; r2 < RINGS; r2++) {
      for (var s2 = 0; s2 < SEG; s2++) {
        var p0 = r2 * (SEG + 1) + s2, p1 = p0 + SEG + 1;
        idx.push(p0, p0 + 1, p1, p0 + 1, p1 + 1, p1);   // (wound so the grass faces up)
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return new THREE.Mesh(g, terrain.material);
  })();
  isle2Top.receiveShadow = true;
  scene.add(isle2Top);
  function onIsle2(x, z, margin) {
    var dx = x - ISLE2_X, dz = z - ISLE2_Z;
    return Math.pow(Math.pow(Math.abs(dx), ISLE2_SQ) + Math.pow(Math.abs(dz), ISLE2_SQ), 1 / ISLE2_SQ) < ISLE2 - margin;
  }
  var ISLE2_BLADES = 26000, isle2Grass = new THREE.InstancedMesh(tuftGeometry(), grassMat, ISLE2_BLADES), i2n = 0;
  for (var ib = 0; ib < ISLE2_BLADES * 2 && i2n < ISLE2_BLADES; ib++) {   // thick grass all over: short, medium and tall clumps
    var ix = ISLE2_X + (isle2Hash(ib * 3.1) * 2 - 1) * ISLE2, iz = ISLE2_Z + (isle2Hash(ib * 7.7) * 2 - 1) * ISLE2;
    if (!onIsle2(ix, iz, 0.5) || dist(ix, iz, SHOP_X, SHOP_Z) < 5.9 || onClinicLot(ix, iz, 0.2) || stonePathDist(ix, iz) < SP_W + 0.15) continue; // (none growing through the shop floor)
    var meadow = noise(ix * 0.35 + 11, iz * 0.35 - 4);                 // some patches grow longer and lusher than others
    gEuler.set((isle2Hash(ib * 1.3) - 0.5) * 0.6, isle2Hash(ib * 2.9) * Math.PI, (isle2Hash(ib * 5.3) - 0.5) * 0.6);
    gQuat.setFromEuler(gEuler);
    var igs = 0.5 + isle2Hash(ib * 9.1) * 0.8 + Math.max(0, meadow) * 0.6;
    var tall = isle2Hash(ib * 6.6) < 0.12 ? 1.6 : 1;                   // now and then a tall clump
    gScale.set(igs, igs * (0.55 + isle2Hash(ib * 4.4) * 0.9) * tall, igs);
    gPos.set(ix, 0, iz);
    gMatrix.compose(gPos, gQuat, gScale);
    isle2Grass.setMatrixAt(i2n, gMatrix);
    var sunny = isle2Hash(ib * 2.7) < 0.25;                           // a mix of deep greens and sunny yellow-greens
    gColor.setHSL((sunny ? 0.19 : 0.25) + isle2Hash(ib * 6.2) * 0.06, 0.35 + isle2Hash(ib * 8.3) * 0.25, (sunny ? 0.6 : 0.42) + isle2Hash(ib * 2.2) * 0.22);
    isle2Grass.setColorAt(i2n, gColor);
    i2n++;
  }
  isle2Grass.count = i2n;
  isle2Grass.frustumCulled = false;
  isle2Grass.receiveShadow = true;
  scene.add(isle2Grass);
  var ISLE2_FLOWERS = 1500, isle2Stems = new THREE.InstancedMesh(stemGeoW, flowerStems.material, ISLE2_FLOWERS), isle2Heads = new THREE.InstancedMesh(headGeoW, flowerHeads.material, ISLE2_FLOWERS), i2f = 0;
  for (var iw = 0; iw < ISLE2_FLOWERS * 4 && i2f < ISLE2_FLOWERS; iw++) {   // wildflowers in little drifts
    var fx = ISLE2_X + (isle2Hash(iw * 13.7) * 2 - 1) * ISLE2, fz = ISLE2_Z + (isle2Hash(iw * 17.3) * 2 - 1) * ISLE2, fh = isle2Hash(iw * 3.3);
    if (!onIsle2(fx, fz, 1) || dist(fx, fz, SHOP_X, SHOP_Z) < 6.2 || onClinicLot(fx, fz, 0.6) || stonePathDist(fx, fz) < SP_W + 0.6 || noise(fx * 0.6 + 3, fz * 0.6 - 1) < 0.05 + fh * 0.2) continue;
    wfE.set((fh - 0.5) * 0.3, isle2Hash(iw * 5.5) * 6.28, 0);
    wfQ.setFromEuler(wfE);
    wfS.setScalar(0.8 + fh * 0.6);
    wfP.set(fx, 0, fz);
    wfM.compose(wfP, wfQ, wfS);
    isle2Stems.setMatrixAt(i2f, wfM);
    isle2Heads.setMatrixAt(i2f, wfM);
    isle2Heads.setColorAt(i2f, FLOWER_COLORS[Math.floor(isle2Hash(iw * 7.1) * FLOWER_COLORS.length)]);
    i2f++;
  }
  isle2Stems.count = isle2Heads.count = i2f;
  isle2Stems.frustumCulled = isle2Heads.frustumCulled = false;
  scene.add(isle2Stems);
  scene.add(isle2Heads);

  // ---------- The grand floating bridge: from the south edge of your island out to the new island ----------
  // A wide stone bridge in carved limestone, floating in a gentle arch with no pillars into the sea. Paved deck, thick
  // carved edge beams, a balustrade of turned stone balusters with a handrail, tall iron lamp posts on stone plinths,
  // a great arched gateway at each end, and under the deck a rugged rock keel with crystals glinting in it
  var BRIDGE_X = 0, BRIDGE_Z0 = 31.5, BRIDGE_Z1 = 80.5, BRIDGE_W = 3.4, BRIDGE_RISE = 1.6;
  var bridgeFirstChild = scene.children.length, bridgeFirstSolid = solids.length;   // (everything built from here on is the bridge: it's copied for the second bridge)
  function onBridge(x, z) { return Math.abs(x - BRIDGE_X) < BRIDGE_W / 2 - 0.45 && z > BRIDGE_Z0 - 1 && z < BRIDGE_Z1 + 1; }
  function bridgeY(z) {                                               // the height of the walkway: level with the land at each end, arching up in the middle
    var t = Math.max(0, Math.min(1, (z - BRIDGE_Z0) / (BRIDGE_Z1 - BRIDGE_Z0)));
    return 0.06 + Math.sin(t * Math.PI) * BRIDGE_RISE;
  }
  function nearBridgeLanding(x, z, r) { return (Math.abs(x - BRIDGE_X) < 3.6 + r && z > BRIDGE_Z0 - 6 - r) || (Math.abs(z - BRIDGE2_Z) < 3.6 + r && x < -(BRIDGE_Z0 - 6 - r)); } // keep the way onto both bridges clear
  function bridgeStoneTexture(base, blocksX, blocksY, mortar) {                 // dressed limestone blocks with weathering
    return paintTexture(256, 256, function (g, w, h) {
      g.fillStyle = mortar; g.fillRect(0, 0, w, h);
      var bw = w / blocksX, bh = h / blocksY;
      for (var r = 0; r < blocksY; r++) {
        for (var c = -1; c <= blocksX; c++) {
          var x0 = c * bw + (r % 2) * bw / 2, n = r * 31 + c;
          var tone = 0.9 + isle2Hash(n * 1.7 + 3) * 0.16;
          var col = base.map(function (v) { return Math.min(255, Math.round(v * tone)); });
          g.fillStyle = 'rgb(' + col.join(',') + ')';
          g.fillRect(x0 + 1.5, r * bh + 1.5, bw - 3, bh - 3);
          for (var sp = 0; sp < 40; sp++) {                             // speckles and pits in the stone
            var v = isle2Hash(n * 7 + sp * 3.3);
            g.fillStyle = v < 0.5 ? 'rgba(60,55,50,' + (0.06 + v * 0.12) + ')' : 'rgba(255,255,250,' + ((v - 0.5) * 0.18) + ')';
            g.fillRect(x0 + 2 + isle2Hash(n + sp * 1.9) * (bw - 4), r * bh + 2 + isle2Hash(n * 3 + sp * 2.7) * (bh - 4), 1 + v * 2, 1 + v * 1.5);
          }
          g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x0 + 1.5, r * bh + 1.5, bw - 3, 1.5);      // lit top edge
          g.fillStyle = 'rgba(40,35,30,0.18)'; g.fillRect(x0 + 1.5, r * bh + bh - 3, bw - 3, 1.5);     // shadowed bottom edge
        }
      }
      for (var m = 0; m < 12; m++) {                                    // a little moss and water staining
        g.fillStyle = m % 3 ? 'rgba(90,110,60,0.12)' : 'rgba(80,70,60,0.1)';
        g.beginPath(); g.ellipse(isle2Hash(m * 7.1 + 9) * w, isle2Hash(m * 2.3 + 9) * h, 8 + isle2Hash(m) * 18, 4 + isle2Hash(m * 4) * 10, 0, 0, Math.PI * 2); g.fill();
      }
    });
  }
  var bridgePaveTex = bridgeStoneTexture([196, 190, 178], 3, 4, '#77706a');
  var bridgeWallTex = bridgeStoneTexture([206, 199, 186], 2, 3, '#8a837a');
  bridgeWallTex.wrapS = bridgeWallTex.wrapT = THREE.RepeatWrapping;
  var bridgeSmoothTex = bridgeStoneTexture([214, 208, 196], 1, 1, '#d0c8b8');
  var bridgePave = new THREE.MeshStandardMaterial({ map: bridgePaveTex, bumpMap: bridgePaveTex, bumpScale: 0.02, roughness: 0.9 });
  var bridgeWall = new THREE.MeshStandardMaterial({ map: bridgeWallTex, bumpMap: bridgeWallTex, bumpScale: 0.02, roughness: 0.88 });
  var bridgeCarved = new THREE.MeshStandardMaterial({ map: bridgeSmoothTex, color: 0xf2ece0, roughness: 0.75 });
  var keelRockTex = paintTexture(128, 128, function (g, w, h) {           // the rugged rock under the deck
    g.fillStyle = '#6e6862'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 900; i++) { var v = isle2Hash(i * 2.1 + 5); g.fillStyle = v < 0.5 ? 'rgba(40,36,34,' + v * 0.5 + ')' : 'rgba(170,160,150,' + (v - 0.5) * 0.5 + ')'; g.fillRect(isle2Hash(i * 3.3) * w, isle2Hash(i * 5.9) * h, 2 + v * 3, 1 + v * 2); }
    for (var s2 = 0; s2 < 10; s2++) { g.fillStyle = 'rgba(120,100,80,0.25)'; g.fillRect(0, isle2Hash(s2 * 4.4) * h, w, 2 + isle2Hash(s2) * 4); } // layered strata
  });
  keelRockTex.wrapS = keelRockTex.wrapT = THREE.RepeatWrapping;
  var keelRockMat = new THREE.MeshStandardMaterial({ map: keelRockTex, bumpMap: keelRockTex, bumpScale: 0.05, roughness: 0.95, flatShading: true });
  var bridgeIron = new THREE.MeshStandardMaterial({ color: 0x2a2a2e, roughness: 0.45, metalness: 0.7 });
  var bridgeGlass = new THREE.MeshStandardMaterial({ color: 0xfff1cc, emissive: 0xffc46a, emissiveIntensity: 1.1, roughness: 0.2, transparent: true, opacity: 0.9 });
  var bridgeCrystal = new THREE.MeshStandardMaterial({ color: 0xd9c6ff, emissive: 0x8a66e8, emissiveIntensity: 0.9, roughness: 0.15 });
  var bridgeGlows = [], bridgeDrifters = [];
  // A floating crystal lantern: an aged bronze frame with six panes of smoky violet glass round a glowing amethyst,
  // a crown of clear crystals on top and a crystal drop hanging beneath. It hovers, bobbing and turning slowly
  var lanternBronze = new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 0.38, metalness: 0.85 });
  var lanternPane = new THREE.MeshStandardMaterial({ color: 0xc9b2ff, emissive: 0x7a3cff, emissiveIntensity: 0.35, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.38, side: THREE.DoubleSide, depthWrite: false });
  var lanternCore = new THREE.MeshStandardMaterial({ color: 0xeedcff, emissive: 0xa45cff, emissiveIntensity: 1.6, roughness: 0.1 });
  var lanternGem = new THREE.MeshStandardMaterial({ color: 0xe6d6ff, emissive: 0x7b4ad8, emissiveIntensity: 0.45, roughness: 0.04, metalness: 0.25, flatShading: true });
  var gemGeo = new THREE.OctahedronGeometry(1, 0), bridgeLanterns = [];
  function makeCrystalLantern(x, y, z, seedN) {
    var lan = new THREE.Group(), body = new THREE.Group(), motes = [];
    lan.add(body);
    function add(geo, mat, px, py, pz, sx, sy, sz) { var m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); if (sx) m.scale.set(sx, sy, sz); body.add(m); return m; }
    // the bronze frame: a stepped base, a waisted collar, a domed cap with a ring of little spires
    add(new THREE.CylinderGeometry(0.075, 0.11, 0.03, 12), lanternBronze, 0, -0.19, 0);
    add(new THREE.CylinderGeometry(0.115, 0.115, 0.022, 12), lanternBronze, 0, -0.168, 0);
    add(new THREE.TorusGeometry(0.105, 0.009, 6, 24), lanternBronze, 0, -0.155, 0).rotation.x = Math.PI / 2;
    add(new THREE.TorusGeometry(0.1, 0.009, 6, 24), lanternBronze, 0, 0.155, 0).rotation.x = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.105, 0.1, 0.025, 12), lanternBronze, 0, 0.17, 0);
    var domePts = [[0.105, 0], [0.1, 0.03], [0.085, 0.07], [0.06, 0.1], [0.035, 0.12], [0.028, 0.14], [0.034, 0.155], [0.0, 0.16]].map(function (q) { return new THREE.Vector2(q[0], q[1]); });
    add(new THREE.LatheGeometry(domePts, 16), lanternBronze, 0, 0.18, 0);
    for (var sp = 0; sp < 6; sp++) {                                  // small spires round the rim of the dome
      var sa = sp / 6 * Math.PI * 2 + Math.PI / 6;
      add(new THREE.ConeGeometry(0.008, 0.05, 4), lanternBronze, Math.cos(sa) * 0.1, 0.205, Math.sin(sa) * 0.1);
    }
    var pane = add(new THREE.CylinderGeometry(0.098, 0.098, 0.3, 6, 1, true), lanternPane, 0, 0, 0); // violet glass
    pane.renderOrder = 2;
    for (var bar = 0; bar < 6; bar++) {                                // twisted bronze ribs with a leaf-curl at the top
      var ba = bar / 6 * Math.PI * 2;
      add(new THREE.CylinderGeometry(0.007, 0.007, 0.31, 5), lanternBronze, Math.cos(ba) * 0.098, 0, Math.sin(ba) * 0.098);
      var curl = add(new THREE.TorusGeometry(0.018, 0.004, 4, 10, Math.PI * 1.4), lanternBronze, Math.cos(ba) * 0.112, 0.125, Math.sin(ba) * 0.112);
      curl.rotation.y = -ba + Math.PI / 2;
    }
    add(new THREE.TorusGeometry(0.1, 0.006, 6, 24), lanternBronze, 0, 0, 0).rotation.x = Math.PI / 2; // a band round the middle of the glass
    // inside: a glowing amethyst point, standing in a tiny bronze cup, with smaller shards round it
    add(new THREE.CylinderGeometry(0.03, 0.02, 0.025, 8), lanternBronze, 0, -0.13, 0);
    var core = add(gemGeo, lanternCore, 0, -0.03, 0, 0.042, 0.1, 0.042);
    [[0.03, -0.09, 0.01, 0.4], [-0.025, -0.095, 0.02, -0.5], [0.0, -0.095, -0.032, 0.2]].forEach(function (c) {
      add(gemGeo, lanternCore, c[0], c[1], c[2], 0.016, 0.04, 0.016).rotation.z = c[3];
    });
    // a crown of clear crystals bursting from the top of the dome
    [[0, 0.42, 0, 0.032, 0.1, 0, 0], [0.035, 0.38, 0.01, 0.022, 0.07, 0, -0.45], [-0.032, 0.375, 0.018, 0.02, 0.065, 0.3, 0.45], [0.008, 0.37, -0.036, 0.019, 0.06, -0.45, 0.1], [-0.02, 0.365, -0.022, 0.015, 0.045, -0.3, 0.5]].forEach(function (c) {
      var gem = add(gemGeo, lanternGem, c[0], c[1], c[2], c[3], c[4], c[3]);
      gem.rotation.set(c[5], 0.3, c[6]);
    });
    // beneath: a bronze finial and a chain of three crystal drops
    add(new THREE.ConeGeometry(0.03, 0.06, 8), lanternBronze, 0, -0.235, 0).rotation.x = Math.PI;
    add(new THREE.SphereGeometry(0.012, 8, 6), lanternBronze, 0, -0.27, 0);
    add(gemGeo, lanternGem, 0, -0.31, 0, 0.022, 0.04, 0.022);
    add(new THREE.SphereGeometry(0.006, 6, 4), lanternBronze, 0, -0.355, 0);
    add(gemGeo, lanternGem, 0, -0.4, 0, 0.026, 0.055, 0.026);
    var inner = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xd2a8ff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
    inner.scale.set(0.38, 0.5, 1);
    lan.add(inner);
    var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0x8f5cff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.set(2.2, 2.2, 1);
    lan.add(halo);
    for (var mo = 0; mo < 4; mo++) {                                   // tiny sparks of light circling the lantern
      var mote = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xe9d6ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
      mote.scale.set(0.06, 0.06, 1);
      lan.add(mote);
      motes.push({ s: mote, a: mo / 4 * Math.PI * 2, r: 0.2 + isle2Hash(seedN + mo) * 0.08, h: (isle2Hash(seedN * 3 + mo) - 0.5) * 0.3 });
    }
    var pool = new THREE.Mesh(new THREE.CircleGeometry(0.9, 24), new THREE.MeshBasicMaterial({ map: dawnGlowTex, color: 0x9d6bff, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }));
    pool.rotation.x = -Math.PI / 2;                                      // a soft purple pool of light on the stone below
    pool.position.set(x, y - 1.33, z);
    scene.add(pool);
    lan.position.set(x, y, z);
    lan.scale.setScalar(1.45);                                          // a good size to see from across the bridge
    scene.add(lan);
    bridgeLanterns.push({ g: lan, body: body, core: core, inner: inner, halo: halo, pool: pool, motes: motes, y: y, p: seedN * 1.37 });
  }
  var SLAB_L = 1.0, slabCount = Math.round((BRIDGE_Z1 - BRIDGE_Z0) / SLAB_L);
  var deckGeo = new THREE.BoxGeometry(BRIDGE_W - 0.5, 0.3, SLAB_L + 0.02);
  var beamGeo = new THREE.BoxGeometry(0.28, 0.6, SLAB_L + 0.02);       // the thick carved edge beam on each side
  var corniceGeo = new THREE.BoxGeometry(0.4, 0.08, SLAB_L + 0.02);    // a moulded lip along its top
  var railGeo = new THREE.BoxGeometry(0.24, 0.1, SLAB_L + 0.02);       // the handrail
  var balPts = [[0.07, 0], [0.07, 0.04], [0.045, 0.06], [0.06, 0.14], [0.075, 0.22], [0.06, 0.3], [0.035, 0.38], [0.045, 0.43], [0.065, 0.46], [0.065, 0.5]].map(function (q) { return new THREE.Vector2(q[0], q[1]); });
  var balGeo = new THREE.LatheGeometry(balPts, 10);                    // a turned stone baluster
  var underBandGeo = new THREE.BoxGeometry(BRIDGE_W - 0.2, 0.5, SLAB_L + 0.02);   // the dressed stone just under the deck
  var corbelGeo = new THREE.BoxGeometry(0.3, 0.32, 0.36);
  var vineLeafGeo = new THREE.SphereGeometry(0.05, 6, 4), crystalGeo = new THREE.OctahedronGeometry(0.12, 0);
  var bridgeVine = new THREE.MeshStandardMaterial({ color: 0x4f8f42, roughness: 0.85 });
  var keelChunkMat = new THREE.MeshStandardMaterial({ vertexColors: true, bumpMap: keelRockTex, bumpScale: 0.05, roughness: 0.95, emissive: 0x16130f }); // (a touch of bounce light so the underside isn't black)
  var rootMatB = new THREE.MeshStandardMaterial({ color: 0x6a4f3a, roughness: 0.95 });
  var keelLight = new THREE.Color(0xa99f91), keelDeep = new THREE.Color(0x4b4540), keelMoss = new THREE.Color(0x5e7d44);
  var bridgeVineLight = new THREE.MeshStandardMaterial({ color: 0x7ab35a, roughness: 0.85 });
  var vineFlowerGeo = new THREE.SphereGeometry(0.035, 6, 5);
  var bridgeVineFlowerA = new THREE.MeshStandardMaterial({ color: 0xf6c4dd, roughness: 0.6 }), bridgeVineFlowerB = new THREE.MeshStandardMaterial({ color: 0xfff6e8, roughness: 0.6 });
  var BALS_PER = 3, balusters = new THREE.InstancedMesh(balGeo, bridgeCarved, slabCount * BALS_PER * 2), balN = 0, balM = new THREE.Matrix4(), balQ = new THREE.Quaternion(), balS = new THREE.Vector3(1, 1, 1), balP = new THREE.Vector3();
  function bridgePart(geo, mat, x, y, z, rx) {
    var m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.x = rx || 0;
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
    return m;
  }
  for (var sb = 0; sb < slabCount; sb++) {
    var z0 = BRIDGE_Z0 + sb * SLAB_L, zc = z0 + SLAB_L / 2, y0 = bridgeY(z0), y1 = bridgeY(z0 + SLAB_L), yc = (y0 + y1) / 2;
    var tilt = -Math.atan2(y1 - y0, SLAB_L);
    bridgePart(deckGeo, bridgePave, BRIDGE_X, yc - 0.15, zc, tilt);                                 // the paved deck
    [-1, 1].forEach(function (sd) {
      var ex = BRIDGE_X + sd * (BRIDGE_W / 2 - 0.14);
      bridgePart(beamGeo, bridgeWall, ex, yc - 0.12, zc, tilt);                                     // edge beam
      bridgePart(corniceGeo, bridgeCarved, ex + sd * 0.04, yc + 0.2, zc, tilt);                     // moulded lip
      bridgePart(railGeo, bridgeCarved, ex, yc + 0.78, zc, tilt);                                   // handrail
      for (var bl = 0; bl < BALS_PER; bl++) {                                                 // balusters between lip and rail
        var bz = z0 + (bl + 0.5) / BALS_PER * SLAB_L;
        balP.set(ex, bridgeY(bz) + 0.24, bz);
        balS.set(1, 1.08, 1);
        balM.compose(balP, balQ, balS);
        balusters.setMatrixAt(balN++, balM);
      }
    });
    if (zc > 34 && zc < 78 && isle2Hash(sb * 2.1) < 0.4) {           // a little ivy trailing over the edge of the stonework here and there
      var ivySd = isle2Hash(sb * 5) < 0.5 ? -1 : 1, ivyN = 1 + Math.floor(isle2Hash(sb * 6.6) * 3);
      for (var vn = 0; vn < ivyN; vn++) {
        var vx = BRIDGE_X + ivySd * (BRIDGE_W / 2 - 0.02), vz = zc + (isle2Hash(sb * 9 + vn) - 0.5) * 0.9;
        var vlen = 0.5 + isle2Hash(sb * 11 + vn) * 1.6, vtop = yc - 0.1;
        for (var lv = 0; lv < Math.round(vlen * 8); lv++) {
          var lt = lv / (vlen * 8), lf = bridgePart(vineLeafGeo, isle2Hash(lv * 5 + sb + vn) < 0.3 ? bridgeVineLight : bridgeVine,
            vx + ivySd * (0.03 + lt * 0.06) + (isle2Hash(sb + vn + lv * 3) - 0.5) * 0.06, vtop - lv / 8, vz + (isle2Hash(sb * 2 + lv + vn) - 0.5) * 0.12);
          lf.rotation.set(isle2Hash(lv * 3 + sb) * 3, isle2Hash(lv + sb * 5) * 6, 0);
          lf.scale.set(1.1 - lt * 0.5, 0.45, 0.9 - lt * 0.4);
          lf.castShadow = false;
        }
      }
    }
    if (sb % 7 === 3) [-1, 1].forEach(function (sd) {                 // floating crystal lanterns above the rails, in pairs
      makeCrystalLantern(BRIDGE_X + sd * (BRIDGE_W / 2 - 0.14), yc + 1.55, zc, sb * 2 + sd);
    });
  }
  balusters.count = balN;
  balusters.castShadow = balusters.receiveShadow = true;
  balusters.frustumCulled = false;
  scene.add(balusters);
  // Underneath: an old stone viaduct of round arches. Its piers never reached the ground: each one breaks off in jagged
  // stone a few metres down, with broken blocks still floating beneath it. A lantern hangs under the crown of each arch
  var PIER_GAP = 7, PIER_T = 1.1, ARCH_R = (PIER_GAP - PIER_T) / 2, DECK_UNDER = 0.27;
  var piers = [];
  for (var pz0 = BRIDGE_Z0 + 3.5 + PIER_GAP; pz0 < BRIDGE_Z1 - 4; pz0 += PIER_GAP) piers.push(pz0);
  function underside(z) {                                               // how far below the deck the stone reaches at z: arches between the piers
    var best = 0.7;
    for (var i = 0; i < piers.length - 1; i++) {
      var a = piers[i] + PIER_T / 2, b = piers[i + 1] - PIER_T / 2;
      if (z >= a && z <= b) { var dz = z - (a + b) / 2; return 0.55 + ARCH_R - Math.sqrt(Math.max(0, ARCH_R * ARCH_R - dz * dz)); }
    }
    for (var j = 0; j < piers.length; j++) if (Math.abs(z - piers[j]) <= PIER_T / 2) return 0.55 + ARCH_R;
    return best;                                                        // the short stretches at each end
  }
  (function () {
    var VZ0 = BRIDGE_Z0 + 2.0, VZ1 = BRIDGE_Z1 - 2.0, RINGS = 420, pos = [], uv = [], idx = [];
    var hw = BRIDGE_W / 2 - 0.02, R = 0.18, CORNER = 5, ACROSS = 10;
    var along = 0, lastZ = VZ0, lastY = bridgeY(VZ0), W = 0;
    for (var r = 0; r <= RINGS; r++) {
      var z = VZ0 + (VZ1 - VZ0) * r / RINGS, top = bridgeY(z) - DECK_UNDER, T = underside(z);
      along += Math.hypot(z - lastZ, bridgeY(z) - lastY); lastZ = z; lastY = bridgeY(z);
      var prof = [[-hw, 0]];                                            // down one face, round the corner, across the soffit, round and back up
      for (var k = 0; k <= CORNER; k++) { var a = Math.PI + k / CORNER * Math.PI / 2; prof.push([-hw + R + Math.cos(a) * R, -T + R + Math.sin(a) * R]); }
      for (var k2 = 1; k2 < ACROSS; k2++) prof.push([-hw + R + k2 / ACROSS * (2 * hw - 2 * R), -T]);
      for (var k3 = 0; k3 <= CORNER; k3++) { var a3 = Math.PI * 1.5 + k3 / CORNER * Math.PI / 2; prof.push([hw - R + Math.cos(a3) * R, -T + R + Math.sin(a3) * R]); }
      prof.push([hw, 0]);
      W = prof.length;
      var arc = 0;
      for (var p = 0; p < W; p++) {
        if (p > 0) arc += Math.hypot(prof[p][0] - prof[p - 1][0], prof[p][1] - prof[p - 1][1]);
        pos.push(BRIDGE_X + prof[p][0], top + prof[p][1], z);
        uv.push(p === 0 || p === W - 1 ? along / 2 : arc / 2, along / 2);
      }
    }
    for (var r2 = 0; r2 < RINGS; r2++) for (var s2 = 0; s2 < W - 1; s2++) {
      var p0 = r2 * W + s2, p1 = p0 + W;
      idx.push(p0, p0 + 1, p1, p0 + 1, p1 + 1, p1);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    var vault = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: bridgeWallTex, bumpMap: bridgeWallTex, bumpScale: 0.025, roughness: 0.9, side: THREE.DoubleSide }));
    vault.castShadow = vault.receiveShadow = true;
    scene.add(vault);
  })();
  function stoneBox(w, h, d) {                                          // a box whose stone blocks stay a sensible size
    var g = new THREE.BoxGeometry(w, h, d), uvs = g.attributes.uv;
    for (var i = 0; i < uvs.count; i++) {
      var face = Math.floor(i / 4), fw = face < 2 ? d : w, fh = face === 2 || face === 3 ? d : h;
      uvs.setXY(i, uvs.getX(i) * fw / 2, uvs.getY(i) * fh / 2);
    }
    return g;
  }
  var rubbleGeo = new THREE.DodecahedronGeometry(1, 0);
  piers.forEach(function (pz, n) {
    var top = bridgeY(pz) - DECK_UNDER - (0.55 + ARCH_R) + 0.02, pierH = 2.2 + isle2Hash(n * 3.1) * 1.4, pw = BRIDGE_W - 0.5;
    var pier = new THREE.Mesh(stoneBox(pw, pierH, PIER_T), bridgeWall); // the pier, carrying on down below the arches
    pier.position.set(BRIDGE_X, top - pierH / 2, pz);
    pier.castShadow = pier.receiveShadow = true;
    scene.add(pier);
    var impost = new THREE.Mesh(stoneBox(pw + 0.16, 0.14, PIER_T + 0.16), bridgeCarved);   // a carved band where the arches spring from it
    impost.position.set(BRIDGE_X, top + 0.02, pz);
    impost.castShadow = true;
    scene.add(impost);
    var base = top - pierH;
    for (var bk = 0; bk < 6; bk++) {                                    // the jagged broken end: stone blocks snapped off unevenly
      var bs = 0.28 + isle2Hash(n * 13 + bk) * 0.3;
      var chunkB = new THREE.Mesh(rubbleGeo, bridgeWall);
      chunkB.scale.set(bs * 1.3, bs * (1.2 + isle2Hash(n * 5 + bk) * 1.4), bs);
      chunkB.position.set(BRIDGE_X + (bk % 3 - 1) * pw * 0.32 + (isle2Hash(n + bk) - 0.5) * 0.2, base - bs * 0.5 * isle2Hash(n * 7 + bk), pz + (bk < 3 ? -0.22 : 0.22));
      chunkB.rotation.set(isle2Hash(bk + n) * 2, isle2Hash(bk * 3 + n) * 3, isle2Hash(bk * 5 + n));
      chunkB.castShadow = true;
      scene.add(chunkB);
    }
    for (var fb = 0; fb < 3; fb++) {                                    // broken blocks still floating where they fell away
      var blk = new THREE.Mesh(stoneBox(0.5, 0.36, 0.42), bridgeWall), bscale = 0.6 + isle2Hash(n * 17 + fb) * 0.7;
      blk.scale.setScalar(bscale);
      blk.position.set(BRIDGE_X + (isle2Hash(n * 19 + fb) - 0.5) * 2.2, base - 0.9 - fb * 0.7 - isle2Hash(n * 23 + fb) * 0.5, pz + (isle2Hash(n * 29 + fb) - 0.5) * 1.4);
      blk.rotation.set(isle2Hash(fb + n * 2) * 3, isle2Hash(fb * 7 + n) * 3, isle2Hash(fb * 11 + n) * 3);
      blk.castShadow = true;
      scene.add(blk);
      bridgeDrifters.push({ m: blk, y: blk.position.y, p: n * 2 + fb });
    }
    for (var iv = 0; iv < 4; iv++) {                                    // ivy climbing down the pier faces
      if (isle2Hash(n * 31 + iv) < 0.4) continue;
      var face = iv < 2 ? -1 : 1, ix = BRIDGE_X + (isle2Hash(n * 37 + iv) - 0.5) * pw * 0.8, ilen = 0.8 + isle2Hash(n * 41 + iv) * (pierH + 0.6);
      for (var il = 0; il < Math.round(ilen * 8); il++) {
        var t = il / (ilen * 8), leaf = bridgePart(vineLeafGeo, isle2Hash(il + n + iv) < 0.3 ? bridgeVineLight : bridgeVine,
          ix + Math.sin(il * 0.7 + iv) * 0.06, top - il / 8, pz + face * (PIER_T / 2 + 0.03));
        leaf.rotation.set(isle2Hash(il * 3 + n) * 3, isle2Hash(il + iv * 5) * 6, 0);
        leaf.scale.set(1.2 - t * 0.5, 0.45, 1 - t * 0.4);
        leaf.castShadow = false;
      }
    }
  });
  for (var ci = 0; ci < piers.length - 1; ci++) {                       // a lantern hanging from the crown of each arch
    var cz = (piers[ci] + piers[ci + 1]) / 2, crownY = bridgeY(cz) - DECK_UNDER - underside(cz), chainLen = 0.55;
    bridgePart(new THREE.CylinderGeometry(0.012, 0.012, chainLen, 5), bridgeIron, BRIDGE_X, crownY - chainLen / 2, cz);
    var ly = crownY - chainLen - 0.18;
    bridgePart(new THREE.ConeGeometry(0.16, 0.14, 6), bridgeIron, BRIDGE_X, ly + 0.2, cz);
    bridgePart(new THREE.CylinderGeometry(0.11, 0.09, 0.28, 6), bridgeGlass, BRIDGE_X, ly, cz).castShadow = false;
    bridgePart(new THREE.CylinderGeometry(0.09, 0.05, 0.06, 6), bridgeIron, BRIDGE_X, ly - 0.17, cz);
    var pg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffc878, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
    pg.position.set(BRIDGE_X, ly, cz);
    pg.scale.set(1.6, 1.6, 1);
    scene.add(pg);
    bridgeGlows.push({ s: pg, p: cz, lamp: true });
  }
  // a great arched gateway at each end: two massive stone piers, a semicircular arch of voussoirs with a carved keystone,
  // a cornice on top, and a lantern hanging from the arch
  [[BRIDGE_Z0 + 0.7, 0], [BRIDGE_Z1 - 0.7, Math.PI]].forEach(function (end) {
    var az = end[0], ay = bridgeY(az), gate = new THREE.Group();
    gate.position.set(BRIDGE_X, ay, az);
    gate.rotation.y = end[1];
    var PIER_X = BRIDGE_W / 2 + 0.15, PIER_H = 2.6, SPAN = PIER_X - 0.3;
    function gp(geo, mat, x, y, z) { var m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; gate.add(m); return m; }
    [-1, 1].forEach(function (sd) {
      gp(new THREE.BoxGeometry(0.85, 0.3, 0.85), bridgeCarved, sd * PIER_X, 0.15, 0);            // plinth
      gp(new THREE.BoxGeometry(0.62, PIER_H, 0.62), bridgeWall, sd * PIER_X, PIER_H / 2 + 0.3, 0); // the pier
      gp(new THREE.BoxGeometry(0.76, 0.14, 0.76), bridgeCarved, sd * PIER_X, PIER_H + 0.37, 0);  // impost
    });
    var archY = PIER_H + 0.44;
    for (var v = 0; v < 13; v++) {                                     // the arch, built from wedge-shaped voussoirs
      var a0 = v / 13 * Math.PI, a1 = (v + 1) / 13 * Math.PI;
      var vs = new THREE.Shape(), R1 = SPAN + 0.3, R0 = SPAN - 0.25;
      vs.moveTo(Math.cos(a0) * R0, Math.sin(a0) * R0); vs.lineTo(Math.cos(a0) * R1, Math.sin(a0) * R1);
      vs.lineTo(Math.cos(a1) * R1, Math.sin(a1) * R1); vs.lineTo(Math.cos(a1) * R0, Math.sin(a1) * R0); vs.closePath();
      var vg = new THREE.ExtrudeGeometry(vs, { depth: 0.56, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 1 });
      vg.translate(0, 0, -0.28);
      var vm = gp(vg, v === 6 ? bridgeCarved : bridgeWall, 0, archY, 0);
      if (v === 6) vm.scale.set(1.05, 1.08, 1.12);                     // the keystone stands proud
    }
    scene.add(gate);
    solids.push({ x: BRIDGE_X - PIER_X, z: az, r: 0.45 }, { x: BRIDGE_X + PIER_X, z: az, r: 0.45 }); // you walk between the piers
  });
  var bridgeEndSolid = solids.length;
  function updateBridge(t, night) {
    bridgeGlass.emissiveIntensity = 0.5 + (night || 0) * 1.3;            // the lamps glow brighter after dark
    var nt = night || 0;
    lanternCore.emissiveIntensity = 1.8 + nt * 0.8;
    lanternPane.emissiveIntensity = 0.6 + nt * 0.4;
    bridgeLanterns.forEach(function (l) {                              // the crystal lanterns float, sway, turn slowly and shimmer
      l.g.position.y = l.y + Math.sin(t * 1.1 + l.p) * 0.07;
      l.body.rotation.y = t * 0.25 + l.p;
      l.body.rotation.z = Math.sin(t * 0.8 + l.p) * 0.05;
      l.core.rotation.y = -t * 0.9;
      var pulse = Math.sin(t * 2.1 + l.p) * 0.5 + 0.5;
      l.inner.material.opacity = 0.7 + nt * 0.2 + pulse * 0.1;
      l.halo.material.opacity = 0.32 + nt * 0.3 + pulse * 0.06;
      l.pool.material.opacity = 0.08 + nt * 0.22 + pulse * 0.04;
      l.motes.forEach(function (m, i) {                                // the little sparks circle round
        var ang = m.a + t * (0.6 + i * 0.15);
        m.s.position.set(Math.cos(ang) * m.r, m.h + Math.sin(t * 1.3 + i) * 0.05, Math.sin(ang) * m.r);
        m.s.material.opacity = 0.5 + Math.sin(t * 4 + i * 2 + l.p) * 0.4;
      });
    });
    bridgeGlows.forEach(function (gl) { gl.s.material.opacity = gl.crystal ? 0.3 + Math.sin(t * 1.6 + gl.p) * 0.12 : 0.15 + (night || 0) * 0.45 + Math.sin(t * 3 + gl.p) * 0.03; });
    bridgeDrifters.forEach(function (d) { d.m.position.y = d.y + Math.sin(t * 0.7 + d.p) * 0.12; d.m.rotation.y = t * 0.12 + d.p; });
    updateBridge2();
  }
  // ---------- A second bridge, west to a third island ----------
  // The same grand floating bridge, built again off the west side of your island: every piece of the first bridge is
  // copied, turned to face west and set down here. Its floating lanterns bob and turn along with the first bridge's
  var BRIDGE2_Z = 6;                                                   // where it leaves your island's west side (it runs out along -x)
  var bridge2 = new THREE.Group();
  bridge2.position.set(0, 0, BRIDGE2_Z); bridge2.rotation.y = -Math.PI / 2;   // the first bridge's (x, z) becomes (-z, BRIDGE2_Z + x)
  scene.add(bridge2);
  var bridgeOriginals = scene.children.slice(bridgeFirstChild).filter(function (o) { return o !== bridge2; });
  var bridgeCopies = bridgeOriginals.map(function (o) { var c = o.clone(true); bridge2.add(c); return c; });
  var bridge2Sync = [];                                                // the moving parts, kept in step with the first bridge's
  bridgeLanterns.forEach(function (l) { var i = bridgeOriginals.indexOf(l.g); if (i >= 0) bridge2Sync.push([l.g, bridgeCopies[i]]); });
  bridgeDrifters.forEach(function (d) { var i = bridgeOriginals.indexOf(d.m); if (i >= 0) bridge2Sync.push([d.m, bridgeCopies[i]]); });
  function syncTree(a, b) {
    b.position.copy(a.position); b.quaternion.copy(a.quaternion); b.scale.copy(a.scale);
    for (var i = 0; i < a.children.length && i < b.children.length; i++) syncTree(a.children[i], b.children[i]);
  }
  function updateBridge2() { for (var i = 0; i < bridge2Sync.length; i++) syncTree(bridge2Sync[i][0], bridge2Sync[i][1]); }
  solids.slice(bridgeFirstSolid, bridgeEndSolid).forEach(function (s) { solids.push({ x: -s.z, z: BRIDGE2_Z + s.x, r: s.r }); });   // its piers bump you too
  function onBridge2(x, z) { return Math.abs(z - BRIDGE2_Z) < BRIDGE_W / 2 - 0.45 && x < -(BRIDGE_Z0 - 1) && x > -(BRIDGE_Z1 + 1); }

  // ---------- The third island, out to the west ----------
  // Open grass and wildflowers for now, waiting to become something new
  var ISLE3_X = -109, ISLE3_Z = BRIDGE2_Z, ISLE3 = 30, ISLE3_SQ = 5;   // its middle, half its width (its near edge meets the bridge), and how square it is
  function isle3Edge(a) { return ISLE3 / Math.pow(Math.pow(Math.abs(Math.cos(a)), ISLE3_SQ) + Math.pow(Math.abs(Math.sin(a)), ISLE3_SQ), 1 / ISLE3_SQ); }
  function isle3Band(sTop, sBot, yTop, yBot) {                        // its grassy rim and cliffs
    var SEG = 180, pos = [], idx = [];
    for (var i = 0; i <= SEG; i++) {
      var a = (i / SEG) * Math.PI * 2, e = isle3Edge(a);
      pos.push(ISLE3_X + Math.cos(a) * e * sTop, yTop, ISLE3_Z + Math.sin(a) * e * sTop, ISLE3_X + Math.cos(a) * e * sBot, yBot, ISLE3_Z + Math.sin(a) * e * sBot);
    }
    for (var j = 0; j < SEG; j++) { var k = j * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  scene.add(new THREE.Mesh(isle3Band(1.03, 0.92, 0, -2.4), sideMat));
  scene.add(new THREE.Mesh(isle3Band(0.92, 0.3, -2.4, -11), cliffMat));
  var isle3Top = (function () {                                       // the grassy top, coloured like the other islands' grass
    var RINGS = 56, SEG = 180, pos = [], col = [], uv = [], idx = [], c = new THREE.Color();
    var grassA = new THREE.Color(0x8fcb68), grassB = new THREE.Color(0x5a9643), lush = new THREE.Color(0x4a8a3a), sunny = new THREE.Color(0xb8cf72);
    for (var r = 0; r <= RINGS; r++) {
      for (var sg = 0; sg <= SEG; sg++) {
        var a = (sg / SEG) * Math.PI * 2, rr = (r / RINGS) * isle3Edge(a) * 1.03;
        var x = ISLE3_X + Math.cos(a) * rr, z = ISLE3_Z + Math.sin(a) * rr;
        pos.push(x, 0, z);
        uv.push(x * 0.55, z * 0.55);
        c.copy(grassA).lerp(grassB, noise(x * 0.8, z * 0.8) * 0.5 + 0.5);
        var lushy = noise(x * 0.45 - 7, z * 0.45 + 2);
        if (lushy > 0.15) c.lerp(lush, Math.min(0.7, (lushy - 0.15) * 1.4));
        var patch = noise(x * 2.7 + 5, z * 2.7 - 3);
        if (patch > 0.3) c.lerp(sunny, Math.min(0.8, (patch - 0.3) * 1.5));
        c.multiplyScalar(0.94 + noise(x * 9, z * 9) * 0.06);
        col.push(c.r, c.g, c.b);
      }
    }
    for (var r2 = 0; r2 < RINGS; r2++) for (var s2 = 0; s2 < SEG; s2++) {
      var p0 = r2 * (SEG + 1) + s2, p1 = p0 + SEG + 1;
      idx.push(p0, p0 + 1, p1, p0 + 1, p1 + 1, p1);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return new THREE.Mesh(g, terrain.material);
  })();
  isle3Top.receiveShadow = true;
  scene.add(isle3Top);
  function onIsle3(x, z, margin) {
    var dx = x - ISLE3_X, dz = z - ISLE3_Z;
    return Math.pow(Math.pow(Math.abs(dx), ISLE3_SQ) + Math.pow(Math.abs(dz), ISLE3_SQ), 1 / ISLE3_SQ) < ISLE3 - margin;
  }
  var ISLE3_BLADES = 14000, isle3Grass = new THREE.InstancedMesh(tuftGeometry(), grassMat, ISLE3_BLADES), i3n = 0;
  for (var ib3 = 0; ib3 < ISLE3_BLADES * 2 && i3n < ISLE3_BLADES; ib3++) {   // thick grass all over
    var jx = ISLE3_X + (isle2Hash(ib3 * 3.1 + 7000) * 2 - 1) * ISLE3, jz = ISLE3_Z + (isle2Hash(ib3 * 7.7 + 7000) * 2 - 1) * ISLE3;
    if (!onIsle3(jx, jz, 0.5) || onAnimalLot(jx, jz, 0) || stonePathDist(jx, jz) < SP_W + 0.15) continue;   // (none through the barn or the path)
    var meadow3 = noise(jx * 0.35 + 11, jz * 0.35 - 4);
    gEuler.set((isle2Hash(ib3 * 1.3 + 7000) - 0.5) * 0.6, isle2Hash(ib3 * 2.9 + 7000) * Math.PI, (isle2Hash(ib3 * 5.3 + 7000) - 0.5) * 0.6);
    gQuat.setFromEuler(gEuler);
    var jgs = 0.5 + isle2Hash(ib3 * 9.1 + 7000) * 0.8 + Math.max(0, meadow3) * 0.6;
    gScale.set(jgs, jgs * (0.55 + isle2Hash(ib3 * 4.4 + 7000) * 0.9) * (isle2Hash(ib3 * 6.6 + 7000) < 0.12 ? 1.6 : 1), jgs);
    gPos.set(jx, 0, jz);
    gMatrix.compose(gPos, gQuat, gScale);
    isle3Grass.setMatrixAt(i3n, gMatrix);
    var sunny3 = isle2Hash(ib3 * 2.7 + 7000) < 0.25;
    gColor.setHSL((sunny3 ? 0.19 : 0.25) + isle2Hash(ib3 * 6.2 + 7000) * 0.06, 0.35 + isle2Hash(ib3 * 8.3 + 7000) * 0.25, (sunny3 ? 0.6 : 0.42) + isle2Hash(ib3 * 2.2 + 7000) * 0.22);
    isle3Grass.setColorAt(i3n, gColor);
    i3n++;
  }
  isle3Grass.count = i3n;
  isle3Grass.frustumCulled = false;
  isle3Grass.receiveShadow = true;
  scene.add(isle3Grass);
  var ISLE3_FLOWERS = 800, isle3Stems = new THREE.InstancedMesh(stemGeoW, flowerStems.material, ISLE3_FLOWERS), isle3Heads = new THREE.InstancedMesh(headGeoW, flowerHeads.material, ISLE3_FLOWERS), i3f = 0;
  for (var iw3 = 0; iw3 < ISLE3_FLOWERS * 4 && i3f < ISLE3_FLOWERS; iw3++) {   // wildflowers in little drifts
    var kx = ISLE3_X + (isle2Hash(iw3 * 13.7 + 9000) * 2 - 1) * ISLE3, kz = ISLE3_Z + (isle2Hash(iw3 * 17.3 + 9000) * 2 - 1) * ISLE3, kh = isle2Hash(iw3 * 3.3 + 9000);
    if (!onIsle3(kx, kz, 1) || onAnimalLot(kx, kz, 0.5) || stonePathDist(kx, kz) < SP_W + 0.6 || noise(kx * 0.6 + 3, kz * 0.6 - 1) < 0.05 + kh * 0.2) continue;
    wfE.set((kh - 0.5) * 0.3, isle2Hash(iw3 * 5.5 + 9000) * 6.28, 0);
    wfQ.setFromEuler(wfE);
    wfS.setScalar(0.8 + kh * 0.6);
    wfP.set(kx, 0, kz);
    wfM.compose(wfP, wfQ, wfS);
    isle3Stems.setMatrixAt(i3f, wfM);
    isle3Heads.setMatrixAt(i3f, wfM);
    isle3Heads.setColorAt(i3f, FLOWER_COLORS[Math.floor(isle2Hash(iw3 * 7.1 + 9000) * FLOWER_COLORS.length)]);
    i3f++;
  }
  isle3Stems.count = isle3Heads.count = i3f;
  isle3Stems.frustumCulled = isle3Heads.frustumCulled = false;
  scene.add(isle3Stems);
  scene.add(isle3Heads);

  function walkable(x, z) { return islandR(x, z) < ISLAND - 1.5 || onBridge(x, z) || onIsle2(x, z, 1.5) || onBridge2(x, z) || onIsle3(x, z, 1.5); } // your island, the bridges, the town square or the western island

  // Small flat stones pressed into the dirt paths
  var PEBBLES = 160;
  var pebbleGeo = new THREE.IcosahedronGeometry(0.07, 1);
  pebbleGeo.scale(1, 0.3, 0.8);
  var pebbles = new THREE.InstancedMesh(pebbleGeo, new THREE.MeshStandardMaterial({ roughness: 0.9 }), PEBBLES);
  var pebbleCount = 0, pebC = new THREE.Color();
  for (var pb = 0; pb < 20000 && pebbleCount < PEBBLES; pb++) {
    var q1 = Math.sin(pb * 91.7) * 43758.5453, q2 = Math.sin(pb * 47.3) * 22578.1459, q3 = Math.sin(pb * 13.1) * 9631.73;
    q1 -= Math.floor(q1); q2 -= Math.floor(q2); q3 -= Math.floor(q3);
    var pX = -ISLAND + q1 * ISLAND * 2, pZ = -ISLAND + q2 * ISLAND * 2;
    if (pathDist(pX, pZ) > PATH_W * 0.85 || groundHeight(pX, pZ) < -0.02 || underDock(pX, pZ)) continue;
    wfE.set(0, q3 * 6.28, 0);
    wfQ.setFromEuler(wfE);
    var psz = 0.6 + q3 * 1.1;
    wfS.set(psz, psz, psz);
    wfP.set(pX, groundHeight(pX, pZ) + 0.005, pZ);
    wfM.compose(wfP, wfQ, wfS);
    pebbles.setMatrixAt(pebbleCount, wfM);
    pebC.setHSL(0.08 + q1 * 0.05, 0.08 + q2 * 0.1, 0.5 + q3 * 0.2);
    pebbles.setColorAt(pebbleCount, pebC);
    pebbleCount++;
  }
  pebbles.count = pebbleCount;
  pebbles.receiveShadow = true;
  scene.add(pebbles);

  for (var rk = 0; rk < 12; rk++) {
    var rs = freeSpot(1.2);
    if (!rs) continue;
    var size = 0.4 + rand() * 0.7;
    boulder(rs.x, rs.z, size, 0.7).position.y = size * 0.15;
    solids.push({ x: rs.x, z: rs.z, r: size * 0.8 });
  }

  // Bushes: their spots are chosen here, and they're grown from real leaves along with the trees below
  var bushSpots = [];
  for (var bu = 0; bu < 12; bu++) {
    var bs = freeSpot(1.2);
    if (!bs) continue;
    bs.size = 0.7 + rand() * 0.6;
    bushSpots.push(bs);
    solids.push({ x: bs.x, z: bs.z, r: 0.85 * bs.size });
  }

  // ---------- Trees and rocks all over the island ----------
  var seedBeforeForest = seed;
  seed = 777; // the forest has its own random numbers, so it never moves the rest of the scenery

  // Distance from point (px, pz) to the line from (ax, az) to (bx, bz): used to keep paths clear
  function distToPath(px, pz, ax, az, bx, bz) {
    var dx = bx - ax, dz = bz - az, len2 = dx * dx + dz * dz;
    var t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / len2));
    return dist(px, pz, ax + dx * t, az + dz * t);
  }
  var startX = FARM_X, startZ = FARM_Z + 5;
  var forestSpots = [];
  // A free spot on dry land, away from the garden, lake, dock, Dawn Tree, paths and other trees
  function forestSpot(gap, tall, outer) {
    for (var i = 0; i < 80; i++) {
      var x, z;
      if (outer) { // anywhere on the outer land
        var o = outerSpot(1.5 + gap);
        if (!o) continue;
        x = o.x; z = o.z;
      } else {
        var a = rand() * Math.PI * 2, r = 2 + Math.sqrt(rand()) * 14.3;
        x = Math.cos(a) * r; z = Math.sin(a) * r;
      }
      if (Math.abs(x - FARM_X) < COLS * TILE / 2 + 1.8 && Math.abs(z - FARM_Z) < ROWS * TILE / 2 + 1.8) continue;
      if (dist(x, z, TREE_X, TREE_Z) < TREE_ZONE + (tall ? 4.6 : 1.5)) continue; // tall trees stay clear of the Dawn Tree's canopy
      if (lakeQ(x, z) < 1.3 || underDock(x, z) || dist(x, z, dockStart.x, dockStart.z) < 2.5) continue;
      if (dist(x, z, startX, startZ) < 2.5) continue;
      if (distToPath(x, z, startX, startZ, dockStart.x, dockStart.z) < 1.6) continue; // path to the dock
      if (distToPath(x, z, startX, startZ, TREE_X, TREE_Z) < 1.6) continue;           // path to the Dawn Tree
      if (distToPath(x, z, startX, startZ, HOUSE_DOOR_X, HOUSE_DOOR_Z) < 1.6) continue; // path to the farmhouse
      if (dist(x, z, HOUSE_X, HOUSE_Z) < (tall ? 9.5 : 7.6) + gap) continue;            // and a clear yard round the house
      var crowded = false;
      for (var j = 0; j < forestSpots.length; j++) {
        if (dist(x, z, forestSpots[j].x, forestSpots[j].z) < gap + forestSpots[j].gap) { crowded = true; break; }
      }
      for (var k = 0; k < solids.length && !crowded; k++) { // and clear of rocks, bushes and the shore boulders
        if (dist(x, z, solids[k].x, solids[k].z) < solids[k].r + gap) crowded = true;
      }
      if (crowded) continue;
      var spot = { x: x, z: z, gap: gap };
      forestSpots.push(spot);
      return spot;
    }
    return null;
  }

  // Painted textures for bark, leaves and pine needles, drawn once on little canvases
  function paintTexture(w, h, paint) {
    var cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    paint(cv.getContext('2d'), w, h);
    return new THREE.CanvasTexture(cv);
  }
  var barkTex = paintTexture(128, 256, function (g, w, h) {
    g.fillStyle = '#6e5440';
    g.fillRect(0, 0, w, h);
    for (var i = 0; i < 300; i++) { // long cracks and ridges running up the bark
      var x = Math.random() * w, y = Math.random() * h, len = 20 + Math.random() * 80;
      var c1 = (Math.random() - 0.5) * 8, c2 = (Math.random() - 0.5) * 8, c3 = (Math.random() - 0.5) * 5;
      g.strokeStyle = Math.random() < 0.55 ? 'rgba(38,26,18,0.6)' : 'rgba(160,132,104,0.35)';
      g.lineWidth = 1 + Math.random() * 3;
      for (var ox = -w; ox <= w; ox += w) { // drawn again past each edge so the bark repeats with no seams
        for (var oy = -h; oy <= h; oy += h) {
          g.beginPath();
          g.moveTo(x + ox, y + oy);
          g.bezierCurveTo(x + ox + c1, y + oy + len * 0.33, x + ox + c2, y + oy + len * 0.66, x + ox + c3, y + oy + len);
          g.stroke();
        }
      }
    }
    for (var j = 0; j < 700; j++) { // speckles
      g.fillStyle = Math.random() < 0.5 ? 'rgba(30,22,15,0.25)' : 'rgba(180,155,130,0.2)';
      g.fillRect(Math.random() * (w - 2), Math.random() * (h - 2), 2, 2);
    }
  });
  barkTex.wrapS = barkTex.wrapT = THREE.RepeatWrapping;
  barkTex.repeat.set(2, 3);
  var leafTex = paintTexture(256, 256, function (g) {
    for (var i = 0; i < 320; i++) { // a round clump of overlapping leaves, see-through around the edge
      var a = Math.random() * Math.PI * 2, r = Math.pow(Math.random(), 0.65) * 108;
      var x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r * 0.92;
      var len = 14 + Math.random() * 14, ang = Math.random() * Math.PI * 2;
      var sunny = Math.max(0, Math.min(1, 0.55 - ((x - 128) + (y - 128)) / 300)); // light comes from the top-left
      g.save();
      g.translate(x, y);
      g.rotate(ang);
      g.fillStyle = 'hsl(' + (88 + Math.random() * 22 - sunny * 10) + ',' + (45 + Math.random() * 20) + '%,' + (26 + sunny * 26 + Math.random() * 12) + '%)';
      g.beginPath();
      g.ellipse(0, 0, len / 2, len * 0.24, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(20,45,12,0.18)';
      g.lineWidth = 1;
      g.stroke();
      g.strokeStyle = 'rgba(235,250,200,' + (0.15 + sunny * 0.3) + ')'; // the leaf's middle vein
      g.beginPath();
      g.moveTo(-len / 2, 0);
      g.lineTo(len / 2, 0);
      g.stroke();
      g.restore();
    }
  });
  var needleTex = paintTexture(256, 128, function (g) {
    for (var i = 0; i < 520; i++) { // needles sprouting from a drooping twig
      var t = Math.random(), x = 6 + t * 240, y = 64 + t * t * 14;
      var reach = (44 - t * 26) * (0.5 + Math.random() * 0.5), side = Math.random() < 0.5 ? -1 : 1;
      g.strokeStyle = 'hsl(' + (128 + Math.random() * 20) + ',' + (32 + Math.random() * 16) + '%,' + (22 + Math.random() * 20) + '%)';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + 6 + Math.random() * 12, y + side * reach);
      g.stroke();
    }
    g.strokeStyle = '#4a3828';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(2, 64);
    g.quadraticCurveTo(128, 68, 252, 78);
    g.stroke();
  });

  var barkMat = new THREE.MeshStandardMaterial({ map: barkTex, bumpMap: barkTex, bumpScale: 0.03, roughness: 0.95 });
  var pineBarkMat = new THREE.MeshStandardMaterial({ map: barkTex, bumpMap: barkTex, bumpScale: 0.03, color: 0x9a8a80, roughness: 0.95 });
  var rootMat = barkMat.clone(), pineRootMat = pineBarkMat.clone();
  rootMat.vertexColors = pineRootMat.vertexColors = true;

  // Soil and fallen leaves under trees and bushes
  var litterTex = paintTexture(256, 256, function (g) {
    var grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0, 'rgba(70,52,36,0.85)');
    grad.addColorStop(0.55, 'rgba(84,66,44,0.55)');
    grad.addColorStop(1, 'rgba(90,75,50,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 260; i++) { // fallen leaves and little twigs, thinning out toward the edge
      var a = Math.random() * Math.PI * 2, r = Math.pow(Math.random(), 0.8) * 115;
      var x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r, fade = 1 - r / 128;
      g.save();
      g.translate(x, y);
      g.rotate(Math.random() * 6.28);
      if (Math.random() < 0.15) {
        g.strokeStyle = 'rgba(60,42,28,' + fade + ')';
        g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(-8, 0); g.lineTo(8, 1); g.stroke();
      } else {
        var hue = Math.random() < 0.6 ? 25 + Math.random() * 20 : 60 + Math.random() * 30;
        g.fillStyle = 'hsla(' + hue + ',' + (35 + Math.random() * 25) + '%,' + (25 + Math.random() * 20) + '%,' + fade + ')';
        g.beginPath(); g.ellipse(0, 0, 5 + Math.random() * 3, 2.5, 0, 0, Math.PI * 2); g.fill();
      }
      g.restore();
    }
  });
  var litterMat = new THREE.MeshStandardMaterial({ map: litterTex, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 });
  var litterGeo = new THREE.CircleGeometry(1, 28);
  litterGeo.rotateX(-Math.PI / 2);
  function litter(parent, radius) {
    var m = place(new THREE.Mesh(litterGeo, litterMat), 0, 0.03, 0, parent);
    m.scale.set(radius, 1, radius);
    m.castShadow = false;
    return m;
  }

  // All leaf clumps (and all pine sprays) go into one batch each, so the forest stays fast
  var forestTime = { value: 0 };
  function foliageMaterial(tex) {
    var mat = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.9 });
    mat.onBeforeCompile = function (shader) {
      shader.uniforms.uForestTime = forestTime;
      shader.vertexShader = 'uniform float uForestTime;\n' + shader.vertexShader
        // light every leaf as if it faced the sky, so the backs of leaves don't go dark
        .replace('#include <defaultnormal_vertex>', 'vec3 transformedNormal = normalMatrix * vec3(0.0, 1.0, 0.0);')
        // leaves sway gently in the breeze, more the higher up they are
        .replace('#include <project_vertex>', [
          'vec4 mvPosition = instanceMatrix * vec4(transformed, 1.0);',
          'float sway = max(0.0, mvPosition.y - 0.8) * 0.035;',
          'mvPosition.x += sin(uForestTime * 1.6 + mvPosition.x * 0.6 + mvPosition.z * 0.4) * sway;',
          'mvPosition.z += cos(uForestTime * 1.3 + mvPosition.x * 0.5) * sway * 0.7;',
          'mvPosition = modelViewMatrix * mvPosition;',
          'gl_Position = projectionMatrix * mvPosition;'
        ].join('\n'));
      shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_begin>',
        'float faceDirection = 1.0;\nvec3 normal = normalize(vNormal);\nvec3 geometryNormal = normal;');
    };
    return mat;
  }
  function foliageBatch(geo, tex, max) {
    var batch = new THREE.InstancedMesh(geo, foliageMaterial(tex), max);
    batch.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.45 }); // leafy shadows
    batch.castShadow = true;
    batch.receiveShadow = true;
    batch.setColorAt(0, new THREE.Color(1, 1, 1)); // makes room for every card's colour (must happen before count is 0)
    batch.count = 0;
    return batch;
  }
  var leafBatch = foliageBatch(new THREE.PlaneGeometry(1, 1), leafTex, 32000);
  var sprayGeo = new THREE.PlaneGeometry(1, 1);
  sprayGeo.rotateX(-Math.PI / 2);
  sprayGeo.translate(0.5, 0, 0); // the spray starts at the trunk and reaches outward
  var needleBatch = foliageBatch(sprayGeo, needleTex, 26000);  // room for every pine's branches (the island needs about 22,000)
  var pineCoreMat = new THREE.MeshStandardMaterial({ color: 0x1d3a22, roughness: 1 });
  var fMat = new THREE.Matrix4(), fWorld = new THREE.Matrix4(), fQuat = new THREE.Quaternion(), fEuler = new THREE.Euler();
  var fPos = new THREE.Vector3(), fScale = new THREE.Vector3(), fColor = new THREE.Color();
  var fRotY = new THREE.Matrix4(), fRotZ = new THREE.Matrix4(), fRotX = new THREE.Matrix4(), fScaleM = new THREE.Matrix4();
  function addCard(batch, tree, local, shade, warm) {
    if (batch.count >= batch.instanceMatrix.count) return;
    fWorld.multiplyMatrices(tree.matrixWorld, local);
    batch.setMatrixAt(batch.count, fWorld);
    fColor.setRGB(shade * (1 + warm), shade, shade * (0.88 - warm));
    batch.setColorAt(batch.count, fColor);
    batch.count++;
  }

  // A branch: a tapered log from `from` in direction `dir`; returns where it ends
  var UP = new THREE.Vector3(0, 1, 0);
  function branch(tree, from, dir, length, r0, r1) {
    var geo = new THREE.CylinderGeometry(r1, r0, length, 7, 1);
    geo.translate(0, length / 2, 0);
    var b = place(new THREE.Mesh(geo, tree.userData.bark), from.x, from.y, from.z, tree);
    b.quaternion.setFromUnitVectors(UP, dir);
    return from.clone().addScaledVector(dir, length);
  }
  // A tube that follows a curve and tapers from r0 to r1, with no flat ends: used for roots and twigs.
  // Roots (flat = true) are wide and low instead of round, with a tall fin where they join the trunk
  function taperTube(points, r0, r1, flat) {
    var curve = new THREE.CatmullRomCurve3(points), SEGS = 12, RADIAL = 10;
    var frames = curve.computeFrenetFrames(SEGS, false);
    var pos = [], nor = [], uv = [], idx = [], col = [], P = new THREE.Vector3(), N = new THREE.Vector3();
    var soil = new THREE.Color(0x6a5240), cc = new THREE.Color();
    var T = new THREE.Vector3(), side = new THREE.Vector3(), upv = new THREE.Vector3(), WORLD_UP = new THREE.Vector3(0, 1, 0);
    for (var i = 0; i <= SEGS; i++) {
      var u = i / SEGS, r = r0 + (r1 - r0) * u;
      curve.getPointAt(u, P);
      var wide = 1, tall = 1, sink = 0;
      if (flat) {
        curve.getTangentAt(u, T);
        side.crossVectors(T, WORLD_UP);
        if (side.lengthSq() < 0.001) side.copy(frames.binormals[i]);
        side.normalize();
        upv.crossVectors(side, T).normalize();
        var knob = 1 + Math.sin(u * 17 + r0 * 40) * 0.1;          // knobbly, uneven thickness
        wide = 1.5 * knob;
        tall = (0.5 + 0.9 * Math.pow(1 - u, 3)) * knob;          // a tall fin near the trunk, flat further out
        sink = r * tall * 0.35;                                  // half-buried in the soil
      }
      for (var j = 0; j <= RADIAL; j++) {
        var v = (j / RADIAL) * Math.PI * 2, c = -Math.cos(v), sn = Math.sin(v);
        if (flat) {
          pos.push(P.x + upv.x * c * r * tall + side.x * sn * r * wide,
                   P.y + upv.y * c * r * tall + side.y * sn * r * wide - sink,
                   P.z + upv.z * c * r * tall + side.z * sn * r * wide);
          N.set(0, 0, 0).addScaledVector(upv, c / tall).addScaledVector(side, sn / wide).normalize();
        } else {
          N.set(0, 0, 0).addScaledVector(frames.normals[i], c).addScaledVector(frames.binormals[i], sn).normalize();
          pos.push(P.x + r * N.x, P.y + r * N.y, P.z + r * N.z);
        }
        nor.push(N.x, N.y, N.z);
        uv.push((j / RADIAL) * 2, u * (flat ? 4 : 2));
        var earthy = flat ? Math.min(1, Math.max(0, (u - 0.45) * 1.6) + (sn < 0 ? 0.25 : 0)) : 0;
        cc.setRGB(1, 1, 1).lerp(soil, earthy * 0.8);
        col.push(cc.r, cc.g, cc.b);
      }
    }
    for (var a = 0; a < SEGS; a++) {
      for (var b = 0; b < RADIAL; b++) {
        var i0 = a * (RADIAL + 1) + b, i1 = (a + 1) * (RADIAL + 1) + b;
        idx.push(i0, i1, i0 + 1, i1, i1 + 1, i0 + 1);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    return g;
  }
  // A root: grows out of the trunk, arches over the ground and dives back into the earth
  function root(tree, angle, reach, thick, rise, wiggle) {
    var dx = Math.cos(angle), dz = Math.sin(angle), sx = -dz * wiggle, sz = dx * wiggle;
    var mat = tree.userData.root || tree.userData.bark;
    place(new THREE.Mesh(taperTube([
      new THREE.Vector3(dx * reach * 0.08, rise, dz * reach * 0.08),
      new THREE.Vector3(dx * reach * 0.35 + sx * 0.4, rise * 0.35, dz * reach * 0.35 + sz * 0.4),
      new THREE.Vector3(dx * reach * 0.7 + sx, thick * 0.3, dz * reach * 0.7 + sz),
      new THREE.Vector3(dx * reach, -thick * 1.5, dz * reach)
    ], thick, thick * 0.12, true), mat), 0, 0, 0, tree);
    // a thinner root branching off to one side partway along
    var side = wiggle >= 0 ? 1 : -1, ba = angle + side * 0.75;
    var bx = dx * reach * 0.42 + sx * 0.5, bz = dz * reach * 0.42 + sz * 0.5, bl = reach * 0.55;
    place(new THREE.Mesh(taperTube([
      new THREE.Vector3(bx, thick * 0.5, bz),
      new THREE.Vector3(bx + Math.cos(ba) * bl * 0.45, thick * 0.2, bz + Math.sin(ba) * bl * 0.45),
      new THREE.Vector3(bx + Math.cos(ba + side * 0.25) * bl, -thick * 0.8, bz + Math.sin(ba + side * 0.25) * bl)
    ], thick * 0.5, thick * 0.06, true), mat), 0, 0, 0, tree);
  }

  // A clump of leaves: several leafy cards at random angles around a point, darker underneath
  function leafClump(tree, center, radius, warm) {
    for (var i = 0; i < 12; i++) {
      fPos.set(rand() - 0.5, (rand() - 0.35) * 0.8, rand() - 0.5).normalize().multiplyScalar(radius * (0.45 + rand() * 0.4)).add(center);
      fEuler.set(rand() * Math.PI * 2, rand() * Math.PI * 2, rand() * Math.PI * 2);
      fQuat.setFromEuler(fEuler);
      var s = radius * (1.15 + rand() * 0.45);
      fScale.set(s, s, s);
      fMat.compose(fPos, fQuat, fScale);
      var lift = Math.max(0, Math.min(1, (fPos.y - center.y) / radius * 0.6 + 0.5)); // 0 underneath, 1 on top
      addCard(leafBatch, tree, fMat, 0.62 + lift * 0.4 + rand() * 0.08, warm);
    }
  }
  function direction(angle, tilt) {
    return new THREE.Vector3(Math.cos(angle) * Math.sin(tilt), Math.cos(tilt), Math.sin(angle) * Math.sin(tilt));
  }

  // Broadleaf tree: flared trunk with roots, splitting into branches and twigs with leaf clumps at the ends
  function leafyTree(x, z, size) {
    var t = new THREE.Group();
    t.userData.bark = barkMat;
    t.userData.root = rootMat;
    finishTree(t, x, z, 0.36 * size);
    var trunkH = (1.5 + rand() * 0.6) * size, warm = (rand() - 0.5) * 0.12;
    var rootAngles = [], rootLens = [];
    for (var ra = 0; ra < 5; ra++) {
      rootAngles.push((ra / 5) * Math.PI * 2 + rand() * 0.5);
      rootLens.push(0.8 + rand() * 0.4);
    }
    var profile = [];
    for (var i = 0; i <= 16; i++) {
      var yy = Math.pow(i / 16, 1.5) * trunkH; // more rings near the bottom, where the trunk flares
      profile.push(new THREE.Vector2(0.27 * size * (1 - 0.3 * yy / trunkH) + 0.26 * size * Math.exp(-yy * 5 / size), yy));
    }
    var trunkGeo = new THREE.LatheGeometry(profile, 30);
    var tpos = trunkGeo.attributes.position;
    for (var tv = 0; tv < tpos.count; tv++) { // the base swells out into each root, like real buttresses
      var vx = tpos.getX(tv), vy = tpos.getY(tv), vz = tpos.getZ(tv), va = Math.atan2(vz, vx), swell = 0;
      for (var rr = 0; rr < 5; rr++) swell += Math.pow(Math.max(0, Math.cos(va - rootAngles[rr])), 6);
      var k = 1 + swell * 0.55 * Math.exp(-vy * 3.5 / size) + noise(va * 3, vy * 4) * 0.03;
      tpos.setXYZ(tv, vx * k, vy, vz * k);
    }
    trunkGeo.computeVertexNormals();
    place(new THREE.Mesh(trunkGeo, barkMat), 0, 0, 0, t);
    for (var rt = 0; rt < 5; rt++) { // roots winding out over the ground
      root(t, rootAngles[rt], 1.1 * size * rootLens[rt], 0.13 * size, 0.55 * size, (rt % 2 ? 0.12 : -0.12) * size);
    }
    litter(t, 1.5 * size);
    t.updateMatrixWorld(true);
    var leaderEnd = branch(t, new THREE.Vector3(0, trunkH - 0.05 * size, 0), direction(rand() * 6.28, rand() * 0.25), 0.9 * size, 0.19 * size, 0.07 * size);
    leafClump(t, leaderEnd, 0.85 * size, warm);
    var mains = 3 + Math.floor(rand() * 2);
    for (var m = 0; m < mains; m++) {
      var a = (m / mains) * Math.PI * 2 + rand() * 0.6, tilt = 0.55 + rand() * 0.35;
      var start = new THREE.Vector3(0, trunkH * (0.78 + rand() * 0.2), 0), dir = direction(a, tilt);
      var len = (1.0 + rand() * 0.4) * size;
      var end = branch(t, start, dir, len, 0.15 * size, 0.07 * size);
      leafClump(t, start.clone().addScaledVector(dir, len * 0.6), 0.6 * size, warm);
      var subs = 2 + Math.floor(rand() * 2);
      for (var sb2 = 0; sb2 < subs; sb2++) {
        var end2 = branch(t, end, direction(a + (rand() - 0.5) * 1.4, 0.35 + rand() * 0.6), (0.55 + rand() * 0.35) * size, 0.07 * size, 0.028 * size);
        leafClump(t, end2, (0.6 + rand() * 0.2) * size, warm);
      }
    }
  }

  // Pine: tall tapering trunk with whorls of drooping needle sprays, wide at the bottom, narrow at the top
  function pineTree(x, z, size) {
    var t = new THREE.Group();
    t.userData.bark = pineBarkMat;
    t.userData.root = pineRootMat;
    finishTree(t, x, z, 0.28 * size);
    litter(t, 1.4 * size);
    var H = (3.0 + rand() * 0.8) * size;
    var trunkGeo = new THREE.CylinderGeometry(0.02 * size, 0.25 * size, H * 0.86, 10); // stops below the tip, hidden in the needles
    trunkGeo.translate(0, H * 0.43, 0);
    place(new THREE.Mesh(trunkGeo, pineBarkMat), 0, 0, 0, t);
    for (var pr = 0; pr < 4; pr++) { // small roots round the base
      var prA = (pr / 4) * Math.PI * 2 + Math.sin(x * 3.1 + z * 1.7 + pr) * 0.5;
      root(t, prA, (0.6 + 0.15 * Math.sin(x + pr * 2.3)) * size, 0.08 * size, 0.3 * size, (pr % 2 ? 0.08 : -0.08) * size);
    }
    // A dark cone hidden inside the branches, so you can't see through the gaps
    var coreH = H * 0.62, coreGeo = new THREE.ConeGeometry(0.62 * size, coreH, 10);
    coreGeo.translate(0, H * 0.24 + coreH / 2, 0);
    place(new THREE.Mesh(coreGeo, pineCoreMat), 0, 0, 0, t);
    t.updateMatrixWorld(true);
    var WHORLS = 15;
    for (var w = 0; w < WHORLS; w++) {
      var f = w / (WHORLS - 1); // 0 at the bottom, 1 at the top
      var y = H * (0.2 + f * 0.66), spread = (1.5 * (1 - f) + 0.35) * size;
      var arms = Math.max(6, Math.round(12 - f * 5));
      for (var b = 0; b < arms; b++) {
        var turn = (b / arms) * Math.PI * 2 + w * 0.7 + rand() * 0.3;
        fRotY.makeRotationY(turn);
        fRotZ.makeRotationZ(-(0.22 + rand() * 0.22 + (1 - f) * 0.12)); // droop
        fRotX.makeRotationX((rand() - 0.5) * 0.7);                       // twist so the sprays aren't all flat
        fScaleM.makeScale(spread, 1, spread * 0.75);
        fMat.makeTranslation(0, y, 0).multiply(fRotY).multiply(fRotZ).multiply(fRotX).multiply(fScaleM);
        addCard(needleBatch, t, fMat, 0.6 + f * 0.35 + rand() * 0.1, -0.03);
        // a shorter inner spray between each pair of long ones fills the branch out
        fRotY.makeRotationY(turn + Math.PI / arms);
        fRotZ.makeRotationZ(-(0.1 + rand() * 0.2));
        fScaleM.makeScale(spread * 0.6, 1, spread * 0.5);
        fMat.makeTranslation(0, y + 0.06 * size, 0).multiply(fRotY).multiply(fRotZ).multiply(fScaleM);
        addCard(needleBatch, t, fMat, 0.5 + f * 0.35 + rand() * 0.1, -0.03);
      }
    }
    // A pointed leafy tip: sprays angled up around the top, plus one pointing straight up
    for (var tip = 0; tip < 6; tip++) {
      fRotY.makeRotationY((tip / 6) * Math.PI * 2 + rand() * 0.4);
      fRotZ.makeRotationZ(1.15 + rand() * 0.2);
      fRotX.makeRotationX((rand() - 0.5) * 0.6);
      fScaleM.makeScale(0.42 * size, 1, 0.22 * size);
      fMat.makeTranslation(0, H * 0.85, 0).multiply(fRotY).multiply(fRotZ).multiply(fRotX).multiply(fScaleM);
      addCard(needleBatch, t, fMat, 0.95 + rand() * 0.1, -0.03);
    }
    for (var up = 0; up < 2; up++) {
      fRotY.makeRotationY(up * Math.PI / 2);
      fRotZ.makeRotationZ(Math.PI / 2 - 0.05);
      fScaleM.makeScale(0.32 * size, 1, 0.16 * size);
      fMat.makeTranslation(0, H * 0.88, 0).multiply(fRotY).multiply(fRotZ).multiply(fScaleM);
      addCard(needleBatch, t, fMat, 1.0, -0.03);
    }
  }

  var sceneryGroups = []; // every tree and bush, joined into a few big meshes at the end so the game stays fast
  var lastTree = null;
  function finishTree(t, x, z, trunkRadius) {
    sceneryGroups.push(t);
    lastTree = t;
    t.position.set(x, groundHeight(x, z), z);
    t.rotation.y = rand() * Math.PI * 2;
    t.rotation.z = (rand() - 0.5) * 0.04; // not perfectly upright
    scene.add(t);
    solids.push({ x: x, z: z, r: trunkRadius + 0.1 });
    t.userData.solid = solids[solids.length - 1];
  }
  // Plants a tree and remembers which leaves are its own, so it can be chopped down later
  var choppable = [], trimmable = []; // trees you can chop, and bushes you can trim
  function plantTree(x, z, size, leafy) {
    var l0 = leafBatch.count, n0 = needleBatch.count;
    if (leafy) leafyTree(x, z, size);
    else pineTree(x, z, size);
    var t = lastTree;
    t.userData.size = size;
    t.userData.leafy = leafy;
    t.userData.leaves = [
      { batch: leafBatch, start: l0, count: leafBatch.count - l0 },
      { batch: needleBatch, start: n0, count: needleBatch.count - n0 }
    ];
    choppable.push(t);
  }

  // Plant the trees: mostly broadleaf, with some pines mixed in
  for (var tr = 0; tr < 44; tr++) {
    var size = 0.85 + rand() * 0.45;
    var ts = forestSpot(1.15 * size, true); // wide enough apart that their leaves don't grow into each other
    if (!ts) continue;
    plantTree(ts.x, ts.z, size, rand() < 0.7);
  }
  // Bushes: several low clumps of leaves on short twigs, darker inside and underneath
  function growBush(bs) {
    var b = new THREE.Group(), sz = bs.size, warm = (rand() - 0.5) * 0.1;
    var l0 = leafBatch.count;
    sceneryGroups.push(b);
    b.userData.bark = barkMat;
    b.position.set(bs.x, groundHeight(bs.x, bs.z), bs.z);
    b.rotation.y = rand() * Math.PI * 2;
    scene.add(b);
    litter(b, 0.9 * sz);
    b.updateMatrixWorld(true);
    var clumpsN = 4 + Math.floor(rand() * 3);
    for (var c = 0; c < clumpsN; c++) {
      var ca = (c / clumpsN) * Math.PI * 2 + rand() * 0.6, cr = (0.25 + rand() * 0.2) * sz;
      var center = new THREE.Vector3(Math.cos(ca) * cr, (0.32 + rand() * 0.15) * sz, Math.sin(ca) * cr);
      place(new THREE.Mesh(taperTube([ // a woody stem coming up out of the ground into the leaves
        new THREE.Vector3(0, -0.08 * sz, 0),
        new THREE.Vector3(center.x * 0.3, center.y * 0.4, center.z * 0.3),
        center
      ], 0.035 * sz, 0.01 * sz), barkMat), 0, 0, 0, b);
      leafClump(b, center, (0.36 + rand() * 0.1) * sz, warm);
    }
    leafClump(b, new THREE.Vector3(0, 0.55 * sz, 0), 0.4 * sz, warm); // a rounded top
    b.userData.size = sz;
    b.userData.bush = true;
    b.userData.solid = solids[solids.length - 1]; // its solid was added just before it was grown
    b.userData.solidR = b.userData.solid.r;
    b.userData.leaves = [{ batch: leafBatch, start: l0, count: leafBatch.count - l0 }];
    trimmable.push(b);
  }
  bushSpots.forEach(growBush);

  // Rocks: clusters of a big boulder with smaller ones around it, plus loose stones
  for (var rc2 = 0; rc2 < 22; rc2++) {
    var big = 0.5 + rand() * 0.9;
    var rs2 = forestSpot(big * 0.9);
    if (!rs2) continue;
    boulder(rs2.x, rs2.z, big, 0.65 + rand() * 0.25).position.y = big * 0.15;
    solids.push({ x: rs2.x, z: rs2.z, r: big * 0.8 });
    var smalls = Math.floor(rand() * 4);
    for (var sm = 0; sm < smalls; sm++) {
      var sa2 = rand() * Math.PI * 2, sd = big + 0.2 + rand() * 0.4, ssz = 0.15 + rand() * 0.3;
      var sx2 = rs2.x + Math.cos(sa2) * sd, sz2 = rs2.z + Math.sin(sa2) * sd;
      if (lakeQ(sx2, sz2) < 1.25) continue;
      var onSomething = false;
      for (var so = 0; so < solids.length - 1 && !onSomething; so++) { // (the last one is this cluster's own big boulder)
        if (dist(sx2, sz2, solids[so].x, solids[so].z) < solids[so].r + ssz) onSomething = true;
      }
      if (onSomething) continue;
      boulder(sx2, sz2, ssz, 0.6).position.y = ssz * 0.1;
    }
  }

  // ---------- Trees, bushes and rocks scattered across the outer land ----------
  seed = 31337; // its own random numbers, so the middle of the island stays exactly as it was
  function rockCluster(spot, big) {
    boulder(spot.x, spot.z, big, 0.65 + rand() * 0.25).position.y = big * 0.15;
    solids.push({ x: spot.x, z: spot.z, r: big * 0.8 });
    var smalls = Math.floor(rand() * 4);
    for (var sm2 = 0; sm2 < smalls; sm2++) {
      var a3 = rand() * Math.PI * 2, d3 = big + 0.2 + rand() * 0.4, s3 = 0.15 + rand() * 0.3;
      var x3 = spot.x + Math.cos(a3) * d3, z3 = spot.z + Math.sin(a3) * d3;
      if (lakeQ(x3, z3) < 1.25 || !onIsland(x3, z3)) continue;
      var hit3 = false;
      for (var so3 = 0; so3 < solids.length - 1 && !hit3; so3++) {
        if (dist(x3, z3, solids[so3].x, solids[so3].z) < solids[so3].r + s3) hit3 = true;
      }
      if (!hit3) boulder(x3, z3, s3, 0.6).position.y = s3 * 0.1;
    }
  }
  for (var ot = 0; ot < 170; ot++) { // trees, some in little groves
    var osize = 0.85 + rand() * 0.5;
    var ots = forestSpot(1.15 * osize, true, true);
    if (!ots) continue;
    plantTree(ots.x, ots.z, osize, rand() < 0.65);
  }
  for (var obu = 0; obu < 60; obu++) { // bushes
    var obsz = 0.7 + rand() * 0.6;
    var obs = forestSpot(0.85 * obsz, false, true);
    if (!obs) continue;
    obs.size = obsz;
    solids.push({ x: obs.x, z: obs.z, r: 0.85 * obsz });
    growBush(obs);
  }
  for (var orc = 0; orc < 70; orc++) { // rocks and boulder clusters
    var obig = 0.5 + rand() * 1.1;
    var ors = forestSpot(obig * 0.9, false, true);
    if (ors) rockCluster(ors, obig);
  }

  [leafBatch, needleBatch].forEach(function (batch) {
    batch.instanceMatrix.needsUpdate = true;
    if (batch.instanceColor) batch.instanceColor.needsUpdate = true;
    scene.add(batch);
  });

  // Join all the trunks, branches, roots and soil patches into one mesh per material, and all the rocks
  // into one batch per rock shape, so hundreds of trees and rocks still draw quickly
  function joinGeometries(geos) {
    var pos = [], nor = [], uv = [], col = [], idx = [], off = 0, anyColor = false;
    geos.forEach(function (g) { if (g.attributes.color) anyColor = true; });
    geos.forEach(function (g) {
      var p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv, c = g.attributes.color;
      g.userData.vStart = off;        // where this piece starts in the joined mesh (used to chop trees)
      g.userData.iStart = idx.length;
      for (var i = 0; i < p.count; i++) {
        pos.push(p.getX(i), p.getY(i), p.getZ(i));
        nor.push(n.getX(i), n.getY(i), n.getZ(i));
        uv.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0);
        if (anyColor) { if (c) col.push(c.getX(i), c.getY(i), c.getZ(i)); else col.push(1, 1, 1); }
      }
      if (g.index) { for (var j = 0; j < g.index.count; j++) idx.push(g.index.getX(j) + off); }
      else { for (var k = 0; k < p.count; k++) idx.push(k + off); }
      off += p.count;
    });
    var m = new THREE.BufferGeometry();
    m.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    m.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    m.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    if (anyColor) m.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    m.setIndex(idx);
    return m;
  }
  var byMaterial = {}, materialList = [];
  sceneryGroups.forEach(function (grp) {
    grp.updateMatrixWorld(true);
    grp.traverse(function (o) {
      if (!o.isMesh) return;
      var key = o.material.uuid;
      if (!byMaterial[key]) { byMaterial[key] = { mat: o.material, geos: [] }; materialList.push(byMaterial[key]); }
      var g = o.geometry.clone();
      g.userData = {}; // its own notes (clones otherwise share them with every copy of the same shape)
      g.applyMatrix4(o.matrixWorld);
      byMaterial[key].geos.push(g);
      if (grp.userData.leaves) (grp.userData.pieces = grp.userData.pieces || []).push({ entry: byMaterial[key], geo: g });
    });
    scene.remove(grp);
  });
  materialList.forEach(function (entry) {
    var joined = new THREE.Mesh(joinGeometries(entry.geos), entry.mat);
    joined.castShadow = entry.mat !== litterMat;
    joined.receiveShadow = true;
    scene.add(joined);
    entry.mesh = joined;
  });
  var rockLists = boulderGeos.map(function () { return []; }), rockBatches = [];
  scene.children.slice().forEach(function (o) {
    if (!o.isMesh || o.material !== stoneMat) return;
    var which = boulderGeos.indexOf(o.geometry);
    if (which < 0) return;
    o.updateMatrix();
    rockLists[which].push(o.matrix.clone());
    scene.remove(o);
  });
  rockLists.forEach(function (list, which) {
    if (!list.length) return;
    var rocks = new THREE.InstancedMesh(boulderGeos[which], stoneMat, list.length);
    list.forEach(function (m4, n) { rocks.setMatrixAt(n, m4); });
    rocks.castShadow = rocks.receiveShadow = true;
    scene.add(rocks);
    rockBatches.push({ mesh: rocks, list: list });
  });

  // ---------- The witchy farmhouse ----------
  // A cosy little cottage near the top of the island: stone footing, cream walls with dark timber beams,
  // a steep purple shingled roof, a round tower with a crooked witch-hat roof, a crooked chimney puffing
  // lavender smoke, glowing windows, a round purple door, pumpkins, a broom and a bubbling cauldron
  var house = new THREE.Group(), houseStatic = new THREE.Group(), houseLive = new THREE.Group();
  house.add(houseStatic); house.add(houseLive);
  var HW = 7.5, HD = 3.8, WALL_H = 2.5, FOOT_H = 0.45;            // width, depth, wall height, height of the stone footing
  house.position.set(HOUSE_X, groundHeight(HOUSE_X, HOUSE_Z), HOUSE_Z);
  house.rotation.y = HOUSE_TURN;
  scene.add(house);

  var shingleTex = paintTexture(128, 128, function (g, w, h) { // rows of rounded purple shingles
    g.fillStyle = '#3a2660'; g.fillRect(0, 0, w, h);
    var cols = ['#5b3f8c', '#6d4ba3', '#4f3580', '#7a58b0', '#634494'];
    for (var row = 0; row < 8; row++) {
      for (var k = -1; k < 9; k++) {
        var x = k * 16 + (row % 2) * 8, y = row * 16;
        g.fillStyle = cols[(row * 3 + k * 7 + 20) % cols.length];
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + 16, y); g.lineTo(x + 16, y + 10);
        g.quadraticCurveTo(x + 8, y + 20, x, y + 10); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(30,15,50,0.7)'; g.lineWidth = 1.2; g.stroke();
        g.strokeStyle = 'rgba(200,170,255,0.25)'; g.beginPath(); g.moveTo(x + 2, y + 2); g.lineTo(x + 14, y + 2); g.stroke();
      }
    }
  });
  shingleTex.wrapS = shingleTex.wrapT = THREE.RepeatWrapping;
  var stoneWallTex = paintTexture(128, 128, function (g, w, h) { // rounded stones set in mortar
    g.fillStyle = '#8c8494'; g.fillRect(0, 0, w, h);
    for (var row = 0; row < 6; row++) {
      for (var k = -1; k < 6; k++) {
        var x = k * 26 + (row % 2) * 13 + (Math.random() - 0.5) * 4, y = row * 21.3 + 10.6;
        var sh = 120 + Math.floor(Math.random() * 50);
        g.fillStyle = 'rgb(' + (sh + 8) + ',' + sh + ',' + (sh + 18) + ')';
        g.beginPath(); g.ellipse(x + 13, y, 11.5, 8.8, (Math.random() - 0.5) * 0.3, 0, Math.PI * 2); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.18)';
        g.beginPath(); g.ellipse(x + 10, y - 3, 6, 3, 0, 0, Math.PI * 2); g.fill();
      }
    }
  });
  stoneWallTex.wrapS = stoneWallTex.wrapT = THREE.RepeatWrapping;
  var plasterTex = paintTexture(64, 64, function (g, w, h) { // soft cream plaster with a little speckle
    g.fillStyle = '#f3e4cc'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 160; i++) {
      g.fillStyle = Math.random() < 0.5 ? 'rgba(190,160,130,0.18)' : 'rgba(255,255,255,0.3)';
      g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
  });
  plasterTex.wrapS = plasterTex.wrapT = THREE.RepeatWrapping;
  plasterTex.repeat.set(3, 2);
  var plankTex = paintTexture(64, 128, function (g, w, h) { // painted plum planks for the door
    for (var i = 0; i < 4; i++) {
      g.fillStyle = ['#6a3d8a', '#74449a', '#61377f', '#6f4192'][i];
      g.fillRect(i * 16, 0, 16, h);
      g.fillStyle = 'rgba(30,10,45,0.6)'; g.fillRect(i * 16, 0, 1.5, h);
      for (var j = 0; j < 6; j++) { g.fillStyle = 'rgba(255,220,255,0.08)'; g.fillRect(i * 16 + 3 + Math.random() * 8, Math.random() * h, 1, 20 + Math.random() * 30); }
    }
  });
  var houseMats = {
    roof: new THREE.MeshStandardMaterial({ map: shingleTex, roughness: 0.8 }),
    stone: new THREE.MeshStandardMaterial({ map: stoneWallTex, roughness: 0.95 }),
    plaster: new THREE.MeshStandardMaterial({ map: plasterTex, roughness: 0.95 }),
    beam: new THREE.MeshStandardMaterial({ color: 0x4a3226, roughness: 0.85 }),
    door: new THREE.MeshStandardMaterial({ map: plankTex, roughness: 0.7 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xffd36e, emissive: 0xb07a10, emissiveIntensity: 0.35, roughness: 0.35, metalness: 0.6 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xffe6a0, emissive: 0xffb84a, emissiveIntensity: 0.5, roughness: 0.3 }),
    shutter: new THREE.MeshStandardMaterial({ color: 0x5e8f86, roughness: 0.8 }),
    hat: new THREE.MeshStandardMaterial({ color: 0x3d2a63, roughness: 0.75 }),
    pumpkin: new THREE.MeshStandardMaterial({ color: 0xf08a2a, roughness: 0.6 }),
    stem: new THREE.MeshStandardMaterial({ color: 0x4f7a32, roughness: 0.8 }),
    straw: new THREE.MeshStandardMaterial({ color: 0xd9b25a, roughness: 0.9 }),
    iron: new THREE.MeshStandardMaterial({ color: 0x24222c, roughness: 0.45, metalness: 0.5 }),
    flowerPink: new THREE.MeshStandardMaterial({ color: 0xff8fd0, roughness: 0.6 }),
    flowerBlue: new THREE.MeshStandardMaterial({ color: 0x9ab8ff, roughness: 0.6 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x5aa84a, roughness: 0.8 }),
    leafDark: new THREE.MeshStandardMaterial({ color: 0x3f8a3c, roughness: 0.8, side: THREE.DoubleSide }),
    flowerWhite: new THREE.MeshStandardMaterial({ color: 0xfff6fb, roughness: 0.6 }),
    flowerLilac: new THREE.MeshStandardMaterial({ color: 0xc9a6f0, roughness: 0.6 }),
    flowerHeart: new THREE.MeshStandardMaterial({ color: 0xffd04a, emissive: 0xb07a10, emissiveIntensity: 0.2, roughness: 0.5 }),
    soil: new THREE.MeshStandardMaterial({ color: 0x4a3222, roughness: 1 }),
    porchSlab: new THREE.MeshStandardMaterial({ color: 0xa69eae, roughness: 0.75 })
  };
  function hPart(geo, matName, x, y, z, rx, ry, rz, parent) { // one piece of the house
    var m = new THREE.Mesh(geo, houseMats[matName]);
    m.position.set(x, y, z);
    m.rotation.set(rx || 0, ry || 0, rz || 0);
    (parent || houseStatic).add(m);
    return m;
  }
  var TOP = FOOT_H + WALL_H, FRONT = HD / 2;

  // footing, walls and timber beams
  var footGeo = new THREE.BoxGeometry(HW + 0.3, FOOT_H + 0.8, HD + 0.3);
  hPart(footGeo, 'stone', 0, (FOOT_H - 0.8) / 2, 0);
  hPart(new THREE.BoxGeometry(HW, WALL_H, HD), 'plaster', 0, FOOT_H + WALL_H / 2, 0);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { // corner posts
    hPart(new THREE.BoxGeometry(0.2, WALL_H, 0.2), 'beam', c[0] * (HW / 2 - 0.02), FOOT_H + WALL_H / 2, c[1] * (FRONT - 0.02));
  });
  [FOOT_H + 0.08, FOOT_H + WALL_H * 0.55, TOP - 0.08].forEach(function (y, n) { // beams running round the house
    if (n !== 1) hPart(new THREE.BoxGeometry(HW + 0.04, 0.14, 0.08), 'beam', 0, y, FRONT + 0.02); // (the front skips the middle one: the door and windows are there)
    hPart(new THREE.BoxGeometry(HW + 0.04, 0.14, 0.08), 'beam', 0, y, -FRONT - 0.02);
    hPart(new THREE.BoxGeometry(0.08, 0.14, HD + 0.04), 'beam', HW / 2 + 0.02, y, 0);
  });

  // the steep roof, with its ends filled in and a ridge along the top
  var RISE = 2.1, OVER = 0.45, halfRun = FRONT + OVER;           // the roof slopes from the ridge down past the wall tops to the eaves
  var pitch = Math.atan2(RISE, FRONT), slabLen = halfRun / Math.cos(pitch), EAVE_Y = TOP - RISE * OVER / FRONT;
  var roofGeo = new THREE.BoxGeometry(HW + 0.4, 0.16, slabLen);    // it hangs over the right end, but stops at the left wall where the tower stands
  var ruv = roofGeo.attributes.uv;
  for (var ru = 0; ru < ruv.count; ru++) ruv.setXY(ru, ruv.getX(ru) * (HW + 0.4) / 1.1, ruv.getY(ru) * slabLen / 1.1); // shingles keep their size
  [-1, 1].forEach(function (s) {
    var nY = Math.cos(pitch) * 0.08, nZ = Math.sin(pitch) * 0.08 * s;  // nudged up so its underside sits on the walls
    hPart(roofGeo, 'roof', 0.2, (TOP + RISE + EAVE_Y) / 2 + nY, s * halfRun / 2 + nZ, s * pitch, 0, 0);
  });
  var gable = new THREE.Shape();                                    // the triangle of wall under each end of the roof
  gable.moveTo(-FRONT, 0); gable.lineTo(FRONT, 0); gable.lineTo(0, RISE); gable.lineTo(-FRONT, 0);
  var gableGeo = new THREE.ExtrudeGeometry(gable, { depth: 0.12, bevelEnabled: false });
  [-1, 1].forEach(function (s) { hPart(gableGeo, 'plaster', s * (HW / 2 - 0.06) - 0.06, TOP, 0, 0, Math.PI / 2, 0); });
  hPart(new THREE.CylinderGeometry(0.11, 0.11, HW + 0.45, 8), 'hat', 0.225, TOP + RISE + 0.1, 0, 0, 0, Math.PI / 2); // the ridge

  // the round tower on the left with a crooked witch-hat roof, a little brim and a gold star on top
  var TR = 0.95, TX = -HW / 2 - TR + 0.05, TZ = 0.35, TH = TOP + RISE + 0.35; // standing right against the left wall, tall enough that its hat clears the roof
  hPart(new THREE.CylinderGeometry(TR + 0.1, TR + 0.15, FOOT_H + 0.8, 16), 'stone', TX, (FOOT_H - 0.8) / 2, TZ);
  hPart(new THREE.CylinderGeometry(TR, TR, TH - FOOT_H, 16), 'plaster', TX, FOOT_H + (TH - FOOT_H) / 2, TZ);
  hPart(new THREE.CylinderGeometry(TR + 0.04, TR + 0.04, 0.14, 16), 'beam', TX, TH - 0.07, TZ);
  hPart(new THREE.CylinderGeometry(TR + 0.04, TR + 0.04, 0.14, 16), 'beam', TX, FOOT_H + 0.08, TZ);
  var hatPts = [];
  for (var hp = 0; hp <= 12; hp++) { var ht = hp / 12; hatPts.push(new THREE.Vector2(Math.max(0.01, (TR + 0.3) * Math.pow(1 - ht, 1.3)), ht * 2.6)); }
  var hatGeo = new THREE.LatheGeometry(hatPts, 18), hpos = hatGeo.attributes.position;
  for (var hv = 0; hv < hpos.count; hv++) { var hy = hpos.getY(hv) / 2.6; hpos.setX(hv, hpos.getX(hv) - Math.pow(hy, 2.4) * 0.75); } // the tip flops over
  hatGeo.computeVertexNormals();
  hPart(hatGeo, 'roof', TX, TH, TZ);
  hPart(new THREE.CylinderGeometry(TR + 0.55, TR + 0.6, 0.08, 20), 'hat', TX, TH + 0.02, TZ);   // the brim
  hPart(new THREE.CylinderGeometry(TR + 0.2, TR + 0.26, 0.2, 18), 'gold', TX, TH + 0.2, TZ);   // a gold hat band
  var star = hPart(new THREE.OctahedronGeometry(0.16, 0), 'gold', TX - 0.75, TH + 2.62, TZ);
  star.scale.set(1, 1.3, 0.45);

  // the crooked chimney on the right
  hPart(new THREE.BoxGeometry(0.62, 2.5, 0.62), 'stone', HW / 2 - 0.95, TOP + 0.9, -0.7, 0, 0, -0.06);
  hPart(new THREE.BoxGeometry(0.78, 0.14, 0.78), 'beam', HW / 2 - 0.88, TOP + 2.17, -0.7, 0, 0, -0.06);
  var CHIM_TOP = new THREE.Vector3(HW / 2 - 0.88, TOP + 2.3, -0.7);

  // the round-topped purple door, with a gold knob and a stone arch
  var doorGeo = new THREE.BoxGeometry(1.0, 1.3, 0.1);
  hPart(doorGeo, 'door', 0, FOOT_H + 0.65, FRONT + 0.03);
  hPart(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 18, 1, false, -Math.PI / 2, Math.PI), 'door', 0, FOOT_H + 1.3, FRONT + 0.03, -Math.PI / 2, 0, 0); // the rounded top, pointing up into the arch
  hPart(new THREE.TorusGeometry(0.56, 0.09, 6, 18, Math.PI), 'stone', 0, FOOT_H + 1.3, FRONT + 0.06);
  [-1, 1].forEach(function (s) { hPart(new THREE.BoxGeometry(0.18, 1.3, 0.16), 'stone', s * 0.56, FOOT_H + 0.65, FRONT + 0.06); });
  hPart(new THREE.SphereGeometry(0.06, 10, 8), 'gold', 0.32, FOOT_H + 0.72, FRONT + 0.11);
  // the front porch: a stone landing at the door and two steps down to the path, each with a smooth slab on top
  PORCH_STEPS.forEach(function (st) {
    var top = st[0], z0 = FRONT + st[1], z1 = FRONT + st[2], wide = st[3];
    hPart(new THREE.BoxGeometry(wide, top + 0.17, z1 - z0), 'stone', 0, (top - 0.23) / 2, (z0 + z1) / 2);   // its top tucked just under the slab, so the two never flicker
    hPart(new THREE.BoxGeometry(wide + 0.06, 0.04, z1 - z0 + 0.05), 'porchSlab', 0, top - 0.02, (z0 + z1) / 2 + 0.02);
  });

  // glowing windows with shutters and flower boxes
  function windowAt(x, y, z, ry, round) {
    var w = new THREE.Group();
    w.position.set(x, y, z); w.rotation.y = ry;
    houseStatic.add(w);
    if (round) {
      hPart(new THREE.CircleGeometry(0.34, 18), 'glass', 0, 0, 0.02, 0, 0, 0, w);
      hPart(new THREE.TorusGeometry(0.36, 0.06, 6, 20), 'beam', 0, 0, 0.04, 0, 0, 0, w);
      hPart(new THREE.BoxGeometry(0.05, 0.68, 0.04), 'beam', 0, 0, 0.05, 0, 0, 0, w);
      hPart(new THREE.BoxGeometry(0.68, 0.05, 0.04), 'beam', 0, 0, 0.05, 0, 0, 0, w);
      return;
    }
    hPart(new THREE.PlaneGeometry(0.7, 0.8), 'glass', 0, 0, 0.02, 0, 0, 0, w);
    hPart(new THREE.BoxGeometry(0.84, 0.08, 0.08), 'beam', 0, 0.44, 0.05, 0, 0, 0, w);
    hPart(new THREE.BoxGeometry(0.84, 0.08, 0.08), 'beam', 0, -0.44, 0.05, 0, 0, 0, w);
    hPart(new THREE.BoxGeometry(0.08, 0.86, 0.08), 'beam', 0.39, 0, 0.05, 0, 0, 0, w);
    hPart(new THREE.BoxGeometry(0.08, 0.86, 0.08), 'beam', -0.39, 0, 0.05, 0, 0, 0, w);
    hPart(new THREE.BoxGeometry(0.05, 0.8, 0.04), 'beam', 0, 0, 0.05, 0, 0, 0, w);
    hPart(new THREE.BoxGeometry(0.7, 0.05, 0.04), 'beam', 0, 0.05, 0.05, 0, 0, 0, w);
    [-1, 1].forEach(function (s) { // shutters swung open
      hPart(new THREE.BoxGeometry(0.36, 0.86, 0.05), 'shutter', s * 0.62, 0, 0.1, 0, s * -0.35, 0, w);
    });
    // a flower box underneath: a wooden planter with a rim, full of soil, little five-petal flowers, leaves and trailing ivy
    hPart(new THREE.BoxGeometry(0.9, 0.18, 0.24), 'beam', 0, -0.55, 0.13, 0, 0, 0, w);
    hPart(new THREE.BoxGeometry(0.96, 0.035, 0.28), 'beam', 0, -0.455, 0.13, 0, 0, 0, w);
    hPart(new THREE.BoxGeometry(0.84, 0.02, 0.2), 'soil', 0, -0.45, 0.13, 0, 0, 0, w);
    var FLOWER_KINDS = ['flowerPink', 'flowerLilac', 'flowerWhite', 'flowerBlue', 'flowerPink', 'flowerWhite', 'flowerLilac'];
    for (var f = 0; f < 6; f++) {
      var fx = -0.35 + f * 0.14, fh = 0.1 + ((f * 5) % 3) * 0.04, fz = 0.1 + (f % 2) * 0.07, tilt = -0.9 - (f % 2) * 0.35;
      hPart(new THREE.CylinderGeometry(0.006, 0.008, fh, 4), 'leafDark', fx, -0.45 + fh / 2, fz, 0, 0, 0, w);        // the stem
      var bloom = new THREE.Group();
      bloom.position.set(fx, -0.45 + fh, fz); bloom.rotation.set(tilt, 0, (f - 3) * 0.12);   // facing up and out of the box
      w.add(bloom);
      for (var pt = 0; pt < 5; pt++) {                                 // five rounded petals
        var pa = pt / 5 * Math.PI * 2 + f;
        var petal = hPart(new THREE.SphereGeometry(0.048, 8, 6), FLOWER_KINDS[f], Math.cos(pa) * 0.048, Math.sin(pa) * 0.048, 0, 0, 0, pa, bloom);
        petal.scale.set(1, 0.62, 0.3);
      }
      hPart(new THREE.SphereGeometry(0.026, 8, 6), 'flowerHeart', 0, 0, 0.012, 0, 0, 0, bloom).scale.set(1, 1, 0.6); // a golden middle
      if (f % 3 === 1) {                                                // and here and there a closed bud
        hPart(new THREE.CylinderGeometry(0.004, 0.005, fh * 0.7, 4), 'leafDark', fx + 0.05, -0.45 + fh * 0.35, fz - 0.04, 0, 0, -0.3, w);
        hPart(new THREE.SphereGeometry(0.018, 8, 6), FLOWER_KINDS[(f + 2) % 7], fx + 0.07, -0.45 + fh * 0.7, fz - 0.04, 0, 0, 0, w).scale.set(1.2, 1.9, 1.2);
      }
    }
    for (var lf = 0; lf < 12; lf++) {                                   // pointed leaves fanning out of the soil
      var lx = -0.4 + lf * 0.073, la = (lf % 2 ? 1 : -1) * (0.5 + (lf % 3) * 0.2);
      var leaf = hPart(new THREE.SphereGeometry(0.06, 8, 6), lf % 3 ? 'leaf' : 'leafDark', lx, -0.425, 0.06 + (lf % 3) * 0.06, 0.6 - (lf % 2) * 0.3, 0, la, w);
      leaf.scale.set(0.4, 1.2, 0.12);
    }
    [-0.3, 0.05, 0.32].forEach(function (ix, iv) {                      // ivy trailing over the front of the box
      for (var k = 0; k < 4 + iv % 2; k++) {
        var ivy = hPart(new THREE.SphereGeometry(0.036, 8, 6), k % 2 ? 'leaf' : 'leafDark', ix + Math.sin(k * 1.7 + iv) * 0.025, -0.47 - k * 0.055, 0.265, 0.2, 0, k % 2 ? 0.6 : -0.6, w);
        ivy.scale.set(1, 0.8, 0.3);
      }
    });
  }
  windowAt(-1.55, FOOT_H + 1.35, FRONT + 0.02, 0);
  windowAt(1.55, FOOT_H + 1.35, FRONT + 0.02, 0);
  windowAt(-2.95, FOOT_H + 1.35, FRONT + 0.02, 0, true);                   // round windows toward the ends
  windowAt(2.95, FOOT_H + 1.35, FRONT + 0.02, 0, true);
  windowAt(HW / 2 + 0.02, FOOT_H + 1.35, -0.3, Math.PI / 2);
  windowAt(HW / 2 + 0.08, TOP + 0.75, 0, Math.PI / 2, true);              // a round attic window up in the end wall
  [FOOT_H + 1.5, TOP + 1.4].forEach(function (wy) {                       // and two in the tower, set out from its curved wall in a deep round frame
    var ta = -0.55, tx = TX + Math.sin(ta) * (TR + 0.1), tz = TZ + Math.cos(ta) * (TR + 0.1); // turned away from the house so it never overlaps the main wall
    windowAt(tx, wy, tz, ta, true);
    var frame = new THREE.Group(); frame.position.set(tx, wy, tz); frame.rotation.y = ta; houseStatic.add(frame);
    hPart(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 20, 1, true), 'beam', 0, 0, -0.06, Math.PI / 2, 0, 0, frame);
  });

  // string lights along the front of the roof
  var houseLights = [];
  for (var sl = 0; sl < 15; sl++) {
    var lx = -HW / 2 + 0.15 + sl * (HW + 0.15) / 14, sag = Math.sin((sl % 5) / 5 * Math.PI) * 0.12;
    var bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshStandardMaterial({ color: sl % 2 ? 0xffd27a : 0xff9be0, emissive: sl % 2 ? 0xffb040 : 0xff6fcf, emissiveIntensity: 0.8 }));
    bulb.position.set(lx, EAVE_Y - 0.08 - sag, FRONT + OVER - 0.05);
    houseLive.add(bulb);
    var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: sl % 2 ? 0xffc060 : 0xff8fe0, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.set(0.35, 0.35, 1);
    halo.position.copy(bulb.position);
    houseLive.add(halo);
    houseLights.push({ bulb: bulb, halo: halo, p: sl * 1.7 });
  }
  // two little lantern posts either side of the path to the door
  var lanternMat = new THREE.MeshStandardMaterial({ color: 0xffe6a0, emissive: 0xffb040, emissiveIntensity: 1 });
  var lanterns = [];
  [-1, 1].forEach(function (s) {
    var lpx = s * 0.95, lpz = FRONT + 1.1;
    hPart(new THREE.CylinderGeometry(0.05, 0.06, 1.15, 6), 'beam', lpx, 0.57, lpz);
    hPart(new THREE.BoxGeometry(0.24, 0.04, 0.24), 'iron', lpx, 1.17, lpz);
    hPart(new THREE.ConeGeometry(0.19, 0.14, 4), 'iron', lpx, 1.48, lpz, 0, Math.PI / 4, 0);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { hPart(new THREE.BoxGeometry(0.025, 0.24, 0.025), 'iron', lpx + c[0] * 0.1, 1.3, lpz + c[1] * 0.1); });
    var lg = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), lanternMat);
    lg.position.set(lpx, 1.3, lpz);
    houseLive.add(lg);
    var lh = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffb860, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    lh.scale.set(1.0, 1.0, 1);
    lh.position.copy(lg.position);
    houseLive.add(lh);
    lanterns.push(lh);
  });

  // pumpkins by the door, and a broom leaning on the wall
  [[-1.45, 0.5, 0.3], [-1.95, 0.75, 0.2], [1.5, 0.55, 0.25]].forEach(function (pk) {
    for (var rib = 0; rib < 6; rib++) { // bumpy ribs all the way round
      var r1 = hPart(new THREE.SphereGeometry(pk[2], 12, 8), 'pumpkin', pk[0], pk[2] * 0.75, FRONT + pk[1], 0, rib / 6 * Math.PI, 0);
      r1.scale.set(1.2, 0.8, 0.55);
    }
    hPart(new THREE.CylinderGeometry(0.03, 0.045, 0.16, 6), 'stem', pk[0] + 0.02, pk[2] * 1.5, FRONT + pk[1], 0, 0, 0.3);
  });
  var BRX = HW / 2 + 0.22, BRZ = 1.25;                                // the broom leans on the right-hand end wall
  hPart(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6), 'beam', BRX, 0.95, BRZ, 0, 0, 0.18);                  // broom handle
  hPart(new THREE.ConeGeometry(0.2, 0.5, 10), 'straw', BRX + 0.17, 0.2, BRZ, 0, 0, 0.18);                    // bristles
  hPart(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 8), 'flowerPink', BRX + 0.13, 0.43, BRZ, 0, 0, 0.18);   // a ribbon tying them

  // a bubbling cauldron on a little fire, out front to the right: a round-bellied iron pot with a rolled rim, side handles,
  // a band of little gold moons, three curled legs, a swirling green potion with a ladle, steam, and flames in a ring of stones
  var CX = HW / 2 + 0.95, CZ = FRONT + 1.4;
  houseMats.cauldron = new THREE.MeshStandardMaterial({ color: 0x2b2833, roughness: 0.42, metalness: 0.55, side: THREE.DoubleSide });
  houseMats.cauldronIn = new THREE.MeshStandardMaterial({ color: 0x151319, roughness: 0.8, metalness: 0.2, side: THREE.BackSide });
  houseMats.hearth = new THREE.MeshStandardMaterial({ color: 0x8a8590, roughness: 0.95 });
  houseMats.ladle = new THREE.MeshStandardMaterial({ color: 0x9a6a40, roughness: 0.75 });
  var potProfile = [[0, 0.2], [0.2, 0.21], [0.36, 0.27], [0.47, 0.38], [0.52, 0.5], [0.51, 0.62], [0.46, 0.73], [0.41, 0.8], [0.4, 0.84], [0.43, 0.87]];
  var potPts = potProfile.map(function (pt) { return new THREE.Vector2(pt[0], pt[1]); });
  hPart(new THREE.LatheGeometry(potPts, 28), 'cauldron', CX, 0, CZ);                              // the round iron belly
  hPart(new THREE.LatheGeometry(potPts.map(function (v) { return new THREE.Vector2(v.x * 0.97, v.y + 0.005); }), 28), 'cauldronIn', CX, 0, CZ); // its darker inside
  hPart(new THREE.TorusGeometry(0.435, 0.045, 10, 30), 'cauldron', CX, 0.875, CZ, Math.PI / 2, 0, 0); // a thick rolled rim
  hPart(new THREE.TorusGeometry(0.52, 0.022, 6, 32), 'cauldron', CX, 0.52, CZ, Math.PI / 2, 0, 0);    // a raised band round the belly
  for (var mr = 0; mr < 8; mr++) {                                                               // little gold moon studs on the band
    var ma = mr / 8 * Math.PI * 2 + 0.2;
    hPart(new THREE.SphereGeometry(0.03, 8, 6), 'gold', CX + Math.cos(ma) * 0.535, 0.52, CZ + Math.sin(ma) * 0.535);
  }
  [0, Math.PI].forEach(function (ha) {                                                           // two ring handles on little ears
    var hx = CX + Math.cos(ha) * 0.47, hz = CZ + Math.sin(ha) * 0.47;
    hPart(new THREE.BoxGeometry(0.08, 0.07, 0.1), 'cauldron', hx, 0.76, hz, 0, -ha, 0);
    hPart(new THREE.TorusGeometry(0.085, 0.018, 6, 14), 'cauldron', CX + Math.cos(ha) * 0.55, 0.69, CZ + Math.sin(ha) * 0.55, 0, Math.PI / 2 - ha, 0);
  });
  [0.5, 2.6, 4.7].forEach(function (la) {                                                       // three legs that curl out into round feet
    var lx = Math.cos(la), lz = Math.sin(la);
    hPart(new THREE.CylinderGeometry(0.045, 0.035, 0.26, 8), 'cauldron', CX + lx * 0.27, 0.15, CZ + lz * 0.27, lz * 0.45, 0, -lx * 0.45);
    hPart(new THREE.SphereGeometry(0.05, 10, 8), 'cauldron', CX + lx * 0.33, 0.04, CZ + lz * 0.33);
  });
  // a ring of stones round the fire, with crossed logs underneath
  for (var hs = 0; hs < 9; hs++) {
    var hsa = hs / 9 * Math.PI * 2;
    var hst = hPart(new THREE.DodecahedronGeometry(0.09, 0), 'hearth', CX + Math.cos(hsa) * 0.62, 0.05, CZ + Math.sin(hsa) * 0.62, hs, hs * 2, 0);
    hst.scale.set(1.2, 0.7, 1);
  }
  [0.4, 1.9, 3.3].forEach(function (a) { hPart(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 6), 'beam', CX, 0.05, CZ, Math.PI / 2, a, 0); }); // firewood
  // the potion: a swirl of greens with brighter streaks and tiny sparkles, slowly turning
  var brewTex = paintTexture(128, 128, function (g, w, h) {
    var base = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    base.addColorStop(0, '#b8ffcf'); base.addColorStop(0.45, '#4fe08a'); base.addColorStop(1, '#13753f');
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    g.lineCap = 'round';
    for (var sw = 0; sw < 5; sw++) {                                   // swirling streaks
      g.strokeStyle = sw % 2 ? 'rgba(220,255,230,0.55)' : 'rgba(30,140,90,0.5)';
      g.lineWidth = 3 + sw % 3;
      g.beginPath();
      for (var k = 0; k <= 40; k++) {
        var ang = sw * 1.26 + k * 0.12, rad = 6 + k * 1.3;
        if (k === 0) g.moveTo(64 + Math.cos(ang) * rad, 64 + Math.sin(ang) * rad); else g.lineTo(64 + Math.cos(ang) * rad, 64 + Math.sin(ang) * rad);
      }
      g.stroke();
    }
    for (var sp = 0; sp < 40; sp++) {                                   // sparkly flecks, a few lilac
      g.fillStyle = sp % 4 ? 'rgba(255,255,255,0.8)' : 'rgba(220,170,255,0.9)';
      g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 0.8 + Math.random() * 1.2, 0, Math.PI * 2); g.fill();
    }
  });
  var brewMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: brewTex, emissive: 0x2fb865, emissiveMap: brewTex, emissiveIntensity: 0.35, roughness: 0.15 });
  var brew = new THREE.Mesh(new THREE.CircleGeometry(0.41, 28), brewMat);
  brew.rotation.x = -Math.PI / 2;
  brew.position.set(CX, 0.8, CZ);
  houseLive.add(brew);
  // a wooden ladle resting in the potion
  var ladle = new THREE.Group();
  ladle.position.set(CX + 0.12, 0.8, CZ - 0.05);
  ladle.rotation.set(0.2, 0.6, -0.55);
  var ladleHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.75, 8), houseMats.ladle);
  ladleHandle.position.y = 0.3;
  ladle.add(ladleHandle);
  var ladleKnob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), houseMats.ladle);
  ladleKnob.position.y = 0.68;
  ladle.add(ladleKnob);
  houseLive.add(ladle);
  var brewGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0x46e07e, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
  brewGlow.scale.set(1.3, 1.3, 1); brewGlow.position.set(CX, 1.0, CZ);
  houseLive.add(brewGlow);
  var fireGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xff8a30, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
  fireGlow.scale.set(1.0, 0.7, 1); fireGlow.position.set(CX, 0.14, CZ);
  houseLive.add(fireGlow);
  // little flames licking up round the bottom of the pot
  var cauldronFlames = [];
  var flameMatOut = new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.85 });
  var flameMatIn = new THREE.MeshBasicMaterial({ color: 0xffe066 });
  [[0.18, 0], [-0.1, 0.15], [-0.08, -0.17], [0.02, 0.02], [0.2, -0.16]].forEach(function (fp, n) {
    var fl = new THREE.Group();
    fl.position.set(CX + fp[0], 0.06, CZ + fp[1]);
    var outer = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.24, 8), flameMatOut);
    outer.position.y = 0.12;
    fl.add(outer);
    var inner = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.13, 6), flameMatIn);
    inner.position.y = 0.07;
    fl.add(inner);
    houseLive.add(fl);
    cauldronFlames.push({ g: fl, p: n * 1.7 });
  });
  var bubbleMat = new THREE.MeshStandardMaterial({ color: 0xc8ffd8, emissive: 0x3fe070, emissiveIntensity: 0.45, roughness: 0.1, transparent: true, opacity: 0.85 });
  var bubbles = [];
  for (var bb = 0; bb < 7; bb++) {
    var bub = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), bubbleMat);
    houseLive.add(bub);
    bubbles.push({ m: bub, t: bb / 7, x: (Math.random() - 0.5) * 0.5, z: (Math.random() - 0.5) * 0.5 });
  }
  // soft billowy puffs for steam and smoke: lots of overlapping smooth blobs, no specks
  var smokeBlobs = [];
  for (var smB = 0; smB < 16; smB++) {
    var sba = isle2Hash(smB * 2.3) * Math.PI * 2, sbd = isle2Hash(smB * 4.1) * 26;
    smokeBlobs.push([64 + Math.cos(sba) * sbd, 64 + Math.sin(sba) * sbd * 0.8, 22 + isle2Hash(smB * 6.7) * 18]);
  }
  var smokeTex = alphaTex(128, 128, function (u, v) {                   // a soft, billowy puff: lots of overlapping smooth blobs, fading softly at the edges
    var x = u * 128, y = v * 128, a = 0;
    for (var i = 0; i < smokeBlobs.length; i++) {
      var b = smokeBlobs[i], d = Math.sqrt((x - b[0]) * (x - b[0]) + (y - b[1]) * (y - b[1])) / b[2];
      a += stopsAt(d, [[0, 0.32], [0.6, 0.14], [1, 0]]);
    }
    return Math.min(1, a) * stopsAt(Math.sqrt((u - 0.5) * (u - 0.5) + (v - 0.5) * (v - 0.5)) * 2, [[0, 1], [0.2, 1], [1, 0]]);
  });
  // wisps of pale green steam curling up out of the pot
  var brewSteam = [];
  for (var bs = 0; bs < 9; bs++) {
    var wisp = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: 0xd8f5e0, transparent: true, opacity: 0, depthWrite: false }));
    houseLive.add(wisp);
    brewSteam.push({ s: wisp, t: bs / 9, a: bs * 1.1, spin: (bs % 2 ? 1 : -1) * 0.5 });
  }

  // lavender smoke curling out of the chimney
  var smoke = [];
  for (var sm = 0; sm < 12; sm++) {
    var puff = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: 0xdcd6e8, transparent: true, opacity: 0, depthWrite: false }));
    houseLive.add(puff);
    smoke.push({ s: puff, t: sm / 12, rot: sm * 1.9, spin: (sm % 2 ? 1 : -1) * (0.3 + (sm % 3) * 0.15) });
  }

  // a few little mushrooms round the house
  [[-HW / 2 - 0.4, FRONT + 0.6], [-HW / 2 - 0.9, FRONT + 0.3], [HW / 2 + 0.5, -1.4], [-1.2, -FRONT - 0.5]].forEach(function (mp, n) {
    hPart(new THREE.CylinderGeometry(0.035, 0.05, 0.22, 6), 'plaster', mp[0], 0.05, mp[1]);
    var cap = hPart(new THREE.SphereGeometry(0.13, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), n % 2 ? 'flowerPink' : 'flowerBlue', mp[0], 0.16, mp[1]);
    cap.scale.set(1, 0.7, 1);
  });
  // a white picket fence all the way round the yard, with a gap at the front for the path
  var FENCE_L = -HW / 2 - 2.6, FENCE_R = HW / 2 + 1.8, FENCE_B = -FRONT - 1.2, FENCE_F = FRONT + 2.3, GATE = 1.5;
  var fencePosts = [];
  function fenceRun(x0, z0, x1, z1) {
    var len = dist(x0, z0, x1, z1), n = Math.max(1, Math.round(len / 0.45)), ang = Math.atan2(x1 - x0, z1 - z0);
    for (var fp = 0; fp <= n; fp++) {
      var fx = x0 + (x1 - x0) * fp / n, fz = z0 + (z1 - z0) * fp / n;
      hPart(new THREE.BoxGeometry(0.1, 0.6, 0.06), 'plaster', fx, 0.15, fz, 0, ang + Math.PI / 2, 0);
      hPart(new THREE.ConeGeometry(0.07, 0.12, 4), 'plaster', fx, 0.51, fz, 0, Math.PI / 4, 0);
      fencePosts.push([fx, fz]);
    }
    [0.3, 0.0].forEach(function (ry) { // two rails joining the posts
      hPart(new THREE.BoxGeometry(0.05, 0.07, len), 'beam', (x0 + x1) / 2, ry, (z0 + z1) / 2, 0, ang, 0);
    });
  }
  fenceRun(-GATE, FENCE_F, FENCE_L, FENCE_F);   // front, left of the gate
  fenceRun(FENCE_L, FENCE_F, FENCE_L, FENCE_B);  // left side
  fenceRun(FENCE_L, FENCE_B, FENCE_R, FENCE_B);  // back
  fenceRun(FENCE_R, FENCE_B, FENCE_R, FENCE_F);  // right side
  fenceRun(FENCE_R, FENCE_F, GATE, FENCE_F);     // front, right of the gate

  // The shipping bin, just outside the fence on the far right: a sleek, modern black bin. Matte black with a fluted front,
  // a recessed plinth so it seems to float, a flat lid with a brushed-steel bar handle, a steel hinge along the back,
  // and an engraved steel label (the lid swings open when you use it)
  var BIN_X = FENCE_R + 1.15, BIN_Z = FRONT + 1.0, BIN_W = 1.2, BIN_H = 0.66, BIN_D = 0.78, BIN_FOOT = 0.07;
  function roundedBox(w, h, d, r) {                                   // a box with crisp but slightly softened edges
    var sh = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, iw = w - 2 * r, ih = h - 2 * r;
    sh.moveTo(x, y); sh.lineTo(x + iw, y); sh.lineTo(x + iw, y + ih); sh.lineTo(x, y + ih); sh.lineTo(x, y);
    var g = new THREE.ExtrudeGeometry(sh, { depth: d - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 3, curveSegments: 4 });
    g.translate(0, 0, -(d - 2 * r) / 2);
    return g;
  }
  var brushedTex = paintTexture(128, 64, function (g, w, h) {        // brushed steel: fine horizontal streaks
    g.fillStyle = '#b9bcc2'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 220; i++) {
      g.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(60,64,72,0.14)';
      g.fillRect(Math.random() * w, Math.random() * h, 20 + Math.random() * 60, 1);
    }
  });
  houseMats.binBlack = new THREE.MeshStandardMaterial({ color: 0x1d1d22, roughness: 0.5, metalness: 0.15 });
  houseMats.binPlinth = new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.8 });
  houseMats.binSteel = new THREE.MeshStandardMaterial({ map: brushedTex, roughness: 0.3, metalness: 0.35 });
  houseMats.binDark = new THREE.MeshStandardMaterial({ color: 0x08080a, roughness: 1 });
  var binLabelTex = paintTexture(256, 64, function (g, w, h) {       // the label: brushed steel with engraved letters
    g.drawImage(brushedTex.image, 0, 0, w, h);
    g.font = '600 30px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (g.letterSpacing !== undefined) g.letterSpacing = '6px';
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillText('SHIPPING', w / 2 + 0.8, h / 2 + 1.8); // the lit lower edge of the engraving
    g.fillStyle = '#2a2c32'; g.fillText('SHIPPING', w / 2, h / 2 + 1);
  });
  houseMats.binLabel = new THREE.MeshStandardMaterial({ map: binLabelTex, roughness: 0.35, metalness: 0.3 });
  var BODY_Y = BIN_FOOT + BIN_H / 2;
  hPart(roundedBox(BIN_W - 0.1, BIN_FOOT + 0.01, BIN_D - 0.1, 0.01), 'binPlinth', BIN_X, BIN_FOOT / 2, BIN_Z);   // the recessed plinth
  hPart(roundedBox(BIN_W, BIN_H, BIN_D, 0.025), 'binBlack', BIN_X, BODY_Y, BIN_Z);                           // the body
  var FLUTES = 18, fluteGeo = new THREE.CylinderGeometry(0.022, 0.022, BIN_H - 0.12, 10, 1, false, 0, Math.PI);
  for (var fl = 0; fl < FLUTES; fl++) {                                                                        // vertical fluting across the front
    var flx = BIN_X - BIN_W / 2 + 0.07 + fl * (BIN_W - 0.14) / (FLUTES - 1);
    hPart(fluteGeo, 'binBlack', flx, BODY_Y - 0.01, BIN_Z + BIN_D / 2, 0, -Math.PI / 2, 0).scale.set(1, 1, 0.45);
  }
  hPart(new THREE.BoxGeometry(0.52, 0.13, 0.012), 'binLabel', BIN_X, BODY_Y + 0.08, BIN_Z + BIN_D / 2 + 0.018); // the steel label
  hPart(new THREE.PlaneGeometry(BIN_W - 0.06, BIN_D - 0.06), 'binDark', BIN_X, BIN_FOOT + BIN_H + 0.002, BIN_Z, -Math.PI / 2, 0, 0); // the inside
  hPart(new THREE.CylinderGeometry(0.013, 0.013, BIN_W - 0.1, 10), 'binSteel', BIN_X, BIN_FOOT + BIN_H + 0.004, BIN_Z - BIN_D / 2 - 0.012, 0, 0, Math.PI / 2); // the hinge along the back
  // the lid: a flat black slab with a slim steel bar handle, hinged along the back edge
  var binLid = new THREE.Group();
  binLid.position.set(BIN_X, BIN_FOOT + BIN_H + 0.004, BIN_Z - BIN_D / 2 - 0.012);
  var lidSlab = new THREE.Mesh(roundedBox(BIN_W + 0.03, 0.05, BIN_D + 0.03, 0.015), new THREE.MeshStandardMaterial({ color: 0x232328, roughness: 0.42, metalness: 0.2 }));
  lidSlab.position.set(0, 0.025, (BIN_D + 0.03) / 2);
  lidSlab.castShadow = lidSlab.receiveShadow = true;
  binLid.add(lidSlab);
  var handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.34, 12), houseMats.binSteel);    // the bar handle
  handleBar.rotation.z = Math.PI / 2;
  handleBar.position.set(0, 0.025, BIN_D + 0.03 + 0.035);
  binLid.add(handleBar);
  [-1, 1].forEach(function (sx) {                                       // on two little standoffs
    var post = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.04, 8), houseMats.binSteel);
    post.rotation.x = Math.PI / 2;
    post.position.set(sx * 0.15, 0.025, BIN_D + 0.03 + 0.016);
    binLid.add(post);
  });
  houseLive.add(binLid);

  // Join the still parts into a few meshes (one per material) so the house stays fast
  house.updateMatrixWorld(true);
  var houseByMat = {};
  houseStatic.traverse(function (o) {
    if (!o.isMesh) return;
    var key = o.material.uuid;
    if (!houseByMat[key]) houseByMat[key] = { mat: o.material, geos: [] };
    var g = o.geometry.clone();
    g.userData = {};
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    g.applyMatrix4(o.matrixWorld);
    houseByMat[key].geos.push(g);
  });
  house.remove(houseStatic);
  Object.keys(houseByMat).forEach(function (key) {
    var entry = houseByMat[key];
    var joined = new THREE.Mesh(joinGeometries(entry.geos), entry.mat);
    joined.castShadow = joined.receiveShadow = true;
    scene.add(joined);
  });

  // ---------- The seed shop, on the new island ----------
  // A fancy storybook boutique: cream stone walls with corner quoins, a plum-and-gold painted shopfront with two big
  // glowing display windows full of seed jars, striped scalloped awnings, a fish-scale slate mansard roof with arched
  // dormers and a round window, gold cresting, a glowing crystal spire, a hanging blade sign, flower boxes,
  // climbing roses and a chalkboard out front. Its windows glow warmly at night
  var shopGroup = new THREE.Group();
  shopGroup.position.set(SHOP_X, 0, SHOP_Z);
  shopGroup.rotation.y = SHOP_TURN;
  scene.add(shopGroup);
  function sp(geo, mat, x, y, z, rx, ry, rz, parent) {
    var m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx || 0, ry || 0, rz || 0);
    m.castShadow = m.receiveShadow = true;
    (parent || shopGroup).add(m);
    return m;
  }
  var SW = SHOP_HW, SD = SHOP_HD, SHOP_PLINTH = 0.3, SHOP_WALL_H = 3.4;   // half width, half depth, stone plinth, wall height
  var WALL_TOP = SHOP_PLINTH + SHOP_WALL_H;
  var shopGlowList = [];
  function shopTiled(tex, rx, ry, ox, oy) {
    var t = tex.clone(); t.needsUpdate = true;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.offset.set(ox || 0, oy || 0);
    return t;
  }

  // painted textures
  var shopAshlarTex = paintTexture(256, 256, function (g, w, h) {      // cream stone blocks
    g.fillStyle = '#cbbfac'; g.fillRect(0, 0, w, h);
    for (var r = 0; r < 8; r++) for (var c = -1; c < 4; c++) {
      var x = c * 64 + (r % 2) * 32, l = 84 + isle2Hash(r * 7 + c * 13 + 400) * 6;
      g.fillStyle = 'hsl(36,32%,' + l + '%)'; g.fillRect(x + 2, r * 32 + 2, 61, 29);
    }
    for (var i = 0; i < 900; i++) { g.fillStyle = 'rgba(120,100,80,' + (0.05 + isle2Hash(i) * 0.08) + ')'; g.fillRect(isle2Hash(i * 3.3) * w, isle2Hash(i * 5.7) * h, 1.5, 1.5); }
  });
  var shopSlateTex = paintTexture(256, 256, function (g, w, h) {       // fish-scale slates, laid from the bottom up
    g.fillStyle = '#2c3038'; g.fillRect(0, 0, w, h);
    for (var r = 16; r >= -1; r--) for (var c = -1; c < 9; c++) {
      var cx = c * 32 + 16 + (r % 2 ? 16 : 0), y0 = r * 16 - 10, l = 33 + isle2Hash(r * 11 + c * 3 + 77) * 12;
      g.fillStyle = 'hsl(' + (215 + isle2Hash(r + c * 5) * 20) + ',9%,' + l + '%)';
      g.beginPath(); g.moveTo(cx - 16, y0); g.lineTo(cx - 16, y0 + 12); g.arc(cx, y0 + 12, 16, Math.PI, 0, true); g.lineTo(cx + 16, y0); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(30,25,45,0.55)'; g.lineWidth = 1.5; g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(cx - 12, y0 + 14, 10, 3);
    }
  });
  var shopArchTex = paintTexture(128, 282, function (g, w, h) {        // an arched window with lilac curtains, lit from inside
    var bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#fff0d4'); bg.addColorStop(1, '#efc994');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b89ce0';
    [[0, 1], [w, -1]].forEach(function (c) {
      g.beginPath(); g.moveTo(c[0], 40); g.quadraticCurveTo(c[0] + c[1] * 40, 120, c[0] + c[1] * 18, 170); g.quadraticCurveTo(c[0] + c[1] * 30, 230, c[0] + c[1] * 26, h); g.lineTo(c[0], h); g.closePath(); g.fill();
    });
    g.fillStyle = '#e8b84a'; g.fillRect(14, 166, 12, 6); g.fillRect(w - 26, 166, 12, 6);
    var sheen = g.createLinearGradient(0, 0, w, h); sheen.addColorStop(0.35, 'rgba(255,255,255,0)'); sheen.addColorStop(0.45, 'rgba(255,255,255,0.25)'); sheen.addColorStop(0.55, 'rgba(255,255,255,0)');
    g.fillStyle = sheen; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#f5efe3'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h * 0.42); g.lineTo(w, h * 0.42); g.moveTo(0, h * 0.71); g.lineTo(w, h * 0.71); g.stroke();
    g.beginPath(); g.moveTo(0, 58); g.lineTo(w, 58); g.stroke();
    for (var a = 1; a < 4; a++) { var an = Math.PI + a / 4 * Math.PI; g.beginPath(); g.moveTo(w / 2, 58); g.lineTo(w / 2 + Math.cos(an) * 64, 58 + Math.sin(an) * 64); g.stroke(); }
  });
  var shopRoseTex = paintTexture(256, 256, function (g, w, h) {        // a plain round window, lit from inside
    var cx = w / 2, cy = h / 2, R = w / 2 - 2;
    var bg = g.createRadialGradient(cx, cy + 20, 10, cx, cy, R); bg.addColorStop(0, '#fbe6c4'); bg.addColorStop(1, '#c9a070');
    g.fillStyle = bg; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
    var sheen = g.createLinearGradient(0, 0, w, h); sheen.addColorStop(0.3, 'rgba(255,255,255,0)'); sheen.addColorStop(0.42, 'rgba(255,255,255,0.3)'); sheen.addColorStop(0.52, 'rgba(255,255,255,0)');
    g.fillStyle = sheen; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#f5efe3'; g.lineWidth = 7;
    g.beginPath(); g.moveTo(cx - R, cy); g.lineTo(cx + R, cy); g.moveTo(cx, cy - R); g.lineTo(cx, cy + R); g.stroke();
    g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, R * 0.45, 0, Math.PI * 2); g.stroke();
  });
  var shopStripeTex = paintTexture(256, 64, function (g, w, h) {       // lilac and cream awning stripes, with scalloped edge
    for (var i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? '#efe7da' : '#8f7fae';
      g.fillRect(i * 32, 0, 32, 40);
      g.beginPath(); g.arc(i * 32 + 16, 40, 16, 0, Math.PI); g.fill();
    }
    g.globalCompositeOperation = 'source-atop';
    for (var k = 0; k < 2560; k++) { g.fillStyle = 'rgba(0,0,0,' + (isle2Hash(k * 2.3) * 0.05) + ')'; g.fillRect(isle2Hash(k) * w, isle2Hash(k * 1.7) * 56, 1, 1); }   // a canvas weave
    for (var j = 0; j < 4; j++) {                                       // soft folds in the cloth
      var fold = g.createLinearGradient(j * 64, 0, j * 64 + 64, 0);
      fold.addColorStop(0, 'rgba(0,0,0,0.14)'); fold.addColorStop(0.5, 'rgba(255,255,255,0.06)'); fold.addColorStop(1, 'rgba(0,0,0,0.14)');
      g.fillStyle = fold; g.fillRect(j * 64, 0, 64, h);
    }
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#b8954a'; g.fillRect(0, 0, w, 4);
  });
  var shopCrestTex = paintTexture(512, 64, function (g, w, h) {        // gold iron cresting
    g.strokeStyle = g.fillStyle = '#f2c14e'; g.lineWidth = 4;
    g.fillRect(0, h - 10, w, 8);
    for (var x0 = 0; x0 < w; x0 += 64) {
      var cx = x0 + 32;
      g.beginPath(); g.moveTo(cx, h - 10); g.lineTo(cx, 12); g.stroke();
      g.beginPath(); g.moveTo(cx, 2); g.lineTo(cx + 6, 10); g.lineTo(cx, 18); g.lineTo(cx - 6, 10); g.closePath(); g.fill();
      g.beginPath(); g.arc(cx - 12, h - 26, 10, -Math.PI * 0.2, Math.PI * 1.2); g.stroke();
      g.beginPath(); g.arc(cx + 12, h - 26, 10, -Math.PI * 0.2, Math.PI * 1.2); g.stroke();
      g.beginPath(); g.arc(cx, 30, 5, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.moveTo(x0, h - 10); g.lineTo(x0, h - 30); g.stroke();
      g.beginPath(); g.arc(x0, h - 33, 4, 0, Math.PI * 2); g.fill();
    }
  });

  // materials
  var shopAshlar = new THREE.MeshStandardMaterial({ map: shopTiled(shopAshlarTex, 3, 1.4), roughness: 0.9 });
  var shopTrim = new THREE.MeshStandardMaterial({ map: plasterTex, color: 0xfaf5ea, roughness: 0.8 });
  var shopPaint = new THREE.MeshStandardMaterial({ color: 0x43304f, roughness: 0.42, metalness: 0.05 });
  var shopPaintLight = new THREE.MeshStandardMaterial({ color: 0x55405f, roughness: 0.42 });
  var shopSlate = new THREE.MeshStandardMaterial({ map: shopTiled(shopSlateTex, 14, 3), roughness: 0.7, metalness: 0.1 });
  var shopNightGlass = [], shopDisplayLit = [];
  function shopPanePaint(kind) {                                      // kind: 'arch', 'round', 'door', 'transom' (bars), and day or night
    return function (g, w, h, night) {
      if (night) {
        var warm = g.createRadialGradient(w / 2, h * 0.6, 4, w / 2, h * 0.6, Math.max(w, h) * 0.75);
        warm.addColorStop(0, '#ffe7b4'); warm.addColorStop(0.6, '#f0b870'); warm.addColorStop(1, '#a8683a');
        g.fillStyle = warm; g.fillRect(0, 0, w, h);
        if (kind === 'arch') {                                          // sheer curtains drawn back to each side
          [[0, 1], [w, -1]].forEach(function (c) {
            var cg = g.createLinearGradient(c[0], 0, c[0] + c[1] * w * 0.32, 0);
            cg.addColorStop(0, 'rgba(120,80,110,0.75)'); cg.addColorStop(1, 'rgba(120,80,110,0)');
            g.fillStyle = cg; g.fillRect(0, 0, w, h);
          });
        }
        if (kind === 'door') {                                          // soft shapes of shelves deep inside
          g.fillStyle = 'rgba(110,70,40,0.35)';
          for (var sh = 0; sh < 3; sh++) g.fillRect(4, h * (0.3 + sh * 0.22), w - 8, 4);
        }
      } else {
        var sky = g.createLinearGradient(0, 0, 0, h);                  // the sky reflected at the top, darker glass below
        sky.addColorStop(0, '#b9cddb'); sky.addColorStop(0.45, '#5f707c'); sky.addColorStop(1, '#2c3034');
        g.fillStyle = sky; g.fillRect(0, 0, w, h);
        var streak = g.createLinearGradient(0, 0, w, h);
        streak.addColorStop(0.25, 'rgba(255,255,255,0)'); streak.addColorStop(0.36, 'rgba(255,255,255,0.28)'); streak.addColorStop(0.42, 'rgba(255,255,255,0.05)'); streak.addColorStop(0.5, 'rgba(255,255,255,0.18)'); streak.addColorStop(0.58, 'rgba(255,255,255,0)');
        g.fillStyle = streak; g.fillRect(0, 0, w, h);
      }
      g.strokeStyle = night ? '#3b2f2a' : '#f2ede4'; g.lineWidth = Math.max(4, w / 28);
      g.beginPath();
      if (kind === 'arch') {
        g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h * 0.42); g.lineTo(w, h * 0.42); g.moveTo(0, h * 0.71); g.lineTo(w, h * 0.71); g.moveTo(0, 58); g.lineTo(w, 58);
        for (var a = 1; a < 4; a++) { var an = Math.PI + a / 4 * Math.PI; g.moveTo(w / 2, 58); g.lineTo(w / 2 + Math.cos(an) * 64, 58 + Math.sin(an) * 64); }
      } else if (kind === 'round') {
        g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.moveTo(w / 2, 0); g.lineTo(w / 2, h);
        g.moveTo(w / 2 + w * 0.22, h / 2); g.arc(w / 2, h / 2, w * 0.22, 0, Math.PI * 2);
      } else if (kind === 'transom') {
        for (var t = 1; t < 4; t++) { g.moveTo(t * w / 4, 0); g.lineTo(t * w / 4, h); }
      }
      g.stroke();
    };
  }
  function shopRealGlass(kind, cw, ch, rx, ry, ox, oy) {             // glass that shows the sky by day and a warm lit room at night
    var day = paintTexture(cw, ch, function (g, w, h) { shopPanePaint(kind)(g, w, h, false); });
    var nite = paintTexture(cw, ch, function (g, w, h) { shopPanePaint(kind)(g, w, h, true); });
    [day, nite].forEach(function (t) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx || 1, ry || 1); t.offset.set(ox || 0, oy || 0); });
    var m = new THREE.MeshStandardMaterial({ map: day, emissive: 0xffffff, emissiveMap: nite, emissiveIntensity: 0.03, roughness: 0.06, metalness: 0.35 });
    shopNightGlass.push(m);
    return m;
  }
  function shopGlow(tex, emissive) {                                  // lit glass, brighter at night
    var m = new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.3, roughness: 0.15, metalness: 0.1 });
    if (emissive !== false) shopGlowList.push(m);
    return m;
  }

  // the stone plinth, the cream stone walls and the corner quoins
  sp(new THREE.BoxGeometry(SW * 2 + 0.3, SHOP_PLINTH, SD * 2 + 0.3), houseMats.stone, 0, SHOP_PLINTH / 2, 0);
  var SHOP_RECESS = 0.6;                                               // how deep the display windows are
  sp(new THREE.BoxGeometry(SW * 2, SHOP_WALL_H, SD * 2 - SHOP_RECESS), shopAshlar, 0, SHOP_PLINTH + SHOP_WALL_H / 2, -SHOP_RECESS / 2);
  [[-4.25, 0.7, SHOP_PLINTH, SHOP_WALL_H], [4.25, 0.7, SHOP_PLINTH, SHOP_WALL_H], [0, 1.9, SHOP_PLINTH, SHOP_WALL_H],      // the front wall round the two window openings
   [-2.425, 2.95, SHOP_PLINTH, 0.6], [2.425, 2.95, SHOP_PLINTH, 0.6], [-2.425, 2.95, SHOP_PLINTH + 2.45, SHOP_WALL_H - 2.45], [2.425, 2.95, SHOP_PLINTH + 2.45, SHOP_WALL_H - 2.45]].forEach(function (f) {
    sp(new THREE.BoxGeometry(f[1], f[3], SHOP_RECESS), shopAshlar, f[0], f[2] + f[3] / 2, SD - SHOP_RECESS / 2);
  });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) {
    for (var q = 0; q < 7; q++) {
      var longX = q % 2 === 0;
      sp(new THREE.BoxGeometry(longX ? 0.62 : 0.36, 0.44, longX ? 0.36 : 0.62), shopTrim, c[0] * (SW - (longX ? 0.29 : 0.16)), SHOP_PLINTH + 0.25 + q * 0.48, c[1] * (SD - (longX ? 0.16 : 0.29)));
    }
  });
  sp(new THREE.BoxGeometry(SW * 2 + 0.5, 0.22, SD * 2 + 0.5), shopTrim, 0, WALL_TOP + 0.05, 0);                 // the cornice
  sp(new THREE.BoxGeometry(SW * 2 + 0.36, 0.06, SD * 2 + 0.36), houseMats.gold, 0, WALL_TOP - 0.09, 0);
  sp(new THREE.BoxGeometry(SW * 2 + 0.2, 0.1, SD * 2 + 0.2), shopTrim, 0, SHOP_PLINTH + 0.05, 0);

  // arched windows with stone surrounds, keystones and sills
  function shopArchPath(path, r, hRect, y0) {
    path.moveTo(-r, y0); path.lineTo(r, y0); path.lineTo(r, hRect); path.absarc(0, hRect, r, 0, Math.PI, false); path.lineTo(-r, y0);
    return path;
  }
  function shopArchWindow(x, y, z, ry, w, hRect, frameMat, parent) {
    var win = new THREE.Group(), r = w / 2;
    win.position.set(x, y, z); win.rotation.y = ry;
    (parent || shopGroup).add(win);
    sp(new THREE.ShapeGeometry(shopArchPath(new THREE.Shape(), r, hRect, 0), 20), shopRealGlass('arch', 128, 282, 1 / w, 1 / (hRect + r), 0.5, 0), 0, 0, 0.01, 0, 0, 0, win);
    var frame = shopArchPath(new THREE.Shape(), r + 0.12, hRect, -0.12);
    frame.holes.push(shopArchPath(new THREE.Path(), r, hRect, 0));
    sp(new THREE.ExtrudeGeometry(frame, { depth: 0.1, bevelEnabled: false, curveSegments: 20 }), frameMat || shopTrim, 0, 0, 0, 0, 0, 0, win);
    sp(new THREE.BoxGeometry(0.2, 0.24, 0.14), frameMat || shopTrim, 0, hRect + r + 0.06, 0.05, 0, 0, 0, win);   // keystone
    sp(new THREE.BoxGeometry(w + 0.4, 0.08, 0.22), frameMat || shopTrim, 0, -0.14, 0.08, 0, 0, 0, win);          // sill
    return win;
  }
  [-1, 1].forEach(function (s) {
    [-1.4, 1.4].forEach(function (wz) { shopArchWindow(s * (SW + 0.01), 1.05, wz, s * Math.PI / 2, 1.0, 1.7); });
    shopArchWindow(s * 2.4, 1.05, -SD - 0.01, Math.PI, 1.0, 1.7);
  });

  // the plum-and-gold shopfront: pilasters, panelled stall risers, two big display windows, a glass door and the sign
  var SHOP_FZ = SD;
  [-4.05, -0.8, 0.8, 4.05].forEach(function (px) {
    sp(new THREE.BoxGeometry(0.3, 2.6, 0.18), shopPaint, px, SHOP_PLINTH + 1.3, SHOP_FZ + 0.09);
    sp(new THREE.BoxGeometry(0.38, 0.2, 0.24), shopPaint, px, SHOP_PLINTH + 0.1, SHOP_FZ + 0.1);
    sp(new THREE.BoxGeometry(0.38, 0.1, 0.24), houseMats.gold, px, SHOP_PLINTH + 2.62, SHOP_FZ + 0.1);
    sp(new THREE.BoxGeometry(0.14, 1.6, 0.04), shopPaintLight, px, SHOP_PLINTH + 1.3, SHOP_FZ + 0.19);
  });
  var shopBoxTex = paintTexture(256, 160, function (g, w, h) {       // soft cream walls inside the window box
    var bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#efe2cc'); bg.addColorStop(1, '#d9c3a2');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(190,160,130,0.25)'; for (var i = 0; i < 16; i++) g.fillRect(i * 16 + 7, 0, 3, h);
  });
  var shopBoxMat = new THREE.MeshStandardMaterial({ map: shopBoxTex, emissive: 0xffd9a0, emissiveIntensity: 0.12, roughness: 0.9, side: THREE.BackSide });
  var shopShelfMat = new THREE.MeshStandardMaterial({ color: 0x7a5236, emissive: 0x3a2010, emissiveIntensity: 0.15, roughness: 0.7 });
  var shopJarMat = new THREE.MeshStandardMaterial({ color: 0xeaf6ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.35, depthWrite: false });
  var shopSeedMat = new THREE.MeshStandardMaterial({ color: 0xd9b8ff, emissive: 0x8a4ad8, emissiveIntensity: 0.6 });
  var shopPotMat = new THREE.MeshStandardMaterial({ color: 0xb8673f, emissive: 0x3a1a0a, emissiveIntensity: 0.15, roughness: 0.85 });
  var shopPlantMat = new THREE.MeshStandardMaterial({ color: 0x3f7a3a, emissive: 0x10240e, emissiveIntensity: 0.15, roughness: 0.6 });
  shopDisplayLit.push(shopBoxMat, shopShelfMat, shopPotMat, shopPlantMat);
  var shopPacketMats = [0xf4c2cc, 0xf7f3ec, 0xd9c8ec, 0xd8e8d4].map(function (c) { return new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.1, roughness: 0.7 }); });
  shopPacketMats.forEach(function (m) { shopDisplayLit.push(m); });
  var shopBulbMat = new THREE.MeshStandardMaterial({ color: 0xfff0c0, emissive: 0xffc860, emissiveIntensity: 1 });
  var shopPaneTex = paintTexture(256, 160, function (g, w, h) {      // reflections across the big panes
    g.fillStyle = 'rgba(200,220,235,0.06)'; g.fillRect(0, 0, w, h);
    var top = g.createLinearGradient(0, 0, 0, h * 0.5); top.addColorStop(0, 'rgba(40,40,50,0.45)'); top.addColorStop(1, 'rgba(40,40,50,0)');
    g.fillStyle = top; g.fillRect(0, 0, w, h);                         // the awning's shade on the glass
    var st = g.createLinearGradient(0, 0, w, h);
    st.addColorStop(0.2, 'rgba(255,255,255,0)'); st.addColorStop(0.3, 'rgba(255,255,255,0.3)'); st.addColorStop(0.36, 'rgba(255,255,255,0.04)'); st.addColorStop(0.44, 'rgba(255,255,255,0.2)'); st.addColorStop(0.52, 'rgba(255,255,255,0)');
    g.fillStyle = st; g.fillRect(0, 0, w, h);
  });
  var shopPaneMat = new THREE.MeshStandardMaterial({ map: shopPaneTex, transparent: true, roughness: 0.05, metalness: 0.4, depthWrite: false });
  var shopLetterTex = paintTexture(512, 64, function (g, w, h) {     // gilded lettering on the glass
    g.fillStyle = '#e2b54c'; g.strokeStyle = 'rgba(80,50,10,0.6)'; g.lineWidth = 2;
    g.font = 'italic bold 40px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.strokeText('Moonbloom Seeds', w / 2, h / 2); g.fillText('Moonbloom Seeds', w / 2, h / 2);
  });
  var shopLetterMat = new THREE.MeshStandardMaterial({ map: shopLetterTex, transparent: true, metalness: 0.6, roughness: 0.3, emissive: 0x6a4a10, emissiveIntensity: 0.3, depthWrite: false });
  var SHOP_WIN_B = SHOP_PLINTH + 0.6, SHOP_WIN_H = 1.85, SHOP_WIN_W = 2.95, BOX_Z = SHOP_FZ - SHOP_RECESS / 2;
  [-1, 1].forEach(function (s) {
    var bx = s * 2.425;
    sp(new THREE.BoxGeometry(SHOP_WIN_W - 0.03, SHOP_WIN_H - 0.03, SHOP_RECESS - 0.04), shopBoxMat, bx, SHOP_WIN_B + SHOP_WIN_H / 2, BOX_Z + 0.02).castShadow = false;   // a hair smaller than the opening, so it never fights with the stone wall behind it
    [SHOP_WIN_B + 0.62, SHOP_WIN_B + 1.22].forEach(function (shy, k) {          // two shelves on little brackets
      sp(new THREE.BoxGeometry(SHOP_WIN_W - 0.1, 0.035, 0.24), shopShelfMat, bx, shy, SHOP_FZ - SHOP_RECESS + 0.14);
      for (var j = 0; j < 9; j++) {
        var jx = bx - 1.25 + j * 0.31 + (k ? 0.12 : 0), hv = isle2Hash(j * 3 + k * 17 + s * 41);
        if ((j + k) % 3 === 0) {                                       // a jar of glowing seeds
          sp(new THREE.CylinderGeometry(0.055, 0.055, 0.1, 10), shopSeedMat, jx, shy + 0.06, SHOP_FZ - SHOP_RECESS + 0.14);
          sp(new THREE.CylinderGeometry(0.065, 0.065, 0.17, 12), shopJarMat, jx, shy + 0.1, SHOP_FZ - SHOP_RECESS + 0.14).castShadow = false;
          sp(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 12), houseMats.gold, jx, shy + 0.2, SHOP_FZ - SHOP_RECESS + 0.14);
        } else if ((j + k) % 3 === 1) {                                // seed packets
          sp(new THREE.BoxGeometry(0.13, 0.18, 0.02), shopPacketMats[Math.floor(hv * 4)], jx, shy + 0.1, SHOP_FZ - SHOP_RECESS + 0.16, -0.15, 0, 0);
          sp(new THREE.BoxGeometry(0.13, 0.17, 0.02), shopPacketMats[(Math.floor(hv * 4) + 1) % 4], jx + 0.07, shy + 0.095, SHOP_FZ - SHOP_RECESS + 0.1, -0.1, 0, 0);
        } else {                                                       // a little potted seedling
          sp(new THREE.CylinderGeometry(0.06, 0.045, 0.1, 10), shopPotMat, jx, shy + 0.05, SHOP_FZ - SHOP_RECESS + 0.14);
          sp(new THREE.IcosahedronGeometry(0.07, 0), shopPlantMat, jx, shy + 0.15, SHOP_FZ - SHOP_RECESS + 0.14, hv * 6, hv * 3, 0);
        }
      }
    });
    [-1.2, 1.2].forEach(function (ex) {                               // on the window floor: a big potted moonbloom at each end
      var px = bx + ex;
      sp(new THREE.CylinderGeometry(0.13, 0.1, 0.22, 14), shopPotMat, px, SHOP_WIN_B + 0.11, BOX_Z + 0.05);
      for (var lf = 0; lf < 6; lf++) sp(new THREE.SphereGeometry(0.07, 8, 6), shopPlantMat, px + Math.cos(lf) * 0.07, SHOP_WIN_B + 0.3 + (lf % 2) * 0.06, BOX_Z + 0.05 + Math.sin(lf) * 0.07, 0, lf, 0.4).scale.set(1, 0.35, 1.6);
      for (var bl = 0; bl < 3; bl++) sp(new THREE.SphereGeometry(0.045, 8, 6), shopSeedMat, px + Math.cos(bl * 2.1) * 0.06, SHOP_WIN_B + 0.42 + bl * 0.03, BOX_Z + 0.05 + Math.sin(bl * 2.1) * 0.06);
    });
    sp(new THREE.BoxGeometry(0.42, 0.14, 0.26), new THREE.MeshStandardMaterial({ color: 0xb08a5a, roughness: 0.95 }), bx - 0.45, SHOP_WIN_B + 0.07, BOX_Z);   // a crate of packets
    for (var cp = 0; cp < 4; cp++) sp(new THREE.BoxGeometry(0.11, 0.16, 0.02), shopPacketMats[cp], bx - 0.6 + cp * 0.1, SHOP_WIN_B + 0.2, BOX_Z - 0.02 + (cp % 2) * 0.06, -0.2, 0, 0);
    var easel = sp(new THREE.BoxGeometry(0.34, 0.42, 0.02), houseMats.door, bx + 0.4, SHOP_WIN_B + 0.21, BOX_Z + 0.08, -0.15, 0, 0);   // a little sign on an easel
    sp(new THREE.PlaneGeometry(0.28, 0.34), new THREE.MeshStandardMaterial({ map: shopChalkTex2(), roughness: 0.9 }), 0, 0, 0.012, 0, 0, 0, easel);
    for (var lb = 0; lb < 9; lb++) {                                   // a string of warm bulbs across the top
      var lt = lb / 8;
      sp(new THREE.SphereGeometry(0.025, 8, 6), shopBulbMat, bx - 1.35 + lt * 2.7, SHOP_WIN_B + SHOP_WIN_H - 0.1 - Math.sin(lt * Math.PI) * 0.12, SHOP_FZ - 0.12);
    }
    sp(new THREE.PlaneGeometry(SHOP_WIN_W, SHOP_WIN_H), shopPaneMat, bx, SHOP_WIN_B + SHOP_WIN_H / 2, SHOP_FZ + 0.01).castShadow = false;
    sp(new THREE.PlaneGeometry(1.6, 0.2), shopLetterMat, bx, SHOP_WIN_B + 0.42, SHOP_FZ + 0.015).castShadow = false;
    [[0, SHOP_WIN_H - 0.42, SHOP_WIN_W, 0.05], [-SHOP_WIN_W / 6, (SHOP_WIN_H - 0.42) / 2, 0.05, SHOP_WIN_H - 0.42], [SHOP_WIN_W / 6, (SHOP_WIN_H - 0.42) / 2, 0.05, SHOP_WIN_H - 0.42],   // slim glazing bars
     [0, 0.02, SHOP_WIN_W, 0.05], [0, SHOP_WIN_H - 0.02, SHOP_WIN_W, 0.05], [-SHOP_WIN_W / 2 + 0.02, SHOP_WIN_H / 2, 0.05, SHOP_WIN_H], [SHOP_WIN_W / 2 - 0.02, SHOP_WIN_H / 2, 0.05, SHOP_WIN_H]].forEach(function (b) {
      sp(new THREE.BoxGeometry(b[2], b[3], 0.05), shopPaint, bx + b[0], SHOP_WIN_B + b[1], SHOP_FZ + 0.02);
    });
    for (var tb = 1; tb < 6; tb++) sp(new THREE.BoxGeometry(0.035, 0.4, 0.04), shopPaint, bx - SHOP_WIN_W / 2 + tb * SHOP_WIN_W / 6, SHOP_WIN_B + SHOP_WIN_H - 0.21, SHOP_FZ + 0.02);
  });
  function shopChalkTex2() {
    return paintTexture(112, 136, function (g, w, h) {
      g.fillStyle = '#2f3833'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#f4efe6'; g.textAlign = 'center'; g.font = 'bold 17px Georgia, serif';
      g.fillText('Fresh', w / 2, 34); g.fillText('Seeds', w / 2, 56);
      g.fillStyle = '#f7d36a'; g.font = 'bold 24px Georgia, serif'; g.fillText('10 ✦', w / 2, 96);
    });
  }
  [-1, 1].forEach(function (s) {
    var cx = s * 2.425;
    sp(new THREE.BoxGeometry(2.95, 0.6, 0.12), shopPaint, cx, SHOP_PLINTH + 0.3, SHOP_FZ + 0.06);              // stall riser
    sp(new THREE.BoxGeometry(2.5, 0.34, 0.04), shopPaintLight, cx, SHOP_PLINTH + 0.3, SHOP_FZ + 0.13);
    sp(new THREE.BoxGeometry(2.56, 0.04, 0.05), houseMats.gold, cx, SHOP_PLINTH + 0.49, SHOP_FZ + 0.14);
    sp(new THREE.BoxGeometry(2.56, 0.04, 0.05), houseMats.gold, cx, SHOP_PLINTH + 0.11, SHOP_FZ + 0.14);
    sp(new THREE.BoxGeometry(3.05, 0.07, 0.26), shopPaint, cx, SHOP_PLINTH + 0.62, SHOP_FZ + 0.13);           // window sill
  });
  var shopDoorGlass = shopRealGlass('door', 128, 168), shopTransomGlass = shopRealGlass('transom', 256, 60);
  sp(new THREE.BoxGeometry(1.3, 2.2, 0.08), houseMats.door, 0, SHOP_PLINTH + 1.1, SHOP_FZ + 0.02);
  sp(new THREE.PlaneGeometry(0.8, 1.05), shopDoorGlass, 0, SHOP_PLINTH + 1.5, SHOP_FZ + 0.065);
  [[0, 0.98, 0.86, 0.05], [0, 2.03, 0.86, 0.05], [-0.41, 1.5, 0.05, 1.1], [0.41, 1.5, 0.05, 1.1], [0, 1.5, 0.03, 1.05], [0, 0.18, 1.1, 0.16]].forEach(function (b) {
    sp(new THREE.BoxGeometry(b[2], b[3], 0.04), houseMats.gold, b[0], SHOP_PLINTH + b[1], SHOP_FZ + 0.075);
  });
  sp(new THREE.SphereGeometry(0.055, 10, 8), houseMats.gold, 0.45, SHOP_PLINTH + 1.05, SHOP_FZ + 0.11);
  sp(new THREE.PlaneGeometry(1.3, 0.3), shopTransomGlass, 0, SHOP_PLINTH + 2.4, SHOP_FZ + 0.02);                  // transom light over the door
  sp(new THREE.BoxGeometry(1.3, 0.05, 0.06), houseMats.gold, 0, SHOP_PLINTH + 2.24, SHOP_FZ + 0.06);
  // the fascia sign and its cornice
  function shopSignPaint(g, w, h, metalOnly) {                      // a hand-painted wooden sign with raised, gilded letters
    if (metalOnly) { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); }
    else {
      g.fillStyle = '#382645'; g.fillRect(0, 0, w, h);                 // deep plum paint over wood
      for (var i = 0; i < 260; i++) {                                  // the grain showing through
        var gy = isle2Hash(i * 1.7) * h, lite = isle2Hash(i * 3.1) > 0.5;
        g.strokeStyle = lite ? 'rgba(120,90,140,' + (0.05 + isle2Hash(i) * 0.08) + ')' : 'rgba(10,5,15,' + (0.08 + isle2Hash(i) * 0.1) + ')';
        g.lineWidth = 0.6 + isle2Hash(i * 5) * 1.4;
        g.beginPath(); var x0 = isle2Hash(i * 2.3) * w * 0.7; g.moveTo(x0, gy);
        g.bezierCurveTo(x0 + 200, gy + (isle2Hash(i * 7) - 0.5) * 6, x0 + 420, gy - (isle2Hash(i * 9) - 0.5) * 6, x0 + 300 + isle2Hash(i * 11) * 500, gy + (isle2Hash(i * 13) - 0.5) * 4);
        g.stroke();
      }
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, h / 2 - 1, w, 2);   // the joint between the two boards
      var vig = g.createLinearGradient(0, 0, 0, h); vig.addColorStop(0, 'rgba(0,0,0,0.3)'); vig.addColorStop(0.2, 'rgba(0,0,0,0)'); vig.addColorStop(0.8, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.35)');
      g.fillStyle = vig; g.fillRect(0, 0, w, h);
      for (var sc = 0; sc < 40; sc++) { g.strokeStyle = 'rgba(200,180,210,0.07)'; g.lineWidth = 1; var sx = isle2Hash(sc * 17) * w, sy = isle2Hash(sc * 19) * h; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + 8 + isle2Hash(sc) * 20, sy + (isle2Hash(sc * 3) - 0.5) * 4); g.stroke(); }
    }
    function gold(y0, y1) {
      if (metalOnly) return '#fff';
      var gg = g.createLinearGradient(0, y0, 0, y1);
      gg.addColorStop(0, '#fff3c0'); gg.addColorStop(0.32, '#e9bb4e'); gg.addColorStop(0.55, '#a87824'); gg.addColorStop(0.78, '#f0cd68'); gg.addColorStop(1, '#7e5814');
      return gg;
    }
    function gild(text, x, y, size, italic, spacing) {                 // letters with a shadow, a dark bevel edge and a gold face
      g.font = (italic ? 'italic ' : '') + 'bold ' + size + 'px Georgia, serif'; g.textBaseline = 'middle';
      var chars = text.split(''), widths = chars.map(function (c) { return g.measureText(c).width + (spacing || 0); });
      var total = widths.reduce(function (a2, b2) { return a2 + b2; }, 0) - (spacing || 0), cx = x - total / 2;
      chars.forEach(function (c, k) {
        if (!metalOnly) {
          g.save(); g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowOffsetX = size * 0.04; g.shadowOffsetY = size * 0.06; g.shadowBlur = size * 0.07;
          g.fillStyle = '#4a3008'; g.fillText(c, cx + 1, y + 1.5); g.restore();
        }
        g.fillStyle = gold(y - size * 0.5, y + size * 0.5); g.fillText(c, cx, y);
        if (!metalOnly) { g.strokeStyle = 'rgba(255,248,215,0.45)'; g.lineWidth = 0.8; g.strokeText(c, cx - 0.5, y - 0.8); }
        cx += widths[k];
      });
    }
    g.strokeStyle = metalOnly ? '#fff' : gold(0, h); g.lineWidth = 3.5;   // a gold pinstripe border
    function rrect(m, r) { g.beginPath(); g.moveTo(m + r, m); g.lineTo(w - m - r, m); g.quadraticCurveTo(w - m, m, w - m, m + r); g.lineTo(w - m, h - m - r); g.quadraticCurveTo(w - m, h - m, w - m - r, h - m); g.lineTo(m + r, h - m); g.quadraticCurveTo(m, h - m, m, h - m - r); g.lineTo(m, m + r); g.quadraticCurveTo(m, m, m + r, m); g.stroke(); }
    rrect(12, 14); g.lineWidth = 1.2; rrect(20, 10);
    gild('Whimsy & Bloom', w / 2, h / 2 + 2, 92, true, 1);
    [[250, 'SEEDS'], [w - 250, 'BLOOMS']].forEach(function (sw) {
      gild(sw[1], sw[0], h / 2 + 2, 32, false, 7);
      g.strokeStyle = metalOnly ? '#fff' : '#c99a3a'; g.lineWidth = 2;
      [-1, 1].forEach(function (d) {                                   // little rules and diamonds either side
        var ex = sw[0] + d * 105;
        g.beginPath(); g.moveTo(ex, h / 2 + 2); g.lineTo(ex + d * 40, h / 2 + 2); g.stroke();
        g.fillStyle = metalOnly ? '#fff' : '#e3b54c'; g.beginPath(); g.moveTo(ex + d * 48, h / 2 - 4); g.lineTo(ex + d * 54, h / 2 + 2); g.lineTo(ex + d * 48, h / 2 + 8); g.lineTo(ex + d * 42, h / 2 + 2); g.closePath(); g.fill();
      });
    });
  }
  var shopSignTex = paintTexture(2048, 130, function (g, w, h) { shopSignPaint(g, w, h, false); });
  var shopSignMetal = paintTexture(2048, 130, function (g, w, h) { shopSignPaint(g, w, h, true); });
  shopSignTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  var shopSignMat = new THREE.MeshStandardMaterial({ map: shopSignTex, metalnessMap: shopSignMetal, metalness: 0.3, roughness: 0.42, emissive: 0xe8b54a, emissiveMap: shopSignMetal, emissiveIntensity: 0.3 });   // the gilding catches the light
  sp(new THREE.BoxGeometry(8.6, 0.62, 0.16), shopPaint, 0, SHOP_PLINTH + 2.98, SHOP_FZ + 0.1);
  sp(new THREE.PlaneGeometry(8.2, 0.52), shopSignMat, 0, SHOP_PLINTH + 2.98, SHOP_FZ + 0.185);
  [[0, 0.29, 8.4, 0.06], [0, -0.29, 8.4, 0.06], [-4.17, 0, 0.06, 0.64], [4.17, 0, 0.06, 0.64]].forEach(function (f) {     // a raised moulded frame with a gold bead
    sp(new THREE.BoxGeometry(f[2], f[3], 0.06), shopPaint, f[0], SHOP_PLINTH + 2.98 + f[1], SHOP_FZ + 0.2);
    sp(new THREE.BoxGeometry(f[2] > 1 ? 8.26 : 0.018, f[3] > 0.1 ? 0.54 : 0.018, 0.02), houseMats.gold, f[0] * 0.985, SHOP_PLINTH + 2.98 + f[1] * 0.9, SHOP_FZ + 0.215);
  });
  var shopLampGlows = [], shopLampInner = new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: 0xffd9a0, emissiveIntensity: 0.2, side: THREE.BackSide });
  [-2.7, 0, 2.7].forEach(function (lx) {                              // brass gooseneck lamps lighting the sign
    var y0 = SHOP_PLINTH + 3.41, z0 = SHOP_FZ + 0.2;
    sp(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 12), houseMats.gold, lx, y0 + 0.01, z0);
    var neck = new THREE.CatmullRomCurve3([new THREE.Vector3(lx, y0, z0), new THREE.Vector3(lx, y0 + 0.22, z0 + 0.05), new THREE.Vector3(lx, y0 + 0.3, z0 + 0.28), new THREE.Vector3(lx, y0 + 0.22, z0 + 0.48)]);
    sp(new THREE.TubeGeometry(neck, 16, 0.014, 6), houseMats.gold, 0, 0, 0);
    var shade = sp(new THREE.SphereGeometry(0.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), houseMats.gold, lx, y0 + 0.2, z0 + 0.5, 0.75, 0, 0);
    shade.scale.set(1.3, 0.8, 1);
    var inner = sp(new THREE.SphereGeometry(0.095, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), shopLampInner, lx, y0 + 0.2, z0 + 0.5, 0.75, 0, 0);
    inner.scale.set(1.3, 0.8, 1); inner.castShadow = false;
    var lg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffd9a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    lg.position.set(lx, y0 + 0.12, z0 + 0.46); lg.scale.set(0.7, 0.7, 1); shopGroup.add(lg);
    shopLampGlows.push(lg);
  });
  sp(new THREE.BoxGeometry(8.9, 0.12, 0.34), shopPaint, 0, SHOP_PLINTH + 3.35, SHOP_FZ + 0.12);
  sp(new THREE.BoxGeometry(8.8, 0.04, 0.3), houseMats.gold, 0, SHOP_PLINTH + 3.27, SHOP_FZ + 0.13);
  // striped awnings with scalloped fronts over the display windows
  var AW_DROP = 0.44, AW_OUT = 0.87, awAng = Math.atan2(AW_DROP, AW_OUT), awLen = Math.sqrt(AW_DROP * AW_DROP + AW_OUT * AW_OUT);
  var shopAwningMat = new THREE.MeshStandardMaterial({ map: shopTiled(shopStripeTex, 2.5, 0.6, 0, 0.4), roughness: 0.85, side: THREE.DoubleSide });
  var shopValanceMat = new THREE.MeshStandardMaterial({ map: shopTiled(shopStripeTex, 2.5, 1), roughness: 0.85, side: THREE.DoubleSide, alphaTest: 0.5 });
  var AW_TOP = SHOP_PLINTH + 2.62;
  [-1, 1].forEach(function (s) {
    var cx = s * 2.425;
    sp(new THREE.PlaneGeometry(3.1, awLen), shopAwningMat, cx, AW_TOP - AW_DROP / 2, SHOP_FZ + 0.18 + AW_OUT / 2, -(Math.PI / 2 - awAng), 0, 0);
    sp(new THREE.PlaneGeometry(3.1, 0.26), shopValanceMat, cx, AW_TOP - AW_DROP - 0.12, SHOP_FZ + 0.18 + AW_OUT);
    sp(new THREE.CylinderGeometry(0.025, 0.025, 3.12, 8), houseMats.gold, cx, AW_TOP - AW_DROP, SHOP_FZ + 0.18 + AW_OUT, 0, 0, Math.PI / 2);
    [-1.55, 1.55].forEach(function (e) { sp(new THREE.BoxGeometry(0.03, 0.03, awLen), houseMats.gold, cx + e, AW_TOP - AW_DROP / 2, SHOP_FZ + 0.18 + AW_OUT / 2, awAng, 0, 0); });
  });

  // the fish-scale slate mansard roof, with gold cresting where it turns flatter, and chimneys
  function shopFrustum(bottomHW, bottomHD, topK, h, y, mat) {
    var geo = new THREE.CylinderGeometry(Math.SQRT2 * topK, Math.SQRT2, 1, 4, 1, true);
    geo.rotateY(Math.PI / 4);
    geo = geo.toNonIndexed(); geo.computeVertexNormals();
    var m = sp(geo, mat, 0, y + h / 2, 0);
    m.scale.set(bottomHW, h, bottomHD);
    return m;
  }
  var ROOF_HW = SW + 0.22, ROOF_HD = SD + 0.22, MANS_H = 2.2, MANS_K = 0.8, ROOF_Y = WALL_TOP + 0.16;
  var BREAK_Y = ROOF_Y + MANS_H, TOP_K = 0.55, TOP_H = 0.65, ROOF_TOP = BREAK_Y + TOP_H;
  shopFrustum(ROOF_HW, ROOF_HD, MANS_K, MANS_H, ROOF_Y, shopSlate);
  shopFrustum(ROOF_HW * MANS_K, ROOF_HD * MANS_K, TOP_K / MANS_K, TOP_H, BREAK_Y, shopSlate);
  sp(new THREE.BoxGeometry(ROOF_HW * TOP_K * 2, 0.06, ROOF_HD * TOP_K * 2), shopSlate, 0, ROOF_TOP, 0);
  sp(new THREE.BoxGeometry(ROOF_HW * MANS_K * 2 + 0.1, 0.1, ROOF_HD * MANS_K * 2 + 0.1), shopTrim, 0, BREAK_Y, 0);
  var shopBX = ROOF_HW * MANS_K, shopBZ = ROOF_HD * MANS_K;
  [[0, shopBZ, shopBX * 2, 0], [0, -shopBZ, shopBX * 2, Math.PI], [shopBX, 0, shopBZ * 2, Math.PI / 2], [-shopBX, 0, shopBZ * 2, -Math.PI / 2]].forEach(function (c) {
    var cm = new THREE.MeshStandardMaterial({ map: shopTiled(shopCrestTex, c[2] / 2.4, 1), emissive: 0xb07a10, emissiveIntensity: 0.3, metalness: 0.6, roughness: 0.4, alphaTest: 0.5, side: THREE.DoubleSide });
    sp(new THREE.PlaneGeometry(c[2], 0.3), cm, c[0], BREAK_Y + 0.2, c[1], 0, c[3], 0).castShadow = false;
  });
  [[-2.3, -1.5], [2.3, -1.5]].forEach(function (c) {
    sp(new THREE.BoxGeometry(0.62, 2.3, 0.62), shopAshlar, c[0], BREAK_Y + 0.4, c[1]);
    sp(new THREE.BoxGeometry(0.8, 0.12, 0.8), shopTrim, c[0], BREAK_Y + 1.6, c[1]);
    [-0.14, 0.14].forEach(function (o) { sp(new THREE.CylinderGeometry(0.09, 0.11, 0.32, 10), houseMats.roof, c[0] + o, BREAK_Y + 1.8, c[1]); });
  });
  // dormers: small arched ones, and a big one in the middle of the front with a round window
  function shopDormer(x, z, ry, big) {
    var d = new THREE.Group(), bw = big ? 2.0 : 1.3, bh = big ? 1.8 : 1.3, depth = 1.3;
    d.position.set(x, ROOF_Y - 0.02, z); d.rotation.y = ry;
    shopGroup.add(d);
    sp(new THREE.BoxGeometry(bw, bh, depth), shopSlate, 0, bh / 2, -depth / 2, 0, 0, 0, d);
    sp(new THREE.BoxGeometry(bw + 0.04, bh, 0.06), shopTrim, 0, bh / 2, 0.01, 0, 0, 0, d);
    [-1, 1].forEach(function (s) { sp(new THREE.BoxGeometry(0.14, bh, 0.12), shopTrim, s * (bw / 2 - 0.02), bh / 2, 0.04, 0, 0, 0, d); });
    var rr = bw / 2 + 0.12;
    sp(new THREE.CylinderGeometry(rr, rr, depth + 0.1, 20, 1, false, Math.PI / 2, Math.PI), shopSlate, 0, bh, -depth / 2 + 0.05, Math.PI / 2, 0, 0, d).scale.set(1, 1, 0.75);
    var ar = sp(new THREE.TorusGeometry(rr, 0.06, 6, 20, Math.PI), shopTrim, 0, bh, 0.06, 0, 0, 0, d);
    ar.scale.set(1, 0.75, 1);
    sp(new THREE.ConeGeometry(0.05, 0.3, 6), houseMats.gold, 0, bh + rr * 0.75 + 0.15, 0.02, 0, 0, 0, d);
    if (big) {
      var rose = sp(new THREE.CircleGeometry(0.6, 32), shopRealGlass('round', 256, 256), 0, bh / 2 + 0.05, 0.06, 0, 0, 0, d);
      sp(new THREE.TorusGeometry(0.63, 0.05, 8, 40), houseMats.gold, 0, bh / 2 + 0.05, 0.08, 0, 0, 0, d);
      sp(new THREE.TorusGeometry(0.74, 0.08, 8, 40), shopTrim, 0, bh / 2 + 0.05, 0.06, 0, 0, 0, d);
      sp(new THREE.BoxGeometry(0.18, 0.24, 0.12), shopTrim, 0, bh / 2 + 0.83, 0.08, 0, 0, 0, d);
    } else {
      shopArchWindow(0, 0.24, 0.04, 0, 0.66, 0.5, shopTrim, d);
    }
    return d;
  }
  shopDormer(0, ROOF_HD - 0.02, 0, true);
  [-2.9, 2.9].forEach(function (x) { shopDormer(x, ROOF_HD - 0.02, 0, false); });
  [-1, 1].forEach(function (s) { shopDormer(s * (ROOF_HW - 0.02), 0, s * Math.PI / 2, false); });
  shopDormer(0, -ROOF_HD + 0.02, Math.PI, false);
  // a gold spire on the roof, with a glowing crystal and a turning star
  var SPIRE_Y = ROOF_TOP + 0.03;
  sp(new THREE.CylinderGeometry(0.3, 0.38, 0.2, 12), houseMats.gold, 0, SPIRE_Y + 0.1, 0);
  sp(new THREE.SphereGeometry(0.16, 14, 10), houseMats.gold, 0, SPIRE_Y + 0.32, 0);
  sp(new THREE.CylinderGeometry(0.025, 0.06, 1.2, 8), houseMats.gold, 0, SPIRE_Y + 0.95, 0);
  var seedGlow = new THREE.MeshStandardMaterial({ color: 0xd9b8ff, emissive: 0xa45cff, emissiveIntensity: 1.1 });
  var shopCrystal = sp(new THREE.OctahedronGeometry(0.2, 0), seedGlow, 0, SPIRE_Y + 0.85, 0);
  shopCrystal.scale.set(1, 1.7, 1);
  var crystalGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xb98cff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
  crystalGlow.position.set(0, SPIRE_Y + 0.85, 0); crystalGlow.scale.set(1.8, 1.8, 1);
  shopGroup.add(crystalGlow);
  var shopStar = sp(new THREE.OctahedronGeometry(0.26, 0), houseMats.gold, 0, SPIRE_Y + 1.75, 0);
  shopStar.scale.set(1, 1.3, 0.4);
  var starGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffe08a, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  starGlow.position.set(0, SPIRE_Y + 1.75, 0); starGlow.scale.set(2, 2, 1);
  shopGroup.add(starGlow);

  // a hanging blade sign on a gold bracket at the corner
  var shopBladeTex = paintTexture(256, 256, function (g, w, h) {
    var cx = w / 2, cy = h / 2;
    g.fillStyle = '#4f3270'; g.beginPath(); g.arc(cx, cy, 124, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#f2c14e'; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, 112, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#7a4e34'; g.beginPath(); g.ellipse(cx, cy + 46, 34, 20, 0, 0, Math.PI * 2); g.fill();       // a seed sprouting
    g.strokeStyle = '#7fd07a'; g.lineWidth = 8; g.beginPath(); g.moveTo(cx, cy + 34); g.quadraticCurveTo(cx - 6, cy - 10, cx, cy - 40); g.stroke();
    g.fillStyle = '#7fd07a';
    g.beginPath(); g.ellipse(cx - 30, cy - 26, 30, 13, -0.5, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(cx + 30, cy - 40, 30, 13, 0.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f7d36a'; g.font = '40px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('✦', cx + 54, cy - 72); g.fillText('✦', cx - 60, cy + 4);
  });
  var shopBladeMat = new THREE.MeshStandardMaterial({ map: shopBladeTex, emissive: 0xffffff, emissiveMap: shopBladeTex, emissiveIntensity: 0.2, roughness: 0.5, side: THREE.DoubleSide, transparent: true, alphaTest: 0.5 });
  var BLADE_X = SW + 0.12, BLADE_Y = SHOP_PLINTH + 3.62;
  sp(new THREE.BoxGeometry(0.05, 0.05, 1.05), houseMats.gold, BLADE_X, BLADE_Y, SHOP_FZ + 0.52);
  sp(new THREE.TorusGeometry(0.16, 0.025, 6, 16, Math.PI * 1.5), houseMats.gold, BLADE_X, BLADE_Y - 0.17, SHOP_FZ + 0.18, 0, Math.PI / 2, 0);
  sp(new THREE.SphereGeometry(0.05, 8, 6), houseMats.gold, BLADE_X, BLADE_Y, SHOP_FZ + 1.06);
  [0.32, 0.82].forEach(function (cz) { sp(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 4), houseMats.gold, BLADE_X, BLADE_Y - 0.1, SHOP_FZ + cz); });
  sp(new THREE.CircleGeometry(0.38, 32), shopBladeMat, BLADE_X, BLADE_Y - 0.56, SHOP_FZ + 0.57, 0, Math.PI / 2, 0);
  sp(new THREE.TorusGeometry(0.39, 0.025, 6, 32), houseMats.gold, BLADE_X, BLADE_Y - 0.56, SHOP_FZ + 0.57, 0, Math.PI / 2, 0);

  // stone steps up to the door
  sp(new THREE.BoxGeometry(1.8, SHOP_PLINTH, 0.3), shopTrim, 0, SHOP_PLINTH / 2, SHOP_FZ + 0.15);
  sp(new THREE.BoxGeometry(2.0, SHOP_PLINTH / 2, 0.28), houseMats.stone, 0, SHOP_PLINTH / 4, SHOP_FZ + 0.44);
  sp(new THREE.BoxGeometry(0.9, 0.02, 0.26), new THREE.MeshStandardMaterial({ color: 0x6b5340, roughness: 1 }), 0, SHOP_PLINTH + 0.01, SHOP_FZ + 0.16);

  // flower boxes under the display windows and the side windows, climbing roses up the front corners
  var shopLeafMat = new THREE.MeshStandardMaterial({ color: 0x3f6e3a, roughness: 0.8, flatShading: true });
  var bloomMatsS = [0xf2a6c8, 0xc8b4ec, 0xfaf2dc].map(function (c) { return new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 }); });
  var shopDummy = new THREE.Object3D(), shopLeafSpots = [], shopBloomSpots = [[], [], []];
  // the plants in the flower boxes: small flat leaves, five-petalled flowers with golden centres, lavender spikes and trailing ivy
  var pbLeaves = [], pbPetals = [], pbCentres = [], pbLavStems = [], pbLavBuds = [];
  var PB_COLOURS = [0xf2a6c8, 0xd9608c, 0xc8b4ec, 0xf6c4a0, 0xf7f3ec, 0xe88ab4];
  function shopPlanter(x, y, z, lx, lz, seedN, ox, oz) {               // (ox, oz): which way the box faces out
    sp(new THREE.BoxGeometry(lx, 0.3, lz), shopPaint, x, y + 0.15, z);
    [[0, lz / 2, lx + 0.06, 0.035], [0, -lz / 2, lx + 0.06, 0.035], [lx / 2, 0, 0.035, lz + 0.06], [-lx / 2, 0, 0.035, lz + 0.06]].forEach(function (r) {   // a thin gold rim
      sp(new THREE.BoxGeometry(r[2], 0.04, r[3]), houseMats.gold, x + r[0], y + 0.31, z + r[1]);
    });
    sp(new THREE.BoxGeometry(lx - 0.02, 0.02, lz - 0.02), new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 1 }), x, y + 0.305, z);   // the soil
    var along = lx > lz, len = along ? lx : lz, depth = along ? lz : lx, top = y + 0.31;
    function at(f, d) { return along ? [x + f * len, z + d * depth] : [x + d * depth, z + f * len]; }
    for (var i = 0; i < Math.floor(len / 0.008); i++) {                 // a dense bed of small leaves
      var h = isle2Hash(seedN + i * 1.37), q = at(isle2Hash(seedN + i * 2.11) - 0.5, (h - 0.5) * 0.85);
      pbLeaves.push([q[0], top + 0.015 + isle2Hash(seedN + i * 5.3) * 0.1, q[1], 0.035 + h * 0.025, isle2Hash(seedN + i * 7.9) * 6.28, 0.15 + h * 0.6, h]);
    }
    for (var fl = 0; fl < Math.floor(len / 0.06); fl++) {               // flowers peeking up out of the leaves
      var fh = isle2Hash(seedN + fl * 3.73), fq = at((fl + 0.5) / Math.floor(len / 0.06) - 0.5 + (fh - 0.5) * 0.04, (isle2Hash(seedN + fl * 4.1) - 0.5) * 0.7);
      var fy = top + 0.09 + isle2Hash(seedN + fl * 6.6) * 0.07, pr = 0.016 + fh * 0.01, col = PB_COLOURS[Math.floor(isle2Hash(seedN + fl * 8.2) * PB_COLOURS.length)], ph = fh * 6.28;
      for (var pt = 0; pt < 5; pt++) {
        var pa = ph + pt / 5 * Math.PI * 2;
        pbPetals.push([fq[0] + Math.cos(pa) * pr, fy, fq[1] + Math.sin(pa) * pr, pr, pa, col]);
      }
      pbCentres.push([fq[0], fy + 0.004, fq[1], pr * 0.45]);
    }
    for (var lv = 0; lv < Math.floor(len / 0.32); lv++) {               // lavender spikes standing up at the back
      var lq = at((lv + 0.5) / Math.floor(len / 0.32) - 0.5, -0.3), lean = (isle2Hash(seedN + lv * 9.1) - 0.5) * 0.3, lh = 0.16 + isle2Hash(seedN + lv * 2.2) * 0.06;
      for (var st = 0; st < 3; st++) {
        var sa = st * 2.1 + lv;
        pbLavStems.push([lq[0] + Math.cos(sa) * 0.02, top + lh / 2, lq[1] + Math.sin(sa) * 0.02, lh, lean * Math.cos(sa), lean * Math.sin(sa)]);
        for (var bd = 0; bd < 6; bd++) {
          var bt = 0.55 + bd * 0.08;
          pbLavBuds.push([lq[0] + Math.cos(sa) * 0.02 + lean * Math.cos(sa) * lh * bt, top + lh * bt, lq[1] + Math.sin(sa) * 0.02 - lean * Math.sin(sa) * lh * bt, 0.011 - bd * 0.0008]);
        }
      }
    }
    for (var iv = 0; iv < Math.floor(len / 0.22); iv++) {               // ivy trailing over the front edge
      var iq = at((iv + 0.5) / Math.floor(len / 0.22) - 0.5 + (isle2Hash(seedN + iv) - 0.5) * 0.05, 0), ilen = 4 + Math.floor(isle2Hash(seedN + iv * 3.3) * 4);
      for (var il = 0; il < ilen; il++) {
        var ih = isle2Hash(seedN + iv * 11 + il);
        pbLeaves.push([iq[0] + ox * (depth / 2 + 0.03) + (ih - 0.5) * 0.03, top + 0.01 - il * 0.045, iq[1] + oz * (depth / 2 + 0.03) + (ih - 0.5) * 0.03, 0.026 + ih * 0.01, ih * 6.28, 1.2 + ih * 0.3, ih]);
      }
    }
  }
  [-1, 1].forEach(function (s) {
    shopPlanter(s * 2.425, 0, SHOP_FZ + 0.32, 2.9, 0.3, 300 + s * 50, 0, 1);
    [-1.4, 1.4].forEach(function (wz, k) { shopPlanter(s * (SW + 0.17), 0.55, wz, 0.24, 1.2, 500 + s * 50 + k * 20, s, 0); });
    for (var v = 0; v < 70; v++) {                                     // climbing roses up the front corners
      var rv = isle2Hash(v * 4.1 + s * 9), vy = 0.4 + v / 70 * 3.2;
      var vx = s * (SW + 0.06 + rv * 0.1), vz = SHOP_FZ - 0.35 + isle2Hash(v * 2.7) * 0.5;
      shopLeafSpots.push([vx, vy, vz, 0.07 + rv * 0.06]);
      if (v % 3 === 0) shopBloomSpots[v % 2 ? 2 : 0].push([vx + s * 0.05, vy + 0.04, vz + 0.06]);
    }
  });
  var shopLeafSpread = [];                                             // break each clump into a few small, differently-green leafy bits
  shopLeafSpots.forEach(function (q, i) {
    for (var j = 0; j < 4; j++) {
      var h1 = isle2Hash(i * 4.3 + j), h2 = isle2Hash(i * 2.9 + j * 7), h3 = isle2Hash(i * 6.1 + j * 3);
      shopLeafSpread.push([q[0] + (h1 - 0.5) * q[3] * 1.4, q[1] + (h2 - 0.4) * q[3], q[2] + (h3 - 0.5) * q[3] * 1.4, q[3] * (0.45 + h1 * 0.3), h2 * 6, h3]);
    }
  });
  var shopLeaves = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, flatShading: true }), shopLeafSpread.length);
  var shopLeafCol = new THREE.Color();
  shopLeafSpread.forEach(function (q, i) {
    shopDummy.position.set(q[0], q[1], q[2]); shopDummy.rotation.set(q[4], q[4] * 1.3, 0); shopDummy.scale.set(q[3], q[3] * 0.6, q[3]); shopDummy.updateMatrix();
    shopLeaves.setMatrixAt(i, shopDummy.matrix);
    shopLeaves.setColorAt(i, shopLeafCol.setHSL(0.27 + q[5] * 0.06, 0.38, 0.22 + q[5] * 0.12));
  });
  shopDummy.rotation.set(0, 0, 0);
  shopGroup.add(shopLeaves);
  shopBloomSpots.forEach(function (list, c) {
    var im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 8, 6), bloomMatsS[c], list.length);
    list.forEach(function (q, i) { shopDummy.position.set(q[0], q[1], q[2]); shopDummy.scale.set(1, 1, 1); shopDummy.updateMatrix(); im.setMatrixAt(i, shopDummy.matrix); });
    shopGroup.add(im);
  });
  function pbInstances(geo, mat, list, place) {                       // one batch for each kind of flower-box piece
    var im = new THREE.InstancedMesh(geo, mat, list.length), pc = new THREE.Color();
    list.forEach(function (q, i) { var col = place(q); shopDummy.updateMatrix(); im.setMatrixAt(i, shopDummy.matrix); if (col !== undefined) im.setColorAt(i, pc.set(col)); });
    im.castShadow = true; im.receiveShadow = true;
    shopGroup.add(im);
    shopDummy.rotation.order = 'XYZ'; shopDummy.rotation.set(0, 0, 0); shopDummy.scale.set(1, 1, 1);
    return im;
  }
  var pbLeafCol = new THREE.Color();
  pbInstances(new THREE.SphereGeometry(1, 8, 5), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 }), pbLeaves, function (q) {
    shopDummy.position.set(q[0], q[1], q[2]); shopDummy.rotation.order = 'YZX'; shopDummy.rotation.set(0, q[4], q[5]); shopDummy.scale.set(q[3], q[3] * 0.18, q[3] * 0.6);
    return pbLeafCol.setHSL(0.26 + q[6] * 0.07, 0.42, 0.24 + q[6] * 0.14).getHex();
  });
  pbInstances(new THREE.SphereGeometry(1, 8, 5), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, side: THREE.DoubleSide }), pbPetals, function (q) {
    shopDummy.position.set(q[0], q[1], q[2]); shopDummy.rotation.order = 'YZX'; shopDummy.rotation.set(0, -q[4], 0.35); shopDummy.scale.set(q[3] * 1.2, q[3] * 0.22, q[3] * 0.8);
    return q[5];
  });
  pbInstances(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshStandardMaterial({ color: 0xe8c040, roughness: 0.7 }), pbCentres, function (q) {
    shopDummy.position.set(q[0], q[1], q[2]); shopDummy.scale.set(q[3], q[3] * 0.6, q[3]);
  });
  pbInstances(new THREE.CylinderGeometry(0.003, 0.004, 1, 4), new THREE.MeshStandardMaterial({ color: 0x5a7a48, roughness: 0.8 }), pbLavStems, function (q) {
    shopDummy.position.set(q[0], q[1], q[2]); shopDummy.rotation.set(q[5], 0, -q[4]); shopDummy.scale.set(1, q[3], 1);
  });
  pbInstances(new THREE.SphereGeometry(1, 6, 5), new THREE.MeshStandardMaterial({ color: 0x8a6ad0, roughness: 0.7 }), pbLavBuds, function (q) {
    shopDummy.position.set(q[0], q[1], q[2]); shopDummy.scale.set(q[3], q[3] * 1.5, q[3]);
  });

  // potted topiaries by the door
  var topiaryXs = [-1.3, 1.3], TOPIARY_Z = SHOP_FZ + 0.5;
  topiaryXs.forEach(function (tx, k) {
    sp(new THREE.CylinderGeometry(0.26, 0.2, 0.46, 14), shopTrim, tx, 0.23, TOPIARY_Z);
    sp(new THREE.TorusGeometry(0.26, 0.03, 6, 20), houseMats.gold, tx, 0.44, TOPIARY_Z, Math.PI / 2, 0, 0);
    sp(new THREE.IcosahedronGeometry(0.3, 1), shopLeafMat, tx, 0.86, TOPIARY_Z);
    for (var b = 0; b < 14; b++) {                                     // lots of little tufts make it look clipped and leafy
      var ba = b * 2.4 + k, bh = (isle2Hash(b * 3 + k * 17) - 0.5) * 0.5, br = Math.sqrt(1 - bh * bh * 3.2) * 0.27;
      sp(new THREE.IcosahedronGeometry(0.1 + isle2Hash(b + k * 9) * 0.04, 0), shopLeafMat, tx + Math.cos(ba) * br, 0.86 + bh * 0.6, TOPIARY_Z + Math.sin(ba) * br, ba, ba * 0.7, 0);
    }
  });
  // floating crystal lanterns above the topiaries (shopGroup is turned, so work out where they land in the world)
  topiaryXs.forEach(function (tx, k) {
    var lz = TOPIARY_Z, c = Math.cos(SHOP_TURN), si = Math.sin(SHOP_TURN);
    makeCrystalLantern(SHOP_X + tx * c + lz * si, 1.95, SHOP_Z - tx * si + lz * c, 90 + k);
  });
  var SHOP_SPARKS = 40, shopSparkGeo = new THREE.BufferGeometry(), shopSparkPos = new Float32Array(SHOP_SPARKS * 3);
  shopSparkGeo.setAttribute('position', new THREE.BufferAttribute(shopSparkPos, 3));
  var shopSparks = new THREE.Points(shopSparkGeo, new THREE.PointsMaterial({ map: dawnGlowTex, color: 0xf2e0ff, size: 0.28, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
  shopSparks.frustumCulled = false;
  shopGroup.add(shopSparks);
  function updateShopBuilding(t) {
    var hr = state.minutes / 60, glow = hr < 6 ? 1 : hr < 7 ? 7 - hr : hr < 18.5 ? 0 : hr < 19.5 ? hr - 18.5 : 1;   // 0 by day, 1 at night
    shopStar.rotation.y = t * 0.8;
    pathLampMat.emissiveIntensity = 0.3 + glow * 1.6;                   // the path's lanterns light up at night
    for (var plg = 0; plg < pathLanternGlows.length; plg++) pathLanternGlows[plg].material.opacity = glow * 0.75;
    shopCrystal.rotation.y = -t * 0.6;
    updateClinicBuilding(t, glow);
    updateAnimalShop(t, glow);
    starGlow.material.opacity = 0.45 + Math.sin(t * 2) * 0.12;
    crystalGlow.material.opacity = 0.45 + glow * 0.3 + Math.sin(t * 2.4) * 0.1;
    seedGlow.emissiveIntensity = 0.9 + Math.sin(t * 2.4) * 0.3;
    for (var g = 0; g < shopGlowList.length; g++) shopGlowList[g].emissiveIntensity = 0.3 + glow * 0.65;
    for (var ng = 0; ng < shopNightGlass.length; ng++) shopNightGlass[ng].emissiveIntensity = 0.03 + glow * 0.9;
    shopSignMat.emissiveIntensity = 0.3 + glow * 0.4;                   // the lamps make the gold letters shine at night
    shopLampInner.emissiveIntensity = 0.2 + glow * 1.2;
    for (var lgi = 0; lgi < shopLampGlows.length; lgi++) shopLampGlows[lgi].material.opacity = glow * 0.75;
    for (var dl = 0; dl < shopDisplayLit.length; dl++) shopDisplayLit[dl].emissiveIntensity = 0.12 + glow * 0.45;
    for (var i = 0; i < SHOP_SPARKS; i++) {                            // sparkles spiralling slowly up round the spire
      var k = (i / SHOP_SPARKS + t * 0.04) % 1, a2 = i * 2.4 + t * 0.3, r = 2.2 * (1 - k * 0.7);
      shopSparkPos[i * 3] = Math.cos(a2) * r; shopSparkPos[i * 3 + 1] = BREAK_Y - 0.2 + k * 3.5; shopSparkPos[i * 3 + 2] = Math.sin(a2) * r;
    }
    shopSparkGeo.attributes.position.needsUpdate = true;
  }
  (function () {                                                       // you bump into the building and the topiaries
    var c = Math.cos(SHOP_TURN), si = Math.sin(SHOP_TURN);
    function solidAt(lx, lz, r) { solids.push({ x: SHOP_X + lx * c + lz * si, z: SHOP_Z - lx * si + lz * c, r: r }); }
    for (var x = -SW; x <= SW + 0.01; x += 1.2) for (var z = -SD; z <= SD - 0.9; z += 1.2) solidAt(x, z, 0.95);
    for (var fx = -SW; fx <= SW + 0.01; fx += 0.5) if (Math.abs(fx) > 0.7) solidAt(fx, SD - 0.25, 0.4);   // the shopfront, with a gap for the door
    solidAt(0, SD - 0.6, 0.35);                                        // the door itself: walk up to it and in you go
    topiaryXs.forEach(function (tx) { solidAt(tx, TOPIARY_Z, 0.32); });
  })();

  // ---------- The doctor's office, on the town square ----------
  // Everdawn Clinic: a tidy cottage surgery in soft sage clapboard with crisp white trim and a coral clay-tiled roof. A
  // white columned porch shelters the teal front door, with a painted sign, brass lanterns, clipped bay trees in pots,
  // six-over-six windows with louvred shutters and flower boxes, a bench, a brick chimney and a heart weathervane.
  // Its windows glow warmly at night
  var clinicGroup = new THREE.Group();
  clinicGroup.position.set(CLINIC_X, 0, CLINIC_Z);
  clinicGroup.rotation.y = CLINIC_TURN;
  scene.add(clinicGroup);
  function clPart(geo, mat, x, y, z, rx, ry, rz, parent) {
    var m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx || 0, ry || 0, rz || 0);
    m.castShadow = m.receiveShadow = true;
    (parent || clinicGroup).add(m);
    return m;
  }
  var CW = CLINIC_HW, CD = CLINIC_HD, CL_PLINTH = 0.3, CL_WALL_H = 3.4, CL_TOP = CL_PLINTH + CL_WALL_H;
  var CL_WIN_Y = 2.05, CL_WIN_W = 1.6, CL_WIN_H = 1.5;                 // the middle height and size of each window (they line up with the windows inside)
  var CL_RD = CD + 0.45, CL_RH = 2.0;                                  // the roof: how far it reaches front and back, and how tall it is

  // painted textures
  var clSidingTex = paintTexture(256, 256, function (g, w, h) {       // sage clapboard: overlapping boards, each with a shadow under its lip
    for (var r = 0; r < 16; r++) {
      var y = r * 16, l = 68 + isle2Hash(r * 3.1 + 900) * 5;
      var bg = g.createLinearGradient(0, y, 0, y + 16);
      bg.addColorStop(0, 'hsl(132,22%,' + (l - 1) + '%)'); bg.addColorStop(0.3, 'hsl(132,24%,' + (l + 6) + '%)'); bg.addColorStop(1, 'hsl(132,22%,' + (l + 10) + '%)');
      g.fillStyle = bg; g.fillRect(0, y, w, 16);
      g.fillStyle = 'rgba(40,60,45,0.4)'; g.fillRect(0, y + 14.5, w, 1.5);
    }
    for (var i = 0; i < 1400; i++) { g.fillStyle = 'rgba(255,255,255,' + isle2Hash(i * 1.9) * 0.08 + ')'; g.fillRect(isle2Hash(i * 2.7) * w, isle2Hash(i * 3.9) * h, 3 + isle2Hash(i) * 8, 1); }   // brush strokes in the paint
  });
  var clTileTex = paintTexture(256, 256, function (g, w, h) {         // coral clay roof tiles, each row overlapping the one below
    g.fillStyle = '#6a3226'; g.fillRect(0, 0, w, h);
    for (var r = 0; r < 8; r++) for (var c = -1; c < 9; c++) {
      var x = c * 32 + (r % 2) * 16, y = r * 32, l = 50 + isle2Hash(r * 13 + c * 7 + 950) * 12;
      var tg = g.createLinearGradient(x, 0, x + 30, 0);
      tg.addColorStop(0, 'hsl(12,50%,' + (l - 11) + '%)'); tg.addColorStop(0.5, 'hsl(14,56%,' + l + '%)'); tg.addColorStop(1, 'hsl(12,50%,' + (l - 13) + '%)');
      g.fillStyle = tg; g.beginPath(); g.moveTo(x + 1, y); g.lineTo(x + 31, y); g.lineTo(x + 31, y + 25); g.quadraticCurveTo(x + 16, y + 33, x + 1, y + 25); g.closePath(); g.fill();
      g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(x + 2, y + 27, 28, 4);
    }
    for (var i = 0; i < 500; i++) { g.fillStyle = 'rgba(' + (isle2Hash(i) > 0.5 ? '255,230,200' : '60,30,20') + ',0.12)'; g.fillRect(isle2Hash(i * 2.1) * w, isle2Hash(i * 3.3) * h, 2, 2); }   // weathering
    for (var st = 0; st < 40; st++) {                                   // faint rain streaks running down the tiles
      var sx = isle2Hash(st * 4.3 + 7) * w, sy = isle2Hash(st * 2.9) * h, sl = 20 + isle2Hash(st) * 50;
      var sg = g.createLinearGradient(0, sy, 0, sy + sl); sg.addColorStop(0, 'rgba(40,25,20,0.16)'); sg.addColorStop(1, 'rgba(40,25,20,0)');
      g.fillStyle = sg; g.fillRect(sx, sy, 2 + isle2Hash(st * 9) * 3, sl);
    }
    for (var lc = 0; lc < 70; lc++) {                                   // little spots of pale lichen
      g.fillStyle = 'rgba(' + (isle2Hash(lc) > 0.5 ? '220,214,160' : '170,180,130') + ',' + (0.25 + isle2Hash(lc * 3) * 0.3) + ')';
      g.beginPath(); g.arc(isle2Hash(lc * 5.1) * w, isle2Hash(lc * 6.7) * h, 1 + isle2Hash(lc * 8.3) * 2.5, 0, Math.PI * 2); g.fill();
    }
  });
  var clShutterTex = paintTexture(64, 192, function (g, w, h) {       // a teal louvred shutter
    g.fillStyle = '#2f6f68'; g.fillRect(0, 0, w, h);
    for (var y = 12; y < h - 12; y += 7) {
      var lg = g.createLinearGradient(0, y, 0, y + 7); lg.addColorStop(0, '#4f9a90'); lg.addColorStop(0.7, '#2f6f68'); lg.addColorStop(1, '#1d4a45');
      g.fillStyle = lg; g.fillRect(8, y, w - 16, 7);
    }
    g.fillStyle = '#3b7f77'; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 10, w, 10); g.fillRect(0, h / 2 - 4, w, 8); g.fillRect(0, 0, 7, h); g.fillRect(w - 7, 0, 7, h);
  });
  function clSignPaint(g, w, h, metalOnly) {                          // a hand-painted teal board with raised gilded letters and enamel hearts
    if (metalOnly) { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); }
    else {
      var base = g.createLinearGradient(0, 0, 0, h); base.addColorStop(0, '#2a6a62'); base.addColorStop(0.5, '#1f5850'); base.addColorStop(1, '#174640');
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 320; i++) {                                  // the wood grain showing through the paint
        var gy = isle2Hash(i * 1.7 + 40) * h, lite = isle2Hash(i * 3.1 + 40) > 0.5;
        g.strokeStyle = lite ? 'rgba(140,200,185,' + (0.04 + isle2Hash(i) * 0.06) + ')' : 'rgba(5,25,22,' + (0.08 + isle2Hash(i) * 0.1) + ')';
        g.lineWidth = 0.6 + isle2Hash(i * 5) * 1.6;
        g.beginPath(); var x0 = isle2Hash(i * 2.3 + 40) * w * 0.7; g.moveTo(x0, gy);
        g.bezierCurveTo(x0 + 200, gy + (isle2Hash(i * 7) - 0.5) * 8, x0 + 420, gy - (isle2Hash(i * 9) - 0.5) * 8, x0 + 300 + isle2Hash(i * 11) * 600, gy + (isle2Hash(i * 13) - 0.5) * 5);
        g.stroke();
      }
      g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, h * 0.5 - 1, w, 2);   // the joint between the two boards
      var vig = g.createLinearGradient(0, 0, 0, h); vig.addColorStop(0, 'rgba(0,0,0,0.3)'); vig.addColorStop(0.18, 'rgba(0,0,0,0)'); vig.addColorStop(0.82, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.38)');
      g.fillStyle = vig; g.fillRect(0, 0, w, h);
      for (var sc = 0; sc < 50; sc++) { g.strokeStyle = 'rgba(220,240,230,0.06)'; g.lineWidth = 1; var sx = isle2Hash(sc * 17 + 3) * w, sy = isle2Hash(sc * 19 + 3) * h; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + 8 + isle2Hash(sc) * 24, sy + (isle2Hash(sc * 3) - 0.5) * 4); g.stroke(); }   // little scuffs
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
        if (!metalOnly) {
          g.save(); g.shadowColor = 'rgba(0,0,0,0.65)'; g.shadowOffsetX = size * 0.04; g.shadowOffsetY = size * 0.06; g.shadowBlur = size * 0.08;
          g.fillStyle = '#4a3008'; g.fillText(c, cx + 1.5, y + 2); g.restore();
        }
        g.fillStyle = gold(y - size * 0.5, y + size * 0.5); g.fillText(c, cx, y);
        if (!metalOnly) { g.strokeStyle = 'rgba(255,248,215,0.5)'; g.lineWidth = 1; g.strokeText(c, cx - 0.6, y - 1); }
        cx += widths[k];
      });
    }
    function rrect(m, r) { g.beginPath(); g.moveTo(m + r, m); g.lineTo(w - m - r, m); g.quadraticCurveTo(w - m, m, w - m, m + r); g.lineTo(w - m, h - m - r); g.quadraticCurveTo(w - m, h - m, w - m - r, h - m); g.lineTo(m + r, h - m); g.quadraticCurveTo(m, h - m, m, h - m - r); g.lineTo(m, m + r); g.quadraticCurveTo(m, m, m + r, m); g.stroke(); }
    g.strokeStyle = metalOnly ? '#fff' : gold(0, h); g.lineWidth = 6; rrect(18, 26);   // a gold pinstripe border, doubled
    g.lineWidth = 2; rrect(32, 18);
    function heart(cx, cy, s2) {                                        // a raised enamel heart with a gold rim and a white cross
      g.beginPath(); g.moveTo(cx, cy + s2 * 0.9); g.bezierCurveTo(cx - s2 * 1.3, cy, cx - s2 * 0.8, cy - s2, cx, cy - s2 * 0.35); g.bezierCurveTo(cx + s2 * 0.8, cy - s2, cx + s2 * 1.3, cy, cx, cy + s2 * 0.9); g.closePath();
      if (metalOnly) { g.strokeStyle = '#fff'; g.lineWidth = 9; g.stroke(); return; }
      g.save(); g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowOffsetY = 6; g.shadowBlur = 10; g.fillStyle = '#7a2030'; g.fill(); g.restore();
      var hg = g.createRadialGradient(cx - s2 * 0.35, cy - s2 * 0.45, 4, cx, cy, s2 * 1.3); hg.addColorStop(0, '#ffb4c4'); hg.addColorStop(0.45, '#e8607c'); hg.addColorStop(1, '#9c2a42');
      g.fillStyle = hg; g.fill();
      g.strokeStyle = gold(cy - s2, cy + s2); g.lineWidth = 9; g.stroke();
      g.fillStyle = '#fbf8f0'; g.fillRect(cx - s2 * 0.11, cy - s2 * 0.44, s2 * 0.22, s2 * 0.76); g.fillRect(cx - s2 * 0.36, cy - s2 * 0.17, s2 * 0.72, s2 * 0.22);
      g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(cx - s2 * 0.42, cy - s2 * 0.42, s2 * 0.22, s2 * 0.1, -0.6, 0, Math.PI * 2); g.fill();   // the shine on the enamel
    }
    heart(190, h / 2 + 8, 92); heart(w - 190, h / 2 + 8, 92);
    gild('Everdawn Clinic', w / 2, h / 2 - 34, 168, true, 2);
    gild('DOCTOR\u2019S OFFICE', w / 2, h / 2 + 108, 44, false, 14);
    g.strokeStyle = metalOnly ? '#fff' : '#c99a3a'; g.lineWidth = 3;
    [-1, 1].forEach(function (d) {                                     // little rules and diamonds either side of the small letters
      var ex = w / 2 + d * 300;
      g.beginPath(); g.moveTo(ex, h / 2 + 108); g.lineTo(ex + d * 150, h / 2 + 108); g.stroke();
      g.fillStyle = metalOnly ? '#fff' : '#e3b54c'; g.beginPath(); g.moveTo(ex + d * 166, h / 2 + 98); g.lineTo(ex + d * 176, h / 2 + 108); g.lineTo(ex + d * 166, h / 2 + 118); g.lineTo(ex + d * 156, h / 2 + 108); g.closePath(); g.fill();
    });
  }
  var clSignTex = paintTexture(2048, 360, function (g, w, h) { clSignPaint(g, w, h, false); });
  var clSignMetal = paintTexture(2048, 360, function (g, w, h) { clSignPaint(g, w, h, true); });
  clSignTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  var clScaleTex = paintTexture(256, 256, function (g, w, h) {       // fish-scale shingles for the gables, in soft cream
    g.fillStyle = '#b8b0a0'; g.fillRect(0, 0, w, h);
    for (var r = 9; r >= -1; r--) for (var c = -1; c < 9; c++) {
      var cx = c * 32 + 16 + (r % 2 ? 16 : 0), y0 = r * 28 - 8, l = 86 + isle2Hash(r * 5 + c * 3 + 990) * 6;
      g.fillStyle = 'hsl(40,30%,' + l + '%)';
      g.beginPath(); g.moveTo(cx - 16, y0); g.lineTo(cx - 16, y0 + 18); g.arc(cx, y0 + 18, 16, Math.PI, 0, true); g.lineTo(cx + 16, y0); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(90,80,60,0.45)'; g.lineWidth = 1.5; g.stroke();
    }
  });
  function clBumpy(tex, bump, rough) {                                // the painted texture doubles as a bump map, so board lips and tile edges catch the light
    return new THREE.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: bump, roughness: rough });
  }
  function clRealGlass(cw, ch, curtains) {                            // window glass: the sky and clouds reflected by day, with sheer curtains behind; a warm lit room at night
    function paint(g, w, h, night) {
      if (night) {
        var warm = g.createRadialGradient(w / 2, h * 0.55, 4, w / 2, h * 0.55, Math.max(w, h) * 0.8);
        warm.addColorStop(0, '#ffe9bc'); warm.addColorStop(0.55, '#f2bd78'); warm.addColorStop(1, '#9a6036');
        g.fillStyle = warm; g.fillRect(0, 0, w, h);
      } else {
        var sky = g.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#d4e6f2'); sky.addColorStop(0.42, '#8eaabb'); sky.addColorStop(0.62, '#4c5e66'); sky.addColorStop(1, '#2b3236');
        g.fillStyle = sky; g.fillRect(0, 0, w, h);
        for (var c = 0; c < 6; c++) {                                   // soft clouds caught in the glass
          var cx = isle2Hash(c * 3.1 + cw) * w, cy = h * (0.08 + isle2Hash(c * 5.3 + ch) * 0.25), cr = w * (0.12 + isle2Hash(c) * 0.12);
          var cg = g.createRadialGradient(cx, cy, 1, cx, cy, cr); cg.addColorStop(0, 'rgba(255,255,255,0.55)'); cg.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = cg; g.fillRect(0, 0, w, h);
        }
        g.fillStyle = 'rgba(40,70,40,0.35)';                            // the reflected tops of the grass and trees across the square
        for (var t = 0; t < w; t += 3) { var th = h * (0.5 + Math.sin(t * 0.13) * 0.03 + isle2Hash(t) * 0.04); g.fillRect(t, th, 3, h * 0.12); }
      }
      if (curtains) {                                                   // sheer cream curtains gathered at the sides, and a valance
        [[0, 1], [w, -1]].forEach(function (cc) {
          var cg2 = g.createLinearGradient(cc[0], 0, cc[0] + cc[1] * w * 0.3, 0);
          cg2.addColorStop(0, night ? 'rgba(250,236,210,0.95)' : 'rgba(236,228,214,0.75)'); cg2.addColorStop(1, 'rgba(236,228,214,0)');
          g.fillStyle = cg2; g.fillRect(0, h * 0.06, w, h);
          g.strokeStyle = night ? 'rgba(160,110,70,0.35)' : 'rgba(120,110,100,0.35)'; g.lineWidth = 1.5;
          for (var f = 0; f < 5; f++) { var fx = cc[0] + cc[1] * (4 + f * w * 0.05); g.beginPath(); g.moveTo(fx, h * 0.08); g.quadraticCurveTo(fx + cc[1] * 6, h * 0.5, fx, h); g.stroke(); }
        });
        g.fillStyle = night ? 'rgba(240,220,190,0.95)' : 'rgba(230,222,208,0.8)'; g.fillRect(0, 0, w, h * 0.09);
      }
      var streak = g.createLinearGradient(0, 0, w, h);                  // a bright sheen across the pane
      streak.addColorStop(0.28, 'rgba(255,255,255,0)'); streak.addColorStop(0.36, 'rgba(255,255,255,' + (night ? 0.08 : 0.3) + ')'); streak.addColorStop(0.41, 'rgba(255,255,255,0.04)'); streak.addColorStop(0.47, 'rgba(255,255,255,' + (night ? 0.05 : 0.18) + ')'); streak.addColorStop(0.53, 'rgba(255,255,255,0)');
      g.fillStyle = streak; g.fillRect(0, 0, w, h);
    }
    var day = paintTexture(cw, ch, function (g, w, h) { paint(g, w, h, false); });
    var nite = paintTexture(cw, ch, function (g, w, h) { paint(g, w, h, true); });
    var m = new THREE.MeshStandardMaterial({ map: day, emissive: 0xffffff, emissiveMap: nite, emissiveIntensity: 0.03, roughness: 0.04, metalness: 0.3 });
    shopNightGlass.push(m);
    return m;
  }
  // materials
  var CL = {
    siding: clBumpy(shopTiled(clSidingTex, 3.5, 1.17), 0.025, 0.7),
    sidingSide: clBumpy(shopTiled(clSidingTex, 2.6, 1.17), 0.025, 0.7),
    gable: clBumpy(shopTiled(clScaleTex, 1 / 1.2, 1 / 1.05), 0.03, 0.75),
    tiles: clBumpy(shopTiled(clTileTex, 4.5, 2), 0.05, 0.62),
    trim: new THREE.MeshStandardMaterial({ color: 0xf8f6f0, roughness: 0.55 }),
    teal: new THREE.MeshStandardMaterial({ color: 0x2f6f68, roughness: 0.4 }),
    shutter: new THREE.MeshStandardMaterial({ map: clShutterTex, roughness: 0.6 }),
    brick: new THREE.MeshStandardMaterial({ map: shopTiled(stoneWallTex, 1, 1.5), color: 0xd89a84, roughness: 0.9 }),
    sign: new THREE.MeshStandardMaterial({ map: clSignTex, metalnessMap: clSignMetal, metalness: 0.35, roughness: 0.4, emissive: 0xe8b54a, emissiveMap: clSignMetal, emissiveIntensity: 0.25 }),   // the gilding catches the light
    soil: new THREE.MeshStandardMaterial({ color: 0x4a3222, roughness: 1 }),
    terracotta: new THREE.MeshStandardMaterial({ color: 0xc0704a, roughness: 0.85 }),
    bay: new THREE.MeshStandardMaterial({ color: 0x3f7a3e, roughness: 0.8, flatShading: true }),
    wood: new THREE.MeshStandardMaterial({ color: 0x9a6a42, roughness: 0.7 }),
    lamp: new THREE.MeshStandardMaterial({ color: 0xfff0c8, emissive: 0xffc870, emissiveIntensity: 0.3, roughness: 0.3 })
  };
  var clGlass = clRealGlass(256, 240, true), clDoorGlass = clRealGlass(128, 160, false);
  // leafy foliage: lots of small leaves set over the surface of a shape, around a dark core, so shrubs and trees look
  // full and soft rather than faceted
  var clLeafGeo = new THREE.SphereGeometry(0.05, 6, 4); clLeafGeo.scale(1, 0.25, 0.6);
  var clLeafMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 });
  var clRoseGeo = (function () {                                       // a rose: a cup of overlapping petals round a tight bud
    var pts = [];
    for (var i = 0; i <= 8; i++) { var t = i / 8; pts.push(new THREE.Vector2(0.012 + Math.sin(t * Math.PI * 0.6) * 0.04 + t * 0.006, t * 0.045 - Math.sin(t * Math.PI) * 0.004)); }
    return new THREE.LatheGeometry(pts, 9);
  })();
  var clLeafy = [], clCores = [];
  function clFoliage(cx, cy, cz, rx, ry, rz, n, seed, list) {
    var out = list || clLeafy;
    if (!list) clCores.push([cx, cy, cz, rx * 0.86, ry * 0.86, rz * 0.86]);
    for (var i = 0; i < n; i++) {
      var u = isle2Hash(seed + i * 1.37), v = isle2Hash(seed * 1.3 + i * 2.11), th = u * Math.PI * 2, ph = Math.acos(2 * v - 1), k = 0.92 + isle2Hash(seed + i * 3.7) * 0.12;
      out.push([cx + Math.sin(ph) * Math.cos(th) * rx * k, cy + Math.cos(ph) * ry * k, cz + Math.sin(ph) * Math.sin(th) * rz * k, u * 6, v * 6, isle2Hash(i + seed) * 6, isle2Hash(seed + i * 5.9)]);
    }
  }

  // the brick plinth, the clapboard walls with white corner boards, and the trim along the top and bottom
  clPart(new THREE.BoxGeometry(CW * 2 + 0.3, CL_PLINTH, CD * 2 + 0.3), CL.brick, 0, CL_PLINTH / 2, 0);
  clPart(new THREE.BoxGeometry(CW * 2, CL_WALL_H, 0.2), CL.siding, 0, CL_PLINTH + CL_WALL_H / 2, CD - 0.1);
  clPart(new THREE.BoxGeometry(CW * 2, CL_WALL_H, 0.2), CL.siding, 0, CL_PLINTH + CL_WALL_H / 2, -CD + 0.1);
  [-1, 1].forEach(function (s) { clPart(new THREE.BoxGeometry(0.2, CL_WALL_H, CD * 2 - 0.4), CL.sidingSide, s * (CW - 0.1), CL_PLINTH + CL_WALL_H / 2, 0); });
  clPart(new THREE.BoxGeometry(CW * 2 - 0.4, 0.1, CD * 2 - 0.4), CL.trim, 0, CL_TOP - 0.05, 0);                            // a lid, so nothing shows through under the roof
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { clPart(new THREE.BoxGeometry(0.26, CL_WALL_H, 0.26), CL.trim, c[0] * (CW - 0.1), CL_PLINTH + CL_WALL_H / 2, c[1] * (CD - 0.1)); });
  clPart(new THREE.BoxGeometry(CW * 2 + 0.12, 0.16, CD * 2 + 0.12), CL.trim, 0, CL_PLINTH + 0.08, 0);                       // the water table
  clPart(new THREE.BoxGeometry(CW * 2 + 0.12, 0.34, CD * 2 + 0.12), CL.trim, 0, CL_TOP + 0.08, 0);                           // the frieze board under the eaves

  // the coral tiled gable roof, with clapboard gable ends, white fascia boards, a ridge cap, a chimney and a weathervane
  var clSlope = Math.atan2(CL_RH, CL_RD), clSlopeLen = Math.sqrt(CL_RD * CL_RD + CL_RH * CL_RH);
  [-1, 1].forEach(function (s) {
    clPart(new THREE.BoxGeometry(CW * 2 + 0.7, 0.14, clSlopeLen + 0.1), CL.tiles, 0, CL_TOP + CL_RH / 2 + 0.07, s * CL_RD / 2, s * clSlope, 0, 0);
    clPart(new THREE.BoxGeometry(CW * 2 + 0.74, 0.2, 0.06), CL.trim, 0, CL_TOP - 0.02, s * (CL_RD + 0.02));                  // fascia along the eaves
    var gh0 = CL_RH * (1 - CD / CL_RD), gs = new THREE.Shape();      // the gable end: a pentagon of clapboard up under the roof
    gs.moveTo(-CD, 0); gs.lineTo(CD, 0); gs.lineTo(CD, gh0); gs.lineTo(0, CL_RH); gs.lineTo(-CD, gh0); gs.lineTo(-CD, 0);
    clPart(new THREE.ShapeGeometry(gs), CL.gable, s * (CW - 0.02), CL_TOP, 0, 0, s * Math.PI / 2, 0);
    [-1, 1].forEach(function (e) {                                      // white barge boards up the roof's edges
      clPart(new THREE.BoxGeometry(0.1, 0.26, clSlopeLen + 0.1), CL.trim, s * (CW + 0.36), CL_TOP + CL_RH / 2 + 0.02, e * CL_RD / 2, e * clSlope, 0, 0);
    });
    clPart(new THREE.CircleGeometry(0.42, 28), clGlass, s * (CW + 0.0), CL_TOP + 0.85, 0, 0, s * Math.PI / 2, 0);            // a round window up in each gable
    clPart(new THREE.TorusGeometry(0.44, 0.06, 8, 28), CL.trim, s * (CW + 0.02), CL_TOP + 0.85, 0, 0, s * Math.PI / 2, 0);
    clPart(new THREE.BoxGeometry(0.04, 0.84, 0.04), CL.trim, s * (CW + 0.03), CL_TOP + 0.85, 0);
    clPart(new THREE.BoxGeometry(0.04, 0.04, 0.84), CL.trim, s * (CW + 0.03), CL_TOP + 0.85, 0);
  });
  clPart(new THREE.CylinderGeometry(0.12, 0.12, CW * 2 + 0.7, 10), CL.terracotta, 0, CL_TOP + CL_RH + 0.12, 0, 0, 0, Math.PI / 2);   // ridge tiles
  clPart(new THREE.BoxGeometry(0.75, 2.4, 0.75), CL.brick, 3.0, CL_TOP + 1.9, -1.6);                                        // the chimney
  clPart(new THREE.BoxGeometry(0.9, 0.14, 0.9), CL.trim, 3.0, CL_TOP + 3.12, -1.6);
  [-0.16, 0.16].forEach(function (o) { clPart(new THREE.CylinderGeometry(0.09, 0.11, 0.3, 10), CL.terracotta, 3.0 + o, CL_TOP + 3.33, -1.6); });
  var CL_VANE_Y = CL_TOP + CL_RH + 1.35;                               // a heart-shaped weathervane, on top of the cupola
  clPart(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 6), houseMats.gold, -1.6, CL_VANE_Y + 0.55, 0);
  clPart(new THREE.SphereGeometry(0.07, 10, 8), houseMats.gold, -1.6, CL_VANE_Y + 0.5, 0);
  clPart(new THREE.BoxGeometry(0.7, 0.02, 0.02), houseMats.gold, -1.6, CL_VANE_Y + 0.75, 0);
  clPart(new THREE.BoxGeometry(0.02, 0.02, 0.7), houseMats.gold, -1.6, CL_VANE_Y + 0.75, 0);
  var clHeartShape = new THREE.Shape();
  clHeartShape.moveTo(0, -0.16); clHeartShape.bezierCurveTo(-0.24, 0, -0.15, 0.18, 0, 0.07); clHeartShape.bezierCurveTo(0.15, 0.18, 0.24, 0, 0, -0.16);
  var clVane = clPart(new THREE.ExtrudeGeometry(clHeartShape, { depth: 0.02, bevelEnabled: false }), houseMats.gold, -1.6, CL_VANE_Y + 1.12, 0);

  // windows: six-over-six sashes with white casings, teal louvred shutters and a flower box below each one
  var clBlooms = [], clLeaves = [];
  function clWindow(x, z, ry) {
    var wg = new THREE.Group(); wg.position.set(x, CL_WIN_Y, z); wg.rotation.y = ry; clinicGroup.add(wg);
    var W = CL_WIN_W, H = CL_WIN_H;
    clPart(new THREE.PlaneGeometry(W, H), clGlass, 0, 0, 0.02, 0, 0, 0, wg);
    [1 / 3, 2 / 3].forEach(function (f) { clPart(new THREE.BoxGeometry(0.035, H, 0.04), CL.trim, -W / 2 + f * W, 0, 0.04, 0, 0, 0, wg); });
    [0.25, 0.75].forEach(function (f) { clPart(new THREE.BoxGeometry(W, 0.035, 0.04), CL.trim, 0, -H / 2 + f * H, 0.04, 0, 0, 0, wg); });
    clPart(new THREE.BoxGeometry(W, 0.07, 0.07), CL.trim, 0, 0, 0.05, 0, 0, 0, wg);                                         // the meeting rail between the sashes
    [[0, H / 2 + 0.07, W + 0.28, 0.14], [0, -H / 2 - 0.05, W + 0.28, 0.1], [-W / 2 - 0.07, 0, 0.14, H], [W / 2 + 0.07, 0, 0.14, H]].forEach(function (f) {
      clPart(new THREE.BoxGeometry(f[2], f[3], 0.1), CL.trim, f[0], f[1], 0.05, 0, 0, 0, wg);
    });
    clPart(new THREE.BoxGeometry(W + 0.5, 0.08, 0.16), CL.trim, 0, H / 2 + 0.18, 0.08, 0, 0, 0, wg);                       // a little crown over the top
    clPart(new THREE.BoxGeometry(W + 0.4, 0.06, 0.22), CL.trim, 0, -H / 2 - 0.12, 0.11, 0, 0, 0, wg);                      // the sill
    [-1, 1].forEach(function (s) {                                      // shutters, folded back against the wall
      clPart(new THREE.BoxGeometry(0.56, H + 0.08, 0.05), CL.shutter, s * (W / 2 + 0.44), 0, 0.03, 0, 0, 0, wg);
      [-0.4, 0.4].forEach(function (hy) { clPart(new THREE.BoxGeometry(0.1, 0.03, 0.02), houseMats.iron, s * (W / 2 + 0.2), hy * H, 0.07, 0, 0, 0, wg); });
    });
    var bx = W + 0.2, by = -H / 2 - 0.36;                               // the flower box
    clPart(new THREE.BoxGeometry(bx, 0.3, 0.3), CL.trim, 0, by, 0.2, 0, 0, 0, wg);
    clPart(new THREE.BoxGeometry(bx - 0.08, 0.02, 0.24), CL.soil, 0, by + 0.15, 0.2, 0, 0, 0, wg);
    clPart(new THREE.BoxGeometry(bx + 0.04, 0.04, 0.33), CL.teal, 0, by + 0.15, 0.2, 0, 0, 0, wg);
    var c = Math.cos(ry), si = Math.sin(ry), n0 = x * 7 + z * 3;
    function put(list, a, b, cc, extra) { list.push([x + a * c + cc * si, CL_WIN_Y + b, z - a * si + cc * c, extra]); }
    for (var k = 0; k < 26; k++) {
      var fa = (isle2Hash(n0 + k * 1.7) - 0.5) * (bx - 0.15), fz = 0.12 + isle2Hash(n0 + k * 2.3) * 0.18;
      put(clLeaves, fa, by + 0.2 + isle2Hash(n0 + k) * 0.08, fz, isle2Hash(n0 + k * 4.1));
      if (k % 2) put(clBlooms, fa, by + 0.27 + isle2Hash(n0 + k * 5.3) * 0.08, fz + 0.04, k % 6 === 1 ? 0 : k % 6 === 3 ? 1 : 2);
    }
    for (var iv = 0; iv < 5; iv++) {                                    // a little ivy tumbling over the front
      for (var t = 0; t < 4; t++) put(clLeaves, -bx / 2 + 0.2 + iv * (bx - 0.4) / 4, by + 0.1 - t * 0.09, 0.37 + t * 0.01, isle2Hash(iv * 3 + t));
    }
  }
  [-2.9, 2.9].forEach(function (wx) { clWindow(wx, CD, 0); });
  clWindow(-CW, 0, -Math.PI / 2); clWindow(CW, 0, Math.PI / 2);
  clWindow(-2.6, -CD, Math.PI); clWindow(2.6, -CD, Math.PI);
  var clDummy = new THREE.Object3D(), clCol = new THREE.Color();
  var clLeafIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.06, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, flatShading: true }), clLeaves.length);
  clLeaves.forEach(function (q, i) {
    clDummy.position.set(q[0], q[1], q[2]); clDummy.rotation.set(q[3] * 4, q[3] * 7, 0); clDummy.scale.set(1, 0.7, 1); clDummy.updateMatrix();
    clLeafIM.setMatrixAt(i, clDummy.matrix); clLeafIM.setColorAt(i, clCol.setHSL(0.27 + q[3] * 0.06, 0.45, 0.26 + q[3] * 0.12));
  });
  clLeafIM.castShadow = true; clinicGroup.add(clLeafIM);
  var CL_BLOOM_COLS = [0xf6a6c8, 0xfaf6ee, 0xc8b4ec];
  var clBloomIM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 8, 5), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }), clBlooms.length);
  clBlooms.forEach(function (q, i) {
    clDummy.position.set(q[0], q[1], q[2]); clDummy.rotation.set(0, 0, 0); clDummy.scale.set(1, 0.6, 1); clDummy.updateMatrix();
    clBloomIM.setMatrixAt(i, clDummy.matrix); clBloomIM.setColorAt(i, clCol.set(CL_BLOOM_COLS[q[3]]));
  });
  clinicGroup.add(clBloomIM);

  // the front door: teal, with a glass panel, raised panels below, a brass knob and kick plate, and a transom light above
  clPart(new THREE.BoxGeometry(1.5, 2.75, 0.12), CL.trim, 0, CL_PLINTH + 1.375, CD + 0.02);                                // the door casing
  clPart(new THREE.BoxGeometry(1.2, 2.3, 0.08), CL.teal, 0, CL_PLINTH + 1.15, CD + 0.07);
  clPart(new THREE.PlaneGeometry(0.76, 0.9), clDoorGlass, 0, CL_PLINTH + 1.6, CD + 0.115);
  [[0, 1.15, 0.84, 0.05], [0, 2.07, 0.84, 0.05], [-0.4, 1.6, 0.05, 0.96], [0.4, 1.6, 0.05, 0.96], [0, 1.6, 0.03, 0.9], [0, 1.6, 0.8, 0.03]].forEach(function (b) {
    clPart(new THREE.BoxGeometry(b[2], b[3], 0.03), CL.trim, b[0], CL_PLINTH + b[1], CD + 0.125);
  });
  [-0.27, 0.27].forEach(function (px) { clPart(new THREE.BoxGeometry(0.42, 0.6, 0.03), new THREE.MeshStandardMaterial({ color: 0x3b7f77, roughness: 0.45 }), px, CL_PLINTH + 0.6, CD + 0.12); });
  clPart(new THREE.BoxGeometry(1.0, 0.16, 0.02), houseMats.gold, 0, CL_PLINTH + 0.12, CD + 0.12);
  clPart(new THREE.SphereGeometry(0.055, 10, 8), houseMats.gold, 0.45, CL_PLINTH + 1.1, CD + 0.16);
  clPart(new THREE.PlaneGeometry(1.2, 0.3), clGlass, 0, CL_PLINTH + 2.48, CD + 0.09);
  [-0.3, 0, 0.3].forEach(function (tx) { clPart(new THREE.BoxGeometry(0.03, 0.3, 0.03), CL.trim, tx, CL_PLINTH + 2.48, CD + 0.1); });
  clPart(new THREE.BoxGeometry(0.34, 0.1, 0.02), houseMats.gold, 0, CL_PLINTH + 1.02, CD + 0.14);                          // a little brass name plate on the door

  // the porch: a stone floor and step, two white columns, a beam with the sign on it, and a pediment roof
  var PORCH_D = 1.45, PORCH_W = 1.7, CL_COL_X = 1.4, CL_BEAM_Y = 2.95;
  clPart(new THREE.BoxGeometry(PORCH_W * 2, CL_PLINTH, PORCH_D), houseMats.stone, 0, CL_PLINTH / 2, CD + PORCH_D / 2);
  clPart(new THREE.BoxGeometry(PORCH_W * 2 + 0.06, 0.04, PORCH_D + 0.03), CL.trim, 0, CL_PLINTH, CD + PORCH_D / 2);
  clPart(new THREE.BoxGeometry(PORCH_W * 2 - 0.4, CL_PLINTH / 2, 0.32), houseMats.stone, 0, CL_PLINTH / 4, CD + PORCH_D + 0.16);   // the step down
  clPart(new THREE.BoxGeometry(1.1, 0.02, 0.6), new THREE.MeshStandardMaterial({ color: 0x8a5a5a, roughness: 1 }), 0, CL_PLINTH + 0.03, CD + 0.5);   // a doormat
  [-1, 1].forEach(function (s) {
    var cx = s * CL_COL_X, cz = CD + PORCH_D - 0.25;
    clPart(new THREE.BoxGeometry(0.36, 0.14, 0.36), CL.trim, cx, CL_PLINTH + 0.07, cz);
    clPart(new THREE.CylinderGeometry(0.15, 0.13, 0.08, 16), CL.trim, cx, CL_PLINTH + 0.18, cz);
    clPart(new THREE.CylinderGeometry(0.11, 0.135, CL_BEAM_Y - CL_PLINTH - 0.4, 16), CL.trim, cx, (CL_BEAM_Y + CL_PLINTH) / 2, cz);
    clPart(new THREE.CylinderGeometry(0.16, 0.12, 0.12, 16), CL.trim, cx, CL_BEAM_Y - 0.14, cz);
    clPart(new THREE.BoxGeometry(0.34, 0.06, 0.34), CL.trim, cx, CL_BEAM_Y - 0.05, cz);
  });
  clPart(new THREE.BoxGeometry(PORCH_W * 2 + 0.2, 0.62, PORCH_D + 0.1), CL.trim, 0, CL_BEAM_Y + 0.31, CD + PORCH_D / 2);   // the beam
  // the potted bay trees either side of the porch: rolled-rim terracotta pots with a moulded garland band, weathered
  // with a white mineral bloom and a little moss, on feet in matching saucers; mossy soil with bark chips; three stems
  // braided together into a trunk; and a clipped ball of real bay leaves, glossy and pointed, darker inside
  var clPotTex = paintTexture(512, 128, function (g, w, h) {           // the pot's surface, from its foot (bottom) up to its rim (top)
    var bg = g.createLinearGradient(0, h, 0, 0); bg.addColorStop(0, '#a85a38'); bg.addColorStop(0.5, '#c4704a'); bg.addColorStop(1, '#b8603e');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 1500; i++) { g.fillStyle = 'rgba(' + (isle2Hash(i) > 0.5 ? '255,210,170' : '90,40,20') + ',' + isle2Hash(i * 1.7) * 0.12 + ')'; g.fillRect(isle2Hash(i * 2.3) * w, isle2Hash(i * 3.1) * h, 2, 2); }
    var bloom = g.createLinearGradient(0, h, 0, h * 0.55); bloom.addColorStop(0, 'rgba(240,235,220,0.55)'); bloom.addColorStop(1, 'rgba(240,235,220,0)');   // white mineral bloom near the foot
    g.fillStyle = bloom; g.fillRect(0, h * 0.55, w, h * 0.45);
    for (var m = 0; m < 30; m++) { g.fillStyle = 'rgba(90,120,50,' + (0.2 + isle2Hash(m * 3) * 0.3) + ')'; g.beginPath(); g.arc(isle2Hash(m * 5.3) * w, h * (0.85 + isle2Hash(m * 7.1) * 0.15), 2 + isle2Hash(m) * 5, 0, Math.PI * 2); g.fill(); }   // moss at the base
    g.strokeStyle = 'rgba(80,35,20,0.5)'; g.lineWidth = 2; var by = h * 0.2;   // the garland band under the rim: swags with little rosettes
    for (var sw = 0; sw < 8; sw++) {
      var x0 = sw * w / 8;
      g.beginPath(); g.moveTo(x0, by); g.quadraticCurveTo(x0 + w / 16, by + 18, x0 + w / 8, by); g.stroke();
      g.fillStyle = 'rgba(230,150,110,0.9)'; g.beginPath(); g.arc(x0, by, 5, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.fillStyle = 'rgba(80,35,20,0.35)'; g.fillRect(0, h * 0.08, w, 2); g.fillRect(0, h * 0.34, w, 2);
  });
  clPotTex.wrapS = THREE.RepeatWrapping;
  var clPotMat = new THREE.MeshStandardMaterial({ map: clPotTex, bumpMap: clPotTex, bumpScale: 0.01, roughness: 0.85 });
  var clBarkTex = paintTexture(64, 128, function (g, w, h) {
    g.fillStyle = '#6a5040'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 40; i++) { g.strokeStyle = 'rgba(' + (isle2Hash(i) > 0.5 ? '40,28,20' : '150,125,100') + ',0.5)'; g.lineWidth = 1 + isle2Hash(i * 2) * 2; var x = isle2Hash(i * 3.3) * w; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (isle2Hash(i * 5) - 0.5) * 8, h); g.stroke(); }
  });
  clBarkTex.wrapS = clBarkTex.wrapT = THREE.RepeatWrapping;
  var clBarkMat = new THREE.MeshStandardMaterial({ map: clBarkTex, roughness: 0.9 });
  var clBayLeafGeo = (function () {                                    // a bay leaf: long and pointed, folded a little along its midrib
    var sh = new THREE.Shape(); sh.moveTo(0, -0.045);
    sh.bezierCurveTo(0.022, -0.03, 0.02, 0.02, 0, 0.05); sh.bezierCurveTo(-0.02, 0.02, -0.022, -0.03, 0, -0.045);
    var g = new THREE.ShapeGeometry(sh, 6), p = g.attributes.position;
    for (var v = 0; v < p.count; v++) p.setZ(v, Math.abs(p.getX(v)) * 0.5 - Math.pow(p.getY(v) / 0.05, 2) * 0.006);
    g.computeVertexNormals();
    return g;
  })();
  var clBayLeaves = [], clBayQ = new THREE.Quaternion(), clBayM = new THREE.Matrix4(), clBayN = new THREE.Vector3(), clBayT = new THREE.Vector3(), clBayB = new THREE.Vector3();
  function clBayTree(tx, tz, seed) {
    var potPts = [[0.001, 0.04], [0.16, 0.04], [0.19, 0.08], [0.25, 0.4], [0.262, 0.41], [0.262, 0.44], [0.29, 0.45], [0.305, 0.48], [0.295, 0.51], [0.26, 0.515], [0.245, 0.5]].map(function (q) { return new THREE.Vector2(q[0], q[1]); });
    clPart(new THREE.LatheGeometry(potPts, 36), clPotMat, tx, 0, tz);
    clPart(new THREE.LatheGeometry([[0.001, 0.0], [0.24, 0.0], [0.25, 0.035], [0.235, 0.04], [0.22, 0.012], [0.001, 0.012]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 28), clPotMat, tx, 0, tz);   // the saucer
    for (var f = 0; f < 3; f++) { var fa = f / 3 * Math.PI * 2 + seed; clPart(new THREE.BoxGeometry(0.05, 0.03, 0.05), clPotMat, tx + Math.cos(fa) * 0.14, 0.027, tz + Math.sin(fa) * 0.14, 0, -fa, 0); }   // pot feet
    clPart(new THREE.CylinderGeometry(0.245, 0.245, 0.01, 28), CL.soil, tx, 0.49, tz);
    for (var mo = 0; mo < 7; mo++) {                                   // cushions of moss and a few bark chips on the soil
      var ma = mo * 0.9 + seed, mr = 0.08 + isle2Hash(seed + mo) * 0.12;
      clPart(new THREE.SphereGeometry(0.05 + isle2Hash(mo * 3 + seed) * 0.03, 10, 6), new THREE.MeshStandardMaterial({ color: 0x6a8a3a, roughness: 1 }), tx + Math.cos(ma) * mr, 0.49, tz + Math.sin(ma) * mr).scale.set(1, 0.35, 1);
      clPart(new THREE.BoxGeometry(0.04, 0.008, 0.025), new THREE.MeshStandardMaterial({ color: 0x8a5a3a, roughness: 0.9 }), tx + Math.cos(ma + 0.45) * (mr + 0.03), 0.497, tz + Math.sin(ma + 0.45) * (mr + 0.03), 0, ma * 2, 0.1);
    }
    for (var st = 0; st < 3; st++) {                                   // three stems braided into a trunk
      var helix = [];
      for (var hp = 0; hp <= 16; hp++) { var t = hp / 16, ha = st * Math.PI * 2 / 3 + t * Math.PI * 3; helix.push(new THREE.Vector3(tx + Math.cos(ha) * 0.018 * (1 - t * 0.4), 0.47 + t * 0.78, tz + Math.sin(ha) * 0.018 * (1 - t * 0.4))); }
      clPart(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helix), 40, 0.013 - st * 0.001, 6), clBarkMat, 0, 0, 0);
    }
    clPart(new THREE.CylinderGeometry(0.014, 0.022, 0.3, 8), clBarkMat, tx, 1.33, tz);
    clPart(new THREE.SphereGeometry(0.38, 18, 14), new THREE.MeshStandardMaterial({ color: 0x1f3a1c, roughness: 0.9 }), tx, 1.52, tz);   // the dark heart of the ball
    for (var l = 0; l < 760; l++) {                                    // and the leaves over it, each facing outward at its own angle
      var u = isle2Hash(seed * 13 + l * 1.37), v = isle2Hash(seed * 7 + l * 2.11), th = u * Math.PI * 2, ph = Math.acos(2 * v - 1), rr = 0.39 + isle2Hash(seed + l * 3.3) * 0.06;
      clBayN.set(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th));
      clBayT.set(isle2Hash(l * 5.1 + seed) - 0.5, isle2Hash(l * 6.3 + seed) - 0.5, isle2Hash(l * 7.7 + seed) - 0.5).cross(clBayN).normalize();
      clBayB.crossVectors(clBayN, clBayT);
      clBayM.makeBasis(clBayT, clBayB, clBayN); clBayQ.setFromRotationMatrix(clBayM);
      var tilt = new THREE.Quaternion().setFromAxisAngle(clBayT, (isle2Hash(l * 9.9 + seed) - 0.3) * 0.9);   // tipped up or down a little, so they overlap like real leaves
      clBayQ.premultiply(tilt);
      clBayLeaves.push({ p: new THREE.Vector3(tx + clBayN.x * rr, 1.52 + clBayN.y * rr * 0.97, tz + clBayN.z * rr), q: clBayQ.clone(), s: 0.85 + isle2Hash(l * 4.4 + seed) * 0.5, c: isle2Hash(l * 8.8 + seed), top: clBayN.y });
    }
  }
  var clLampGlows = [];
  var CSZ = CD + PORCH_D + 0.05, CSY = CL_BEAM_Y + 0.31;               // the sign: a board on the front of the beam, in a white moulded frame with a gold bead
  clPart(new THREE.BoxGeometry(3.3, 0.58, 0.05), CL.teal, 0, CSY, CSZ + 0.025);
  clPart(new THREE.PlaneGeometry(3.2, 0.56), CL.sign, 0, CSY, CSZ + 0.052);
  [[0, 0.3, 3.42, 0.06], [0, -0.3, 3.42, 0.06], [-1.68, 0, 0.06, 0.66], [1.68, 0, 0.06, 0.66]].forEach(function (f) {
    clPart(new THREE.BoxGeometry(f[2], f[3], 0.07), CL.trim, f[0], CSY + f[1], CSZ + 0.06);
    clPart(new THREE.BoxGeometry(f[2] > 1 ? 3.3 : 0.018, f[3] > 0.1 ? 0.56 : 0.018, 0.02), houseMats.gold, f[0] * 0.985, CSY + f[1] * 0.9, CSZ + 0.09);
  });
  [-1, 1].forEach(function (s2) { clPart(new THREE.SphereGeometry(0.05, 12, 8), houseMats.gold, s2 * 1.68, CSY, CSZ + 0.1); });   // brass rosettes on the frame's ends
  var clSignLampInner = new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: 0xffd9a0, emissiveIntensity: 0.2, side: THREE.BackSide });
  [-0.9, 0.9].forEach(function (lx) {                                  // two little brass gooseneck lamps lighting the sign
    var y0 = CSY + 0.33, z0 = CSZ + 0.08;
    clPart(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12), houseMats.gold, lx, y0 + 0.01, z0);
    var neck = new THREE.CatmullRomCurve3([new THREE.Vector3(lx, y0, z0), new THREE.Vector3(lx, y0 + 0.16, z0 + 0.04), new THREE.Vector3(lx, y0 + 0.22, z0 + 0.2), new THREE.Vector3(lx, y0 + 0.15, z0 + 0.36)]);
    clPart(new THREE.TubeGeometry(neck, 14, 0.012, 6), houseMats.gold, 0, 0, 0);
    clPart(new THREE.SphereGeometry(0.08, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), houseMats.gold, lx, y0 + 0.13, z0 + 0.38, 0.75, 0, 0).scale.set(1.3, 0.8, 1);
    var inner = clPart(new THREE.SphereGeometry(0.076, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), clSignLampInner, lx, y0 + 0.13, z0 + 0.38, 0.75, 0, 0);
    inner.scale.set(1.3, 0.8, 1); inner.castShadow = false;
    var lg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffd9a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    lg.position.set(lx, y0 + 0.06, z0 + 0.34); lg.scale.set(0.6, 0.6, 1); clinicGroup.add(lg); clLampGlows.push(lg);
  });
  var clPedShape = new THREE.Shape();                                  // the pediment: a little triangular gable over the porch
  clPedShape.moveTo(-PORCH_W - 0.2, 0); clPedShape.lineTo(PORCH_W + 0.2, 0); clPedShape.lineTo(0, 0.8); clPedShape.lineTo(-PORCH_W - 0.2, 0);
  clPart(new THREE.ExtrudeGeometry(clPedShape, { depth: PORCH_D + 0.2, bevelEnabled: false }), CL.trim, 0, CL_BEAM_Y + 0.62, CD - 0.1);
  var clPedAng = Math.atan2(0.8, PORCH_W + 0.2), clPedLen = Math.sqrt(0.64 + Math.pow(PORCH_W + 0.2, 2));
  [-1, 1].forEach(function (s) {
    clPart(new THREE.BoxGeometry(clPedLen + 0.12, 0.08, PORCH_D + 0.35), CL.tiles, s * (PORCH_W + 0.2) / 2, CL_BEAM_Y + 0.62 + 0.42, CD + PORCH_D / 2 + 0.05, 0, 0, -s * clPedAng);
  });
  clPart(new THREE.CircleGeometry(0.22, 24), CL.teal, 0, CL_BEAM_Y + 0.93, CD + PORCH_D + 0.12);                         // a round teal plaque with a gold heart
  clPart(new THREE.ExtrudeGeometry(clHeartShape, { depth: 0.015, bevelEnabled: false }), houseMats.gold, 0, CL_BEAM_Y + 0.93, CD + PORCH_D + 0.125).scale.set(0.8, 0.8, 1);

  // brass lanterns either side of the door, bay trees in terracotta pots, and a bench under the left window
  [-1, 1].forEach(function (s) {
    var lx = s * 0.98, ly = CL_PLINTH + 1.95;
    clPart(new THREE.BoxGeometry(0.12, 0.2, 0.04), houseMats.gold, lx, ly, CD + 0.12);
    clPart(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 6), houseMats.gold, lx, ly, CD + 0.22, Math.PI / 2, 0, 0);
    clPart(new THREE.CylinderGeometry(0.09, 0.07, 0.24, 6), CL.lamp, lx, ly - 0.02, CD + 0.34);
    clPart(new THREE.ConeGeometry(0.12, 0.12, 6), houseMats.gold, lx, ly + 0.16, CD + 0.34);
    clPart(new THREE.CylinderGeometry(0.06, 0.08, 0.04, 6), houseMats.gold, lx, ly - 0.15, CD + 0.34);
    var lg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffc870, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    lg.position.set(lx, ly, CD + 0.36); lg.scale.set(1.2, 1.2, 1); clinicGroup.add(lg); clLampGlows.push(lg);
    clBayTree(s * (PORCH_W + 0.55), CD + 0.75, s * 31 + 40);           // a potted bay tree on each side of the steps
  });
  (function () {                                                       // every bay leaf, in one batch
    var im = new THREE.InstancedMesh(clBayLeafGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.32, side: THREE.DoubleSide }), clBayLeaves.length), m = new THREE.Matrix4(), sc = new THREE.Vector3(), col = new THREE.Color();
    clBayLeaves.forEach(function (lf, i) {
      sc.set(lf.s, lf.s, lf.s); m.compose(lf.p, lf.q, sc); im.setMatrixAt(i, m);
      im.setColorAt(i, col.setHSL(0.27 + lf.c * 0.05, 0.45 + lf.c * 0.1, 0.2 + lf.c * 0.1 + Math.max(0, lf.top) * 0.08));   // fresher, paler growth on top
    });
    im.castShadow = true; im.receiveShadow = true; clinicGroup.add(im);
  })();
  var clBench = new THREE.Group(); clBench.position.set(-3.5, 0, CD + 1.35); clinicGroup.add(clBench);
  for (var cbs = 0; cbs < 4; cbs++) clPart(new THREE.BoxGeometry(1.5, 0.04, 0.09), CL.wood, 0, 0.45, -0.15 + cbs * 0.1, 0, 0, 0, clBench);
  for (var cbb = 0; cbb < 3; cbb++) clPart(new THREE.BoxGeometry(1.5, 0.08, 0.035), CL.wood, 0, 0.62 + cbb * 0.12, -0.24, -0.15, 0, 0, clBench);
  [-0.68, 0.68].forEach(function (bx) {
    clPart(new THREE.BoxGeometry(0.04, 0.45, 0.04), houseMats.iron, bx, 0.225, 0.17, 0, 0, 0, clBench);
    clPart(new THREE.BoxGeometry(0.04, 0.88, 0.04), houseMats.iron, bx, 0.44, -0.24, -0.15, 0, 0, clBench);
    clPart(new THREE.BoxGeometry(0.04, 0.04, 0.46), houseMats.iron, bx, 0.62, -0.02, 0, 0, 0, clBench);
  });

  // ----- the finer details -----
  var clCopper = new THREE.MeshStandardMaterial({ color: 0xb87a4a, roughness: 0.35, metalness: 0.7 });
  var clMulch = new THREE.MeshStandardMaterial({ color: 0x5a3a26, roughness: 1 });
  var clDummy2 = new THREE.Object3D(), clCol2 = new THREE.Color();
  function clInstanced(geo, mat, list, place) {                       // one batch for many little pieces (each q: x, y, z, then extras)
    var im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach(function (q, i) {
      clDummy2.position.set(q[0], q[1], q[2]); clDummy2.rotation.set(0, 0, 0); clDummy2.scale.set(1, 1, 1);
      var c = place ? place(q) : undefined;
      clDummy2.updateMatrix(); im.setMatrixAt(i, clDummy2.matrix);
      if (c !== undefined) im.setColorAt(i, clCol2.set(c));
    });
    im.castShadow = true; im.receiveShadow = true;
    clinicGroup.add(im);
    return im;
  }

  // rounded tile ends along the front and back eaves, and the ridge
  var clTileEnds = [];
  for (var tex2 = -CW - 0.3; tex2 <= CW + 0.31; tex2 += 0.22) { clTileEnds.push([tex2, CL_TOP + 0.14, CL_RD - 0.08, 1], [tex2, CL_TOP + 0.14, -CL_RD + 0.08, -1]); }
  clInstanced(new THREE.CylinderGeometry(0.075, 0.075, 0.3, 10), CL.terracotta, clTileEnds, function (q) { clDummy2.rotation.x = q[3] * (clSlope - Math.PI / 2); });
  // dentils: a row of little white blocks under the eaves, front and back
  var clDentils = [];
  for (var cdx = -CW + 0.1; cdx <= CW - 0.09; cdx += 0.2) { clDentils.push([cdx, CL_TOP - 0.15, CD + 0.1], [cdx, CL_TOP - 0.15, -CD - 0.1]); }
  clInstanced(new THREE.BoxGeometry(0.09, 0.1, 0.09), CL.trim, clDentils);
  clPart(new THREE.BoxGeometry(CW * 2 + 0.16, 0.04, 0.05), CL.trim, 0, CL_TOP - 0.2, CD + 0.1);
  clPart(new THREE.BoxGeometry(CW * 2 + 0.16, 0.04, 0.05), CL.trim, 0, CL_TOP - 0.2, -CD - 0.1);
  // carved brackets under the eaves at each corner of the gable ends
  [-1, 1].forEach(function (s) {
    [-1, 1].forEach(function (e) {
      var bx = s * (CW + 0.06), bz = e * (CD + 0.05);
      clPart(new THREE.BoxGeometry(0.1, 0.42, 0.1), CL.trim, bx, CL_TOP - 0.1, bz);
      clPart(new THREE.BoxGeometry(0.1, 0.1, 0.36), CL.trim, bx, CL_TOP + 0.06, bz + e * 0.17);
      clPart(new THREE.BoxGeometry(0.08, 0.06, 0.36), CL.trim, bx, CL_TOP - 0.06, bz + e * 0.14, e * 0.7, 0, 0);
    });
  });

  // copper gutters along the front and back eaves, with downpipes at the corners and stone splash blocks
  [-1, 1].forEach(function (e) {
    var gz = e * (CL_RD + 0.08);
    clPart(new THREE.CylinderGeometry(0.07, 0.07, CW * 2 + 0.7, 10), clCopper, 0, CL_TOP - 0.06, gz, 0, 0, Math.PI / 2);
    [-1, 1].forEach(function (s) {
      var px = s * (CW + 0.2);
      clPart(new THREE.CylinderGeometry(0.04, 0.04, 0.62, 8), clCopper, px, CL_TOP - 0.3, e * (CD + 0.32), e * 0.9, 0, 0);
      clPart(new THREE.CylinderGeometry(0.04, 0.04, CL_TOP - 0.7, 8), clCopper, px, (CL_TOP - 0.5) / 2 + 0.1, e * (CD + 0.08));
      [0.8, 1.9, 3.0].forEach(function (by) { clPart(new THREE.BoxGeometry(0.1, 0.03, 0.1), clCopper, px, by, e * (CD + 0.06)); });
      clPart(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8), clCopper, px, 0.14, e * (CD + 0.16), e * Math.PI / 2.6, 0, 0);
      clPart(new THREE.BoxGeometry(0.22, 0.04, 0.38), houseMats.stone, px, 0.02, e * (CD + 0.35));
    });
  });

  // two dormer windows on the front of the roof
  var clDormerGlass = clRealGlass(128, 128, true);
  function clRoofY(z) { return CL_TOP + CL_RH * (1 - Math.abs(z) / CL_RD); }
  [-3.1, 3.1].forEach(function (dx) {
    var fz = CD - 0.55, bz = 1.0, top = clRoofY(fz) + 0.95, dw = 1.25;
    clPart(new THREE.BoxGeometry(dw, top - clRoofY(fz) + 0.6, fz - bz), CL.siding, dx, (top + clRoofY(fz) - 0.6) / 2, (fz + bz) / 2);
    [-1, 1].forEach(function (s) { clPart(new THREE.BoxGeometry(0.12, top - clRoofY(fz) + 0.1, 0.12), CL.trim, dx + s * (dw / 2 - 0.02), (top + clRoofY(fz) - 0.1) / 2, fz + 0.02); });
    var rise = 0.55, half = dw / 2 + 0.18, ang = Math.atan2(rise, half), slen = Math.sqrt(rise * rise + half * half);
    [-1, 1].forEach(function (s) {                                    // its own little gable roof
      clPart(new THREE.BoxGeometry(slen + 0.06, 0.08, fz - bz + 0.35), CL.tiles, dx + s * half / 2, top + rise / 2 + 0.03, (fz + bz) / 2 + 0.17, 0, 0, -s * ang);
      clPart(new THREE.BoxGeometry(slen + 0.06, 0.12, 0.05), CL.trim, dx + s * half / 2, top + rise / 2 - 0.02, fz + 0.36, 0, 0, -s * ang);
    });
    var gs = new THREE.Shape(); gs.moveTo(-dw / 2, 0); gs.lineTo(dw / 2, 0); gs.lineTo(0, rise * (dw / 2) / half); gs.lineTo(-dw / 2, 0);
    clPart(new THREE.ShapeGeometry(gs), CL.gable, dx, top, fz + 0.005);
    clPart(new THREE.CylinderGeometry(0.06, 0.06, fz - bz + 0.35, 8), CL.terracotta, dx, top + rise + 0.07, (fz + bz) / 2 + 0.17, Math.PI / 2, 0, 0);
    var wy = top - 0.42;                                              // its window: a little sash with a white surround
    clPart(new THREE.PlaneGeometry(0.62, 0.62), clDormerGlass, dx, wy, fz + 0.02);
    clPart(new THREE.BoxGeometry(0.03, 0.62, 0.03), CL.trim, dx, wy, fz + 0.035);
    clPart(new THREE.BoxGeometry(0.62, 0.03, 0.03), CL.trim, dx, wy, fz + 0.035);
    [[0, 0.36, 0.84, 0.1], [0, -0.36, 0.84, 0.1], [-0.36, 0, 0.1, 0.62], [0.36, 0, 0.1, 0.62]].forEach(function (f) { clPart(new THREE.BoxGeometry(f[2], f[3], 0.07), CL.trim, dx + f[0], wy + f[1], fz + 0.03); });
    clPart(new THREE.BoxGeometry(0.95, 0.05, 0.16), CL.trim, dx, wy - 0.42, fz + 0.07);
    clPart(new THREE.SphereGeometry(0.05, 10, 8), houseMats.gold, dx, top + rise + 0.16, fz + 0.36);   // a gold finial on the peak
  });

  // a little cupola on the ridge, with louvred sides and a copper roof, carrying the weathervane
  var CUP_X = -1.6, CUP_Y = CL_TOP + CL_RH;
  clPart(new THREE.BoxGeometry(0.8, 0.5, 0.8), CL.trim, CUP_X, CUP_Y + 0.05, 0);
  clPart(new THREE.BoxGeometry(0.66, 0.55, 0.66), CL.siding, CUP_X, CUP_Y + 0.55, 0);
  [[0, 0.34, 0], [Math.PI / 2, 0, 0.34], [Math.PI, 0, -0.34], [-Math.PI / 2, -0.34, 0]].forEach(function (f, k) {
    clPart(new THREE.BoxGeometry(0.4, 0.42, 0.02), CL.shutter, CUP_X + (k === 1 ? 0.34 : k === 3 ? -0.34 : 0), CUP_Y + 0.55, k === 0 ? 0.34 : k === 2 ? -0.34 : 0, 0, f[0], 0);
  });
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (c) { clPart(new THREE.BoxGeometry(0.08, 0.6, 0.08), CL.trim, CUP_X + c[0] * 0.33, CUP_Y + 0.55, c[1] * 0.33); });
  clPart(new THREE.BoxGeometry(0.82, 0.06, 0.82), CL.trim, CUP_X, CUP_Y + 0.86, 0);
  clPart(new THREE.ConeGeometry(0.6, 0.5, 4), new THREE.MeshStandardMaterial({ color: 0x5fa890, roughness: 0.5, metalness: 0.5 }), CUP_X, CUP_Y + 1.14, 0, 0, Math.PI / 4, 0);   // a verdigris copper cap
  clPart(new THREE.SphereGeometry(0.06, 10, 8), houseMats.gold, CUP_X, CUP_Y + 1.4, 0);

  // porch railings between the columns and the wall, with turned balusters
  [-1, 1].forEach(function (s) {
    var rx = s * CL_COL_X, z0 = CD + 0.05, z1 = CD + PORCH_D - 0.38;
    clPart(new THREE.BoxGeometry(0.08, 0.06, z1 - z0), CL.trim, rx, CL_PLINTH + 0.86, (z0 + z1) / 2);
    clPart(new THREE.BoxGeometry(0.06, 0.05, z1 - z0), CL.trim, rx, CL_PLINTH + 0.12, (z0 + z1) / 2);
    for (var bz = z0 + 0.1; bz < z1 - 0.05; bz += 0.13) clPart(new THREE.CylinderGeometry(0.022, 0.03, 0.7, 8), CL.trim, rx, CL_PLINTH + 0.49, bz);
  });
  // a lattice skirt round the porch floor
  var clLatticeTex = paintTexture(64, 32, function (g, w, h) {
    g.fillStyle = '#3a2a22'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#f4f1ea'; g.lineWidth = 3;
    for (var x = -32; x < w + 32; x += 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h, h); g.moveTo(x, h); g.lineTo(x + h, 0); g.stroke(); }
  });
  clLatticeTex.wrapS = THREE.RepeatWrapping; clLatticeTex.repeat.set(5, 1);
  clPart(new THREE.PlaneGeometry(PORCH_W * 2 - 0.1, 0.2), new THREE.MeshStandardMaterial({ map: clLatticeTex, roughness: 0.8 }), 0, 0.12, CD + PORCH_D + 0.005);
  // climbing roses twining up the porch columns
  var clRoseLeaves = [], clRoses = [];
  [-1, 1].forEach(function (s) {
    var cx = s * CL_COL_X, cz = CD + PORCH_D - 0.25;
    for (var k = 0; k < 340; k++) {                                     // leafy canes wandering up the column, thicker in clumps
      var h = 0.3 + Math.pow(isle2Hash(k * 1.31 + s * 5), 0.8) * (CL_BEAM_Y - 0.4), a = h * 2.2 + s + (isle2Hash(k * 2.7 + s) - 0.5) * 2.6;
      var clump = 0.5 + 0.5 * Math.sin(h * 3.1 + s * 2), r = 0.15 + isle2Hash(k * 3.9 + s) * (0.05 + clump * 0.08);
      if (isle2Hash(k * 5.3 + s) > 0.45 + clump * 0.5) continue;
      clRoseLeaves.push([cx + Math.cos(a) * r, h, cz + Math.sin(a) * r, isle2Hash(k * 13 + s)]);
      if (isle2Hash(k * 17 + s * 3) > 0.8 && clump > 0.4) clRoses.push([cx + Math.cos(a) * (r + 0.035), h + 0.02, cz + Math.sin(a) * (r + 0.035), isle2Hash(k * 7 + s)]);
    }
    for (var bx = 0; bx < 30; bx++) {                                  // and spilling along the beam
      var ba = isle2Hash(bx * 3.7 + s * 11);
      clRoseLeaves.push([cx - s * bx * 0.03, CL_BEAM_Y - 0.03 - ba * 0.14, CD + PORCH_D - 0.02 + isle2Hash(bx + s) * 0.06, ba]);   // trailing under the beam, clear of the sign
      if (bx % 3 === 0) clRoses.push([cx - s * bx * 0.03, CL_BEAM_Y - 0.08 - ba * 0.1, CD + PORCH_D + 0.03, ba]);
    }
  });
  clInstanced(clLeafGeo, clLeafMat, clRoseLeaves, function (q) {
    clDummy2.rotation.set(q[3] * 5, q[3] * 9, q[3] * 3); return clCol2.setHSL(0.27 + q[3] * 0.05, 0.42, 0.22 + q[3] * 0.1).getHex();
  });
  clInstanced(clRoseGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }), clRoses, function (q) {   // cupped blooms of layered petals
    clDummy2.rotation.set(q[3] * 2 - 1, q[3] * 6, 0); clDummy2.scale.setScalar(0.8 + q[3] * 0.5); return [0xf28aa8, 0xfbd0dc, 0xe0607a][Math.floor(q[3] * 3)];
  });

  // a wreath on the front door, with a pink bow
  var clWreath = [];
  for (var wk = 0; wk < 40; wk++) { var wa = wk / 40 * Math.PI * 2; clWreath.push([Math.cos(wa) * 0.17, CL_PLINTH + 1.62 + Math.sin(wa) * 0.17, CD + 0.17, isle2Hash(wk * 3.3)]); }
  clInstanced(new THREE.IcosahedronGeometry(0.06, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, flatShading: true }), clWreath, function (q) {
    clDummy2.rotation.set(q[3] * 6, q[3] * 4, 0); return clCol2.setHSL(0.3 + q[3] * 0.04, 0.4, 0.22 + q[3] * 0.08).getHex();
  });
  for (var wb = 0; wb < 8; wb++) { var wba = wb * 0.79 + 0.2; clPart(new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }), Math.cos(wba) * 0.19, CL_PLINTH + 1.62 + Math.sin(wba) * 0.19, CD + 0.21); }
  var clBowMat = new THREE.MeshStandardMaterial({ color: 0xf28aa8, roughness: 0.6 });
  [-1, 1].forEach(function (s) {
    clPart(new THREE.SphereGeometry(0.06, 10, 8), clBowMat, s * 0.07, CL_PLINTH + 1.44, CD + 0.22).scale.set(1.2, 0.7, 0.5);
    clPart(new THREE.BoxGeometry(0.04, 0.16, 0.02), clBowMat, s * 0.04, CL_PLINTH + 1.34, CD + 0.21, 0, 0, s * 0.3);
  });

  // a hanging sign on a wrought-iron bracket at the front corner, so you can spot the clinic from along the path
  var clBladeTex = paintTexture(256, 256, function (g, w, h) {
    g.fillStyle = '#fbf8f0'; g.beginPath(); g.arc(w / 2, h / 2, 120, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#2f6f68'; g.lineWidth = 12; g.stroke();
    g.strokeStyle = '#c9a24a'; g.lineWidth = 3; g.beginPath(); g.arc(w / 2, h / 2, 104, 0, Math.PI * 2); g.stroke();
    var cx = w / 2, cy = h / 2 - 6, s = 62;
    g.fillStyle = '#e0607a'; g.beginPath(); g.moveTo(cx, cy + s * 0.9); g.bezierCurveTo(cx - s * 1.3, cy, cx - s * 0.8, cy - s, cx, cy - s * 0.35); g.bezierCurveTo(cx + s * 0.8, cy - s, cx + s * 1.3, cy, cx, cy + s * 0.9); g.fill();
    g.fillStyle = '#fff'; g.fillRect(cx - 8, cy - 28, 16, 50); g.fillRect(cx - 24, cy - 11, 48, 16);
    g.fillStyle = '#2f6f68'; g.textAlign = 'center'; g.font = 'bold 26px Georgia, serif'; g.fillText('CLINIC', cx, h - 42);
  });
  var clBladeMat = new THREE.MeshStandardMaterial({ map: clBladeTex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5 });
  var CBX = CW - 0.35, CBY = CL_PLINTH + 2.75;
  clPart(new THREE.BoxGeometry(0.03, 0.03, 1.0), houseMats.iron, CBX, CBY, CD + 0.5);
  clPart(new THREE.BoxGeometry(0.025, 0.025, 0.7), houseMats.iron, CBX, CBY - 0.22, CD + 0.36, -0.6, 0, 0);
  clPart(new THREE.TorusGeometry(0.12, 0.012, 6, 16, Math.PI * 1.5), houseMats.iron, CBX, CBY - 0.1, CD + 0.2, 0, Math.PI / 2, 0);
  clPart(new THREE.BoxGeometry(0.06, 0.3, 0.1), houseMats.iron, CBX, CBY - 0.1, CD + 0.03);
  [0.3, 0.86].forEach(function (cz) { clPart(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 4), houseMats.gold, CBX, CBY - 0.07, CD + cz); });
  var clBlade = clPart(new THREE.PlaneGeometry(0.72, 0.72), clBladeMat, CBX, CBY - 0.48, CD + 0.58, 0, Math.PI / 2, 0);
  clBlade.castShadow = false;

  // flower beds of dark mulch all round the foundations: clipped boxwood balls, mophead hydrangeas and little white flowers,
  // edged with stone
  var clBox = [], clBedSpots = [], clHydLeaf = [], clHyd = [], clDaisy = [], clEdge = [];
  function clBed(x0, z0, x1, z1, seed) {
    var w = x1 - x0, d = z1 - z0, along = w > d, len = along ? w : d;
    clPart(new THREE.BoxGeometry(w, 0.05, d), clMulch, (x0 + x1) / 2, 0.025, (z0 + z1) / 2).castShadow = false;
    for (var e = 0; e < len; e += 0.3) {                               // a row of edging stones along the outer side
      var ex = along ? x0 + e + 0.15 : (x0 + x1) / 2 + (x0 + x1 > 0 ? 1 : -1) * (w / 2), ez = along ? (z0 + z1) / 2 + (z0 + z1 > 0 ? 1 : -1) * (d / 2) : z0 + e + 0.15;
      clEdge.push([ex, 0.05, ez, along ? 0 : 1, isle2Hash(seed + e * 7)]);
    }
    for (var k = 0; k * 1.05 < len - 0.4; k++) {
      var f = 0.5 + k * 1.05, px = along ? x0 + f : (x0 + x1) / 2, pz = along ? (z0 + z1) / 2 : z0 + f, n = seed + k * 13;
      if (dist(px, pz, 2.25, CD + 0.75) < 0.6 || dist(px, pz, -2.25, CD + 0.75) < 0.6) continue;   // leave room for the bay trees
      clBedSpots.push([px, pz]);
      if (k % 2 === 0) clBox.push([px, 0.28, pz, 0.3 + isle2Hash(n) * 0.06]);
      else {                                                          // a hydrangea: a leafy mound with big round flower heads
        var hc = isle2Hash(n * 1.7) > 0.5 ? 0 : 1;
        for (var l = 0; l < 14; l++) clHydLeaf.push([px + (isle2Hash(n + l) - 0.5) * 0.55, 0.12 + isle2Hash(n + l * 2) * 0.3, pz + (isle2Hash(n + l * 3) - 0.5) * 0.45, isle2Hash(n + l * 5)]);
        for (var hh = 0; hh < 5; hh++) clHyd.push([px + (isle2Hash(n + hh * 7) - 0.5) * 0.45, 0.42 + isle2Hash(n + hh * 11) * 0.12, pz + (isle2Hash(n + hh * 13) - 0.5) * 0.35, hc, isle2Hash(n + hh)]);
      }
      for (var dz = 0; dz < 6; dz++) clDaisy.push([px + (along ? 0.5 : 0) + (isle2Hash(n + dz * 17) - 0.5) * 0.4, 0.08 + isle2Hash(n + dz) * 0.05, pz + (along ? 0 : 0.5) + (isle2Hash(n + dz * 19) - 0.5) * 0.3, isle2Hash(n + dz * 23)]);
    }
  }
  clBed(-CW - 0.1, CD + 0.12, -PORCH_W - 0.05, CD + 0.95, 1100);
  clBed(PORCH_W + 0.05, CD + 0.12, CW + 0.1, CD + 0.95, 1200);
  clBed(-CW - 0.95, -CD - 0.1, -CW - 0.12, CD + 0.95, 1300);
  clBed(CW + 0.12, -CD - 0.1, CW + 0.95, CD + 0.95, 1400);
  clBed(-CW - 0.1, -CD - 0.95, CW + 0.1, -CD - 0.12, 1500);
  clInstanced(new THREE.BoxGeometry(0.3, 0.1, 0.16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }), clEdge, function (q) {
    clDummy2.rotation.y = q[3] * Math.PI / 2 + (q[4] - 0.5) * 0.08; return clCol2.setHSL(0.08, 0.06, 0.62 + q[4] * 0.12).getHex();
  });
  clBox.forEach(function (q, i) { clFoliage(q[0], q[1], q[2], q[3], q[3] * 0.88, q[3], 150, 900 + i * 17); });   // clipped boxwood: tiny leaves packed into a ball
  var clHydLeaves = [];
  clHydLeaf.forEach(function (q, i) { if (i % 2 === 0) clFoliage(q[0], q[1] + 0.05, q[2], 0.2, 0.14, 0.18, 26, 400 + i * 7, clHydLeaves); });
  clInstanced(clLeafGeo, clLeafMat, clHydLeaves, function (q) {      // the hydrangeas' broad leaves, a fresher green
    clDummy2.rotation.set(q[3], q[4], q[5]); clDummy2.scale.setScalar(1.9); return clCol2.setHSL(0.27, 0.45, 0.26 + q[6] * 0.12).getHex();
  });
  var clFlorets = [];                                                  // each mophead: a dome of tiny four-petalled florets
  clHyd.forEach(function (q, i) {
    for (var f = 0; f < 36; f++) {
      var u = isle2Hash(i * 41 + f * 1.3), v = isle2Hash(i * 43 + f * 2.1), th = u * Math.PI * 2, ph = Math.acos(1 - v * 1.3);
      clFlorets.push([q[0] + Math.sin(ph) * Math.cos(th) * 0.11, q[1] + Math.cos(ph) * 0.09, q[2] + Math.sin(ph) * Math.sin(th) * 0.11, q[3], q[4], u, v]);
    }
  });
  clInstanced(new THREE.CylinderGeometry(0.026, 0.02, 0.012, 4), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }), clFlorets, function (q) {
    clDummy2.rotation.set((q[6] - 0.5) * 2, q[5] * 6, (q[5] - 0.5) * 2);
    return q[3] ? clCol2.setHSL(0.6 + q[4] * 0.08 + q[6] * 0.03, 0.5, 0.64 + q[5] * 0.1).getHex() : clCol2.setHSL(0.93 + q[4] * 0.04, 0.55, 0.74 + q[5] * 0.1).getHex();
  });
  clInstanced(clLeafGeo, clLeafMat, clLeafy, function (q) {          // every leaf of the bay trees and boxwoods
    clDummy2.rotation.set(q[3], q[4], q[5]); clDummy2.scale.setScalar(1.1 + q[6] * 0.5); return clCol2.setHSL(0.28 + q[6] * 0.04, 0.42, 0.2 + q[6] * 0.14).getHex();
  });
  clInstanced(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshStandardMaterial({ color: 0x23401f, roughness: 0.9 }), clCores, function (q) { clDummy2.scale.set(q[3], q[4], q[5]); });
  clInstanced(new THREE.CylinderGeometry(0.035, 0.03, 0.012, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }), clDaisy, function (q) {
    clDummy2.rotation.set((q[3] - 0.5) * 0.6, 0, (q[3] - 0.5) * 0.4); return q[3] > 0.7 ? 0xfff1b8 : 0xfbfaf6;
  });

  // a teal mailbox on a post by the path
  var clMail = new THREE.Group(); clMail.position.set(-2.0, 0, CD + 2.4); clMail.rotation.y = 0.4; clinicGroup.add(clMail);
  clPart(new THREE.BoxGeometry(0.08, 1.0, 0.08), CL.trim, 0, 0.5, 0, 0, 0, 0, clMail);
  clPart(new THREE.BoxGeometry(0.22, 0.03, 0.42), CL.trim, 0, 1.0, 0, 0, 0, 0, clMail);
  clPart(new THREE.BoxGeometry(0.2, 0.15, 0.4), CL.teal, 0, 1.09, 0, 0, 0, 0, clMail);
  clPart(new THREE.CylinderGeometry(0.1, 0.1, 0.4, 16, 1, false, 0, Math.PI), CL.teal, 0, 1.165, 0, Math.PI / 2, 0, Math.PI / 2, clMail);
  clPart(new THREE.BoxGeometry(0.015, 0.16, 0.04), new THREE.MeshStandardMaterial({ color: 0xe0607a, roughness: 0.5 }), 0.11, 1.18, -0.12, 0, 0, 0, clMail);
  clPart(new THREE.BoxGeometry(0.015, 0.05, 0.08), new THREE.MeshStandardMaterial({ color: 0xe0607a, roughness: 0.5 }), 0.11, 1.25, -0.1, 0, 0, 0, clMail);
  clPart(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 10), houseMats.gold, 0, 1.12, 0.21, Math.PI / 2, 0, 0, clMail);

  function updateClinicBuilding(t, glow) {                            // the lanterns light up at night, and the weathervane turns in the breeze
    CL.lamp.emissiveIntensity = 0.3 + glow * 1.5;
    CL.sign.emissiveIntensity = 0.25 + glow * 0.45;                    // the little lamps make the gold letters shine at night
    clSignLampInner.emissiveIntensity = 0.2 + glow * 1.2;
    for (var i = 0; i < clLampGlows.length; i++) clLampGlows[i].material.opacity = glow * 0.8;
    clVane.rotation.y = Math.sin(t * 0.21) * 0.9 + Math.sin(t * 0.53) * 0.3;
  }
  function barnRampHeight(x, z) {                                      // how high Fluff & Feather's ramp lifts you
    var dx = x - ANIMAL_X, dz = z - ANIMAL_Z, c = Math.cos(ANIMAL_TURN), si = Math.sin(ANIMAL_TURN), lx = dx * c - dz * si, lz = dx * si + dz * c;
    if (Math.abs(lx) > 1.25 || lz < BD - 0.7 || lz > BD + 1.25) return 0;
    return lz < BD + 0.15 ? B_FOUND : B_FOUND * (BD + 1.25 - lz) / 1.1;
  }
  function clinicStepHeight(x, z) {                                   // how high the clinic's porch and step lift you
    var l = clinicLocal(x, z);
    if (Math.abs(l[0]) > PORCH_W || l[1] < CD - 0.6 || l[1] > CD + PORCH_D + 0.32) return 0;
    return l[1] < CD + PORCH_D ? CL_PLINTH : CL_PLINTH / 2;
  }
  (function () {                                                       // you bump into the walls, the columns, the bay trees and the bench
    var c = Math.cos(CLINIC_TURN), si = Math.sin(CLINIC_TURN);
    function solidAt(lx, lz, r) { solids.push({ x: CLINIC_X + lx * c + lz * si, z: CLINIC_Z - lx * si + lz * c, r: r }); }
    for (var x = -CW + 0.4; x <= CW - 0.39; x += 1.2) for (var z = -CD + 0.4; z <= CD - 1.1; z += 1.2) solidAt(x, z, 0.95);
    for (var x2 = -CW; x2 <= CW + 0.01; x2 += 0.5) if (Math.abs(x2) > 0.7) solidAt(x2, CD - 0.25, 0.4);   // the front wall, with a gap for the door
    for (var z2 = -CD; z2 <= CD; z2 += 0.5) { solidAt(-CW + 0.25, z2, 0.4); solidAt(CW - 0.25, z2, 0.4); }
    solidAt(0, CD - 0.6, 0.35);                                        // the door itself: walk up to it and in you go
    [-1, 1].forEach(function (s) { solidAt(s * CL_COL_X, CD + PORCH_D - 0.25, 0.2); solidAt(s * (PORCH_W + 0.55), CD + 0.75, 0.42); });
    solidAt(-3.9, CD + 1.35, 0.35); solidAt(-3.1, CD + 1.35, 0.35);
    clBedSpots.forEach(function (b) { solidAt(b[0], b[1], 0.35); });   // the shrubs in the flower beds
    solidAt(-2.0, CD + 2.4, 0.12);                                    // the mailbox
  })();

  // ---------- Fluff & Feather, the animal shop on the Western Isle ----------
  // A big red barn of a shop: board-and-batten siding with white trim, a grey shingled gambrel roof with a cupola and a
  // rooster weathervane, a fieldstone foundation, big white-braced sliding doors (half open, warm light inside), a
  // hayloft door with a pulley and hay spilling out, a painted sign with paw prints, windows with flower boxes,
  // lanterns, hay bales, feed sacks, a water trough, a milk churn, and a few farmyard bits and pieces
  var barnGroup = new THREE.Group();
  barnGroup.position.set(ANIMAL_X, 0, ANIMAL_Z); barnGroup.rotation.y = ANIMAL_TURN;
  scene.add(barnGroup);
  function apPart(geo, mat, x, y, z, rx, ry, rz, parent) {
    var m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, rz || 0);
    m.castShadow = m.receiveShadow = true;
    (parent || barnGroup).add(m);
    return m;
  }
  var BW = ANIMAL_HW, BD = ANIMAL_HD, B_FOUND = 0.35, B_WALL = 3.0, B_TOP = B_FOUND + B_WALL;
  var barnSidingTex = paintTexture(256, 256, function (g, w, h) {      // barn-red board and batten, weathered
    for (var x = 0; x < w; x += 32) {
      var l = 34 + isle2Hash(x * 0.7 + 1) * 5;
      g.fillStyle = 'hsl(4,58%,' + l + '%)'; g.fillRect(x, 0, 32, h);
      for (var gr = 0; gr < 14; gr++) { g.strokeStyle = 'rgba(' + (isle2Hash(x + gr) > 0.5 ? '255,200,180' : '60,10,10') + ',0.12)'; g.lineWidth = 1; var gx = x + 2 + isle2Hash(x * 3 + gr) * 28; g.beginPath(); g.moveTo(gx, 0); g.lineTo(gx + (isle2Hash(gr + x) - 0.5) * 4, h); g.stroke(); }
      var bat = g.createLinearGradient(x + 26, 0, x + 32, 0); bat.addColorStop(0, 'rgba(0,0,0,0.35)'); bat.addColorStop(0.3, 'hsl(4,55%,40%)'); bat.addColorStop(1, 'hsl(4,55%,30%)');
      g.fillStyle = bat; g.fillRect(x + 25, 0, 7, h);                  // the batten over each seam
    }
    for (var i = 0; i < 400; i++) { g.fillStyle = 'rgba(255,235,220,' + isle2Hash(i) * 0.08 + ')'; g.fillRect(isle2Hash(i * 2.1) * w, isle2Hash(i * 3.3) * h, 1 + isle2Hash(i * 5) * 3, 1); }   // flaking paint
  });
  var barnShingleTex = paintTexture(256, 256, function (g, w, h) {     // grey-green cedar shingles
    g.fillStyle = '#3c4440'; g.fillRect(0, 0, w, h);
    for (var r = 0; r < 12; r++) for (var c = -1; c < 10; c++) {
      var x = c * 28 + (r % 2) * 14 + isle2Hash(r * 7 + c) * 4, l = 34 + isle2Hash(r * 13 + c * 5) * 14, sw = 24 + isle2Hash(c + r * 3) * 6;
      g.fillStyle = 'hsl(150,6%,' + l + '%)'; g.fillRect(x, r * 22, sw, 20);
      g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x, r * 22 + 18, sw, 3);
    }
  });
  var barnStoneTex = paintTexture(256, 128, function (g, w, h) {       // fieldstones set in mortar
    g.fillStyle = '#8a8478'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 70; i++) {
      var x = isle2Hash(i * 3.1) * w, y = isle2Hash(i * 5.7) * h, rx = 10 + isle2Hash(i) * 14, ry = 7 + isle2Hash(i * 2) * 8, l = 48 + isle2Hash(i * 9) * 22;
      g.fillStyle = 'hsl(' + (25 + isle2Hash(i * 4) * 20) + ',8%,' + l + '%)'; g.beginPath(); g.ellipse(x, y, rx, ry, isle2Hash(i * 6) * 3, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.ellipse(x - rx * 0.2, y - ry * 0.3, rx * 0.6, ry * 0.4, 0, 0, Math.PI * 2); g.fill();
    }
  });
  var strawTex = paintTexture(128, 128, function (g, w, h) {           // straw for the hay bales
    g.fillStyle = '#d8b65a'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 700; i++) { g.strokeStyle = 'rgba(' + (isle2Hash(i) > 0.5 ? '250,225,140' : '150,110,40') + ',0.6)'; g.lineWidth = 1; var x = isle2Hash(i * 2.3) * w, y = isle2Hash(i * 3.7) * h, a = (isle2Hash(i * 5.1) - 0.5) * 0.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); g.stroke(); }
  });
  [barnSidingTex, barnShingleTex, barnStoneTex, strawTex].forEach(function (t) { t.wrapS = t.wrapT = THREE.RepeatWrapping; });
  var AM = {
    siding: new THREE.MeshStandardMaterial({ map: barnSidingTex, bumpMap: barnSidingTex, bumpScale: 0.02, roughness: 0.8 }),
    trim: new THREE.MeshStandardMaterial({ color: 0xf6f2e8, roughness: 0.6 }),
    shingle: new THREE.MeshStandardMaterial({ map: barnShingleTex, bumpMap: barnShingleTex, bumpScale: 0.03, roughness: 0.85 }),
    stone: new THREE.MeshStandardMaterial({ map: barnStoneTex, bumpMap: barnStoneTex, bumpScale: 0.04, roughness: 0.95 }),
    straw: new THREE.MeshStandardMaterial({ map: strawTex, roughness: 1 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x8a6440, roughness: 0.8 }),
    darkWood: new THREE.MeshStandardMaterial({ color: 0x4a3426, roughness: 0.85 }),
    iron: new THREE.MeshStandardMaterial({ color: 0x2a2a2e, roughness: 0.45, metalness: 0.6 }),
    copper: new THREE.MeshStandardMaterial({ color: 0x5fa890, roughness: 0.5, metalness: 0.5 }),
    warm: new THREE.MeshStandardMaterial({ color: 0xffe2a8, emissive: 0xffb860, emissiveIntensity: 0.6, roughness: 0.9 }),
    lamp: new THREE.MeshStandardMaterial({ color: 0xfff0c8, emissive: 0xffc870, emissiveIntensity: 0.3, roughness: 0.3 }),
    wool: new THREE.MeshStandardMaterial({ color: 0xf6f2ea, roughness: 1, flatShading: true }),
    black: new THREE.MeshStandardMaterial({ color: 0x2a2624, roughness: 0.7 })
  };
  function sidingMat(rx, ry) { var m = AM.siding.clone(); m.map = barnSidingTex.clone(); m.map.needsUpdate = true; m.map.repeat.set(rx, ry); m.bumpMap = m.map; return m; }
  // the fieldstone foundation and the walls
  var barnStoneMat = AM.stone.clone(); barnStoneMat.map = barnStoneTex.clone(); barnStoneMat.map.needsUpdate = true; barnStoneMat.map.repeat.set(5, 0.6); barnStoneMat.bumpMap = barnStoneMat.map;
  apPart(new THREE.BoxGeometry(BW * 2 + 0.3, B_FOUND, BD * 2 + 0.3), barnStoneMat, 0, B_FOUND / 2, 0);
  apPart(new THREE.BoxGeometry(BW * 2, B_WALL, BD * 2), sidingMat(BW * 2 / 1.6, B_WALL / 1.6), 0, B_FOUND + B_WALL / 2, 0);
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (c) { apPart(new THREE.BoxGeometry(0.2, B_WALL, 0.2), AM.trim, c[0] * (BW - 0.04), B_FOUND + B_WALL / 2, c[1] * (BD - 0.04)); });   // white corner boards
  apPart(new THREE.BoxGeometry(BW * 2 + 0.12, 0.16, BD * 2 + 0.12), AM.trim, 0, B_TOP - 0.06, 0);
  // the gambrel roof: steep lower slopes and shallow upper slopes, with white-trimmed gable ends above the walls
  var GP = [[-BW - 0.35, B_TOP - 0.15], [-BW * 0.6, B_TOP + 1.7], [0, B_TOP + 2.6], [BW * 0.6, B_TOP + 1.7], [BW + 0.35, B_TOP - 0.15]];
  var barnGable = new THREE.Shape(); barnGable.moveTo(-BW, B_TOP); barnGable.lineTo(-BW * 0.6 + 0.2, B_TOP + 1.55); barnGable.lineTo(0, B_TOP + 2.42); barnGable.lineTo(BW * 0.6 - 0.2, B_TOP + 1.55); barnGable.lineTo(BW, B_TOP); barnGable.lineTo(-BW, B_TOP);
  var barnFrontGable = new THREE.Shape(barnGable.getPoints());          // the front one has the hayloft opening cut through it
  var loftHole = new THREE.Path(); loftHole.moveTo(-0.6, B_TOP + 0.2); loftHole.lineTo(-0.6, B_TOP + 1.3); loftHole.lineTo(0.6, B_TOP + 1.3); loftHole.lineTo(0.6, B_TOP + 0.2); loftHole.lineTo(-0.6, B_TOP + 0.2);
  barnFrontGable.holes.push(loftHole);
  [-1, 1].forEach(function (e) {
    apPart(new THREE.ShapeGeometry(e > 0 ? barnFrontGable : barnGable), sidingMat(1 / 1.6, 1 / 1.6), 0, 0, e * (BD - 0.01), 0, e < 0 ? Math.PI : 0, 0);
    for (var k = 0; k < 4; k++) {                                       // white barge boards along each edge of the gable
      var a = GP[k], b = GP[k + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      apPart(new THREE.BoxGeometry(len + 0.1, 0.18, 0.08), AM.trim, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 0.04, e * (BD + 0.32), 0, 0, Math.atan2(b[1] - a[1], b[0] - a[0]));
    }
  });
  for (var rfk = 0; rfk < 4; rfk++) {                                      // the four roof slopes
    var ra = GP[rfk], rb = GP[rfk + 1], rlen = Math.hypot(rb[0] - ra[0], rb[1] - ra[1]);
    var rm = AM.shingle.clone(); rm.map = barnShingleTex.clone(); rm.map.needsUpdate = true; rm.map.repeat.set(rlen / 1.4, (BD * 2 + 0.6) / 1.4); rm.bumpMap = rm.map;
    apPart(new THREE.BoxGeometry(rlen + 0.06, 0.12, BD * 2 + 0.6), rm, (ra[0] + rb[0]) / 2, (ra[1] + rb[1]) / 2 + 0.05, 0, 0, 0, Math.atan2(rb[1] - ra[1], rb[0] - ra[0]));
  }
  apPart(new THREE.BoxGeometry(0.22, 0.12, BD * 2 + 0.66), AM.trim, 0, B_TOP + 2.68, 0);   // the ridge cap
  // a cupola with louvres and a copper roof, and a rooster weathervane
  var CU_Y = B_TOP + 2.6;
  apPart(new THREE.BoxGeometry(1.0, 0.85, 1.0), AM.siding, 0, CU_Y + 0.42, 0);
  [0, 1, 2, 3].forEach(function (k) {
    var an = k * Math.PI / 2;
    var lv = new THREE.Group(); lv.position.set(Math.sin(an) * 0.505, CU_Y + 0.45, Math.cos(an) * 0.505); lv.rotation.y = an; barnGroup.add(lv);
    apPart(new THREE.BoxGeometry(0.6, 0.55, 0.02), AM.trim, 0, 0, 0, 0, 0, 0, lv);
    for (var l = 0; l < 5; l++) apPart(new THREE.BoxGeometry(0.52, 0.03, 0.06), AM.darkWood, 0, -0.2 + l * 0.1, 0.02, 0.6, 0, 0, lv);
  });
  apPart(new THREE.ConeGeometry(0.85, 0.7, 4), AM.copper, 0, CU_Y + 1.2, 0, 0, Math.PI / 4, 0);
  apPart(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 6), AM.iron, 0, CU_Y + 1.9, 0);
  [[0.4, 0], [0, 0.4]].forEach(function (d) { apPart(new THREE.BoxGeometry(0.02 + d[0] * 1.6, 0.02, 0.02 + d[1] * 1.6), AM.iron, 0, CU_Y + 1.85, 0); });
  var roosterShape = new THREE.Shape();                                // the rooster: body, tail, head, comb, beak and legs in one silhouette
  roosterShape.moveTo(-0.22, 0); roosterShape.lineTo(-0.05, 0); roosterShape.lineTo(-0.05, 0.08); roosterShape.quadraticCurveTo(0.12, 0.08, 0.16, 0.2); roosterShape.lineTo(0.24, 0.22); roosterShape.lineTo(0.17, 0.26);
  roosterShape.lineTo(0.2, 0.32); roosterShape.lineTo(0.15, 0.31); roosterShape.lineTo(0.14, 0.36); roosterShape.lineTo(0.1, 0.31); roosterShape.quadraticCurveTo(0.06, 0.24, 0.0, 0.2);
  roosterShape.quadraticCurveTo(-0.2, 0.22, -0.3, 0.42); roosterShape.quadraticCurveTo(-0.34, 0.2, -0.22, 0.12); roosterShape.lineTo(-0.22, 0);
  var rooster = apPart(new THREE.ExtrudeGeometry(roosterShape, { depth: 0.015, bevelEnabled: false }), AM.iron, 0, CU_Y + 1.98, 0);
  // the front: big sliding barn doors on an iron track, standing half open with warm light inside
  var B_FZ = BD;
  apPart(new THREE.BoxGeometry(2.6, 2.2, 0.02), AM.warm, 0, B_FOUND + 1.1, B_FZ + 0.012);   // the lit doorway
  apPart(new THREE.BoxGeometry(3.6, 0.1, 0.1), AM.iron, 0, B_FOUND + 2.3, B_FZ + 0.1);    // the track
  // a plank ramp up onto the barn floor, so you can walk in: boards across it on two stringers, worn in the middle
  var RAMP_L = Math.hypot(1.1, B_FOUND), RAMP_A = Math.atan2(B_FOUND, 1.1);
  [-1.15, 1.15].forEach(function (sx) { apPart(new THREE.BoxGeometry(0.1, 0.12, RAMP_L), AM.darkWood, sx, B_FOUND / 2 - 0.05, B_FZ + 0.15 + 0.55, RAMP_A, 0, 0); });
  for (var rpb = 0; rpb < 8; rpb++) {
    var rpT = (rpb + 0.5) / 8, rpZ = B_FZ + 0.15 + rpT * 1.1;
    apPart(new THREE.BoxGeometry(2.5, 0.045, RAMP_L / 8 - 0.015), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.07 + isle2Hash(rpb * 3.3) * 0.02, 0.3, 0.3 + isle2Hash(rpb * 5.1) * 0.08), roughness: 0.85 }), (isle2Hash(rpb) - 0.5) * 0.04, B_FOUND * (1 - rpT) + 0.01, rpZ, RAMP_A, 0, 0);
    [-1.15, 1.15].forEach(function (sx) { apPart(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 6), AM.iron, sx, B_FOUND * (1 - rpT) + 0.037, rpZ, RAMP_A, 0, 0); });   // nail heads
  }
  apPart(new THREE.BoxGeometry(2.6, 0.06, 0.16), AM.darkWood, 0, B_FOUND - 0.02, B_FZ + 0.08);   // the oak sill at the top
  [-1, 1].forEach(function (s) {                                       // the two doors, slid apart, each with a white frame and an X brace
    var dg = new THREE.Group(); dg.position.set(s * 1.5, B_FOUND + 1.12, B_FZ + 0.1); barnGroup.add(dg);
    apPart(new THREE.BoxGeometry(1.3, 2.2, 0.06), sidingMat(1.3 / 1.6, 2.2 / 1.6), 0, 0, 0, 0, 0, 0, dg);
    [[0, 1.05, 1.3, 0.12], [0, -1.05, 1.3, 0.12], [-0.6, 0, 0.12, 2.2], [0.6, 0, 0.12, 2.2], [0, 0, 1.3, 0.1]].forEach(function (f) { apPart(new THREE.BoxGeometry(f[2], f[3], 0.05), AM.trim, f[0], f[1], 0.04, 0, 0, 0, dg); });
    [-1, 1].forEach(function (v) { apPart(new THREE.BoxGeometry(1.4, 0.1, 0.05), AM.trim, 0, v * 0.52, 0.045, 0, 0, Math.atan2(0.9, 1.1) * (v * s > 0 ? 1 : -1), dg); });
    [-0.4, 0.4].forEach(function (rx) { apPart(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 12), AM.iron, rx, 1.17, 0.0, Math.PI / 2, 0, 0, dg); });   // rollers
    apPart(new THREE.BoxGeometry(0.04, 0.3, 0.04), AM.iron, -s * 0.5, 0, 0.09, 0, 0, 0, dg);   // a handle
  });
  apPart(new THREE.BoxGeometry(3.0, 0.12, 0.1), AM.trim, 0, B_FOUND + 2.42, B_FZ + 0.03);
  // the hayloft above the big doors: a deep opening with plank walls and a warm lantern inside, hay heaped on the loft
  // floor and spilling over the sill, a white casing with a drip cap, and a board-and-batten door with a Z brace, swung
  // open on long iron strap hinges and held back by a hook. Above it, a hoist beam on a knee brace with an iron pulley
  // block, a rope and a hook
  var HL_Y = B_TOP + 0.75, HL_W = 1.2, HL_H = 1.1, HL_D = 0.6;          // the middle of the opening, its size and how deep it goes
  var loftDark = new THREE.MeshStandardMaterial({ color: 0x3a2618, roughness: 1 });
  var loftPlank = new THREE.MeshStandardMaterial({ map: barnSidingTex.clone(), color: 0x7a5236, roughness: 0.95 });
  loftPlank.map.needsUpdate = true; loftPlank.map.repeat.set(0.8, 0.8);
  apPart(new THREE.PlaneGeometry(HL_W, HL_H), loftDark, 0, HL_Y, B_FZ - HL_D);                                  // the back of the loft
  [-1, 1].forEach(function (s) { apPart(new THREE.PlaneGeometry(HL_D, HL_H), loftPlank, s * HL_W / 2, HL_Y, B_FZ - HL_D / 2, 0, -s * Math.PI / 2, 0); });   // its plank side walls
  apPart(new THREE.PlaneGeometry(HL_W, HL_D), loftDark, 0, HL_Y + HL_H / 2, B_FZ - HL_D / 2, Math.PI / 2, 0, 0);                    // the ceiling
  apPart(new THREE.BoxGeometry(HL_W, 0.04, HL_D + 0.02), AM.wood, 0, HL_Y - HL_H / 2 + 0.02, B_FZ - HL_D / 2);                       // the loft floor
  apPart(new THREE.SphereGeometry(0.1, 10, 8), AM.lamp, 0.35, HL_Y + 0.25, B_FZ - HL_D + 0.12);                                    // a lantern glowing at the back
  apPart(new THREE.CylinderGeometry(0.004, 0.004, 0.25, 4), AM.iron, 0.35, HL_Y + 0.42, B_FZ - HL_D + 0.12);
  var loftHay = apPart(new THREE.SphereGeometry(0.5, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), AM.straw, -0.1, HL_Y - HL_H / 2 + 0.04, B_FZ - 0.3);   // a heap of loose hay
  loftHay.scale.set(1.05, 0.55, 0.6);
  for (var hayS = 0; hayS < 70; hayS++) {                              // wisps on the heap and hanging over the sill
    var hx = (isle2Hash(hayS) - 0.5) * 1.05, over = hayS % 3 === 0;
    apPart(new THREE.CylinderGeometry(0.004, 0.003, over ? 0.22 : 0.18, 3), AM.straw, hx, HL_Y - HL_H / 2 + (over ? -0.03 : 0.12 + isle2Hash(hayS * 2) * 0.15), B_FZ + (over ? 0.07 : -0.1 - isle2Hash(hayS * 7) * 0.3),
      over ? 0.4 + isle2Hash(hayS * 3) * 0.6 : Math.PI / 2 + (isle2Hash(hayS * 3) - 0.5) * 1.2, isle2Hash(hayS * 11) * 3, (isle2Hash(hayS * 5) - 0.5) * 0.8).castShadow = false;
  }
  // the casing: white boards round the opening, a drip cap over the top, and a sill board
  [[0, HL_H / 2 + 0.06, HL_W + 0.24, 0.12], [-HL_W / 2 - 0.06, 0, 0.12, HL_H], [HL_W / 2 + 0.06, 0, 0.12, HL_H]].forEach(function (f) { apPart(new THREE.BoxGeometry(f[2], f[3], 0.06), AM.trim, f[0], HL_Y + f[1], B_FZ + 0.03); });
  apPart(new THREE.BoxGeometry(HL_W + 0.34, 0.05, 0.14), AM.trim, 0, HL_Y + HL_H / 2 + 0.14, B_FZ + 0.07);
  apPart(new THREE.BoxGeometry(HL_W + 0.3, 0.05, 0.16), AM.trim, 0, HL_Y - HL_H / 2 - 0.025, B_FZ + 0.06);
  // the door: vertical boards with grooves, a white Z brace, swung open about its hinge side and resting against the wall
  var loftDoor = new THREE.Group(); loftDoor.position.set(HL_W / 2 + 0.02, HL_Y, B_FZ + 0.06); loftDoor.rotation.y = 1.75; barnGroup.add(loftDoor);
  var DW = HL_W - 0.04, DH = HL_H - 0.04;
  for (var ldb = 0; ldb < 6; ldb++) apPart(new THREE.BoxGeometry(DW / 6 - 0.008, DH, 0.045), AM.siding, -DW + (ldb + 0.5) * DW / 6, 0, 0, 0, 0, 0, loftDoor);   // the boards
  [0.035, -0.035].forEach(function (fz) {                               // top and bottom rails and the diagonal, on both faces so it looks right swung open
    [0.42, -0.42].forEach(function (ry) { apPart(new THREE.BoxGeometry(DW - 0.04, 0.1, 0.03), AM.trim, -DW / 2, ry, fz, 0, 0, 0, loftDoor); });
    apPart(new THREE.BoxGeometry(Math.hypot(DW - 0.16, 0.74), 0.09, 0.028), AM.trim, -DW / 2, 0, fz, 0, 0, -Math.atan2(0.74, DW - 0.16), loftDoor);
  });
  [0.42, -0.42].forEach(function (hy) {                                 // long iron strap hinges, with bolts, reaching across the door
    apPart(new THREE.BoxGeometry(0.55, 0.04, 0.01), AM.iron, -0.27, hy, 0.055, 0, 0, 0, loftDoor);
    apPart(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 6), AM.iron, -0.54, hy, 0.055, Math.PI / 2, 0, 0, loftDoor);
    for (var bt = 0; bt < 4; bt++) apPart(new THREE.SphereGeometry(0.009, 6, 4), AM.iron, -0.06 - bt * 0.14, hy, 0.062, 0, 0, 0, loftDoor);
    apPart(new THREE.CylinderGeometry(0.014, 0.014, 0.1, 8), AM.iron, 0.0, hy, 0.0, 0, 0, 0, loftDoor);   // the hinge pin
  });
  apPart(new THREE.TorusGeometry(0.03, 0.006, 6, 12), AM.iron, -DW + 0.08, 0, 0.06, 0, 0, 0, loftDoor);   // a ring pull
  var hookRod = new THREE.CatmullRomCurve3([new THREE.Vector3(HL_W / 2 + 0.95, HL_Y - 0.1, B_FZ + 0.02), new THREE.Vector3(HL_W / 2 + 0.85, HL_Y - 0.12, B_FZ + 0.12), new THREE.Vector3(HL_W / 2 + 0.75, HL_Y - 0.1, B_FZ + 0.22)]);
  apPart(new THREE.TubeGeometry(hookRod, 8, 0.006, 5), AM.iron, 0, 0, 0);                                          // the hook holding it open
  // the hoist beam: a heavy timber out of the gable on a knee brace, with an iron pulley block, rope and hook
  var HB_Y = B_TOP + 1.43;
  apPart(new THREE.BoxGeometry(0.16, 0.16, 1.3), AM.darkWood, 0, HB_Y, B_FZ + 0.6);
  apPart(new THREE.BoxGeometry(0.1, 0.1, 0.7), AM.darkWood, 0, HB_Y - 0.28, B_FZ + 0.27, -0.85, 0, 0);       // the knee brace
  apPart(new THREE.BoxGeometry(0.17, 0.03, 0.17), AM.iron, 0, HB_Y + 0.0, B_FZ + 1.2);                       // an iron cap on the end
  var PU_Z = B_FZ + 1.05, PU_Y = HB_Y - 0.2;
  [-1, 1].forEach(function (sd) { apPart(new THREE.BoxGeometry(0.015, 0.3, 0.18), AM.iron, sd * 0.05, PU_Y + 0.04, PU_Z); });   // the cheeks of the block
  apPart(new THREE.CylinderGeometry(0.075, 0.075, 0.035, 18), AM.wood, 0, PU_Y, PU_Z, 0, 0, Math.PI / 2);     // the sheave
  apPart(new THREE.TorusGeometry(0.075, 0.008, 6, 18), new THREE.MeshStandardMaterial({ color: 0xc8a870, roughness: 1 }), 0, PU_Y, PU_Z, 0, Math.PI / 2, 0);   // rope round it
  apPart(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 8), AM.iron, 0, PU_Y, PU_Z, 0, 0, Math.PI / 2);
  var ropeMat = new THREE.MeshStandardMaterial({ color: 0xc8a870, roughness: 1 });
  apPart(new THREE.CylinderGeometry(0.01, 0.01, 0.45, 5), ropeMat, 0, PU_Y - 0.3, PU_Z + 0.075);           // the rope down to the hook (short, so it hangs clear of the sign)
  apPart(new THREE.TorusGeometry(0.05, 0.011, 6, 14, Math.PI * 1.4), AM.iron, 0, PU_Y - 0.58, PU_Z + 0.075, 0, Math.PI / 2, Math.PI);
  apPart(new THREE.CylinderGeometry(0.01, 0.01, 0.42, 5), ropeMat, 0, PU_Y - 0.25, PU_Z - 0.075);          // the other end, tied off to a cleat on the wall
  // a round window up in the gable: a deep white surround with four keystones, a sill, glazing bars with an inner
  // ring, and glass that glows warm inside and catches the light
  var RW_Y = B_TOP + 1.97, RW_R = 0.28;
  apPart(new THREE.CircleGeometry(RW_R, 32), AM.warm, 0, RW_Y, B_FZ + 0.01);
  apPart(new THREE.CircleGeometry(RW_R, 32), new THREE.MeshStandardMaterial({ map: siGlassTex, transparent: true, opacity: 0.6, roughness: 0.05, depthWrite: false }), 0, RW_Y, B_FZ + 0.035).renderOrder = 2;
  apPart(new THREE.CylinderGeometry(RW_R + 0.01, RW_R + 0.01, 0.12, 32, 1, true), AM.trim, 0, RW_Y, B_FZ - 0.02, Math.PI / 2, 0, 0);   // the depth of the opening
  apPart(new THREE.TorusGeometry(RW_R + 0.06, 0.06, 10, 36), AM.trim, 0, RW_Y, B_FZ + 0.04);
  apPart(new THREE.TorusGeometry(RW_R + 0.11, 0.018, 8, 36), AM.trim, 0, RW_Y, B_FZ + 0.06);                  // a moulded outer bead
  [0, 1, 2, 3].forEach(function (k) {                                   // four keystones
    var ka = k * Math.PI / 2;
    apPart(new THREE.BoxGeometry(0.12, 0.16, 0.08), AM.trim, Math.sin(ka) * (RW_R + 0.1), RW_Y + Math.cos(ka) * (RW_R + 0.1), B_FZ + 0.06, 0, 0, -ka);
  });
  apPart(new THREE.TorusGeometry(RW_R * 0.42, 0.014, 6, 28), AM.trim, 0, RW_Y, B_FZ + 0.04);                  // glazing: an inner ring and four spokes
  [0, 1, 2, 3].forEach(function (k) { apPart(new THREE.BoxGeometry(0.025, RW_R * 0.58, 0.025), AM.trim, Math.sin(k * Math.PI / 2) * RW_R * 0.71, RW_Y + Math.cos(k * Math.PI / 2) * RW_R * 0.71, B_FZ + 0.04, 0, 0, -k * Math.PI / 2); });
  apPart(new THREE.BoxGeometry(0.5, 0.04, 0.12), AM.trim, 0, RW_Y - RW_R - 0.14, B_FZ + 0.06);              // a little sill
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

});
