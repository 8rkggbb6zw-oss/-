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

(function () {
  if (window.THREE) { startGame(window.THREE); return; }
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  s.onload = function () { startGame(window.THREE); };
  s.onerror = function () { showToast('Could not load the 3D engine. Check your internet connection.', 60000); };
  document.head.appendChild(s);
})();

function startGame(THREE) {
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
  var spLine = stoneCurve(SP_PTS, 160), cpLine = stoneCurve(CP_PTS, 170);
  function lineBox(line) {                                             // the box round a path, so far-off spots can skip the sums
    var b = [1e9, -1e9, 1e9, -1e9];
    line.forEach(function (q) { b[0] = Math.min(b[0], q[0] - 3); b[1] = Math.max(b[1], q[0] + 3); b[2] = Math.min(b[2], q[1] - 3); b[3] = Math.max(b[3], q[1] + 3); });
    return b;
  }
  var spBox = lineBox(spLine), cpBox = lineBox(cpLine);
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
  function stonePathDist(x, z) { return Math.min(lineDist(spLine, spBox, x, z), lineDist(cpLine, cpBox, x, z)); }   // how far to the nearest stone path
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
  function onBridge(x, z) { return Math.abs(x - BRIDGE_X) < BRIDGE_W / 2 - 0.45 && z > BRIDGE_Z0 - 1 && z < BRIDGE_Z1 + 1; }
  function bridgeY(z) {                                               // the height of the walkway: level with the land at each end, arching up in the middle
    var t = Math.max(0, Math.min(1, (z - BRIDGE_Z0) / (BRIDGE_Z1 - BRIDGE_Z0)));
    return 0.06 + Math.sin(t * Math.PI) * BRIDGE_RISE;
  }
  function nearBridgeLanding(x, z, r) { return Math.abs(x - BRIDGE_X) < 3.6 + r && z > BRIDGE_Z0 - 6 - r; } // keep the way onto the bridge clear
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
  }
  function walkable(x, z) { return islandR(x, z) < ISLAND - 1.5 || onBridge(x, z) || onIsle2(x, z, 1.5); } // your island, the bridge, or the new island

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
    if (!indoors || inShop || inClinic) return;
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
  function inRoom(x, z) { return inClinic ? inClinicRoom(x, z) : inShop ? inShopRoom(x, z) : Math.abs(x - IN_X) < ROOM_W / 2 - 0.35 && Math.abs(z - IN_Z) < ROOM_D / 2 - 0.35; }
  function useDoor(goIn, toShop) {                                   // toShop: true for the seed shop's door, 'clinic' for the clinic's, or nothing for the farmhouse's
    if (doorBusy) return;
    doorBusy = true;
    doorArmed = false;
    walkTarget = null;
    doorSound();
    fadeBox.style.opacity = 1;
    setTimeout(function () {
      var leftShop = inShop, leftClinic = inClinic;
      indoors = goIn;
      inShop = goIn && toShop === true;
      inClinic = goIn && toShop === 'clinic';
      if (goIn) {
        if (inClinic) {
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
        cam.dist = inShop || inClinic ? 8.5 : 7.5; cam.pitch = 0.85; cam.yaw = 0;
      } else {
        scene.add(player);
        if (leftClinic) {
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
    var d = indoors ? (inShop || inClinic ? 99 : dist(px, pz, IN_X, IN_Z + EXIT_Z)) : dist(px, pz, OUT_DOOR_X, OUT_DOOR_Z);
    if (!doorArmed) { if (Math.min(d, dShop, dClinic) > 0.85) doorArmed = true; return; }  // you have to step away before a door works again
    if (d < 0.5) useDoor(!indoors);
    else if (dShop < (indoors ? 0.5 : 0.22)) useDoor(!indoors, true);   // outside, you have to climb right up to the shop door
    else if (dClinic < (indoors ? 0.5 : 0.22)) useDoor(!indoors, 'clinic');
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
    setTimeout(function () {
      wakeNextMorning();                                               // well rested: full mana and stamina, at 6 am
      setTimeout(function () {
        fadeBox.style.opacity = 0;
        showToast('Good morning! ☀ Day ' + state.day, 2600);
        setTimeout(function () { fadeBox.style.transition = 'opacity 0.35s'; sleeping = false; }, 900);
      }, 1200);
    }, 1000);
  }
  // ---------- Stamina ----------
  // Swinging tools and watering use stamina. Run out and you collapse, waking up at home the next morning.
  // Sleeping fills it back up, and eating a moonbloom gives you some back (never more than MAX_STAMINA)
  var passingOut = false, tiredWarned = false;
  function useStamina(n) {
    state.stamina = Math.max(0, state.stamina - n);
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
  function wakeNextMorning() {                                        // shared by sleeping and collapsing
    if (state.minutes >= 6 * 60) state.day += 1;                      // wake at 6 am the next morning
    state.minutes = 6 * 60;                                            // (after midnight, it's 6 am that same morning)
    state.mana = MAX_MANA;
    state.stamina = MAX_STAMINA;
    tiredWarned = false;
    updateClock(0);
  }
  function passOut() {                                                // out of stamina: everything goes dark and you wake up at home
    if (passingOut || sleeping) return;
    passingOut = sleeping = true;
    walkTarget = null; keys = {};
    if (binOpen) closeBin();
    if (shopOpen) closeShop();
    toggleBag(false);
    sleepSound();
    showToast('You\'re exhausted… 💫', 1800);
    fadeBox.style.transition = 'opacity 1.2s';
    fadeBox.style.opacity = 1;
    setTimeout(function () {
      if (!indoors) outsideCam = { dist: cam.dist, pitch: cam.pitch, yaw: cam.yaw };
      indoors = true; inShop = false; inClinic = false;                 // carried home, next to your bed
      interiorScene.add(player);
      player.position.set(IN_X + BX - BED_W / 2 - 0.55, 0, IN_Z + MZ);
      facing = -Math.PI / 2;
      cam.dist = 7.5; cam.pitch = 0.85; cam.yaw = 0;
      cam.target.set(player.position.x, 0.8, player.position.z);
      doorArmed = false;
      wakeNextMorning();
      setTimeout(function () {
        fadeBox.style.opacity = 0;
        showToast('You collapsed and woke up at home. ☀ Day ' + state.day, 3000);
        setTimeout(function () { fadeBox.style.transition = 'opacity 0.35s'; sleeping = passingOut = false; }, 1300);
      }, 1500);
    }, 1400);
  }
  function updateStamina() {
    if (ui.stamina) ui.stamina.style.width = (state.stamina / MAX_STAMINA * 100).toFixed(1) + '%';
    var stText = Math.ceil(state.stamina - 0.001) + ' / ' + MAX_STAMINA;
    if (ui.staminaNum && ui.staminaNum.textContent !== stText) ui.staminaNum.textContent = stText;
    if (state.stamina <= 0 && !passingOut && !sleeping) passOut();
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
  clinicScene.add(new THREE.HemisphereLight(0xfffaf2, 0x8c9488, 0.66));
  var ciSun = new THREE.DirectionalLight(0xfff0dc, 0.5);               // daylight slanting in through the windows
  ciSun.position.set(CIN_X - 6, 8, CIN_Z + 5);
  ciSun.target.position.set(CIN_X + 1, 0, CIN_Z - 0.5);
  ciSun.castShadow = true;
  ciSun.shadow.mapSize.set(2048, 2048);
  ciSun.shadow.camera.left = -8; ciSun.shadow.camera.right = 8; ciSun.shadow.camera.top = 7; ciSun.shadow.camera.bottom = -7;
  ciSun.shadow.camera.near = 1; ciSun.shadow.camera.far = 25;
  ciSun.shadow.bias = -0.0006; ciSun.shadow.normalBias = 0.02;
  clinicScene.add(ciSun); clinicScene.add(ciSun.target);
  var ciLamp = new THREE.PointLight(0xfff4e6, 0.5, 13);                // the ceiling lights
  ciLamp.position.set(CIN_X - 2.4, 3.1, CIN_Z + 0.6);
  clinicScene.add(ciLamp);
  var ciLamp2 = new THREE.PointLight(0xfff4e6, 0.5, 13);
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
  var ciFloorTex = paintTexture(512, 512, function (g, w, h) {        // cream and pale mint vinyl tiles, with a soft speckle
    for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
      g.fillStyle = (r + c) % 2 ? '#cfe2d6' : '#f1ece0'; g.fillRect(c * 64, r * 64, 64, 64);
      var sh = g.createLinearGradient(c * 64, r * 64, c * 64 + 64, r * 64 + 64); sh.addColorStop(0, 'rgba(255,255,255,0.12)'); sh.addColorStop(1, 'rgba(0,0,0,0.04)');
      g.fillStyle = sh; g.fillRect(c * 64, r * 64, 64, 64);
    }
    for (var i = 0; i < 5000; i++) { g.fillStyle = 'rgba(' + (isle2Hash(i) > 0.5 ? '90,100,90' : '255,255,255') + ',' + isle2Hash(i * 1.3) * 0.18 + ')'; g.fillRect(isle2Hash(i * 2.1) * w, isle2Hash(i * 3.7) * h, 1.5, 1.5); }
    g.strokeStyle = 'rgba(120,130,120,0.35)'; g.lineWidth = 1.2;
    for (var k = 0; k <= 8; k++) { g.beginPath(); g.moveTo(k * 64, 0); g.lineTo(k * 64, h); g.moveTo(0, k * 64); g.lineTo(w, k * 64); g.stroke(); }
  });
  ciFloorTex.wrapS = ciFloorTex.wrapT = THREE.RepeatWrapping; ciFloorTex.repeat.set(CIN_W / 3.2, CIN_D / 3.2);
  ciFloorTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  var ciBeadTex = paintTexture(256, 64, function (g, w, h) {          // mint beadboard: narrow tongue-and-groove boards
    for (var x = 0; x < w; x += 16) {
      var bg = g.createLinearGradient(x, 0, x + 16, 0); bg.addColorStop(0, '#9fc7b4'); bg.addColorStop(0.2, '#b9dccb'); bg.addColorStop(0.85, '#b2d6c4'); bg.addColorStop(1, '#8fb8a5');
      g.fillStyle = bg; g.fillRect(x, 0, 16, h);
      g.fillStyle = 'rgba(40,70,60,0.35)'; g.fillRect(x, 0, 1.5, h);
    }
  });
  ciBeadTex.wrapS = THREE.RepeatWrapping;
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
    floor: new THREE.MeshStandardMaterial({ map: ciFloorTex, roughness: 0.4, metalness: 0.02 }),
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
    var plasterMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95 });
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
    ciPart(new THREE.ShapeGeometry(shape), plasterMat, 0, 0, 0, 0, 0, 0, wgp);
    var beadTex = ciBeadTex.clone(); beadTex.needsUpdate = true; beadTex.repeat.set(len / 1.4, 1);
    ciPart(new THREE.BoxGeometry(len, 1.0, 0.025), new THREE.MeshStandardMaterial({ map: beadTex, roughness: 0.6 }), 0, 0.5, 0.0125, 0, 0, 0, wgp);
    ciPart(new THREE.BoxGeometry(len, 0.06, 0.06), CI.white, 0, 1.02, 0.03, 0, 0, 0, wgp);                                // the chair rail
    ciPart(new THREE.BoxGeometry(len, 0.13, 0.045), CI.white, 0, 0.065, 0.035, 0, 0, 0, wgp);                             // the skirting
    ciPart(new THREE.BoxGeometry(len, 0.09, 0.07), CI.white, 0, CIN_H - 0.045, 0.035, 0, 0, 0, wgp);                      // the cornice
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
  // a hanging "Reception" sign above the desk
  var ciRecTex = paintTexture(256, 64, function (g, w, h) {
    g.fillStyle = '#2f6f68'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#c9a24a'; g.lineWidth = 3; g.strokeRect(5, 5, w - 10, h - 10);
    g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 30px Georgia, serif'; g.fillText('Reception', w / 2, h / 2 + 2);
  });
  ciPart(new THREE.BoxGeometry(1.0, 0.25, 0.03), new THREE.MeshStandardMaterial({ map: ciRecTex, roughness: 0.6 }), RCP_X, 2.55, RCP_Z + 0.1);
  [-0.4, 0.4].forEach(function (sx) { ciPart(new THREE.CylinderGeometry(0.004, 0.004, CIN_H - 2.68, 4), CI.brass, RCP_X + sx, (CIN_H + 2.68) / 2, RCP_Z + 0.1); });
  // filing cabinets under the back window, with binders and a tray of letters on top
  [-3.25, -1.95].forEach(function (fx) {
    ciPart(new THREE.BoxGeometry(1.2, 0.86, 0.5), CI.white, fx, 0.43, CNW + 0.27);
    [0.24, 0.62].forEach(function (dy) {
      ciPart(new THREE.BoxGeometry(1.12, 0.34, 0.02), CI.mint, fx, dy, CNW + 0.53);
      ciPart(new THREE.BoxGeometry(0.22, 0.03, 0.03), CI.brass, fx, dy + 0.1, CNW + 0.555);
      ciPart(new THREE.BoxGeometry(0.12, 0.05, 0.005), CI.paper, fx, dy + 0.02, CNW + 0.545);
    });
  });
  for (var bd = 0; bd < 11; bd++) {
    var bw = 0.065 + isle2Hash(bd * 3.3) * 0.02, bh = 0.28 + isle2Hash(bd * 1.7) * 0.05;
    ciPart(new THREE.BoxGeometry(bw, bh, 0.26), [CI.teal, CI.coral, CI.mint, CI.white, CI.tealVinyl][bd % 5], -3.75 + bd * 0.08, 0.86 + bh / 2, CNW + 0.24, 0, 0, bd === 10 ? 0.25 : 0);
  }
  ciPart(new THREE.BoxGeometry(0.36, 0.06, 0.28), CI.wood, -1.7, 0.89, CNW + 0.26);
  ciPart(new THREE.BoxGeometry(0.3, 0.02, 0.22), CI.paper, -1.7, 0.92, CNW + 0.26);
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
  // a cabinet of tonics between the back windows: a cupboard below and a glass-fronted cabinet of glowing bottles above
  var MC_Z = CNW;
  ciPart(new THREE.BoxGeometry(1.3, 0.88, 0.5), CI.white, 0, 0.44, MC_Z + 0.25);
  [-0.32, 0.32].forEach(function (dx) { ciPart(new THREE.BoxGeometry(0.6, 0.74, 0.02), CI.mint, dx, 0.44, MC_Z + 0.51); ciPart(new THREE.BoxGeometry(0.02, 0.12, 0.03), CI.brass, dx * 0.2, 0.6, MC_Z + 0.53); });
  ciPart(new THREE.BoxGeometry(1.36, 0.04, 0.54), CI.wood, 0, 0.9, MC_Z + 0.27);
  ciPart(new THREE.BoxGeometry(1.2, 1.3, 0.32), CI.white, 0, 1.95, MC_Z + 0.16);
  ciPart(new THREE.BoxGeometry(1.1, 1.2, 0.02), new THREE.MeshStandardMaterial({ color: 0xe8f0ec, roughness: 0.8 }), 0, 1.95, MC_Z + 0.02);
  var ciTonics = [];
  [1.42, 1.85, 2.28].forEach(function (shy, k) {
    ciPart(new THREE.BoxGeometry(1.1, 0.02, 0.28), CI.white, 0, shy - 0.02, MC_Z + 0.16);
    for (var b = 0; b < 6; b++) {
      var bx = -0.45 + b * 0.18 + (isle2Hash(b + k * 7) - 0.5) * 0.04, bh = 0.14 + isle2Hash(b * 3 + k) * 0.1, col = [0xc89aff, 0x7ad0b0, 0xff9ab8, 0x8ac8ff, 0xffd27a][(b + k) % 5];
      var tm = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.5, roughness: 0.15, transparent: true, opacity: 0.88 });
      ciTonics.push(tm);
      ciPart(b % 3 ? new THREE.CylinderGeometry(0.045, 0.05, bh, 14) : new THREE.SphereGeometry(0.06, 14, 10), tm, bx, shy + (b % 3 ? bh / 2 : 0.06), MC_Z + 0.16);
      ciPart(new THREE.CylinderGeometry(0.018, 0.022, 0.04, 8), CI.wood, bx, shy + (b % 3 ? bh : 0.11) + 0.02, MC_Z + 0.16);
    }
  });
  [-0.3, 0.3].forEach(function (dx) {                                  // the glass doors in white frames
    ciPart(new THREE.PlaneGeometry(0.54, 1.18), CI.glass, dx, 1.95, MC_Z + 0.33).renderOrder = 2;
    [[0, 0.6, 0.58, 0.04], [0, -0.6, 0.58, 0.04], [-0.28, 0, 0.04, 1.2], [0.28, 0, 0.04, 1.2]].forEach(function (f) { ciPart(new THREE.BoxGeometry(f[2], f[3], 0.03), CI.white, dx + f[0], 1.95 + f[1], MC_Z + 0.33); });
    ciPart(new THREE.SphereGeometry(0.018, 8, 6), CI.brass, dx * 0.15, 1.95, MC_Z + 0.355);
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

  // ---------- The seed shop: step up to the counter inside to buy seeds with Star Coins ----------
  var SEED_COST = 10;
  function shopFront(d) { return { x: SHOP_X + Math.sin(SHOP_TURN) * (SHOP_HD + d), z: SHOP_Z + Math.cos(SHOP_TURN) * (SHOP_HD + d) }; }
  var shopDoor = shopFront(0.12);
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
  var MAP_X0 = -47, MAP_X1 = 47, MAP_Z0 = -42, MAP_Z1 = 168, MAP_S = 6;   // the area it covers, and how many pixels per step
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
    function land(x, z) { return islandR(x, z) < ISLAND || onIsle2(x, z, 0); }
    for (var py = 0; py < bh; py++) for (var px = 0; px < bw; px++) {
      var x = MAP_X0 + (px + 0.5) / BS, z = MAP_Z0 + (py + 0.5) / BS, c, i = (py * bw + px) * 4;
      var main = islandR(x, z) < ISLAND, isle = onIsle2(x, z, 0), br = Math.abs(x - BRIDGE_X) < BRIDGE_W / 2 + 0.3 && z > BRIDGE_Z0 - 1.5 && z < BRIDGE_Z1 + 1.5;
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
        if (isle && !onIsle2(x, z, 1.2)) c = [96, 156, 82];
        if (isle && stonePathDist(x, z) < SP_W) c = (Math.floor(x * 1.6) + Math.floor(z * 1.6)) % 2 ? [222, 214, 198] : [206, 198, 184];   // the stone path to the shop
      } else if (br) {
        c = Math.abs(x - BRIDGE_X) > BRIDGE_W / 2 - 0.15 ? [170, 160, 150] : [210, 200, 186];  // railings and paving
        if (Math.abs(x - BRIDGE_X) <= BRIDGE_W / 2 - 0.15 && (Math.floor(z * 1.5) % 2 === 0)) c = [200, 190, 176];
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
    for (var bl = BRIDGE_Z0 + 6; bl < BRIDGE_Z1 - 3; bl += 9) { [-1, 1].forEach(function (sd) { var lp = mapXY(BRIDGE_X + sd * (BRIDGE_W / 2 + 0.9), bl); var lg = g.createRadialGradient(lp[0], lp[1], 1, lp[0], lp[1], 12); lg.addColorStop(0, 'rgba(200,150,255,0.95)'); lg.addColorStop(1, 'rgba(200,150,255,0)'); g.fillStyle = lg; g.fillRect(lp[0] - 12, lp[1] - 12, 24, 24); }); }
    label('Bridge', BRIDGE_X + 7, (BRIDGE_Z0 + BRIDGE_Z1) / 2, 0);
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
    if (indoors) you = inClinic ? clinicFront(1.5) : inShop ? shopFront(1.5) : { x: OUT_DOOR_X, z: OUT_DOOR_Z + 1 };
    var yp = mapXY(you.x, you.z), fa = indoors ? (inClinic ? CLINIC_TURN : inShop ? SHOP_TURN : 0) : facing, pulse = 1 + Math.sin(Date.now() / 250) * 0.15;
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
    { name: 'Everdawn Clinic', icon: '🩺', spot: function () { var f = clinicFront(2.6); return { x: f.x, z: f.z, face: CLINIC_TURN + Math.PI, view: CLINIC_TURN }; } }
  ];
  var teleporting = false;
  var tpBtn = document.createElement('button');
  tpBtn.type = 'button'; tpBtn.id = 'btnTeleport'; tpBtn.innerHTML = 'Teleport <kbd>T</kbd>';
  if (ui.btnSpell && ui.btnSpell.parentNode) ui.btnSpell.parentNode.insertBefore(tpBtn, ui.btnSpell.nextSibling);
  function openTeleport() {                                           // the world map, with its teleport pins
    if (teleporting || sleeping || doorBusy) return;
    if (binOpen) closeBin(); if (shopOpen) closeShop();
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
        indoors = false; inShop = false; inClinic = false;
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
    if (binOpen || shopOpen) return;                                  // a tap while a menu is open doesn't walk you away from it
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
        var rx0 = inClinic ? CIN_X : inShop ? SIN_X : IN_X, rz0 = inClinic ? CIN_Z : inShop ? SIN_Z : IN_Z;
        var hw = (inClinic ? CIN_W : inShop ? SIN_W : ROOM_W) / 2 - 0.35, hd = (inClinic ? CIN_D : inShop ? SIN_D : ROOM_D) / 2 - 0.35;
        player.position.x = Math.max(rx0 - hw, Math.min(rx0 + hw, player.position.x));
        player.position.z = Math.max(rz0 - hd, Math.min(rz0 + hd, player.position.z));
        (inClinic ? ciSolids : inShop ? shopInSolids : inSolids).forEach(function (o) {
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
    var footY = indoors ? 0 : onDock(player.position.x, player.position.z) ? DOCK_Y : onBridge(player.position.x, player.position.z) ? Math.max(groundHeight(player.position.x, player.position.z), bridgeY(player.position.z)) : groundHeight(player.position.x, player.position.z) + porchHeight(player.position.x, player.position.z) + shopStepHeight(player.position.x, player.position.z) + clinicStepHeight(player.position.x, player.position.z); // up the porch, shop and clinic steps, and over the bridge
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
    updateBridge(state.time, night);
    updateInterior(dt, state.time);
    updateCrops(dt, night);
    updateWorld(dt, night);
    updateEffects(dt);
    updateCamera(dt);
    updateClinicInterior(state.time);
    if (inShop) { camera.updateMatrixWorld(); drawShopView(); }
    if (inClinic) { camera.updateMatrixWorld(); drawClinicView(); }
    renderer.render(indoors ? (inClinic ? clinicScene : inShop ? shopScene : interiorScene) : scene, camera); // inside the house, the shop or the clinic, only that room is drawn
  }
  renderer.setAnimationLoop(frame);

}
