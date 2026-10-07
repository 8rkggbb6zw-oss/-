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
  var GAME_MINUTES_PER_SECOND = 8; // one in-game day = 3 real minutes

  var state = { mana: MAX_MANA, harvest: 0, coins: 0, time: 0, minutes: 6 * 60, day: 1, inTreeZone: false };

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
  scene.add(sea);

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
  var dawnGlowTex = dawnPaint(64, 64, function (g) {
    var grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.45)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  });
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
  var glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 64;
  var gctx = glowCanvas.getContext('2d');
  var grad = gctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.4)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  gctx.fillStyle = grad;
  gctx.fillRect(0, 0, 64, 64);
  var glowTexture = new THREE.CanvasTexture(glowCanvas);

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

  // Sparkles that drift up from the fish (one shared pool, drawn in a single go)
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
        for (var b = 0; b < 18; b++) sparkle(p.x, WATER_Y + 0.05, p.z, f.kind.glow, 1.3, 0.9);
      }
      if (f.jump >= 0) {
        f.jump += dt / 1.1;
        y += Math.sin(Math.PI * Math.min(f.jump, 1)) * 0.7;
        pitch = Math.cos(Math.PI * Math.min(f.jump, 1)) * 0.9;
        if (f.jump >= 1) {
          f.jump = -1;
          f.jumpIn = 6 + Math.random() * 8;
          ripple(p.x, p.z, 0xffffff, 1.1, 1.2);
          for (var b2 = 0; b2 < 24; b2++) sparkle(p.x, WATER_Y + 0.05, p.z, f.kind.glow, 1.5, 1.1);
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

      // An occasional sparkle drifting up from the tail
      f.sparkIn -= dt;
      if (f.sparkIn <= 0) {
        f.sparkIn = 0.15 + Math.random() * 0.2;
        var back = -FISH_LEN * 0.6;
        sparkle(p.x + Math.cos(g.rotation.y) * back, y + 0.05, p.z - Math.sin(g.rotation.y) * back, f.kind.glow, 0.12, 0.3);
      }
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
  var leafBatch = foliageBatch(new THREE.PlaneGeometry(1, 1), leafTex, 28000);
  var sprayGeo = new THREE.PlaneGeometry(1, 1);
  sprayGeo.rotateX(-Math.PI / 2);
  sprayGeo.translate(0.5, 0, 0); // the spray starts at the trunk and reaches outward
  var needleBatch = foliageBatch(sprayGeo, needleTex, 18000);
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
    hPart(new THREE.BoxGeometry(wide, top + 0.2, z1 - z0), 'stone', 0, (top - 0.2) / 2, (z0 + z1) / 2);
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
  // wisps of green steam curling up out of the pot
  var brewSteam = [];
  for (var bs = 0; bs < 6; bs++) {
    var wisp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xb8ffd0, transparent: true, opacity: 0, depthWrite: false }));
    houseLive.add(wisp);
    brewSteam.push({ s: wisp, t: bs / 6, a: bs * 1.1 });
  }

  // lavender smoke curling out of the chimney
  var smoke = [];
  for (var sm = 0; sm < 7; sm++) {
    var puff = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xbfa8f0, transparent: true, opacity: 0, depthWrite: false }));
    houseLive.add(puff);
    smoke.push({ s: puff, t: sm / 7 });
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

  // You bump into the house, the tower and the cauldron
  function houseToWorld(lx, lz) {
    var c = Math.cos(HOUSE_TURN), s = Math.sin(HOUSE_TURN);
    return { x: HOUSE_X + lx * c + lz * s, z: HOUSE_Z - lx * s + lz * c };
  }
  var houseBumps = [[TX, TZ, TR + 0.2], [CX, CZ, 0.55], [-0.95, FRONT + 1.1, 0.12], [0.95, FRONT + 1.1, 0.12]];
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
    brewGlow.material.opacity = 0.12 + night * 0.4 + Math.sin(t * 3) * 0.05;          // a soft glow by day, brighter at night
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
      w.t += dt * 0.28;
      if (w.t > 1) w.t -= 1;
      var k = w.t;
      w.s.position.set(CX + Math.sin(k * 4 + w.a) * 0.18, 0.95 + k * 1.3, CZ + Math.cos(k * 3 + w.a) * 0.18);
      w.s.scale.setScalar(0.25 + k * 0.6);
      w.s.material.opacity = Math.sin(k * Math.PI) * 0.32;
    });
    smoke.forEach(function (p) {                                                       // puffs drift up, grow and fade
      p.t += dt * 0.16;
      if (p.t > 1) p.t -= 1;
      var k = p.t;
      p.s.position.set(CHIM_TOP.x + Math.sin(k * 5 + p.t) * 0.25 + k * 0.6, CHIM_TOP.y + k * 2.6, CHIM_TOP.z + Math.cos(k * 4) * 0.15);
      p.s.scale.setScalar(0.4 + k * 1.3);
      p.s.material.opacity = Math.min(1, k * 6) * (1 - k) * 0.8;
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
    if (!indoors) return;
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
  function inRoom(x, z) { return Math.abs(x - IN_X) < ROOM_W / 2 - 0.35 && Math.abs(z - IN_Z) < ROOM_D / 2 - 0.35; }
  function useDoor(goIn) {
    if (doorBusy) return;
    doorBusy = true;
    doorArmed = false;
    walkTarget = null;
    doorSound();
    fadeBox.style.opacity = 1;
    setTimeout(function () {
      indoors = goIn;
      if (goIn) {
        interiorScene.add(player);
        player.position.set(IN_X, 0, IN_Z + EXIT_Z - 1.0);
        facing = Math.PI;                                           // facing into the room
        outsideCam = { dist: cam.dist, pitch: cam.pitch, yaw: cam.yaw };
        cam.dist = 7.5; cam.pitch = 0.85; cam.yaw = 0;
      } else {
        scene.add(player);
        player.position.set(OUT_DOOR_X, 0, OUT_DOOR_Z + 1.0);
        facing = 0;                                                 // facing out, away from the door
        if (outsideCam) { cam.dist = outsideCam.dist; cam.pitch = outsideCam.pitch; cam.yaw = outsideCam.yaw; }
      }
      cam.target.set(player.position.x, 0.8, player.position.z);   // jump the camera straight there
      fadeBox.style.opacity = 0;
      setTimeout(function () { doorBusy = false; }, 380);
    }, 380);
  }
  function updateDoors() {
    var px = player.position.x, pz = player.position.z;
    var d = indoors ? dist(px, pz, IN_X, IN_Z + EXIT_Z) : dist(px, pz, OUT_DOOR_X, OUT_DOOR_Z);
    if (!doorArmed) { if (d > 0.85) doorArmed = true; return; }  // you have to step away before the door works again
    if (d < 0.5) useDoor(!indoors);
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
      if (state.minutes >= 6 * 60) state.day += 1;                    // wake at 6 am the next morning
      state.minutes = 6 * 60;                                          // (fall asleep after midnight and it's 6 am that same morning)
      state.mana = MAX_MANA;                                           // well rested: full mana
      updateClock(0);
      setTimeout(function () {
        fadeBox.style.opacity = 0;
        showToast('Good morning! ☀ Day ' + state.day, 2600);
        setTimeout(function () { fadeBox.style.transition = 'opacity 0.35s'; sleeping = false; }, 900);
      }, 1200);
    }, 1000);
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
  var TILL_FINDS = ['stone', 'fiber', 'sap', 'acorn', 'pinecone', 'coal', 'hay', 'wood', 'seed'];
  var swingTile = null, tilling = [];
  function tillTile(tile) {
    if (swingT < SWING_TIME) return; // still mid-swing
    swingT = 0;
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
        if (!addItem(L.item, L.amount)) continue;
        popSound();
        showToast('+' + L.amount + ' ' + ITEMS[L.item].name + ' ' + ITEMS[L.item].icon);
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

  // Trees, bushes and rocks that happen to stand on the path are cleared away for good, so it's open all the way
  allScenery.forEach(function (t) {
    var u = t.userData;
    if (pathDist(u.solid.x, u.solid.z) > PATH_W + 0.35 + u.solidR * 0.7) return;
    u.gone = true; u.state = 'gone'; u.solid.r = 0;
    setTreeGrowth(t, 0);
  });
  mineable.forEach(function (r) {
    if (pathDist(r.x, r.z) > PATH_W + 0.3 + r.size * 0.6) return;
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
  var flyGlowCanvas = document.createElement('canvas');
  flyGlowCanvas.width = flyGlowCanvas.height = 64;
  (function (g) {
    var grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.2, 'rgba(255,255,255,0.6)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.15)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  })(flyGlowCanvas.getContext('2d'));
  var flyGlowTex = new THREE.CanvasTexture(flyGlowCanvas);
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
    var nearTree = treeInReach();
    if (nearTree && heldItem() === 'axe') { chopTree(nearTree); return; }
    var nearRock = heldItem() === 'pickaxe' ? rockInReach() : null;
    if (nearRock) { mineRock(nearRock); return; }
    var nearBush = heldItem() === 'trimmers' ? bushInReach() : null;
    if (nearBush) { trimBush(nearBush); return; }
    var tile = targetTile();
    if (!tile) {
      if (nearTree) return;
      if (state.inTreeZone && state.petalDay !== state.day && addItem('petal', 1)) {
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
      scene.remove(tile.crop);
      scene.remove(tile.drop);
      tile.crop = null;
      setWet(tile, false);
      state.harvest += 1;
      addItem('bloom', 1);
      addItem('seed', 2);
      burst(tile.x, 0.8, tile.z, 0xffb3e6, 22, 3, 3, -4);
      popSound();
      showToast('+1 Moonbloom 🌸  +2 Seeds 🌱');
    } else if (!tile.wet) {
      setWet(tile, true);
      burst(tile.x, 1.2, tile.z, 0x7cc7ff, 14, 1, 0.5, -6);
      waterSound();
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
    seed: { name: 'Moonbloom Seed', price: 5, icon: '🌱', img: iconSeed(), info: 'Plant one in tilled garden soil and water it every day. After 4 watered days it blooms. Every harvest gives you two seeds back.' },
    bloom: { name: 'Moonbloom', price: 60, icon: '🌸', img: iconBloom(), info: 'A glowing flower grown in your garden.' },
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
      : 'Tap an item to see what it is.';
    updateSellRow();
  }

  // ---------- Star Coins: the island's money. Sell things from your bag to earn them ----------
  var coinUi = document.createElement('div');                  // the coin counter in the top bar, next to the clock
  coinUi.className = 'stat coins';
  coinUi.title = 'Star Coins';
  coinUi.innerHTML = '<img class="coin-icon" alt=""> <b id="coins">0</b>';
  var statsBar = document.querySelector('.stats');
  if (statsBar) statsBar.insertBefore(coinUi, statsBar.firstChild);
  var coinCount = coinUi.querySelector('b');
  function showCoins(bump) {
    coinCount.textContent = state.coins;
    if (bump) { coinUi.classList.remove('bump'); void coinUi.offsetWidth; coinUi.classList.add('bump'); } // a little hop when you earn some
  }
  var sellRow = document.createElement('div');                 // under the item's description in the bag
  sellRow.className = 'sell-row';
  sellRow.innerHTML = '<button type="button" class="sell-btn" data-n="1"></button><button type="button" class="sell-btn" data-n="all"></button>';
  if (bagUi.box) bagUi.box.appendChild(sellRow);
  var sellOne = sellRow.children[0], sellAll = sellRow.children[1];
  function updateSellRow() {
    if (!sellRow) return;                                        // (the bag can be drawn before this part is set up)
    var it = bag[selectedSlot], price = it && !isTool(it.id) ? ITEMS[it.id].price : 0;
    sellRow.hidden = !price;                                   // tools can't be sold
    if (!price) return;
    sellOne.innerHTML = 'Sell 1 · <img class="coin-icon" alt=""> ' + price;
    sellAll.innerHTML = 'Sell all ' + it.count + ' · <img class="coin-icon" alt=""> ' + price * it.count;
    sellAll.hidden = it.count < 2;
    paintCoinIcons(sellRow);
  }
  function isTool(id) { return id === 'axe' || id === 'pickaxe' || id === 'trimmers' || id === 'hoe'; }
  function sellSelected(all) {
    var it = bag[selectedSlot];
    if (!it || isTool(it.id) || !ITEMS[it.id].price) return;   // never sell your tools
    var n = all ? it.count : 1, earned = ITEMS[it.id].price * n, name = ITEMS[it.id].name;
    if (!takeItem(it.id, n)) return;
    state.coins += earned;
    showCoins(true);
    coinSound(n);
    showToast('Sold ' + n + ' ' + name + ' for ' + earned + ' Star Coins ✦');
  }
  sellOne.addEventListener('click', function () { sellSelected(false); });
  sellAll.addEventListener('click', function () { sellSelected(true); });
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
    for (var ci = 0; ci < imgs.length; ci++) imgs[ci].src = coinPicture;
  }
  paintCoinIcons(coinUi);
  showCoins(false);
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
  function toggleBag(open) {
    if (!bagUi.box) return;
    bagUi.box.hidden = open === undefined ? !bagUi.box.hidden : !open;
    if (!bagUi.box.hidden) renderBag();
  }
  if (bagUi.open) bagUi.open.addEventListener('click', function () { toggleBag(); });
  if (bagUi.close) bagUi.close.addEventListener('click', function () { toggleBag(false); focusGame(); });
  renderBag();

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
    var rect = canvas.getBoundingClientRect();
    var ndc = new THREE.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    var hit = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(ground, hit)) return;
    if (indoors ? !inRoom(hit.x, hit.z) : !onIsland(hit.x, hit.z)) return;
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

      if (indoors) { // inside the farmhouse: stay between the walls and bump into the furniture
        var hw = ROOM_W / 2 - 0.35, hd = ROOM_D / 2 - 0.35;
        player.position.x = Math.max(IN_X - hw, Math.min(IN_X + hw, player.position.x));
        player.position.z = Math.max(IN_Z - hd, Math.min(IN_Z + hd, player.position.z));
        inSolids.forEach(function (o) {
          var dx = player.position.x - (IN_X + o[0]), dz = player.position.z - (IN_Z + o[1]);
          var d = Math.hypot(dx, dz), min = o[2] + 0.35;
          if (d < min && d > 0.0001) {
            player.position.x = IN_X + o[0] + dx / d * min;
            player.position.z = IN_Z + o[1] + dz / d * min;
          }
        });
      } else {
      var fromCenter = islandR(player.position.x, player.position.z);
      if (fromCenter > ISLAND - 1.5) player.position.multiplyScalar((ISLAND - 1.5) / fromCenter); // stay on the island
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
    player.position.y = indoors ? 0 : onDock(player.position.x, player.position.z) ? DOCK_Y : groundHeight(player.position.x, player.position.z) + porchHeight(player.position.x, player.position.z); // up the porch steps
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
    var data = {
      v: 1,
      state: { mana: state.mana, harvest: state.harvest, coins: state.coins, minutes: state.minutes, day: state.day, petalDay: state.petalDay },
      bag: bag, selectedSlot: selectedSlot, hotRow: hotRow,
      player: { x: px, z: pz, facing: facing },
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
    state.minutes = data.state.minutes; state.day = data.state.day; state.petalDay = data.state.petalDay;
    state.coins = data.state.coins || 0; showCoins(false);
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
    updateInterior(dt, state.time);
    updateCrops(dt, night);
    updateWorld(dt, night);
    updateEffects(dt);
    updateCamera(dt);
    renderer.render(indoors ? interiorScene : scene, camera); // inside the house, only the room is drawn
  }
  renderer.setAnimationLoop(frame);

}
