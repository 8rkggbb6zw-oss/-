// Everdawn: the base of the game
(function () {
  'use strict';

  // Page elements
  var $ = function (id) { return document.getElementById(id); };
  var canvas = $('game');
  var clockEl = $('clock'), dayEl = $('day');
  var manaEl = $('mana'), manaNumEl = $('manaNum');
  var toastEl = $('toast');
  var hotbarEl = $('hotbarSlots');

  if (typeof THREE === 'undefined') {
    toastEl.textContent = 'The 3D engine could not load. Check your connection and run the pen again.';
    toastEl.classList.add('show');
    return;
  }

  // 3D view
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color('#9fd8ff');

  var camera = new THREE.PerspectiveCamera(45, 3 / 2, 0.1, 2000);
  camera.position.set(0, 50, 66);
  camera.lookAt(0, -3, 0);

  // Light
  var hemi = new THREE.HemisphereLight('#cfe4ff', '#4a5530', 0.6);
  scene.add(hemi);
  var sun = new THREE.DirectionalLight('#ffeccc', 1.6);
  sun.position.set(-40, 70, 30);
  scene.add(sun);
  scene.fog = new THREE.Fog('#9fd8ff', 120, 260);

  // The farm: a grassy square with softly rounded corners
  var FARM = 34;
  function rand(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  function canvasTex(c, srgb) {
    var t = new THREE.CanvasTexture(c);
    if (srgb) t.encoding = THREE.sRGBEncoding;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }

  // Close-up grass: fine blades and specks of soil, tiled across the ground
  function grassTexture() {
    var S = 512, c = document.createElement('canvas'); c.width = c.height = S;
    var g = c.getContext('2d'), r = rand(7);
    g.fillStyle = '#4e7a30'; g.fillRect(0, 0, S, S);
    for (var k = 0; k < 900; k++) {
      g.fillStyle = r() < 0.6 ? 'rgba(70,52,30,.35)' : 'rgba(40,60,22,.4)';
      g.fillRect(r() * S, r() * S, 1 + r() * 2, 1 + r() * 2);
    }
    var shades = ['#3f6a26', '#56873a', '#6a9c45', '#4b7b2f', '#7fae52', '#365d20', '#8fbc5c', '#a3c46a'];
    g.lineCap = 'round';
    for (var j = 0; j < 26000; j++) {
      var bx = r() * S, by = r() * S, len = 3 + r() * 9, lean = (r() - 0.5) * 5;
      g.strokeStyle = shades[(r() * shades.length) | 0];
      g.globalAlpha = 0.45 + r() * 0.5;
      g.lineWidth = 0.6 + r() * 1.0;
      g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + lean * 0.3, by - len * 0.6, bx + lean, by - len); g.stroke();
      if (bx < 12 || bx > S - 12 || by < 12 || by > S - 12) {
        var ox = bx < 12 ? S : bx > S - 12 ? -S : 0, oy = by < 12 ? S : by > S - 12 ? -S : 0;
        g.beginPath(); g.moveTo(bx + ox, by + oy); g.lineTo(bx + ox + lean, by + oy - len); g.stroke();
      }
    }
    g.globalAlpha = 1;
    return canvasTex(c, true);
  }

  function soilTexture() {
    var W = 1024, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H;
    var g = c.getContext('2d'), r = rand(3);
    var grd = g.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, '#3f5f24'); grd.addColorStop(0.1, '#5e4128'); grd.addColorStop(0.45, '#4d3420'); grd.addColorStop(1, '#2e1f12');
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    for (var l = 0; l < 6; l++) {
      g.strokeStyle = 'rgba(' + (l % 2 ? '35,22,12' : '110,82,52') + ',.25)'; g.lineWidth = 3 + r() * 5;
      g.beginPath(); var y0 = 50 + l * 34; g.moveTo(0, y0);
      for (var x = 0; x <= W; x += 64) g.lineTo(x, y0 + (r() - .5) * 10);
      g.stroke();
    }
    for (var i = 0; i < 12000; i++) {
      g.fillStyle = ['rgba(25,15,8,.35)', 'rgba(125,95,62,.3)', 'rgba(85,60,38,.35)'][i % 3];
      g.fillRect(r() * W, 24 + r() * (H - 24), 1 + r() * 3, 1 + r() * 2);
    }
    for (var k = 0; k < 90; k++) {
      var sx = r() * W, sy = 45 + r() * (H - 55), rw = 3 + r() * 9, rh = 2 + r() * 5;
      g.fillStyle = 'rgba(20,12,6,.45)'; g.beginPath(); g.ellipse(sx + 1, sy + 1.5, rw, rh, 0, 0, 6.3); g.fill();
      g.fillStyle = ['#8a7d70', '#9c9184', '#766a5e'][k % 3]; g.beginPath(); g.ellipse(sx, sy, rw, rh, 0, 0, 6.3); g.fill();
      g.fillStyle = 'rgba(255,255,255,.2)'; g.beginPath(); g.ellipse(sx - rw * .25, sy - rh * .3, rw * .45, rh * .3, 0, 0, 6.3); g.fill();
    }
    for (var j = 0; j < 220; j++) {
      g.strokeStyle = 'rgba(' + (r() < .5 ? '60,40,22' : '160,130,90') + ',.75)'; g.lineWidth = 0.6 + r();
      var rx = r() * W, ry = 18 + r() * 10; g.beginPath(); g.moveTo(rx, ry);
      g.quadraticCurveTo(rx + (r() - .5) * 14, ry + 14, rx + (r() - .5) * 10, ry + 14 + r() * 34); g.stroke();
    }
    var t = canvasTex(c, true); t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
  }

  // Smooth natural noise for patches and bumps
  var NP = (function () { var r = rand(29), a = []; for (var i = 0; i < 512; i++) a.push(r()); return a; })();
  function vnoise(x, z) {
    var xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
    var h = function (i, j) { return NP[((i * 73 + j * 151) % 512 + 512) % 512]; };
    var u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
    var a = h(xi, zi), b = h(xi + 1, zi), c = h(xi, zi + 1), d = h(xi + 1, zi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, z) { return vnoise(x, z) * 0.5 + vnoise(x * 2.1 + 7, z * 2.1 + 3) * 0.3 + vnoise(x * 4.3 + 1, z * 4.3 + 9) * 0.2; }
  // Grass colour at a spot: lush green, olive and sun-dried straw mixed naturally
  var LUSH = new THREE.Color('#3d6327'), OLIVE = new THREE.Color('#5b7232'), DRY = new THREE.Color('#8f8a4a'), DARK = new THREE.Color('#2c4a1c');
  function grassColour(x, z, out) {
    var a = fbm(x * 0.06, z * 0.06), b = fbm(x * 0.17 + 40, z * 0.17 + 40), dry = Math.max(0, fbm(x * 0.045 + 90, z * 0.045 + 90) - 0.55) * 2.4;
    out.copy(LUSH).lerp(OLIVE, a).lerp(DARK, Math.max(0, 0.45 - b) * 1.2).lerp(DRY, Math.min(0.55, dry));
    return out;
  }

  var grassTime = { value: 0 };
  function insideFarm(x, z, w, R) {
    var dx = Math.max(Math.abs(x) - (w - R), 0), dz = Math.max(Math.abs(z) - (w - R), 0);
    return dx * dx + dz * dz <= R * R;
  }
  // A point (and its outward direction) at fraction t round the farm's rounded edge
  function rimPoint(t, w, R) {
    var s = w - R, L = 8 * s + 2 * Math.PI * R, d = t * L, segs = [];
    for (var q = 0; q < 4; q++) { segs.push(['l', q]); segs.push(['c', q]); }
    for (var i = 0; i < segs.length; i++) {
      var len = segs[i][0] === 'l' ? 2 * s : Math.PI * R / 2;
      if (d <= len || i === segs.length - 1) {
        var q = segs[i][1], ang = q * Math.PI / 2, ca = Math.cos(ang), sa = Math.sin(ang), lx, lz, nx, nz;
        if (segs[i][0] === 'l') { lx = -s + d; lz = -w; nx = 0; nz = -1; }
        else { var a = -Math.PI / 2 + Math.min(d / R, Math.PI / 2); lx = s + Math.cos(a) * R; lz = -s + Math.sin(a) * R; nx = Math.cos(a); nz = Math.sin(a); }
        return { x: lx * ca - lz * sa, z: lx * sa + lz * ca, nx: nx * ca - nz * sa, nz: nx * sa + nz * ca };
      }
      d -= len;
    }
  }

  function groundHeight(x, z, w) {
    var edge = Math.min(w - Math.abs(x), w - Math.abs(z));
    var fade = Math.max(0, Math.min(1, edge / 4));
    return 0.12 + fade * (0.15 + fbm(x * 0.08, z * 0.08) * 0.9) + vnoise(x * 0.5, z * 0.5) * 0.1;
  }

  (function buildFarm() {
    var R = 7, w = FARM;

    // Soil body with a rounded rim
    var outline = [], N = 640;
    for (var i = 0; i < N; i++) { var pp = rimPoint(i / N, w, R); outline.push(new THREE.Vector2(pp.x, -pp.z)); }
    var shape = new THREE.Shape(outline);
    var body = new THREE.ExtrudeGeometry(shape, { depth: 5, steps: 10, bevelEnabled: false });
    // Crumbly earth edge that leans inward as it goes down
    var bp2 = body.attributes.position;
    for (var k = 0; k < bp2.count; k++) {
      var vx = bp2.getX(k), vy = bp2.getY(k), vz = bp2.getZ(k), down = (5 - vz) / 5;
      var len = Math.hypot(vx, vy); if (len < w * 0.5) continue;
      var j = (fbm(vx * 0.3 + vz * 0.25, vy * 0.3 - vz * 0.25) - 0.5) * (0.5 + down * 1.6) + (vnoise(vx * 1.7, vy * 1.7 + vz) - 0.5) * 0.35 - down * down * 0.7;
      if (vz > 4.99) j = (vnoise(vx * 0.9, vy * 0.9) - 0.5) * 0.35;
      bp2.setXYZ(k, vx + vx / len * j, vy + vy / len * j, vz);
    }
    body.computeVertexNormals();
    var bc2 = new Float32Array(bp2.count * 3);
    for (var k2 = 0; k2 < bp2.count; k2++) {
      var dz2 = (5 - bp2.getZ(k2)) / 5, cr = vnoise(bp2.getX(k2) * 0.8, bp2.getY(k2) * 0.8 + bp2.getZ(k2));
      var lv = (1 - dz2 * 0.55) * (0.75 + cr * 0.35);
      bc2[k2 * 3] = lv; bc2[k2 * 3 + 1] = lv * 0.96; bc2[k2 * 3 + 2] = lv * 0.92;
    }
    body.setAttribute('color', new THREE.BufferAttribute(bc2, 3));
    var side = soilTexture(); side.repeat.set(0.06, 1 / 5); side.offset.set(0, 0);
    var bodyMesh = new THREE.Mesh(body, [new THREE.MeshLambertMaterial({ color: '#3c5a22' }), new THREE.MeshStandardMaterial({ map: side, roughness: 1, vertexColors: true })]);
    bodyMesh.rotation.x = -Math.PI / 2;
    bodyMesh.position.y = -5;
    scene.add(bodyMesh);

    // Gently rolling grass ground, shaded in large natural patches
    var N = 150, geo = new THREE.PlaneGeometry(w * 2, w * 2, N, N);
    geo.rotateX(-Math.PI / 2);
    var pos = geo.attributes.position, cols = new Float32Array(pos.count * 3), c = new THREE.Color();
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i), z = pos.getZ(i);
      if (!insideFarm(x, z, w, R)) {
        var cx = Math.sign(x) * (w - R), cz = Math.sign(z) * (w - R), dx = x - cx, dz = z - cz, d = Math.hypot(dx, dz);
        x = cx + dx / d * R; z = cz + dz / d * R;
      }
      pos.setXYZ(i, x, groundHeight(x, z, w), z);
      grassColour(x, z, c).multiplyScalar(1.6);
      cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    var tex = grassTexture(); tex.repeat.set(w * 2 / 5, w * 2 / 5);
    scene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, vertexColors: true, roughness: 0.95 })));

    // Real grass blades that sway in the breeze
    var blade = new THREE.BufferGeometry();
    var bw = 0.05, bp = [-bw, 0, 0, bw, 0, 0, -bw * 0.7, 0.45, 0.03, bw * 0.7, 0.45, 0.03, 0, 1, 0.12];
    var bc = [0.18, 0.2, 0.1, 0.18, 0.2, 0.1, 0.42, 0.46, 0.26, 0.42, 0.46, 0.26, 0.72, 0.74, 0.5];
    blade.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3));
    blade.setAttribute('color', new THREE.Float32BufferAttribute(bc, 3));
    blade.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4]);
    blade.computeVertexNormals();
    var mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    mat.onBeforeCompile = function (sh) {
      sh.uniforms.uTime = grassTime;
      sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\n' +
        'vec4 bw = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);\n' +
        'float sway = sin(uTime * 1.5 + bw.x * 0.3 + bw.z * 0.22) * 0.6 + sin(uTime * 2.6 + bw.x * 0.9 - bw.z * 0.7) * 0.25;\n' +
        'transformed.x += sway * position.y * position.y * 0.28;\n' +
        'transformed.z += sway * position.y * position.y * 0.12;');
    };
    var COUNT = 110000, FRINGE = 9000, grass = new THREE.InstancedMesh(blade, mat, COUNT + FRINGE), r = rand(11);
    var m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), p = new THREE.Vector3(), tint = new THREE.Color(), placed = 0;
    while (placed < COUNT) {
      var bx = (r() * 2 - 1) * (w - 0.15), bz = (r() * 2 - 1) * (w - 0.15);
      if (!insideFarm(bx, bz, w - 0.15, R - 0.15)) continue;
      var hgt = 0.25 + r() * r() * 0.75;
      e.set((r() - 0.5) * 0.5, r() * Math.PI * 2, (r() - 0.5) * 0.5); q.setFromEuler(e);
      p.set(bx, groundHeight(bx, bz, w) - 0.02, bz); sc.set(0.8 + r() * 0.6, hgt, 1);
      m.compose(p, q, sc); grass.setMatrixAt(placed, m);
      grassColour(bx, bz, tint).multiplyScalar(2.1 + (r() - 0.5) * 0.7);
      if (r() < 0.06) tint.lerp(DRY, 0.6).multiplyScalar(1.3);
      grass.setColorAt(placed, tint);
      placed++;
    }
    var axis = new THREE.Vector3(), qt = new THREE.Quaternion(), qy = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
    for (var f = 0; f < FRINGE; f++) {
      var rp = rimPoint(r(), w, R), inset = r() * 0.5;
      var fx = rp.x - rp.nx * inset, fz = rp.z - rp.nz * inset;
      qy.setFromAxisAngle(up, r() * Math.PI * 2);
      axis.set(rp.nz, 0, -rp.nx).normalize();
      qt.setFromAxisAngle(axis, 0.5 + r() * 1.0 + (0.5 - inset) * 0.6);
      q.copy(qt).multiply(qy);
      p.set(fx, groundHeight(fx, fz, w) - 0.05, fz); sc.set(0.9 + r() * 0.6, 0.45 + r() * 0.8, 1);
      m.compose(p, q, sc); grass.setMatrixAt(COUNT + f, m);
      grassColour(fx, fz, tint).multiplyScalar(1.7 + (r() - 0.5) * 0.7);
      if (r() < 0.12) tint.lerp(DRY, 0.6).multiplyScalar(1.3);
      grass.setColorAt(COUNT + f, tint);
    }
    grass.instanceMatrix.needsUpdate = true;
    scene.add(grass);

    // Stones poking out of the earth edge
    var rockGeo = new THREE.IcosahedronGeometry(1, 1), rpz = rockGeo.attributes.position;
    for (var v = 0; v < rpz.count; v++) {
      var vx3 = rpz.getX(v), vy3 = rpz.getY(v), vz3 = rpz.getZ(v), f3 = 0.75 + vnoise(vx3 * 2 + 5, vy3 * 2 + vz3 * 2) * 0.5;
      rpz.setXYZ(v, vx3 * f3, vy3 * f3 * 0.8, vz3 * f3);
    }
    rockGeo.computeVertexNormals();
    var ROCKS = 170, rocks = new THREE.InstancedMesh(rockGeo, new THREE.MeshStandardMaterial({ roughness: 0.92, flatShading: true }), ROCKS);
    var rr = rand(41), rq = new THREE.Quaternion(), re = new THREE.Euler(), rs = new THREE.Vector3(), rpv = new THREE.Vector3(), rc = new THREE.Color();
    for (var n2 = 0; n2 < ROCKS; n2++) {
      var rim = rimPoint(rr(), w, R), dep = 0.6 + rr() * 3.8, dn = dep / 5, out = -dn * dn * 0.7 + 0.15;
      rpv.set(rim.x + rim.nx * out, -dep, rim.z + rim.nz * out);
      re.set(rr() * 6.3, rr() * 6.3, rr() * 6.3); rq.setFromEuler(re);
      var big = 0.18 + rr() * rr() * 0.6; rs.set(big * (0.8 + rr() * 0.6), big * (0.6 + rr() * 0.5), big * (0.8 + rr() * 0.6));
      m.compose(rpv, rq, rs); rocks.setMatrixAt(n2, m);
      rc.setHSL(0.07 + rr() * 0.05, 0.08 + rr() * 0.1, 0.3 + rr() * 0.22); rocks.setColorAt(n2, rc);
    }
    scene.add(rocks);

    // Roots hanging from under the grass
    var rootPts = [], rr2 = rand(53);
    for (var t2 = 0; t2 < 420; t2++) {
      var rim2 = rimPoint(rr2(), w, R), L2 = 0.4 + rr2() * rr2() * 2.4, x2 = rim2.x + rim2.nx * 0.12, z2 = rim2.z + rim2.nz * 0.12, y2 = -0.05;
      var wob = (rr2() - 0.5) * 0.3, segs2 = 6;
      for (var g2 = 0; g2 < segs2; g2++) {
        var k3 = (g2 + 1) / segs2, dn3 = (k3 * L2) / 5;
        var nx2 = rim2.x + rim2.nx * (0.12 - dn3 * dn3 * 0.7 + Math.sin(k3 * 4 + t2) * 0.06) + rim2.nz * wob * k3;
        var nz2 = rim2.z + rim2.nz * (0.12 - dn3 * dn3 * 0.7 + Math.sin(k3 * 4 + t2) * 0.06) - rim2.nx * wob * k3;
        var ny2 = -k3 * L2;
        rootPts.push(x2, y2, z2, nx2, ny2, nz2); x2 = nx2; y2 = ny2; z2 = nz2;
      }
    }
    var rootGeo = new THREE.BufferGeometry(); rootGeo.setAttribute('position', new THREE.Float32BufferAttribute(rootPts, 3));
    scene.add(new THREE.LineSegments(rootGeo, new THREE.LineBasicMaterial({ color: '#6b5236', transparent: true, opacity: 0.85 })));
  })();

  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  // Messages
  var toastTimer = 0;
  function toast(text, seconds) {
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, (seconds || 2.4) * 1000);
  }

  // Time
  var MINUTES_PER_SECOND = 1.4;
  var day = 1;
  var minutes = 6 * 60;

  function clockText(m) {
    var h = Math.floor(m / 60) % 24, mm = Math.floor(m % 60 / 10) * 10;
    var am = h < 12, h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + (mm < 10 ? '0' : '') + mm + '<small>' + (am ? 'A·M' : 'P·M') + '</small>';
  }
  function showTime() {
    clockEl.innerHTML = clockText(minutes);
    var h = minutes / 60 % 24, stat = $('timeStat');
    var part = h >= 5 && h < 7.5 ? 'dawn' : h >= 7.5 && h < 17.5 ? 'day' : h >= 17.5 && h < 20 ? 'dusk' : 'night';
    ['dawn', 'day', 'dusk', 'night'].forEach(function (p) { stat.classList.toggle(p, p === part); });
    var size = day >= 100 ? 16 : 22;
    [dayEl, $('dayShade')].forEach(function (el) { el.textContent = day; el.setAttribute('font-size', size); });
    $('dayNext').textContent = day + 1;
  }

  // Sky colour
  var SKY = [
    [0, '#1a1840'], [5, '#2a2660'], [6, '#f6b8a8'], [8, '#9fd8ff'],
    [17, '#9fd8ff'], [19, '#f4a6a0'], [20.5, '#3a2f70'], [24, '#1a1840']
  ];
  var skyA = new THREE.Color(), skyB = new THREE.Color();
  function skyColour(m) {
    var h = (m / 60) % 24;
    for (var i = 0; i < SKY.length - 1; i++) {
      if (h >= SKY[i][0] && h <= SKY[i + 1][0]) {
        var t = (h - SKY[i][0]) / (SKY[i + 1][0] - SKY[i][0]);
        skyA.set(SKY[i][1]); skyB.set(SKY[i + 1][1]);
        return skyA.lerp(skyB, t);
      }
    }
    return skyA.set(SKY[0][1]);
  }

  function newDay(fainted) {
    day += 1;
    minutes = 6 * 60;
    mana = MANA_MAX;
    showMana();
    showTime();
    var cal = $('dayCal');
    cal.classList.remove('flip'); void cal.getBoundingClientRect(); cal.classList.add('flip');
    toast(fainted ? 'You were so tired you fell asleep. Good morning!' : 'Good morning! Day ' + day + '.', 3.2);
  }

  // Mana
  var MANA_MAX = 100;
  var mana = MANA_MAX;
  function showMana() {
    manaEl.style.width = (mana / MANA_MAX * 100) + '%';
    manaNumEl.textContent = Math.round(mana) + ' / ' + MANA_MAX;
  }

  // Hotbar
  var HOTBAR_SIZE = 6;
  var selected = 0;
  function buildHotbar() {
    hotbarEl.innerHTML = '';
    for (var i = 0; i < HOTBAR_SIZE; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot empty' + (i === selected ? ' selected' : '');
      b.setAttribute('aria-label', 'Slot ' + (i + 1) + ', empty');
      b.innerHTML = '<span class="slot-key">' + (i + 1) + '</span>';
      (function (n) { b.addEventListener('click', function () { selectSlot(n); }); })(i);
      hotbarEl.appendChild(b);
    }
  }
  function selectSlot(n) {
    selected = n;
    var slots = hotbarEl.children;
    for (var i = 0; i < slots.length; i++) slots[i].classList.toggle('selected', i === n);
  }

  // Buttons and keys
  function interact() { toast('Nothing here yet.'); }
  function castSpell() {
    if (mana < 20) { toast('Not enough mana.'); return; }
    mana -= 20;
    showMana();
    toast('Dawn Bloom! Nothing to water yet.');
  }
  function openBag() { toast('Your bag is empty.'); }

  function toggleFull() {
    var on = !document.body.classList.contains('full');
    document.body.classList.toggle('full', on);
    var el = document.documentElement;
    try {
      if (on && el.requestFullscreen) el.requestFullscreen().catch(function () {});
      else if (!on && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    } catch (e) {}
    setTimeout(resize, 60);
  }
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement) document.body.classList.remove('full');
    setTimeout(resize, 60);
  });

  $('btnAct').addEventListener('click', interact);
  $('btnSpell').addEventListener('click', castSpell);
  $('btnBag').addEventListener('click', openBag);
  $('btnFull').addEventListener('click', toggleFull);

  window.addEventListener('keydown', function (e) {
    if (e.repeat) return;
    var k = e.code;
    if (k === 'KeyE' || k === 'Space') { interact(); e.preventDefault(); }
    else if (k === 'KeyQ') castSpell();
    else if (k === 'KeyI') openBag();
    else if (k === 'KeyF') toggleFull();
    else if (/^Digit[1-6]$/.test(k)) selectSlot(+k.slice(5) - 1);
  });

  // Game loop
  var last = performance.now();
  function frame(now) {
    var dt = Math.min((now - last) / 1000, 0.1);
    last = now;

    var before = Math.floor(minutes / 10);
    minutes += dt * MINUTES_PER_SECOND;
    if (minutes >= 26 * 60) newDay(true);
    else if (Math.floor(minutes / 10) !== before) showTime();

    scene.background.copy(skyColour(minutes));
    scene.fog.color.copy(scene.background);
    grassTime.value = now / 1000;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  resize();
  buildHotbar();
  showTime();
  showMana();
  requestAnimationFrame(frame);
})();
