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
    harvest: document.getElementById('harvest'),
    clock: document.getElementById('clock'),
    day: document.getElementById('day'),
    mana: document.getElementById('mana'),
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
  var MAX_MANA = 100, SPELL_COST = 35;
  var STAGE_TIME = 6;              // seconds per growth stage while watered
  var SPEED = 4.4;
  var GAME_MINUTES_PER_SECOND = 8; // one in-game day = 3 real minutes

  var state = { mana: MAX_MANA, harvest: 0, time: 0, minutes: 6 * 60, day: 1, inTreeZone: false };

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

  // How far a point is from the nearest worn path (start → dock, start → Dawn Tree), a little wobbly
  function pathDist(x, z) {
    var hx = FARM_X, hz = FARM_Z + 5;
    return Math.min(segDist(x, z, hx, hz, dockStart.x, dockStart.z), segDist(x, z, hx, hz, TREE_X, TREE_Z)) + noise(x * 1.3, z * 1.3) * 0.18;
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
  place(new THREE.Mesh(new THREE.BoxGeometry(COLS * TILE + 0.8, 0.04, ROWS * TILE + 0.8), M.garden), FARM_X, 0.01, FARM_Z);

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
      var x = Math.random() * w, y = Math.random() * h, len = 30 + Math.random() * 90;
      g.strokeStyle = Math.random() < 0.55 ? 'rgba(45,22,48,0.55)' : 'rgba(205,165,205,0.3)';
      g.lineWidth = 1 + Math.random() * 3;
      g.beginPath();
      g.moveTo(x, y);
      g.bezierCurveTo(x + 6, y + len * 0.33, x - 6, y + len * 0.66, x + (Math.random() - 0.5) * 6, y + len);
      g.stroke();
    }
  });
  var dawnVeins = dawnPaint(128, 256, function (g, w, h) {
    g.fillStyle = '#000';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#fff';
    g.shadowColor = '#fff';
    g.shadowBlur = 6;
    for (var i = 0; i < 6; i++) { // glowing magic veins winding up the bark
      var x = Math.random() * w;
      g.lineWidth = 1.5 + Math.random() * 2;
      g.beginPath();
      g.moveTo(x, h);
      for (var y = h; y > -16; y -= 16) { x += (Math.random() - 0.5) * 16; g.lineTo(x, y); }
      g.stroke();
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
  var BLADES = 3000, OUTER_BLADES = 9000;
  var grass = new THREE.InstancedMesh(tuftGeometry(), grassMat, BLADES + OUTER_BLADES);
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
  for (var pb = 0; pb < 3000 && pebbleCount < PEBBLES; pb++) {
    var q1 = Math.sin(pb * 91.7) * 43758.5453, q2 = Math.sin(pb * 47.3) * 22578.1459, q3 = Math.sin(pb * 13.1) * 9631.73;
    q1 -= Math.floor(q1); q2 -= Math.floor(q2); q3 -= Math.floor(q3);
    var pX = -17 + q1 * 34, pZ = -17 + q2 * 34;
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
        falls: falls, mesh: pc.entry.mesh, vStart: vs, vCount: vc,
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
    setTreeTransform(t, treeM);
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
  var ridgeGeo = new THREE.CylinderGeometry(0.07, 0.07, TILE * 0.82, 8, 1, false, 0, Math.PI);
  ridgeGeo.rotateZ(Math.PI / 2);
  ridgeGeo.rotateX(-Math.PI / 2); // a half-round ridge lying across the plot
  function tillTile(tile) {
    if (swingT < SWING_TIME) return; // still mid-swing
    swingT = 0;
    swingTile = tile;
    facing = Math.atan2(tile.x - player.position.x, tile.z - player.position.z);
  }
  // The hoe bites into the ground: the turf flips over into a mound of soil with furrows
  function hoeHits(tile) {
    if (tile.soil) return;
    tile.soil = place(new THREE.Mesh(soilGeo, M.soilDry), tile.x, 0.06, tile.z);
    tile.ridges = [];
    for (var r = 0; r < 3; r++) { // three furrows, raised one after another
      var ridge = place(new THREE.Mesh(ridgeGeo, M.soilDry), 0, 0.06, (r - 1) * TILE * 0.28, tile.soil);
      ridge.scale.set(1, 0.001, 1);
      tile.ridges.push(ridge);
    }
    tile.soil.scale.set(0.6, 0.05, 0.6);
    tile.tillT = 0;
    tilling.push(tile);
    burst(tile.x, 0.2, tile.z, 0x8a5a36, 16, 2.6, 2.2, -8); // clods of earth
    burst(tile.x, 0.2, tile.z, 0x6aa84f, 8, 2, 1.8, -7);    // bits of turf
    if (Math.random() < TILL_FIND_CHANCE) { // dug something up!
      var find = TILL_FINDS[Math.floor(Math.random() * TILL_FINDS.length)];
      dropPickup(find, 1, tile.x + (Math.random() - 0.5) * 0.4, tile.z + (Math.random() - 0.5) * 0.4, 0.12, 0.35);
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
    } else if (item === 'petal') { // a curled, shimmering Dawn Petal
      m = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), petalMat);
      m.scale.set(1, 0.25, 0.65);
      m.rotation.z = 0.4;
      g.add(m);
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
  }  // Trimming sounds: a crisp "snip-snick" of the shears with a rustle of leaves, and a big leafy whoosh when the bush is cleared
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
  }  // Spell sounds: a sparkly magical shimmer when you cast, and a soft chime as the sparkles land on each crop
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
  }  // Mana sounds: soft twinkles that climb higher as the Dawn Tree fills your mana, and a bright chord when it's full
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
  var tiles = [];
  for (var row = 0; row < ROWS; row++) {
    for (var col = 0; col < COLS; col++) {
      tiles.push({
        x: FARM_X + (col - (COLS - 1) / 2) * TILE,
        z: FARM_Z + (row - (ROWS - 1) / 2) * TILE,
        soil: null, crop: null, drop: null, stage: 0, growth: 0, wet: false
      });
    }
  }
  function tileAt(x, z) {
    var c = Math.round((x - FARM_X) / TILE + (COLS - 1) / 2);
    var r = Math.round((z - FARM_Z) / TILE + (ROWS - 1) / 2);
    return (c >= 0 && c < COLS && r >= 0 && r < ROWS) ? tiles[r * COLS + c] : null;
  }

  var soilGeo = new THREE.BoxGeometry(TILE * 0.9, 0.12, TILE * 0.9);
  var stemGeo = new THREE.CylinderGeometry(0.035, 0.05, 1, 6);
  stemGeo.translate(0, 0.5, 0);
  var ballGeo = new THREE.SphereGeometry(0.1, 10, 8);
  var dropGeo = new THREE.SphereGeometry(0.08, 10, 8);

  function makeCrop(tile) {
    var crop = new THREE.Group();
    var stem = place(new THREE.Mesh(stemGeo, M.stem), 0, 0, 0, crop);
    var leaves = new THREE.Group();
    place(new THREE.Mesh(ballGeo, M.leaf), -0.13, 0, 0, leaves).scale.set(1.6, 0.4, 0.8);
    place(new THREE.Mesh(ballGeo, M.leaf), 0.13, 0, 0, leaves).scale.set(1.6, 0.4, 0.8);
    crop.add(leaves);
    var bud = place(new THREE.Mesh(ballGeo, M.bud), 0, 0, 0, crop);
    var bloom = new THREE.Group();
    for (var i = 0; i < 5; i++) {
      var a = (i / 5) * Math.PI * 2;
      var p = place(new THREE.Mesh(ballGeo, M.petal), Math.cos(a) * 0.12, 0, Math.sin(a) * 0.12, bloom);
      p.scale.set(1.25, 0.4, 0.75);
      p.rotation.set(0, -a, 0.35);
    }
    place(new THREE.Mesh(ballGeo, M.center), 0, 0, 0, bloom).scale.setScalar(0.7);
    crop.add(bloom);
    crop.userData = { stem: stem, leaves: leaves, bud: bud, bloom: bloom };
    crop.position.set(tile.x, 0.12, tile.z);
    crop.rotation.y = Math.random() * Math.PI * 2;
    scene.add(crop);
    return crop;
  }

  function showStage(tile) {
    var parts = tile.crop.userData, s = tile.stage;
    var h = [0.16, 0.36, 0.55, 0.7][s];
    parts.stem.scale.y = h;
    parts.leaves.position.y = h * 0.45;
    parts.leaves.scale.setScalar([0.55, 1, 1.15, 1.25][s]);
    parts.bud.visible = s === 2;
    parts.bud.position.y = h;
    parts.bloom.visible = s === 3;
    parts.bloom.position.y = h;
  }

  function setWet(tile, wet) {
    tile.wet = wet;
    if (tile.soil) tile.soil.traverse(function (o) { if (o.isMesh) o.material = wet ? M.soilWet : M.soilDry; });
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
  player.position.set(FARM_X, 0, FARM_Z + 5);
  scene.add(player);
  var facing = Math.PI; // looking toward the garden
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
    } else if (tile.stage === 3) {
      scene.remove(tile.crop);
      scene.remove(tile.drop);
      tile.crop = null;
      setWet(tile, false);
      state.harvest += 1;
      ui.harvest.textContent = state.harvest;
      addItem('bloom', 1);
      addItem('seed', 2);
      burst(tile.x, 0.8, tile.z, 0xffb3e6, 22, 3, 3, -4);
      popSound();
      showToast('+1 Moonbloom 🌸  +2 Seeds 🌱');
    } else if (!tile.wet) {
      setWet(tile, true);
      burst(tile.x, 1.2, tile.z, 0x7cc7ff, 14, 1, 0.5, -6);
    }
  }

  function castSpell() {
    if (state.mana < SPELL_COST) return;
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
    seed: { name: 'Moonbloom Seed', icon: '🌱', img: iconSeed(), info: 'Plant one in tilled garden soil. Every harvest gives you two seeds back.' },
    bloom: { name: 'Moonbloom', icon: '🌸', img: iconBloom(), info: 'A glowing flower grown in your garden.' },
    petal: { name: 'Dawn Petal', icon: '🌺', info: 'A shimmering petal from the Dawn Tree. It gives you one each day.' },
    axe: { name: 'Axe', icon: '🪓', img: iconAxe(), fill: 94, info: 'Select it in your hotbar, then press Interact next to a tree. Ten chops fell a tree.' },
    wood: { name: 'Wood', icon: '🪵', info: 'Chopped from trees. Every tree drops logs worth 15 wood; walk into them to pick them up.' },
    pickaxe: { name: 'Pickaxe', icon: '⛏️', img: iconPickaxe(), fill: 80, info: 'Select it in your hotbar, then press Interact next to a rock. Ten hits break a rock.' },
    hoe: { name: 'Hoe', icon: '🪏', img: iconHoe(), fill: 95, info: 'Select it in your hotbar, then press Interact on garden soil to till it. Sometimes you dig something up!' },
    trimmers: { name: 'Hedge Trimmers', icon: '✂️', img: iconTrimmers(), fill: 93, info: 'Select them in your hotbar, then press Interact next to a bush. Ten snips trim a bush.' },
    fiber: { name: 'Fiber', icon: '🌿', img: iconFiber(), fill: 92, info: 'Tough green strands trimmed from bushes.' },
    hay: { name: 'Hay', icon: '🌾', img: iconHay(), fill: 92, info: 'Bushes have a 50% chance of dropping a bundle of hay.' },
    stone: { name: 'Stone', icon: '🪨', info: 'Broken from rocks. Bigger rocks give more.' },
    coal: { name: 'Coal', icon: '⚫', img: iconCoal(), info: 'Rocks have a 40% chance of dropping a lump of coal.' },
    sap: { name: 'Sap', icon: '🍯', img: iconSap(), info: 'Sticky golden sap. Every tree drops 3.' },
    acorn: { name: 'Acorn', icon: '🌰', img: iconAcorn(), fill: 92, info: 'Dropped by leafy trees.' },
    pinecone: { name: 'Pinecone', icon: '🌲', img: iconPinecone(), fill: 92, info: 'Dropped by pine trees.' }
  };
  // Little drawn pictures for items that don't have a good emoji
  function iconCanvas(draw) {
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    draw(c.getContext('2d'));
    return c.toDataURL();
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
  }
  // One slot button, for the bag or the hotbar. Tap to select it; press and drag to move it to another slot
  function makeSlot(i, onPick) {
    var slot = document.createElement('button');
    slot.type = 'button';
    slot.className = 'slot' + (bag[i] ? '' : ' empty') + (i === selectedSlot ? ' selected' : '');
    slot.setAttribute('data-slot', i);
    if (bag[i]) {
      slot.appendChild(itemPicture(bag[i].id));
      slot.setAttribute('aria-label', ITEMS[bag[i].id].name + ', ' + bag[i].count);
      var count = document.createElement('span');
      count.className = 'count';
      count.textContent = bag[i].count;
      slot.appendChild(count);
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
      if (pinch > 0) cam.dist = THREE.MathUtils.clamp(cam.dist * pinch / d, 6, 26);
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
    if (!onIsland(hit.x, hit.z)) return;
    walkTarget = hit;
    ripple(hit.x, hit.z, 0xffffff, 0.6, 0.45);
  }

  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    cam.dist = THREE.MathUtils.clamp(cam.dist * (1 + e.deltaY * 0.001), 6, 26);
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
      // No walking on water: slide along the shore instead
      if (inLake(player.position.x, player.position.z)) {
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
    player.position.y = onDock(player.position.x, player.position.z) ? DOCK_Y : groundHeight(player.position.x, player.position.z);
    body.position.y = moving ? Math.abs(Math.sin(state.time * 11)) * 0.09 : body.position.y * 0.8;
    body.rotation.z = moving ? Math.sin(state.time * 11) * 0.06 : body.rotation.z * 0.8;
    hatStar.rotation.y += dt * 2;
  }

  function updateCrops(dt, night) {
    tiles.forEach(function (tile) {
      if (!tile.crop) return;
      if (tile.wet && tile.stage < 3) {
        tile.growth += dt / STAGE_TIME;
        if (tile.growth >= 1) {
          tile.stage += 1;
          tile.growth = 0;
          showStage(tile);
          burst(tile.x, 0.7, tile.z, tile.stage === 3 ? 0xffb3e6 : 0x9be08a, tile.stage === 3 ? 14 : 6, 1.2, 1.6, -2);
          if (tile.stage < 3) setWet(tile, false); // thirsty again
        }
      }
      tile.crop.rotation.z = Math.sin(state.time * 1.6 + tile.x * 1.3 + tile.z) * 0.05;
      tile.drop.visible = !tile.wet && tile.stage < 3;
      tile.drop.position.y = 1 + Math.sin(state.time * 3 + tile.x) * 0.08;
    });
    M.petal.emissiveIntensity = 0.3 + night * 0.6 + Math.sin(state.time * 3) * 0.1;
  }

  function updateWorld(dt, night) {
    var t = state.time;

    // Dawn Tree glow and mana
    var pulse = 0.5 + Math.sin(t * 2) * 0.5;
    updateDawnTree(dt, t, night, pulse);
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

  var clock = new THREE.Clock();
  cam.target.set(player.position.x, 0.8, player.position.z);

  function frame() {
    var dt = Math.min(clock.getDelta(), 0.05);
    state.time += dt;
    updateClock(dt);
    var night = updateSky();
    updatePlayer(dt);
    updateCrops(dt, night);
    updateWorld(dt, night);
    updateEffects(dt);
    updateCamera(dt);
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(frame);

}
