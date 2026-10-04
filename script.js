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
  var WALK_R = 16;
  var TREE_X = -7, TREE_Z = -8, TREE_ZONE = 3;
  var LAKE_X = -7, LAKE_Z = 6.5, LAKE_R = 8.5;
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

  // ---------- Renderer, scene, camera ----------
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9fd8ff);
  scene.fog = new THREE.Fog(0x9fd8ff, 32, 75);

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
  sun.shadow.mapSize.set(1024, 1024);
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
    grass: mat(0x9be08a), cliff: mat(0xc9a27e), garden: mat(0xc5e89a), sand: mat(0xf3dfb0),
    soilDry: mat(0xb07d55), soilWet: mat(0x6b4630),
    stem: mat(0x5cb85c), leaf: mat(0x7ed37a), bud: mat(0xf7a8d8), pad: mat(0x6cc46a),
    petal: mat(0xffb3e6, 0xff6fcf, 0.35), center: mat(0xffe27a, 0xffc94d, 0.4),
    robe: mat(0xb48cff), skin: mat(0xffe0c7), hat: mat(0x7b4fd6), eye: mat(0x3b2b55),
    star: mat(0xffd75e, 0xffb64d, 0.8), drop: mat(0x7cc7ff, 0x3d9bff, 0.5),
    trunk: mat(0x8a5a8c), canopy: mat(0xffc3f2, 0xff7fd8, 0.45),
    rock: mat(0xb9b3d6), bush: mat(0x86cf8a)
  };

  // ---------- Island ----------
  var island = place(new THREE.Mesh(new THREE.CylinderGeometry(18, 15.5, 2.4, 64), M.grass), 0, -1.2, 0);
  island.castShadow = false;
  place(new THREE.Mesh(new THREE.CylinderGeometry(15.6, 4, 6, 64, 1, true), M.cliff), 0, -5.4, 0);
  var sea = new THREE.Mesh(new THREE.CircleGeometry(90, 64),
    new THREE.MeshStandardMaterial({ color: 0x8fd3ff, transparent: true, opacity: 0.85, roughness: 0.3 }));
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -1.4;
  scene.add(sea);
  place(new THREE.Mesh(new THREE.BoxGeometry(COLS * TILE + 0.8, 0.04, ROWS * TILE + 0.8), M.garden), FARM_X, 0.01, FARM_Z);

  var solids = []; // things you bump into: {x, z, r}

  // ---------- The glowing Dawn Tree ----------
  var tree = new THREE.Group();
  tree.position.set(TREE_X, 0, TREE_Z);
  place(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 2.8, 10), M.trunk), 0, 1.4, 0, tree);
  var canopyGeo = new THREE.IcosahedronGeometry(1, 1);
  [[0, 3.6, 0, 1.7], [-1.1, 3.0, 0.5, 1.15], [1.1, 3.1, -0.3, 1.2], [0.2, 4.5, 0.4, 1.1]].forEach(function (c) {
    place(new THREE.Mesh(canopyGeo, M.canopy), c[0], c[1], c[2], tree).scale.setScalar(c[3]);
  });
  var treeLight = new THREE.PointLight(0xffa8ee, 1.2, 12, 2);
  treeLight.position.set(0, 3.4, 0);
  tree.add(treeLight);
  var treeRing = new THREE.Mesh(new THREE.RingGeometry(TREE_ZONE - 0.35, TREE_ZONE, 64),
    new THREE.MeshBasicMaterial({ color: 0xffb3f0, transparent: true, opacity: 0.5, depthWrite: false }));
  treeRing.rotation.x = -Math.PI / 2;
  treeRing.position.y = 0.03;
  tree.add(treeRing);
  scene.add(tree);
  solids.push({ x: TREE_X, z: TREE_Z, r: 0.8 });

  // ---------- The lake ----------
  function lakeRadius(a) { return LAKE_R * (1 + 0.08 * Math.sin(3 * a) + 0.04 * Math.sin(5 * a + 1)); }
  // A point on the lake's edge (pushed out by `extra`), kept on the island
  function lakeEdge(a, extra, limit) {
    var r = lakeRadius(a) + extra;
    var x = Math.cos(a) * r, z = -Math.sin(a) * r;
    var wx = LAKE_X + x, wz = LAKE_Z + z, wd = Math.sqrt(wx * wx + wz * wz);
    if (wd > limit) { x = wx * limit / wd - LAKE_X; z = wz * limit / wd - LAKE_Z; }
    return { x: x, z: z };
  }
  // A random spot inside the water, between `inner` and `outer` (0 = middle, 1 = shore)
  function lakeSpot(inner, outer) {
    var e = lakeEdge(rand() * Math.PI * 2, 0, 16.7), f = inner + rand() * (outer - inner);
    return { x: e.x * f, z: e.z * f };
  }
  function lakeGeometry(extra, limit) {
    var shape = new THREE.Shape();
    for (var i = 0; i <= 96; i++) {
      var p = lakeEdge((i / 96) * Math.PI * 2, extra, limit);
      if (i === 0) shape.moveTo(p.x, -p.z);
      else shape.lineTo(p.x, -p.z);
    }
    var g = new THREE.ShapeGeometry(shape);
    g.rotateX(-Math.PI / 2); // lay it flat on the ground
    return g;
  }
  // Water surface: rings from the middle out to the shore, each point knows how deep it is
  function waterGeometry() {
    var RINGS = 14, SEG = 96, pos = [0, 0, 0], depth = [1], idx = [];
    for (var r = 1; r <= RINGS; r++) {
      for (var s = 0; s < SEG; s++) {
        var e = lakeEdge((s / SEG) * Math.PI * 2, 0, 16.7), f = r / RINGS;
        pos.push(e.x * f, 0, e.z * f);
        depth.push(1 - f);
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

  // The wooden dock points from the shore toward where you start
  var DOCK_A = Math.atan2(-((FARM_Z + 5) - LAKE_Z), FARM_X - LAKE_X);
  var DOCK_LEN = 4.6, DOCK_W = 1.5;
  var dockIn = { x: -Math.cos(DOCK_A), z: Math.sin(DOCK_A) }; // direction out over the water
  var dockStart = {
    x: LAKE_X + Math.cos(DOCK_A) * (lakeRadius(DOCK_A) + 0.8),
    z: LAKE_Z - Math.sin(DOCK_A) * (lakeRadius(DOCK_A) + 0.8)
  };
  function onDock(x, z) {
    var rx = x - dockStart.x, rz = z - dockStart.z;
    var along = rx * dockIn.x + rz * dockIn.z, across = -rx * dockIn.z + rz * dockIn.x;
    return along > -0.2 && along < DOCK_LEN && Math.abs(across) < DOCK_W / 2;
  }
  function nearDock(a) {
    var d = Math.abs(Math.atan2(Math.sin(a - DOCK_A), Math.cos(a - DOCK_A)));
    return d < 0.3;
  }
  function inLake(x, z) {
    if (onDock(x, z)) return false;
    var lx = x - LAKE_X, lz = z - LAKE_Z;
    return Math.sqrt(lx * lx + lz * lz) < lakeRadius(Math.atan2(-lz, lx)) - 0.3;
  }
  function nearLake(x, z) {
    var lx = x - LAKE_X, lz = z - LAKE_Z;
    return Math.sqrt(lx * lx + lz * lz) < lakeRadius(Math.atan2(-lz, lx)) + 1.5;
  }

  var lake = new THREE.Group();
  lake.position.set(LAKE_X, 0, LAKE_Z);
  // Mossy bank and the lake bed under the water
  place(new THREE.Mesh(lakeGeometry(0.9, 17.4), mat(0x76b862)), 0, 0.012, 0, lake).castShadow = false;
  place(new THREE.Mesh(lakeGeometry(0, 16.7), mat(0x3f7470)), 0, 0.02, 0, lake).castShadow = false;

  // Water: shallow teal at the edges, deep blue in the middle, with moving shimmer
  var waterUniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    uTime: { value: 0 },
    uNight: { value: 0 },
    uShallow: { value: new THREE.Color(0x5cc3cf) },
    uDeep: { value: new THREE.Color(0x1d5d8c) }
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
      'varying float vDepth;',
      'varying vec3 vWorld;',
      '#include <fog_pars_fragment>',
      'void main() {',
      '  float d = smoothstep(0.0, 0.7, vDepth);',
      '  vec3 col = mix(uShallow, uDeep, d);',
      '  vec2 p = vWorld.xz;',
      '  float w = sin(p.x * 1.7 + uTime * 0.8) + sin(p.y * 2.1 - uTime * 0.6)',
      '          + sin((p.x + p.y) * 1.3 + uTime * 1.1) + sin((p.x - p.y) * 2.7 - uTime * 0.9);',
      '  col += vec3(0.55, 0.8, 0.85) * smoothstep(2.3, 3.4, w) * 0.3 * (1.0 - d * 0.4);',
      '  col = mix(col, vec3(0.85, 0.96, 0.96), smoothstep(0.07, 0.0, vDepth) * 0.55);',
      '  col *= mix(1.0, 0.35, uNight);',
      '  gl_FragColor = vec4(col, mix(0.55, 0.92, d));',
      '  #include <fog_fragment>',
      '}'
    ].join('\n')
  });
  var water = new THREE.Mesh(waterGeometry(), waterMat);
  water.position.y = 0.12;
  water.renderOrder = 1;
  lake.add(water);

  // Rocks under the surface
  var boulderGeo = new THREE.IcosahedronGeometry(1, 1);
  var rockGeo = new THREE.DodecahedronGeometry(0.5, 0);
  var stoneMat = mat(0x9ea7b3), wetStoneMat = mat(0x5f8790);
  for (var ur = 0; ur < 12; ur++) {
    var us = lakeSpot(0.5, 0.85), usz = 0.6 + rand() * 0.9;
    var under = place(new THREE.Mesh(boulderGeo, wetStoneMat), us.x, 0.02, us.z, lake);
    under.scale.set(usz, 0.08, usz * (0.7 + rand() * 0.5));
    under.rotation.y = rand() * 3;
    under.castShadow = false;
  }

  // Big boulders out in the water
  [2.1, 3.2, 4.3].forEach(function (offset, i) {
    var e = lakeEdge(DOCK_A + offset, 0, 16.7), f = 0.45 + i * 0.12, size = 0.8 + rand() * 0.6;
    var big = place(new THREE.Mesh(boulderGeo, stoneMat), e.x * f, size * 0.2, e.z * f, lake);
    big.scale.set(size, size * 0.65, size * 0.85);
    big.rotation.y = rand() * 3;
    var small = place(new THREE.Mesh(boulderGeo, stoneMat), e.x * f + size * 0.9, 0.1, e.z * f + 0.3, lake);
    small.scale.set(size * 0.5, size * 0.3, size * 0.45);
  });

  // Rounded boulders all around the shore
  for (var sb = 0; sb < 34; sb++) {
    var sa = (sb / 34) * Math.PI * 2 + rand() * 0.12;
    if (nearDock(sa) || rand() < 0.3) continue; // leave gaps so it doesn't look like a necklace
    var se = lakeEdge(sa, -0.3 + rand() * 0.8, 16.9), ss = 0.3 + rand() * 0.6;
    var shoreRock = place(new THREE.Mesh(boulderGeo, stoneMat), se.x, ss * 0.1, se.z, lake);
    shoreRock.scale.set(ss, ss * 0.6, ss * (0.7 + rand() * 0.4));
    shoreRock.rotation.y = rand() * 3;
    solids.push({ x: LAKE_X + se.x, z: LAKE_Z + se.z, r: ss * 0.6 });
  }

  // Reeds in a few spots along the edge
  var reedGeo = new THREE.ConeGeometry(0.035, 0.9, 4);
  var reedMat = mat(0x4f7d3c), cattailMat = mat(0x7a4f2e);
  for (var rc = 0; rc < 9; rc++) {
    var ra0 = rand() * Math.PI * 2;
    if (nearDock(ra0)) continue;
    var re = lakeEdge(ra0, -0.15, 16.6);
    for (var rd = 0; rd < 7; rd++) {
      var reed = place(new THREE.Mesh(reedGeo, reedMat), re.x + (rand() - 0.5) * 0.6, 0.4, re.z + (rand() - 0.5) * 0.6, lake);
      reed.scale.y = 0.7 + rand() * 0.6;
      reed.rotation.set((rand() - 0.5) * 0.3, 0, (rand() - 0.5) * 0.3);
      if (rd % 3 === 0) {
        place(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.18, 6), cattailMat), 0, 0.35, 0, reed);
      }
    }
  }

  // Lily pads in clusters, a few with flowers
  var padGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.02, 18, 1, false, 0.4, Math.PI * 2 - 0.8);
  var padMat = mat(0x2f5e3c);
  var lotusPetal = new THREE.SphereGeometry(0.09, 10, 8);
  var lilyPads = [];
  for (var lc = 0; lc < 11; lc++) {
    var cs = lakeSpot(0.2, 0.8);
    var count = 3 + Math.floor(rand() * 4);
    for (var lpad = 0; lpad < count; lpad++) {
      var pad = place(new THREE.Mesh(padGeo, padMat), cs.x + (rand() - 0.5) * 1.4, 0.14, cs.z + (rand() - 0.5) * 1.4, lake);
      pad.scale.setScalar(0.6 + rand() * 0.7);
      pad.rotation.y = rand() * Math.PI * 2;
      pad.castShadow = false;
      lilyPads.push(pad);
      if (lc % 4 === 0 && lpad === 0) {
        for (var lp = 0; lp < 6; lp++) {
          var la = (lp / 6) * Math.PI * 2;
          var petal = place(new THREE.Mesh(lotusPetal, M.petal), Math.cos(la) * 0.09, 0.05, Math.sin(la) * 0.09, pad);
          petal.scale.set(1.3, 0.5, 0.7);
          petal.rotation.set(0, -la, 0.5);
        }
        place(new THREE.Mesh(lotusPetal, M.center), 0, 0.07, 0, pad).scale.setScalar(0.6);
      }
    }
  }

  // ---------- The dock ----------
  var dock = new THREE.Group();
  dock.position.set(dockStart.x, 0, dockStart.z);
  dock.rotation.y = Math.atan2(-dockIn.z, dockIn.x); // local x now points out over the water
  var plankGeo = new THREE.BoxGeometry(0.28, 0.06, DOCK_W);
  var woodMats = [mat(0xa8774f), mat(0x9a6a45), mat(0xb38457)];
  for (var pk = 0; pk * 0.31 < DOCK_LEN; pk++) {
    var plank = place(new THREE.Mesh(plankGeo, woodMats[pk % 3]), pk * 0.31 + 0.14, 0.27, (rand() - 0.5) * 0.04, dock);
    plank.rotation.y = (rand() - 0.5) * 0.03;
  }
  var beamGeo = new THREE.BoxGeometry(DOCK_LEN, 0.1, 0.1);
  place(new THREE.Mesh(beamGeo, mat(0x6e4a30)), DOCK_LEN / 2, 0.19, DOCK_W / 2 - 0.1, dock);
  place(new THREE.Mesh(beamGeo, mat(0x6e4a30)), DOCK_LEN / 2, 0.19, -DOCK_W / 2 + 0.1, dock);
  var postGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.8, 8);
  [0.5, 2.4, DOCK_LEN - 0.1].forEach(function (px) {
    place(new THREE.Mesh(postGeo, mat(0x6e4a30)), px, 0.05, DOCK_W / 2, dock);
    place(new THREE.Mesh(postGeo, mat(0x6e4a30)), px, 0.05, -DOCK_W / 2, dock);
  });
  scene.add(dock);

  scene.add(lake);
  var rippleTimer = 0;

  // ---------- Grass, rocks and bushes ----------
  function freeSpot(padding) {
    for (var i = 0; i < 60; i++) {
      var a = rand() * Math.PI * 2, r = 3 + rand() * (WALK_R - 2.5);
      var x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (Math.abs(x - FARM_X) < COLS * TILE / 2 + padding && Math.abs(z - FARM_Z) < ROWS * TILE / 2 + padding) continue;
      if (dist(x, z, TREE_X, TREE_Z) < TREE_ZONE + 0.8) continue;
      if (nearLake(x, z)) continue;
      if (dist(x, z, FARM_X, FARM_Z + 5) < 2) continue;
      return { x: x, z: z };
    }
    return null;
  }
  var bladeGeo = new THREE.ConeGeometry(0.08, 0.35, 4);
  for (var g = 0; g < 120; g++) {
    var spot = freeSpot(0.6);
    if (!spot) continue;
    for (var b = 0; b < 3; b++) {
      var blade = new THREE.Mesh(bladeGeo, M.stem);
      blade.position.set(spot.x + (b - 1) * 0.07, 0.15, spot.z);
      blade.rotation.z = (b - 1) * 0.35;
      scene.add(blade);
    }
  }
  for (var rk = 0; rk < 10; rk++) {
    var rs = freeSpot(1.2);
    if (!rs) continue;
    var size = 0.5 + rand() * 0.8;
    var rock = place(new THREE.Mesh(rockGeo, M.rock), rs.x, size * 0.2, rs.z);
    rock.scale.set(size, size * 0.7, size);
    rock.rotation.set(rand(), rand() * 3, rand());
    solids.push({ x: rs.x, z: rs.z, r: size * 0.5 });
  }
  var bushGeo = new THREE.IcosahedronGeometry(0.6, 1);
  for (var bu = 0; bu < 12; bu++) {
    var bs = freeSpot(1.2);
    if (!bs) continue;
    var bsize = 0.7 + rand() * 0.6;
    for (var k = 0; k < 3; k++) {
      place(new THREE.Mesh(bushGeo, M.bush), bs.x + (k - 1) * 0.4 * bsize, 0.35 * bsize, bs.z + (rand() - 0.5) * 0.5)
        .scale.setScalar(bsize * (0.7 + rand() * 0.5));
    }
    solids.push({ x: bs.x, z: bs.z, r: 0.9 * bsize });
  }

  // ---------- Sparkles round the tree, fireflies at night ----------
  function makePoints(count, color, size) {
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    var pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: color, size: size, transparent: true, depthWrite: false }));
    scene.add(pts);
    return pts;
  }
  var sparkles = makePoints(40, 0xfff1a8, 0.16);
  sparkles.position.set(TREE_X, 0, TREE_Z);
  var fireflies = makePoints(60, 0xfff3a0, 0.2);
  var flyHome = [];
  for (var f = 0; f < 60; f++) {
    var fa = rand() * Math.PI * 2, fr = rand() * WALK_R;
    flyHome.push({ x: Math.cos(fa) * fr, z: Math.sin(fa) * fr, y: 0.5 + rand() * 2.5, p: rand() * 10 });
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
    m.position.set(x, 0.16, z);
    scene.add(m);
    waves.push({ mesh: m, life: life, max: life, size: maxSize });
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
      showToast('☀ A new day begins: Day ' + state.day, 2500);
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
    var tile = targetTile();
    if (!tile) {
      if (state.inTreeZone) showToast('The Dawn Tree hums softly… your mana is restoring ✦');
      else if (nearLake(player.position.x, player.position.z)) showToast('The lake glimmers… a lotus drifts by 🪷');
      else showToast('Walk to the garden soil to farm 🌱');
      return;
    }
    if (!tile.soil) {
      tile.soil = place(new THREE.Mesh(soilGeo, M.soilDry), tile.x, 0.06, tile.z);
      burst(tile.x, 0.3, tile.z, 0xb07d55, 10, 2, 1.6, -4);
      showToast('Tilled the soil ⛏');
    } else if (!tile.crop) {
      tile.crop = makeCrop(tile);
      tile.stage = 0;
      tile.growth = 0;
      showStage(tile);
      tile.drop = place(new THREE.Mesh(dropGeo, M.drop), tile.x, 1, tile.z);
      burst(tile.x, 0.3, tile.z, 0x7ed37a, 8, 1.2, 1.4, -4);
      showToast('Planted a moonbloom seed 🌱');
    } else if (tile.stage === 3) {
      scene.remove(tile.crop);
      scene.remove(tile.drop);
      tile.crop = null;
      setWet(tile, false);
      state.harvest += 1;
      ui.harvest.textContent = state.harvest;
      burst(tile.x, 0.8, tile.z, 0xffb3e6, 22, 3, 3, -4);
      showToast('Harvested a moonbloom! 🌸');
    } else if (!tile.wet) {
      setWet(tile, true);
      burst(tile.x, 1.2, tile.z, 0x7cc7ff, 14, 1, 0.5, -6);
      showToast('Watered 💧');
    } else {
      showToast('Growing nicely… ' + Math.round((tile.stage + tile.growth) / 3 * 100) + '% ✨');
    }
  }

  function castSpell() {
    if (state.mana < SPELL_COST) { showToast('Not enough mana. Visit the glowing tree ✦'); return; }
    state.mana -= SPELL_COST;
    var watered = 0;
    tiles.forEach(function (t) {
      if (t.crop && t.stage < 3 && !t.wet) {
        setWet(t, true);
        watered += 1;
        burst(t.x, 0.6, t.z, 0xc08bff, 8, 1.4, 2.2, -2);
      }
    });
    ripple(player.position.x, player.position.z, 0xffb3f0, 14, 1.2);
    burst(player.position.x, 1.2, player.position.z, 0xfff1a8, 26, 4, 3, -1);
    showToast(watered ? 'Dawn Bloom! Watered ' + watered + ' crop' + (watered > 1 ? 's' : '') + ' 🌸' : 'Dawn Bloom shimmers… no crops needed water ✦');
  }

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
  window.addEventListener('keyup', function (e) { keys[e.code] = false; });
  window.addEventListener('blur', function () { keys = {}; });

  function focusGame() { canvas.focus({ preventScroll: true }); }
  ui.btnAct.addEventListener('click', function () { interact(); focusGame(); });
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
    if (Math.hypot(hit.x, hit.z) > WALK_R) return;
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

      var fromCenter = Math.hypot(player.position.x, player.position.z);
      if (fromCenter > WALK_R) player.position.multiplyScalar(WALK_R / fromCenter);
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
    player.position.y = onDock(player.position.x, player.position.z) ? 0.3 : 0; // step up onto the dock
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
    M.canopy.emissiveIntensity = 0.35 + night * 0.5 + pulse * 0.15;
    treeLight.intensity = 0.9 + night * 1.6 + pulse * 0.3;
    treeRing.material.opacity = 0.3 + pulse * 0.35;
    var sp = sparkles.geometry.attributes.position;
    for (var i = 0; i < 40; i++) {
      var a = i * 2.4 + t * (0.3 + (i % 5) * 0.12), r = 1.5 + (i % 7) * 0.28;
      sp.setXYZ(i, Math.cos(a) * r, 1 + (i % 9) * 0.45 + Math.sin(t * 1.5 + i) * 0.3, Math.sin(a) * r);
    }
    sp.needsUpdate = true;

    var inZone = dist(player.position.x, player.position.z, TREE_X, TREE_Z) < TREE_ZONE;
    if (inZone && !state.inTreeZone) showToast('The Dawn Tree restores your mana ✦');
    state.inTreeZone = inZone;
    state.mana = Math.min(MAX_MANA, state.mana + (inZone ? 32 : 1.5) * dt);
    ui.mana.style.width = (state.mana / MAX_MANA * 100).toFixed(1) + '%';

    // Lake: moving water, bobbing lily pads, the odd ripple
    waterUniforms.uTime.value = t;
    waterUniforms.uNight.value = night;
    lilyPads.forEach(function (pad, n) {
      pad.position.y = 0.14 + Math.sin(t * 1.4 + n * 1.3) * 0.012;
      pad.rotation.y += dt * 0.03 * (n % 2 ? 1 : -1);
    });
    rippleTimer -= dt;
    if (rippleTimer <= 0) {
      rippleTimer = 0.6 + Math.random() * 0.9;
      var re = lakeEdge(Math.random() * Math.PI * 2, 0, 16.7), rf = Math.random() * 0.7;
      ripple(LAKE_X + re.x * rf, LAKE_Z + re.z * rf, 0xffffff, 0.9, 1.6);
    }

    // Fireflies come out at night
    fireflies.visible = night > 0.02;
    fireflies.material.opacity = night * 0.95;
    if (fireflies.visible) {
      var fp = fireflies.geometry.attributes.position;
      flyHome.forEach(function (h, n) {
        fp.setXYZ(n, h.x + Math.sin(t * 0.5 + h.p) * 0.8, h.y + Math.sin(t * 1.3 + h.p * 2) * 0.35, h.z + Math.cos(t * 0.4 + h.p) * 0.8);
      });
      fp.needsUpdate = true;
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

  function updateEffects(dt) {
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

  showToast('Welcome to Everdawn ✦ Press E on the soil to begin', 3200);
}
