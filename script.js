// Everdawn — a cozy 3D garden.
// No imports needed: three.js is loaded automatically from a CDN at runtime
// and used through the global `THREE` object.

const THREE_SOURCES = [
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',
  'https://unpkg.com/three@0.128.0/build/three.min.js',
];

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => { s.remove(); reject(new Error('Failed to load ' + src)); };
    document.head.appendChild(s);
  });
}

function loadThree() {
  if (window.THREE) return Promise.resolve(window.THREE);
  // Try each CDN in turn until one of them gives us THREE
  let attempt = Promise.reject(new Error('three.js could not be loaded'));
  THREE_SOURCES.forEach(function (src) {
    attempt = attempt.catch(function () {
      return loadScript(src).then(function () {
        if (!window.THREE) throw new Error('THREE missing after loading ' + src);
        return window.THREE;
      });
    });
  });
  return attempt;
}

loadThree()
  .then(startGame)
  .catch((err) => {
    console.error(err);
    const t = document.getElementById('toast');
    t.textContent = 'Could not load the 3D engine — check your connection.';
    t.classList.add('show');
  });

function startGame(THREE) {
  // ---------- DOM ----------
  const canvas = document.getElementById('game');
  const ui = {
    harvest: document.getElementById('harvest'),
    clock: document.getElementById('clock'),
    mana: document.getElementById('mana'),
    toast: document.getElementById('toast'),
    btnAct: document.getElementById('btnAct'),
    btnSpell: document.getElementById('btnSpell'),
  };
  canvas.tabIndex = 0;
  canvas.style.outline = 'none';

  // ---------- Tunables ----------
  const TILE = 1.3;
  const COLS = 7;
  const ROWS = 5;
  const FARM = { x: 2, z: 1 };
  const ISLAND_R = 18;
  const WALK_R = 16.3;
  const TREE_POS = new THREE.Vector3(-8, 0, -4);
  const TREE_ZONE = 3;
  const MAX_MANA = 100;
  const SPELL_COST = 35;
  const STAGE_TIME = 6;      // seconds per growth stage while watered
  const DAY_LENGTH = 150;    // seconds for a full dawn → night → dawn cycle
  const SPEED = 4.4;

  const state = {
    mana: MAX_MANA,
    harvest: 0,
    time: 0,
    dayPhase: 0.02,
    inTreeZone: false,
  };

  // Deterministic random so the island looks the same every visit
  let seed = 20240917;
  const rand = () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // ---------- Renderer / scene / camera ----------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9fd8ff);
  scene.fog = new THREE.Fog(0x9fd8ff, 32, 75);

  const camera = new THREE.PerspectiveCamera(50, 1.5, 0.1, 200);
  const cam = { yaw: 0, pitch: 0.75, dist: 14, target: new THREE.Vector3() };

  function resize() {
    const w = canvas.clientWidth || 800;
    const h = canvas.clientHeight || Math.round(w / 1.5);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize);

  // ---------- Lights ----------
  const hemi = new THREE.HemisphereLight(0xfff1e0, 0x8a6fb8, 0.7);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffe2c4, 1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 60 });
  sun.shadow.bias = -0.0008;
  scene.add(sun, sun.target);

  // ---------- Materials ----------
  const std = (color, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.85 }, extra));
  const M = {
    grass: std(0x9be08a),
    cliff: std(0xc9a27e),
    garden: std(0xc5e89a),
    soilDry: std(0xb07d55),
    soilWet: std(0x6b4630, { roughness: 0.55 }),
    stem: std(0x5cb85c),
    leaf: std(0x7ed37a),
    bud: std(0xf7a8d8),
    petal: std(0xffb3e6, { emissive: 0xff6fcf, emissiveIntensity: 0.35 }),
    center: std(0xffe27a, { emissive: 0xffc94d, emissiveIntensity: 0.4 }),
    robe: std(0xb48cff),
    skin: std(0xffe0c7),
    hat: std(0x7b4fd6),
    star: std(0xffd75e, { emissive: 0xffb64d, emissiveIntensity: 0.8 }),
    eye: std(0x3b2b55),
    trunk: std(0x8a5a8c),
    canopy: std(0xffc3f2, { emissive: 0xff7fd8, emissiveIntensity: 0.45 }),
    rock: std(0xb9b3d6),
    bush: std(0x86cf8a),
    drop: new THREE.MeshStandardMaterial({ color: 0x7cc7ff, emissive: 0x3d9bff, emissiveIntensity: 0.5 }),
  };
  const shadowed = (m, cast = true, receive = true) => { m.castShadow = cast; m.receiveShadow = receive; return m; };

  // ---------- Island ----------
  const island = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(ISLAND_R, ISLAND_R - 2.5, 2.4, 64), M.grass), false, true);
  island.position.y = -1.2;
  scene.add(island);

  const cliff = new THREE.Mesh(new THREE.CylinderGeometry(ISLAND_R - 2.4, 4, 6, 64, 1, true), M.cliff);
  cliff.position.y = -5.4;
  scene.add(cliff);

  const sea = new THREE.Mesh(
    new THREE.CircleGeometry(90, 64),
    new THREE.MeshStandardMaterial({ color: 0x8fd3ff, transparent: true, opacity: 0.85, roughness: 0.3 })
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -1.4;
  scene.add(sea);

  const gardenPatch = shadowed(new THREE.Mesh(new THREE.BoxGeometry(COLS * TILE + 0.8, 0.04, ROWS * TILE + 0.8), M.garden), false, true);
  gardenPatch.position.set(FARM.x, 0.01, FARM.z);
  scene.add(gardenPatch);

  // ---------- Decorations ----------
  const inFarm = (x, z, pad) =>
    Math.abs(x - FARM.x) < (COLS * TILE) / 2 + pad && Math.abs(z - FARM.z) < (ROWS * TILE) / 2 + pad;
  const freeSpot = (pad = 1.2) => {
    for (let i = 0; i < 60; i++) {
      const a = rand() * Math.PI * 2;
      const r = 3 + rand() * (WALK_R - 2.5);
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (inFarm(x, z, pad)) continue;
      if (Math.hypot(x - TREE_POS.x, z - TREE_POS.z) < TREE_ZONE + 0.8) continue;
      if (Math.hypot(x - FARM.x, z - 6) < 2) continue;
      return { x, z };
    }
    return null;
  };

  const solids = []; // simple circle colliders {x, z, r}

  const tuftGeo = new THREE.ConeGeometry(0.08, 0.35, 4);
  for (let i = 0; i < 140; i++) {
    const p = freeSpot(0.6);
    if (!p) continue;
    const tuft = new THREE.Group();
    for (let k = 0; k < 3; k++) {
      const blade = new THREE.Mesh(tuftGeo, M.stem);
      blade.position.set((k - 1) * 0.07, 0.15, (rand() - 0.5) * 0.06);
      blade.rotation.z = (k - 1) * 0.35;
      tuft.add(blade);
    }
    tuft.position.set(p.x, 0, p.z);
    tuft.rotation.y = rand() * Math.PI;
    scene.add(tuft);
  }

  const rockGeo = new THREE.DodecahedronGeometry(0.5, 0);
  for (let i = 0; i < 12; i++) {
    const p = freeSpot();
    if (!p) continue;
    const s = 0.5 + rand() * 0.8;
    const rock = shadowed(new THREE.Mesh(rockGeo, M.rock));
    rock.position.set(p.x, s * 0.2, p.z);
    rock.scale.set(s, s * 0.7, s);
    rock.rotation.set(rand(), rand() * 3, rand());
    scene.add(rock);
    solids.push({ x: p.x, z: p.z, r: s * 0.5 });
  }

  const bushGeo = new THREE.IcosahedronGeometry(0.6, 1);
  const flowerGeo = new THREE.SphereGeometry(0.08, 8, 6);
  const flowerMats = [0xff9be0, 0xffe27a, 0x9ec9ff, 0xffffff].map((c) => std(c, { emissive: c, emissiveIntensity: 0.15 }));
  for (let i = 0; i < 14; i++) {
    const p = freeSpot();
    if (!p) continue;
    const bush = new THREE.Group();
    const s = 0.7 + rand() * 0.6;
    for (let k = 0; k < 3; k++) {
      const b = shadowed(new THREE.Mesh(bushGeo, M.bush));
      b.position.set((k - 1) * 0.45 * s, 0.35 * s, (rand() - 0.5) * 0.3);
      b.scale.setScalar(s * (0.8 + rand() * 0.4));
      bush.add(b);
    }
    for (let k = 0; k < 4; k++) {
      const f = new THREE.Mesh(flowerGeo, flowerMats[Math.floor(rand() * flowerMats.length)]);
      const a = rand() * Math.PI * 2;
      f.position.set(Math.cos(a) * 0.5 * s, 0.55 * s + rand() * 0.3, Math.sin(a) * 0.4 * s);
      bush.add(f);
    }
    bush.position.set(p.x, 0, p.z);
    bush.rotation.y = rand() * Math.PI;
    scene.add(bush);
    solids.push({ x: p.x, z: p.z, r: 0.9 * s });
  }

  // ---------- The glowing Dawn Tree ----------
  const tree = new THREE.Group();
  tree.position.copy(TREE_POS);
  const trunk = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 2.8, 10), M.trunk));
  trunk.position.y = 1.4;
  tree.add(trunk);
  const canopyGeo = new THREE.IcosahedronGeometry(1, 1);
  [[0, 3.6, 0, 1.7], [-1.1, 3.0, 0.5, 1.15], [1.1, 3.1, -0.3, 1.2], [0.2, 4.5, 0.4, 1.1]].forEach(([x, y, z, s]) => {
    const c = shadowed(new THREE.Mesh(canopyGeo, M.canopy));
    c.position.set(x, y, z);
    c.scale.setScalar(s);
    tree.add(c);
  });
  const treeLight = new THREE.PointLight(0xffa8ee, 1.2, 12, 2);
  treeLight.position.set(0, 3.4, 0);
  tree.add(treeLight);
  const treeRing = new THREE.Mesh(
    new THREE.RingGeometry(TREE_ZONE - 0.35, TREE_ZONE, 64),
    new THREE.MeshBasicMaterial({ color: 0xffb3f0, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false })
  );
  treeRing.rotation.x = -Math.PI / 2;
  treeRing.position.y = 0.03;
  tree.add(treeRing);
  scene.add(tree);
  solids.push({ x: TREE_POS.x, z: TREE_POS.z, r: 0.8 });

  // Sparkles orbiting the tree
  const SPARKLES = 40;
  const sparkleData = [];
  const sparklePos = new Float32Array(SPARKLES * 3);
  for (let i = 0; i < SPARKLES; i++) {
    sparkleData.push({ a: rand() * Math.PI * 2, r: 1.5 + rand() * 1.8, y: 1 + rand() * 4, s: 0.3 + rand() * 0.7 });
  }
  const sparkleGeo = new THREE.BufferGeometry();
  sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
  const sparkles = new THREE.Points(sparkleGeo, new THREE.PointsMaterial({
    color: 0xfff1a8, size: 0.16, transparent: true, opacity: 0.9, depthWrite: false,
  }));
  sparkles.position.copy(TREE_POS);
  scene.add(sparkles);

  // Fireflies (visible at dusk / night)
  const FLIES = 60;
  const flyData = [];
  const flyPos = new Float32Array(FLIES * 3);
  for (let i = 0; i < FLIES; i++) {
    const a = rand() * Math.PI * 2, r = rand() * WALK_R;
    flyData.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, y: 0.5 + rand() * 2.5, p: rand() * 10 });
  }
  const flyGeo = new THREE.BufferGeometry();
  flyGeo.setAttribute('position', new THREE.BufferAttribute(flyPos, 3));
  const fireflies = new THREE.Points(flyGeo, new THREE.PointsMaterial({
    color: 0xfff3a0, size: 0.2, transparent: true, opacity: 0, depthWrite: false,
  }));
  scene.add(fireflies);

  // ---------- Farm tiles ----------
  const tiles = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      tiles.push({
        c, r,
        x: FARM.x + (c - (COLS - 1) / 2) * TILE,
        z: FARM.z + (r - (ROWS - 1) / 2) * TILE,
        tilled: false, soil: null,
        crop: null, stage: 0, growth: 0, wet: false, drop: null,
      });
    }
  }
  const tileAt = (x, z) => {
    const c = Math.round((x - FARM.x) / TILE + (COLS - 1) / 2);
    const r = Math.round((z - FARM.z) / TILE + (ROWS - 1) / 2);
    return c >= 0 && c < COLS && r >= 0 && r < ROWS ? tiles[r * COLS + c] : null;
  };

  const soilGeo = new THREE.BoxGeometry(TILE * 0.9, 0.12, TILE * 0.9);
  const stemGeo = new THREE.CylinderGeometry(0.035, 0.05, 1, 6);
  stemGeo.translate(0, 0.5, 0);
  const leafGeo = new THREE.SphereGeometry(0.12, 8, 6);
  const budGeo = new THREE.SphereGeometry(0.09, 10, 8);
  const petalGeo = new THREE.SphereGeometry(0.1, 10, 8);
  const centerGeo = new THREE.SphereGeometry(0.07, 10, 8);
  const dropGeo = new THREE.SphereGeometry(0.08, 10, 8);

  function makeCrop() {
    const g = new THREE.Group();
    const stem = shadowed(new THREE.Mesh(stemGeo, M.stem));
    const leaves = new THREE.Group();
    for (let k = 0; k < 2; k++) {
      const s = k === 0 ? -1 : 1;
      const l = shadowed(new THREE.Mesh(leafGeo, M.leaf));
      l.scale.set(1.3, 0.35, 0.7);
      l.position.x = s * 0.13;
      l.rotation.z = s * 0.5;
      leaves.add(l);
    }
    const bud = shadowed(new THREE.Mesh(budGeo, M.bud));
    const bloom = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const p = shadowed(new THREE.Mesh(petalGeo, M.petal));
      p.scale.set(1.25, 0.4, 0.75);
      p.position.set(Math.cos(a) * 0.12, 0, Math.sin(a) * 0.12);
      p.rotation.y = -a;
      p.rotation.z = 0.35;
      bloom.add(p);
    }
    bloom.add(new THREE.Mesh(centerGeo, M.center));
    g.add(stem, leaves, bud, bloom);
    g.userData = { stem, leaves, bud, bloom };
    return g;
  }

  function applyStage(tile) {
    const { stem, leaves, bud, bloom } = tile.crop.userData;
    const s = tile.stage;
    const h = [0.16, 0.36, 0.55, 0.7][s];
    stem.scale.y = h;
    leaves.position.y = h * 0.45;
    leaves.scale.setScalar([0.55, 1, 1.15, 1.25][s]);
    bud.visible = s === 2;
    bud.position.y = h;
    bloom.visible = s === 3;
    bloom.position.y = h;
  }

  function setWet(tile, wet) {
    tile.wet = wet;
    if (tile.soil) tile.soil.material = wet ? M.soilWet : M.soilDry;
  }

  // ---------- Player ----------
  const player = new THREE.Group();
  const body = new THREE.Group();
  player.add(body);
  const robe = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.4, 0.75, 16), M.robe));
  robe.position.y = 0.375;
  const head = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 16), M.skin));
  head.position.y = 0.98;
  const brim = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.04, 24), M.hat));
  brim.position.y = 1.16;
  const hat = shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.65, 20), M.hat));
  hat.position.set(0, 1.48, -0.04);
  hat.rotation.x = -0.18;
  const hatStar = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), M.star);
  hatStar.position.set(0, 1.42, 0.22);
  const eyeGeo = new THREE.SphereGeometry(0.04, 8, 6);
  const eyeL = new THREE.Mesh(eyeGeo, M.eye);
  const eyeR = new THREE.Mesh(eyeGeo, M.eye);
  eyeL.position.set(-0.1, 1.0, 0.24);
  eyeR.position.set(0.1, 1.0, 0.24);
  body.add(robe, head, brim, hat, hatStar, eyeL, eyeR);
  player.position.set(FARM.x, 0, 6);
  scene.add(player);
  let facing = Math.PI; // facing -z, toward the garden
  let moveTarget = null;

  // Tile highlight cursor
  const cursor = new THREE.Mesh(
    new THREE.RingGeometry(TILE * 0.56, TILE * 0.66, 4, 1),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide })
  );
  cursor.rotation.set(-Math.PI / 2, 0, Math.PI / 4);
  cursor.position.y = 0.14;
  scene.add(cursor);

  // ---------- Effects ----------
  const particles = [];
  const partGeo = new THREE.SphereGeometry(0.06, 6, 5);
  function burst(pos, color, n, { speed = 2, up = 2, life = 0.9, gravity = -4, size = 1 } = {}) {
    for (let i = 0; i < n; i++) {
      const mesh = new THREE.Mesh(partGeo, new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false }));
      mesh.position.copy(pos);
      mesh.scale.setScalar(size * (0.6 + Math.random() * 0.8));
      const vel = new THREE.Vector3((Math.random() - 0.5) * speed, up * (0.3 + Math.random()), (Math.random() - 0.5) * speed);
      const l = life * (0.7 + Math.random() * 0.6);
      particles.push({ mesh, vel, life: l, max: l, gravity });
      scene.add(mesh);
    }
  }

  const waves = [];
  const waveGeo = new THREE.RingGeometry(0.85, 1, 64);
  function wave(pos, color, maxScale = 10, life = 1.1) {
    const mesh = new THREE.Mesh(waveGeo, new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false,
    }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(pos.x, 0.08, pos.z);
    scene.add(mesh);
    waves.push({ mesh, life, max: life, maxScale });
  }

  // ---------- UI helpers ----------
  let toastTimer = 0;
  function toast(msg, ms = 1800) {
    ui.toast.textContent = msg;
    ui.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ui.toast.classList.remove('show'), ms);
  }
  let lastClock = '';
  function updateUI() {
    ui.mana.style.width = ((state.mana / MAX_MANA) * 100).toFixed(1) + '%';
    ui.harvest.textContent = state.harvest;
    const p = state.dayPhase;
    const label = p < 0.18 ? '☼ Dawn' : p < 0.5 ? '☀ Day' : p < 0.68 ? '☾ Dusk' : '★ Night';
    if (label !== lastClock) { ui.clock.textContent = label; lastClock = label; }
  }

  // ---------- Actions ----------
  const tmpV = new THREE.Vector3();

  function targetTile() {
    const fx = player.position.x + Math.sin(facing) * 0.95;
    const fz = player.position.z + Math.cos(facing) * 0.95;
    return tileAt(fx, fz) || tileAt(player.position.x, player.position.z);
  }

  function interact() {
    const tile = targetTile();
    if (!tile) {
      if (state.inTreeZone) toast('The Dawn Tree hums softly… your mana is restoring ✦');
      else toast('Walk to the garden soil to farm 🌱');
      return;
    }
    tmpV.set(tile.x, 0.3, tile.z);

    if (!tile.tilled) {
      tile.tilled = true;
      tile.soil = shadowed(new THREE.Mesh(soilGeo, M.soilDry), false, true);
      tile.soil.position.set(tile.x, 0.06, tile.z);
      scene.add(tile.soil);
      burst(tmpV, 0xb07d55, 10, { speed: 2, up: 1.6, life: 0.6 });
      toast('Tilled the soil ⛏');
    } else if (!tile.crop) {
      tile.crop = makeCrop();
      tile.crop.position.set(tile.x, 0.12, tile.z);
      tile.crop.rotation.y = Math.random() * Math.PI * 2;
      tile.stage = 0;
      tile.growth = 0;
      applyStage(tile);
      scene.add(tile.crop);
      tile.drop = new THREE.Mesh(dropGeo, M.drop);
      tile.drop.position.set(tile.x, 1.1, tile.z);
      scene.add(tile.drop);
      burst(tmpV, 0x7ed37a, 8, { speed: 1.2, up: 1.4, life: 0.6 });
      toast('Planted a moonbloom seed 🌱');
    } else if (tile.stage === 3) {
      harvestTile(tile);
    } else if (!tile.wet) {
      setWet(tile, true);
      burst(tmpV.set(tile.x, 1.2, tile.z), 0x7cc7ff, 14, { speed: 1, up: 0.5, life: 0.7, gravity: -6 });
      toast('Watered 💧');
    } else {
      const pct = Math.round(((tile.stage + tile.growth) / 3) * 100);
      toast(`Growing nicely… ${pct}% ✨`);
    }
  }

  function harvestTile(tile) {
    scene.remove(tile.crop);
    tile.crop = null;
    tile.stage = 0;
    tile.growth = 0;
    setWet(tile, false);
    state.harvest++;
    burst(tmpV.set(tile.x, 0.8, tile.z), 0xffb3e6, 22, { speed: 3, up: 3, life: 1.1 });
    burst(tmpV, 0xffe27a, 10, { speed: 2, up: 3.5, life: 1 });
    toast(`Harvested a moonbloom! 🌸 (${state.harvest})`);
  }

  function castSpell() {
    if (state.mana < SPELL_COST) {
      toast('Not enough mana — visit the glowing tree ✦');
      return;
    }
    state.mana -= SPELL_COST;
    let watered = 0;
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      if (t.crop && t.stage < 3 && !t.wet) {
        setWet(t, true);
        watered++;
        burst(tmpV.set(t.x, 0.6, t.z), 0xc08bff, 8, { speed: 1.4, up: 2.2, life: 0.9, gravity: -2 });
      }
    }
    wave(player.position, 0xffb3f0, 14, 1.2);
    wave(player.position, 0x8ec5ff, 9, 0.9);
    burst(tmpV.copy(player.position).setY(1.2), 0xfff1a8, 26, { speed: 4, up: 3, life: 1, gravity: -1 });
    toast(watered ? `Dawn Bloom! Watered ${watered} crop${watered > 1 ? 's' : ''} 🌸` : 'Dawn Bloom shimmers… no crops needed water ✦');
  }

  // ---------- Input: keyboard ----------
  const keys = new Set();
  const GAME_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyE', 'Space', 'KeyQ']);
  const typing = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);

  window.addEventListener('keydown', (e) => {
    if (typing(e.target) || !GAME_KEYS.has(e.code)) return;
    e.preventDefault();
    keys.add(e.code);
    moveTarget = null;
    if (e.repeat) return;
    if (e.code === 'KeyE' || e.code === 'Space') interact();
    if (e.code === 'KeyQ') castSpell();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());

  const refocus = () => canvas.focus({ preventScroll: true });
  ui.btnAct.addEventListener('click', () => { interact(); refocus(); });
  ui.btnSpell.addEventListener('click', () => { castSpell(); refocus(); });

  // ---------- Input: pointer (orbit, pinch zoom, tap to walk) ----------
  const pointers = new Map();
  let drag = null;
  let pinchDist = 0;
  const raycaster = new THREE.Raycaster();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const ndc = new THREE.Vector2();

  canvas.addEventListener('pointerdown', (e) => {
    refocus();
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), moved: false };
      canvas.style.cursor = 'grabbing';
    } else if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      if (drag) drag.moved = true; // a pinch is never a tap
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist > 0) cam.dist = THREE.MathUtils.clamp(cam.dist * (pinchDist / d), 6, 26);
      pinchDist = d;
      return;
    }
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX;
    drag.y = e.clientY;
    if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) drag.moved = true;
    cam.yaw -= dx * 0.008;
    cam.pitch = THREE.MathUtils.clamp(cam.pitch + dy * 0.006, 0.25, 1.35);
  });

  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (pointers.size === 0) {
      if (drag && !drag.moved && performance.now() - drag.t < 450 && e.type === 'pointerup') tapToWalk(e);
      drag = null;
      pinchDist = 0;
      canvas.style.cursor = '';
    }
  }
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);

  function tapToWalk(e) {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(groundPlane, hit)) return;
    if (Math.hypot(hit.x, hit.z) > WALK_R) return;
    moveTarget = hit;
    wave(hit, 0xffffff, 0.6, 0.45);
  }

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    cam.dist = THREE.MathUtils.clamp(cam.dist * (1 + e.deltaY * 0.001), 6, 26);
  }, { passive: false });

  // ---------- Day / night palette ----------
  const SKY_KEYS = [
    { t: 0.00, sky: 0xffc6a8, sun: 0xffb98a, sunI: 0.8, hemiI: 0.6 },
    { t: 0.25, sky: 0x9fd8ff, sun: 0xfff4e0, sunI: 1.15, hemiI: 0.75 },
    { t: 0.55, sky: 0xf3a6d0, sun: 0xff9a7a, sunI: 0.7, hemiI: 0.55 },
    { t: 0.75, sky: 0x2b2a5e, sun: 0x8fa0ff, sunI: 0.25, hemiI: 0.3 },
    { t: 0.92, sky: 0x3a3473, sun: 0x9fa8ff, sunI: 0.25, hemiI: 0.32 },
    { t: 1.00, sky: 0xffc6a8, sun: 0xffb98a, sunI: 0.8, hemiI: 0.6 },
  ].map((k) => Object.assign({}, k, { sky: new THREE.Color(k.sky), sun: new THREE.Color(k.sun) }));
  const skyColor = new THREE.Color();

  function updateSky() {
    const p = state.dayPhase;
    let i = 0;
    while (i < SKY_KEYS.length - 2 && p > SKY_KEYS[i + 1].t) i++;
    const a = SKY_KEYS[i], b = SKY_KEYS[i + 1];
    const k = THREE.MathUtils.smoothstep(p, a.t, b.t);
    skyColor.copy(a.sky).lerp(b.sky, k);
    scene.background.copy(skyColor);
    scene.fog.color.copy(skyColor);
    sun.color.copy(a.sun).lerp(b.sun, k);
    sun.intensity = THREE.MathUtils.lerp(a.sunI, b.sunI, k);
    hemi.intensity = THREE.MathUtils.lerp(a.hemiI, b.hemiI, k);

    const ang = p * Math.PI * 2;
    sun.position.set(player.position.x + Math.cos(ang) * 14, 14 + Math.sin(ang) * 5, player.position.z + 9);
    sun.target.position.copy(player.position);

    // 0 during the day, 1 at night
    const night = THREE.MathUtils.smoothstep(p, 0.5, 0.7) * (1 - THREE.MathUtils.smoothstep(p, 0.94, 1));
    return night;
  }

  // ---------- Main loop ----------
  const clock = new THREE.Clock();
  const fwd = new THREE.Vector2();
  const right = new THREE.Vector2();
  const move = new THREE.Vector2();

  function updatePlayer(dt) {
    fwd.set(-Math.sin(cam.yaw), -Math.cos(cam.yaw));
    right.set(Math.cos(cam.yaw), -Math.sin(cam.yaw));
    const f = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
    const s = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
    move.set(fwd.x * f + right.x * s, fwd.y * f + right.y * s);

    if (move.lengthSq() === 0 && moveTarget) {
      move.set(moveTarget.x - player.position.x, moveTarget.z - player.position.z);
      if (move.length() < 0.15) { moveTarget = null; move.set(0, 0); }
    }

    const moving = move.lengthSq() > 0;
    if (moving) {
      move.normalize();
      const prevX = player.position.x, prevZ = player.position.z;
      player.position.x += move.x * SPEED * dt;
      player.position.z += move.y * SPEED * dt;

      // stay on the island
      const r = Math.hypot(player.position.x, player.position.z);
      if (r > WALK_R) player.position.multiplyScalar(WALK_R / r);
      // bump into trees, rocks and bushes
      for (let i = 0; i < solids.length; i++) {
        const o = solids[i];
        const dx = player.position.x - o.x, dz = player.position.z - o.z;
        const d = Math.hypot(dx, dz), min = o.r + 0.35;
        if (d < min && d > 1e-4) {
          player.position.x = o.x + (dx / d) * min;
          player.position.z = o.z + (dz / d) * min;
        }
      }
      // give up on a tap target we're stuck against
      if (moveTarget && Math.hypot(player.position.x - prevX, player.position.z - prevZ) < SPEED * dt * 0.2) moveTarget = null;

      const want = Math.atan2(move.x, move.y);
      let diff = want - facing;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      facing += diff * Math.min(1, dt * 14);
    }
    player.rotation.y = facing;

    // walk bob / idle breathing
    const t = state.time;
    if (moving) {
      body.position.y = Math.abs(Math.sin(t * 11)) * 0.09;
      body.rotation.z = Math.sin(t * 11) * 0.06;
    } else {
      body.position.y *= 0.8;
      body.rotation.z *= 0.8;
      body.scale.y = 1 + Math.sin(t * 2.5) * 0.015;
    }
    hatStar.rotation.y += dt * 2;
  }

  function updateCrops(dt, night) {
    const t = state.time;
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      if (!tile.crop) continue;
      if (tile.wet && tile.stage < 3) {
        tile.growth += dt / STAGE_TIME;
        if (tile.growth >= 1) {
          tile.stage++;
          tile.growth = 0;
          applyStage(tile);
          burst(tmpV.set(tile.x, 0.7, tile.z), tile.stage === 3 ? 0xffb3e6 : 0x9be08a, tile.stage === 3 ? 14 : 6, { speed: 1.2, up: 1.6, life: 0.7, gravity: -2 });
          if (tile.stage < 3) setWet(tile, false); // thirsty again
        }
      }
      tile.crop.rotation.z = Math.sin(t * 1.6 + tile.x * 1.3 + tile.z) * 0.05;
      if (tile.stage === 3) tile.crop.userData.bloom.rotation.y += dt * 0.6;

      const thirsty = !tile.wet && tile.stage < 3;
      tile.drop.visible = thirsty;
      if (thirsty) tile.drop.position.y = 1.0 + Math.sin(t * 3 + tile.x) * 0.08;
    }
    M.petal.emissiveIntensity = 0.3 + night * 0.6 + Math.sin(t * 3) * 0.1;
  }

  function updateEffects(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
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
    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i];
      w.life -= dt;
      if (w.life <= 0) {
        scene.remove(w.mesh);
        w.mesh.material.dispose();
        waves.splice(i, 1);
        continue;
      }
      const k = 1 - w.life / w.max;
      w.mesh.scale.setScalar(0.2 + k * w.maxScale);
      w.mesh.material.opacity = (1 - k) * 0.9;
    }
  }

  function updateWorld(dt, night) {
    const t = state.time;

    // Dawn Tree: glow, ring pulse, sparkles, mana refill
    const pulse = 0.5 + Math.sin(t * 2) * 0.5;
    M.canopy.emissiveIntensity = 0.35 + night * 0.5 + pulse * 0.15;
    treeLight.intensity = 0.9 + night * 1.6 + pulse * 0.3;
    treeRing.material.opacity = 0.3 + pulse * 0.35;
    for (let i = 0; i < SPARKLES; i++) {
      const d = sparkleData[i];
      const a = d.a + t * d.s;
      sparklePos[i * 3] = Math.cos(a) * d.r;
      sparklePos[i * 3 + 1] = d.y + Math.sin(t * 1.5 + i) * 0.3;
      sparklePos[i * 3 + 2] = Math.sin(a) * d.r;
    }
    sparkleGeo.attributes.position.needsUpdate = true;

    const inZone = Math.hypot(player.position.x - TREE_POS.x, player.position.z - TREE_POS.z) < TREE_ZONE;
    if (inZone && !state.inTreeZone) toast('The Dawn Tree restores your mana ✦');
    state.inTreeZone = inZone;
    const before = state.mana;
    state.mana = Math.min(MAX_MANA, state.mana + (inZone ? 32 : 1.5) * dt);
    if (inZone && state.mana > before && Math.random() < dt * 12) {
      burst(tmpV.copy(player.position).setY(0.4), 0xc08bff, 1, { speed: 0.6, up: 1.8, life: 0.8, gravity: 0.5, size: 0.8 });
    }

    // Fireflies
    fireflies.material.opacity = night * 0.95;
    fireflies.visible = night > 0.02;
    if (fireflies.visible) {
      for (let i = 0; i < FLIES; i++) {
        const d = flyData[i];
        flyPos[i * 3] = d.x + Math.sin(t * 0.5 + d.p) * 0.8;
        flyPos[i * 3 + 1] = d.y + Math.sin(t * 1.3 + d.p * 2) * 0.35;
        flyPos[i * 3 + 2] = d.z + Math.cos(t * 0.4 + d.p) * 0.8;
      }
      flyGeo.attributes.position.needsUpdate = true;
    }

    // Tile cursor
    const tile = targetTile();
    cursor.visible = !!tile;
    if (tile) {
      cursor.position.x = tile.x;
      cursor.position.z = tile.z;
      cursor.material.opacity = 0.45 + Math.sin(t * 5) * 0.25;
      cursor.material.color.set(tile.stage === 3 && tile.crop ? 0xffb3e6 : tile.crop && !tile.wet ? 0x8ec5ff : 0xffffff);
    }
  }

  function updateCamera(dt) {
    tmpV.copy(player.position).setY(0.8);
    cam.target.lerp(tmpV, 1 - Math.exp(-dt * 6));
    const cp = Math.cos(cam.pitch);
    camera.position.set(
      cam.target.x + Math.sin(cam.yaw) * cp * cam.dist,
      cam.target.y + Math.sin(cam.pitch) * cam.dist,
      cam.target.z + Math.cos(cam.yaw) * cp * cam.dist
    );
    camera.lookAt(cam.target);
  }

  cam.target.copy(player.position).setY(0.8);

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    state.time += dt;
    state.dayPhase = (state.dayPhase + dt / DAY_LENGTH) % 1;

    const night = updateSky();
    updatePlayer(dt);
    updateCrops(dt, night);
    updateWorld(dt, night);
    updateEffects(dt);
    updateCamera(dt);
    updateUI();
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(tick);

  toast('Welcome to Everdawn ✦ Press E on the soil to begin', 3200);
}
