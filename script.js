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
  var choppable = [];
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
  // Remember every tree's own trunk, branches and leaves inside the shared batches
  choppable.forEach(function (t) {
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
    var hx = u.base.x - Math.sin(facing) * 0.3, hz = u.base.z - Math.cos(facing) * 0.3;
    burst(hx, 0.7, hz, 0xd2a86e, 12, 2.6, 1.8, -7);                // wood chips
    burst(u.base.x, 2.6 * u.size, u.base.z, 0x6aa84f, 6, 1.6, 0.2, -1.2); // a few leaves shaken loose
    if (u.hits < CHOPS_TO_FELL) {
      u.shudderT = 0;
      return;
    }
    // Timber! Swap the standing tree for a copy that tips over, away from you
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
  var sapMat = new THREE.MeshStandardMaterial({ color: 0xf0a030, emissive: 0xd07a10, emissiveIntensity: 0.35, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.9 });
  var sapGeo = new THREE.SphereGeometry(0.11, 16, 12);
  (function () { // pull the top of the ball up into a droplet point
    var pp = sapGeo.attributes.position;
    for (var i = 0; i < pp.count; i++) {
      var y = pp.getY(i);
      if (y > 0) { var k = y / 0.11; pp.setXYZ(i, pp.getX(i) * (1 - k * 0.75), y + k * k * 0.12, pp.getZ(i) * (1 - k * 0.75)); }
    }
    sapGeo.computeVertexNormals();
  })();
  var nutMat = new THREE.MeshStandardMaterial({ color: 0xc07a3a, roughness: 0.5 });
  var capMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2b, roughness: 0.95 });
  var coneMat = new THREE.MeshStandardMaterial({ color: 0x8a5530, roughness: 0.85 });
  function pickupModel(item) {
    var g = new THREE.Group(), m;
    if (item === 'wood') {
      m = new THREE.Mesh(logGeo, logMats);
      m.rotation.order = 'YXZ';
      m.rotation.x = Math.random() * Math.PI;  // roll, so the bark looks different on each
      m.rotation.z = 0.12;                      // a slight tilt, like a floating pickup
      g.add(m);
    } else if (item === 'sap') {
      g.add(new THREE.Mesh(sapGeo, sapMat));
    } else if (item === 'acorn') {
      m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), nutMat);
      m.scale.set(1, 1.35, 1);
      g.add(m);
      var cap = new THREE.Mesh(new THREE.SphereGeometry(0.125, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
      cap.position.y = 0.07;
      cap.scale.set(1, 0.7, 1);
      g.add(cap);
      var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.06, 6), capMat);
      stem.position.y = 0.17;
      g.add(stem);
    } else if (item === 'stone') {
      m = new THREE.Mesh(boulderGeos[2], stoneMat);
      m.scale.set(0.15, 0.12, 0.13);
      g.add(m);
    } else if (item === 'coal') {
      m = new THREE.Mesh(coalGeo, coalMat);
      m.rotation.set(0.4, 0.3, 0.2);
      g.add(m);
    } else if (item === 'pinecone') { // rings of woody scales getting smaller toward the tip
      for (var r = 0; r < 6; r++) {
        var f = r / 5, rad = 0.06 + Math.sin((f * 0.85 + 0.1) * Math.PI) * 0.07;
        for (var k = 0; k < 7; k++) {
          var sc = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), coneMat);
          var a = (k / 7) * Math.PI * 2 + r * 0.45;
          sc.position.set(Math.cos(a) * rad, -0.12 + f * 0.26, Math.sin(a) * rad);
          sc.scale.set(1.2, 0.55, 1);
          sc.lookAt(sc.position.x * 3, sc.position.y + 0.3, sc.position.z * 3);
          g.add(sc);
        }
      }
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.26, 8), coneMat));
    }
    g.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
    return g;
  }
  var coalGeo = new THREE.IcosahedronGeometry(0.13, 0);
  coalGeo.scale(1, 0.8, 0.9);
  var coalMat = new THREE.MeshStandardMaterial({ color: 0x26262c, roughness: 0.35, metalness: 0.35, flatShading: true });
  var PICKUP_GLOW = { wood: 0xffe6a8, sap: 0xffc060, acorn: 0xffe6a8, pinecone: 0xffe6a8, stone: 0xe6eeff, coal: 0xffb070 };
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
          if (o.isMesh && o.geometry !== logGeo && o.geometry !== sapGeo && o.geometry !== coalGeo && boulderGeos.indexOf(o.geometry) < 0) o.geometry.dispose();
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
    var hx = r.x - Math.sin(facing) * r.size * 0.5, hz = r.z - Math.cos(facing) * r.size * 0.5;
    burst(hx, r.y + r.size * 0.4, hz, 0xa9a49a, 12, 2.6, 2, -8);  // stone chips
    burst(hx, r.y + r.size * 0.4, hz, 0xfff1c4, 4, 2, 1.5, -4);   // a few sparks
    if (r.hits < HITS_TO_BREAK) { r.shakeT = 0; return; }
    // Crumble! The rock bursts into rubble and sparkles, leaving stone (and maybe coal) behind
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
    }
    if (swingTree && before < IMPACT && swingT >= IMPACT) { axeHits(swingTree); swingTree = null; }
    if (swingRock && before < IMPACT && swingT >= IMPACT) { pickHits(swingRock); swingRock = null; }
    updateRocks(dt);
    choppable.forEach(function (t) {
      var u = t.userData;
      if (u.state === 'standing' && u.shudderT !== undefined) { // a quick shudder after each hit
        u.shudderT += dt;
        var sh = u.shudderT < 0.45 ? Math.sin(u.shudderT * 38) * 0.035 * Math.exp(-u.shudderT * 7) : 0;
        setTreeTilt(t, sh, Math.sin(facing), Math.cos(facing));
        if (u.shudderT >= 0.45) u.shudderT = undefined;
      }
      if (u.state === 'falling') {
        u.fallT += dt;
        var FALL = 1.6, flat = Math.PI / 2 - 0.05, angle;
        if (u.fallT < FALL) angle = Math.pow(u.fallT / FALL, 2.4) * flat; // slow at first, then faster and faster
        else {
          var tb = u.fallT - FALL;                                          // a little bounce as it lands
          angle = flat - 0.1 * Math.exp(-tb * 5) * Math.abs(Math.sin(tb * 12));
          if (!u.landed) {
            u.landed = true;
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
    var holding = heldItem() === 'axe' || heldItem() === 'pickaxe';
    axeArm.visible = holding;
    axeHeadGrp.visible = heldItem() === 'axe';
    pickHeadGrp.visible = heldItem() === 'pickaxe';
    var REST = 5.23, UP = 2.35, HIT = 4.75;            // arm angles: carrying, raised up behind you, striking forward over the top
    var armX = REST, armZ = 0, twist = 0, lean = 0, squash = 0, sw = swingT;
    function easeOut(k) { return 1 - (1 - k) * (1 - k); }
    function easeIn(k) { return k * k * k; }
    if (holding && sw < SWING_TIME) {
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
    if (tile.soil) tile.soil.material = wet ? M.soilWet : M.soilDry;
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
  axeArm.position.set(-0.27, 0.68, 0.02);
  body.add(axeArm);
  var sleeve = new THREE.CylinderGeometry(0.075, 0.09, 0.32, 10);
  sleeve.translate(0, -0.16, 0);
  place(new THREE.Mesh(sleeve, M.robe), 0, 0, 0, axeArm);
  place(new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), M.skin), 0, -0.34, 0, axeArm);  // hand
  var handleGeo = new THREE.CylinderGeometry(0.024, 0.03, 0.62, 8);
  handleGeo.translate(0, -0.31, 0);
  place(new THREE.Mesh(handleGeo, new THREE.MeshStandardMaterial({ color: 0x8a5a34, roughness: 0.8 })), 0, -0.3, 0, axeArm);
  var axeMetal = new THREE.MeshStandardMaterial({ color: 0xc9ced6, metalness: 0.7, roughness: 0.35 });
  var axeHeadGrp = new THREE.Group(), pickHeadGrp = new THREE.Group();
  axeArm.add(axeHeadGrp);
  axeArm.add(pickHeadGrp);
  place(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.16), axeMetal), 0, -0.84, -0.07, axeHeadGrp);    // axe head
  place(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.06), axeMetal), 0, -0.84, -0.17, axeHeadGrp);    // its sharp edge
  // pickaxe head: a curved metal bar with a point at each end
  var pickMetal = new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: 0.75, roughness: 0.35 });
  place(new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.1), pickMetal), 0, -0.84, 0, pickHeadGrp);
  [-1, 1].forEach(function (side) {
    var spike = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.3, 8), pickMetal);
    spike.rotation.x = side * (Math.PI / 2 + 0.35); // curving back toward the handle
    place(spike, 0, -0.81, side * 0.18, pickHeadGrp);
  });
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
      tile.soil = place(new THREE.Mesh(soilGeo, M.soilDry), tile.x, 0.06, tile.z);
      burst(tile.x, 0.3, tile.z, 0xb07d55, 10, 2, 1.6, -4);
    } else if (!tile.crop) {
      if (!takeItem('seed', 1)) return;
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
    var watered = 0;
    tiles.forEach(function (t) {
      if (t.crop && t.stage < 3 && !t.wet) {
        setWet(t, true);
        launchSparks(t, 16, watered * 0.12); // sparkles float over and settle onto this crop
        watered += 1;
      }
    });
    if (!watered) launchSparks(null, 30, 0); // nothing to water: the sparkles just shimmer up around you
  }

  // ---------- Bag (inventory) ----------
  var ITEMS = {
    seed: { name: 'Moonbloom Seed', icon: '🌱', info: 'Plant one in tilled garden soil. Every harvest gives you two seeds back.' },
    bloom: { name: 'Moonbloom', icon: '🌸', info: 'A glowing flower grown in your garden.' },
    petal: { name: 'Dawn Petal', icon: '🌺', info: 'A shimmering petal from the Dawn Tree. It gives you one each day.' },
    axe: { name: 'Axe', icon: '🪓', info: 'Select it in your hotbar, then press Interact next to a tree. Ten chops fell a tree.' },
    wood: { name: 'Wood', icon: '🪵', info: 'Chopped from trees. Every tree drops logs worth 15 wood; walk into them to pick them up.' },
    pickaxe: { name: 'Pickaxe', icon: '⛏️', info: 'Select it in your hotbar, then press Interact next to a rock. Ten hits break a rock.' },
    stone: { name: 'Stone', icon: '🪨', info: 'Broken from rocks. Bigger rocks give more.' },
    coal: { name: 'Coal', icon: '⚫', img: iconCoal(), info: 'Rocks have a 40% chance of dropping a lump of coal.' },
    sap: { name: 'Sap', icon: '🍯', img: iconSap(), info: 'Sticky golden sap. Every tree drops 3.' },
    acorn: { name: 'Acorn', icon: '🌰', img: iconAcorn(), info: 'Dropped by leafy trees.' },
    pinecone: { name: 'Pinecone', icon: '🌲', img: iconPinecone(), info: 'Dropped by pine trees.' }
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
      var grad = g.createRadialGradient(26, 38, 2, 32, 40, 20);
      grad.addColorStop(0, '#e2a35e'); grad.addColorStop(1, '#9a5b26');
      g.fillStyle = grad;
      g.beginPath(); g.ellipse(32, 40, 14, 18, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#6b4a2b';
      g.beginPath(); g.ellipse(32, 26, 18, 10, 0, Math.PI, 0); g.lineTo(50, 28); g.quadraticCurveTo(32, 34, 14, 28); g.fill();
      g.strokeStyle = 'rgba(40,25,10,0.5)'; g.lineWidth = 1.5;
      for (var i = 0; i < 5; i++) { g.beginPath(); g.moveTo(17 + i * 7, 18); g.lineTo(20 + i * 7, 30); g.stroke(); }
      g.strokeStyle = '#5a3a1e'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(32, 16); g.lineTo(34, 7); g.stroke();
    });
  }
  function iconPinecone() {
    return iconCanvas(function (g) {
      for (var row = 0; row < 6; row++) {
        var y = 12 + row * 8, w = 8 + Math.sin((row + 0.5) / 6 * Math.PI) * 12;
        for (var k = -1; k <= 1; k++) {
          g.fillStyle = row % 2 ? '#8a5530' : '#a8683a';
          g.beginPath(); g.ellipse(32 + k * w * 0.6, y, w * 0.45, 6, 0, 0, Math.PI * 2); g.fill();
          g.strokeStyle = 'rgba(50,28,12,0.6)'; g.lineWidth = 1.2; g.stroke();
        }
      }
    });
  }
  var BAG_SLOTS = 12;
  var bag = [{ id: 'seed', count: 6 }, { id: 'axe', count: 1 }, { id: 'pickaxe', count: 1 }]; // you start with a few seeds and an axe
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
    for (var i = 0; i < bag.length; i++) if (bag[i].id === id) return bag[i].count;
    return 0;
  }
  // Adds items to the bag; returns false if there's no room for a new kind of item
  function addItem(id, n) {
    for (var i = 0; i < bag.length; i++) {
      if (bag[i].id === id) { bag[i].count += n; renderBag(); return true; }
    }
    if (bag.length >= BAG_SLOTS) return false;
    bag.push({ id: id, count: n });
    renderBag();
    return true;
  }
  // Takes items out of the bag; returns false if you don't have enough
  function takeItem(id, n) {
    for (var i = 0; i < bag.length; i++) {
      if (bag[i].id === id && bag[i].count >= n) {
        bag[i].count -= n;
        if (bag[i].count === 0) { // that slot is now empty: the items after it move up one
          bag.splice(i, 1);
          if (selectedSlot === i) selectedSlot = -1;
          else if (selectedSlot > i) selectedSlot--;
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
  // One slot button, for the bag or the hotbar
  function makeSlot(i, onPick) {
    var slot = document.createElement('button');
    slot.type = 'button';
    slot.className = 'slot' + (bag[i] ? '' : ' empty') + (i === selectedSlot ? ' selected' : '');
    if (bag[i]) {
      if (ITEMS[bag[i].id].img) {
        var pic = document.createElement('img');
        pic.src = ITEMS[bag[i].id].img;
        pic.alt = '';
        pic.style.width = '70%';
        pic.style.pointerEvents = 'none';
        slot.appendChild(pic);
      } else slot.textContent = ITEMS[bag[i].id].icon;
      slot.setAttribute('aria-label', ITEMS[bag[i].id].name + ', ' + bag[i].count);
      var count = document.createElement('span');
      count.className = 'count';
      count.textContent = bag[i].count;
      slot.appendChild(count);
      slot.onclick = function () { selectedSlot = i; renderBag(); if (onPick) onPick(i); };
    } else {
      slot.setAttribute('aria-label', 'Empty slot');
    }
    return slot;
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
    state.mana = Math.min(MAX_MANA, state.mana + (inZone ? 32 : 1.5) * dt);
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
