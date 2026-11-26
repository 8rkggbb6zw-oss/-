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
  camera.position.set(0, 5.5, 9.5);
  camera.lookAt(0, 1.1, 0);

  // Light
  var hemi = new THREE.HemisphereLight('#cfe4ff', '#4a5530', 0.6);
  scene.add(hemi);
  var sun = new THREE.DirectionalLight('#ffeccc', 1.6);
  sun.position.set(-40, 70, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = sun.shadow.camera.bottom = -45;
  sun.shadow.camera.right = sun.shadow.camera.top = 45;
  sun.shadow.camera.near = 20; sun.shadow.camera.far = 170;
  sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.04;
  scene.add(sun);
  scene.fog = new THREE.Fog('#9fd8ff', 120, 260);

  // The Farm Land
  var FARM = 34;
  function rand(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  function canvasTex(c, srgb) {
    var t = new THREE.CanvasTexture(c);
    if (srgb) t.encoding = THREE.sRGBEncoding;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }

  // The Grass with Specs of Soil
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
    var W = 1024, H = 512, c = document.createElement('canvas'); c.width = W; c.height = H;
    var g = c.getContext('2d'), r = rand(3);
    var grd = g.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, '#4a3a22'); grd.addColorStop(0.08, '#5c4029'); grd.addColorStop(0.5, '#4a3220'); grd.addColorStop(1, '#2c1d11');
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    // soft blotches of different earth tones
    for (var i = 0; i < 700; i++) {
      var x = r() * W, y = r() * H, rad = 6 + r() * 40;
      var tone = ['92,66,42', '58,40,24', '110,84,58', '70,52,34', '44,30,18', '120,100,72'][i % 6];
      var bl = g.createRadialGradient(x, y, 0, x, y, rad);
      bl.addColorStop(0, 'rgba(' + tone + ',' + (0.25 + r() * 0.3) + ')'); bl.addColorStop(1, 'rgba(' + tone + ',0)');
      g.fillStyle = bl; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // faint sediment layers
    for (var l = 0; l < 9; l++) {
      g.strokeStyle = 'rgba(' + (l % 2 ? '30,20,10' : '125,98,66') + ',.18)'; g.lineWidth = 2 + r() * 6;
      g.beginPath(); var y0 = 40 + l * 50 + r() * 20; g.moveTo(0, y0);
      for (var x2 = 0; x2 <= W; x2 += 32) g.lineTo(x2, y0 + (r() - .5) * 8);
      g.stroke();
    }
    // clods: lit on top, shaded underneath
    for (var k = 0; k < 900; k++) {
      var cx = r() * W, cy = 20 + r() * (H - 20), cw = 2 + r() * 7, ch = 1.5 + r() * 4;
      g.fillStyle = 'rgba(20,12,6,.5)'; g.beginPath(); g.ellipse(cx + .8, cy + 1.4, cw, ch, 0, 0, 6.3); g.fill();
      g.fillStyle = ['#5e432a', '#6d5034', '#4f3822', '#7a5c3d'][k % 4]; g.beginPath(); g.ellipse(cx, cy, cw, ch, 0, 0, 6.3); g.fill();
      g.fillStyle = 'rgba(190,160,120,.22)'; g.beginPath(); g.ellipse(cx - cw * .2, cy - ch * .4, cw * .55, ch * .35, 0, 0, 6.3); g.fill();
    }
    // grit and tiny pebbles
    for (var j = 0; j < 22000; j++) {
      var pv = r();
      g.fillStyle = pv < 0.5 ? 'rgba(18,10,4,.45)' : pv < 0.85 ? 'rgba(140,112,80,.4)' : 'rgba(170,160,150,.55)';
      var sz = pv > 0.85 ? 1 + r() * 2.2 : 0.6 + r() * 1.4;
      g.fillRect(r() * W, r() * H, sz, sz);
    }
    // fine root hairs
    for (var t = 0; t < 260; t++) {
      g.strokeStyle = 'rgba(' + (r() < .5 ? '58,40,22' : '168,138,96') + ',.6)'; g.lineWidth = 0.5 + r() * 0.8;
      var rx = r() * W, ry = r() * H * 0.6; g.beginPath(); g.moveTo(rx, ry);
      g.bezierCurveTo(rx + (r() - .5) * 20, ry + 15, rx + (r() - .5) * 20, ry + 30, rx + (r() - .5) * 16, ry + 20 + r() * 50); g.stroke();
    }
    var t2 = canvasTex(c, true); t2.wrapT = THREE.ClampToEdgeWrapping;
    return t2;
  }

  function rockTexture(banded) {
    var S = 512, c = document.createElement('canvas'); c.width = c.height = S;
    var g = c.getContext('2d'), r = rand(banded ? 23 : 17);
    g.fillStyle = '#c4bcae'; g.fillRect(0, 0, S, S);
    // mottled colour
    for (var i = 0; i < 520; i++) {
      var x = r() * S, y = r() * S, rad = 6 + r() * 50, tone = ['86,80,72', '214,206,192', '150,136,116', '118,110,102', '172,150,120'][i % 5];
      var bl = g.createRadialGradient(x, y, 0, x, y, rad);
      bl.addColorStop(0, 'rgba(' + tone + ',.4)'); bl.addColorStop(1, 'rgba(' + tone + ',0)');
      g.fillStyle = bl; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // layered bands for slate-like stones
    if (banded) for (var bnd = 0; bnd < 34; bnd++) {
      var by = r() * S, bh = 1 + r() * 7;
      g.fillStyle = 'rgba(' + (r() < .5 ? '60,56,52' : '200,192,178') + ',' + (0.15 + r() * 0.25) + ')';
      g.beginPath(); g.moveTo(0, by);
      for (var bx = 0; bx <= S; bx += 32) g.lineTo(bx, by + Math.sin(bx * 0.02 + bnd) * 4);
      g.lineTo(S, by + bh); for (var bx2 = S; bx2 >= 0; bx2 -= 32) g.lineTo(bx2, by + bh + Math.sin(bx2 * 0.02 + bnd) * 4);
      g.fill();
    }
    // mineral grains: dark specks, white quartz flecks and glinting mica
    for (var j = 0; j < 26000; j++) {
      var v = r(), sz = v < 0.9 ? 1 : 1 + r() * 2;
      g.fillStyle = v < 0.45 ? 'rgba(28,24,20,.45)' : v < 0.85 ? 'rgba(236,230,218,.45)' : v < 0.95 ? 'rgba(96,70,50,.5)' : 'rgba(255,250,235,.85)';
      g.fillRect(r() * S, r() * S, sz, sz);
    }
    // pale quartz veins
    for (var vn = 0; vn < 6; vn++) {
      g.strokeStyle = 'rgba(238,232,220,.55)'; g.lineWidth = 1 + r() * 2.5; g.beginPath();
      var vx = r() * S, vy = r() * S; g.moveTo(vx, vy);
      for (var q = 0; q < 8; q++) { vx += (r() - .3) * 50; vy += (r() - .5) * 30; g.lineTo(vx, vy); }
      g.stroke();
    }
    // hairline cracks with a lit edge
    for (var k = 0; k < 26; k++) {
      var cx = r() * S, cy = r() * S, pts = [[cx, cy]];
      for (var q2 = 0; q2 < 6; q2++) { cx += (r() - .5) * 46; cy += (r() - .5) * 46; pts.push([cx, cy]); }
      [['rgba(255,250,240,.35)', 0.7, 1], ['rgba(24,20,16,.7)', 0.6 + r() * 0.9, 0]].forEach(function (st) {
        g.strokeStyle = st[0]; g.lineWidth = st[1]; g.beginPath();
        pts.forEach(function (p, i) { if (i) g.lineTo(p[0] + st[2], p[1] + st[2]); else g.moveTo(p[0] + st[2], p[1] + st[2]); });
        g.stroke();
      });
    }
    // little pits
    for (var pt = 0; pt < 260; pt++) {
      var px = r() * S, py = r() * S, pr = 0.8 + r() * 2.4;
      g.fillStyle = 'rgba(30,26,22,.5)'; g.beginPath(); g.arc(px, py, pr, 0, 6.3); g.fill();
      g.fillStyle = 'rgba(240,234,222,.35)'; g.beginPath(); g.arc(px + pr * .4, py + pr * .4, pr * .5, 0, 6.3); g.fill();
    }
    // crusty lichen: grey-green and orange rosettes
    for (var l = 0; l < 70; l++) {
      var lx = r() * S, ly = r() * S, lr = 3 + r() * 12, col = r() < 0.65 ? [150, 162, 108] : r() < 0.6 ? [214, 196, 132] : [206, 132, 60];
      for (var dot = 0; dot < 26; dot++) {
        var an = r() * 6.3, d2 = Math.sqrt(r()) * lr;
        g.fillStyle = 'rgba(' + col.join(',') + ',' + (0.35 + r() * 0.4) + ')';
        g.beginPath(); g.arc(lx + Math.cos(an) * d2, ly + Math.sin(an) * d2, 0.8 + r() * 2.2, 0, 6.3); g.fill();
      }
    }
    // dark weathering streaks
    for (var w2 = 0; w2 < 18; w2++) {
      var sx = r() * S, sy = r() * S * 0.6, gr = g.createLinearGradient(sx, sy, sx, sy + 120);
      gr.addColorStop(0, 'rgba(40,34,28,.28)'); gr.addColorStop(1, 'rgba(40,34,28,0)');
      g.fillStyle = gr; g.fillRect(sx - 3 - r() * 6, sy, 6 + r() * 12, 120);
    }
    return canvasTex(c, true);
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
    var outline = [], N = 900;
    for (var i = 0; i < N; i++) { var pp = rimPoint(i / N, w, R); outline.push(new THREE.Vector2(pp.x, -pp.z)); }
    var shape = new THREE.Shape(outline);
    var body = new THREE.ExtrudeGeometry(shape, { depth: 5, steps: 22, bevelEnabled: false });
    // Crumbly earth edge that leans inward as it goes down
    var bp2 = body.attributes.position;
    for (var k = 0; k < bp2.count; k++) {
      var vx = bp2.getX(k), vy = bp2.getY(k), vz = bp2.getZ(k), down = (5 - vz) / 5;
      var len = Math.hypot(vx, vy); if (len < w * 0.5) continue;
      var j = (fbm(vx * 0.3 + vz * 0.25, vy * 0.3 - vz * 0.25) - 0.5) * (0.5 + down * 1.6) + (vnoise(vx * 1.7, vy * 1.7 + vz) - 0.5) * 0.35 + (vnoise(vx * 4.3 + vz * 3, vy * 4.3 - vz * 3) - 0.5) * 0.22 - down * down * 0.7;
      if (vz > 4.99) j = (vnoise(vx * 0.9, vy * 0.9) - 0.5) * 0.35;
      bp2.setXYZ(k, vx + vx / len * j, vy + vy / len * j, vz);
    }
    body.computeVertexNormals();
    // Smooth the earth's shading (the sides are built from separate pieces)
    var nrm = body.attributes.normal, acc = {};
    for (var k4 = 0; k4 < bp2.count; k4++) {
      var key = Math.round(bp2.getX(k4) * 50) + ',' + Math.round(bp2.getY(k4) * 50) + ',' + Math.round(bp2.getZ(k4) * 50);
      var a4 = acc[key] || (acc[key] = [0, 0, 0]); a4[0] += nrm.getX(k4); a4[1] += nrm.getY(k4); a4[2] += nrm.getZ(k4);
    }
    for (var k5 = 0; k5 < bp2.count; k5++) {
      var a5 = acc[Math.round(bp2.getX(k5) * 50) + ',' + Math.round(bp2.getY(k5) * 50) + ',' + Math.round(bp2.getZ(k5) * 50)];
      var l5 = Math.hypot(a5[0], a5[1], a5[2]) || 1; nrm.setXYZ(k5, a5[0] / l5, a5[1] / l5, a5[2] / l5);
    }
    var bc2 = new Float32Array(bp2.count * 3);
    for (var k2 = 0; k2 < bp2.count; k2++) {
      var dz2 = (5 - bp2.getZ(k2)) / 5, cr = vnoise(bp2.getX(k2) * 0.8, bp2.getY(k2) * 0.8 + bp2.getZ(k2));
      var lv = (1.25 - dz2 * 0.45) * (0.8 + cr * 0.3);
      var moss = Math.max(0, 1 - dz2 * 4.5) * Math.max(0, cr - 0.35) * 1.8;
      bc2[k2 * 3] = lv * (1 - moss * 0.45); bc2[k2 * 3 + 1] = lv * (0.96 + moss * 0.25); bc2[k2 * 3 + 2] = lv * (0.92 - moss * 0.4);
    }
    body.setAttribute('color', new THREE.BufferAttribute(bc2, 3));
    var side = soilTexture(); side.repeat.set(0.2, -0.2); side.offset.set(0, 0.2);
    var bodyMesh = new THREE.Mesh(body, [new THREE.MeshLambertMaterial({ color: '#120b06' }), new THREE.MeshStandardMaterial({ map: side, bumpMap: side, bumpScale: 0.2, roughness: 1, vertexColors: true })]);
    bodyMesh.rotation.x = -Math.PI / 2;
    bodyMesh.position.y = -5;
    bodyMesh.receiveShadow = true;
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
    var COUNT = 110000, FRINGE = 13000, grass = new THREE.InstancedMesh(blade, mat, COUNT + FRINGE), r = rand(11);
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
      var hang = f > 9000;
      if (hang) { fx = rp.x + rp.nx * 0.08; fz = rp.z + rp.nz * 0.08; }
      qt.setFromAxisAngle(axis, hang ? 1.7 + r() * 0.9 : 0.5 + r() * 1.0 + (0.5 - inset) * 0.6);
      q.copy(qt).multiply(qy);
      p.set(fx, hang ? 0.05 : groundHeight(fx, fz, w) - 0.05, fz); sc.set(0.9 + r() * 0.6, hang ? 0.5 + r() * r() * 1.6 : 0.45 + r() * 0.8, 1);
      m.compose(p, q, sc); grass.setMatrixAt(COUNT + f, m);
      grassColour(fx, fz, tint).multiplyScalar(1.7 + (r() - 0.5) * 0.7);
      if (r() < 0.12) tint.lerp(DRY, 0.6).multiplyScalar(1.3);
      grass.setColorAt(COUNT + f, tint);
    }
    grass.instanceMatrix.needsUpdate = true;
    scene.add(grass);

    // Stones set into the earth edge: rounded river stones, angular chunks, flat slates and small pebbles
    var rockTex = rockTexture(false), slateTex = rockTexture(true);
    var rr = rand(41), rq = new THREE.Quaternion(), re = new THREE.Euler(), rs = new THREE.Vector3(), rpv = new THREE.Vector3(), rc = new THREE.Color();
    var PAL = ['#8d8478', '#9c8f7c', '#6f6a66', '#a38c6e', '#7b6a5a', '#5d5a58', '#b0a48e'];
    var KINDS = [
      { detail: 4, sx: 1, sy: 0.7, sz: 0.95, rough: 0.5, flat: false, count: 75, size: [0.18, 0.6] },
      { detail: 2, sx: 1, sy: 0.85, sz: 0.9, rough: 0.75, flat: true, ridged: true, count: 65, size: [0.16, 0.55] },
      { detail: 3, sx: 1.2, sy: 0.32, sz: 0.9, rough: 0.6, flat: true, slate: true, count: 50, size: [0.2, 0.6] },
      { detail: 2, sx: 1, sy: 0.75, sz: 1, rough: 0.4, flat: false, count: 150, size: [0.05, 0.13] }
    ];
    KINDS.forEach(function (K, kind) {
      var rockGeo = new THREE.IcosahedronGeometry(1, K.detail), rpz = rockGeo.attributes.position, rcol = new Float32Array(rpz.count * 3);
      for (var v = 0; v < rpz.count; v++) {
        var vx3 = rpz.getX(v), vy3 = rpz.getY(v), vz3 = rpz.getZ(v), o = kind * 17;
        var bump = fbm(vx3 * 1.2 + vz3 * 0.7 + o, vy3 * 1.2 - vz3 * 0.5 + o);
        var fine = (vnoise(vx3 * 6 + vz3 * 4 + o, vy3 * 6 - vz3 * 3) - 0.5) * 0.06 + (vnoise(vx3 * 13 + o, vy3 * 13 + vz3 * 9) - 0.5) * 0.025;
        if (K.ridged) bump = 1 - Math.abs(bump * 2 - 1) * 0.9;
        var f3 = 1 - K.rough * 0.35 + bump * K.rough * 0.7 + fine;
        if (K.ridged && vx3 + vy3 * 0.6 > 0.55) f3 *= 0.86;
        rpz.setXYZ(v, vx3 * f3 * K.sx, vy3 * f3 * K.sy, vz3 * f3 * K.sz);
        var ao = 0.55 + bump * 0.5 + fine * 3, dirt = Math.max(0, -vy3 - 0.15) * 1.2, moss = Math.max(0, vy3 - 0.45) * Math.max(0, vnoise(vx3 * 3 + o, vz3 * 3) - 0.45) * 5;
        rcol[v * 3] = ao * (1 - dirt * 0.4) * (1 - moss * 0.45); rcol[v * 3 + 1] = ao * (1 - dirt * 0.5) * (1 + moss * 0.15); rcol[v * 3 + 2] = ao * (1 - dirt * 0.62) * (1 - moss * 0.55);
      }
      rockGeo.setAttribute('color', new THREE.BufferAttribute(rcol, 3));
      rockGeo.computeVertexNormals();
      var tx = K.slate ? slateTex : rockTex, mat = new THREE.MeshStandardMaterial({ map: tx, bumpMap: tx, bumpScale: 0.08, roughness: 0.82, metalness: 0.02, vertexColors: true, flatShading: K.flat });
      var rocks = new THREE.InstancedMesh(rockGeo, mat, K.count);
      for (var n2 = 0; n2 < K.count; n2++) {
        var rim = rimPoint(rr(), w, R), dep = 0.4 + rr() * 4.2, dn = dep / 5;
        var big = K.size[0] + rr() * rr() * (K.size[1] - K.size[0]);
        var out = -dn * dn * 0.7 + 0.08 + big * 0.15;
        rpv.set(rim.x + rim.nx * out, -dep, rim.z + rim.nz * out);
        re.set((rr() - 0.5) * (kind === 2 ? 0.5 : 1.2), rr() * 6.3, (rr() - 0.5) * (kind === 2 ? 0.4 : 1.2)); rq.setFromEuler(re);
        rs.set(big * (0.85 + rr() * 0.5), big * (0.75 + rr() * 0.5), big * (0.85 + rr() * 0.5));
        m.compose(rpv, rq, rs); rocks.setMatrixAt(n2, m);
        rc.set(PAL[(rr() * PAL.length) | 0]).multiplyScalar(0.85 + rr() * 0.35); rocks.setColorAt(n2, rc);
      }
      rocks.castShadow = true; rocks.receiveShadow = true;
      scene.add(rocks);
    });

    // Roots hanging from under the grass
    var rootPts = [], rr2 = rand(53);
    for (var t2 = 0; t2 < 220; t2++) {
      var rim2 = rimPoint(rr2(), w, R), L2 = 0.25 + rr2() * rr2() * 1.2, x2 = rim2.x + rim2.nx * 0.12, z2 = rim2.z + rim2.nz * 0.12, y2 = -0.05;
      var wob = (rr2() - 0.5) * 0.5, segs2 = 8;
      for (var g2 = 0; g2 < segs2; g2++) {
        var k3 = (g2 + 1) / segs2, dn3 = (k3 * L2) / 5;
        var nx2 = rim2.x + rim2.nx * (0.12 - dn3 * dn3 * 0.7 + Math.sin(k3 * 9 + t2) * 0.05) + rim2.nz * wob * k3;
        var nz2 = rim2.z + rim2.nz * (0.12 - dn3 * dn3 * 0.7 + Math.sin(k3 * 9 + t2) * 0.05) - rim2.nx * wob * k3;
        var ny2 = -k3 * L2;
        rootPts.push(x2, y2, z2, nx2, ny2, nz2); x2 = nx2; y2 = ny2; z2 = nz2;
      }
    }
    var rootGeo = new THREE.BufferGeometry(); rootGeo.setAttribute('position', new THREE.Float32BufferAttribute(rootPts, 3));
    scene.add(new THREE.LineSegments(rootGeo, new THREE.LineBasicMaterial({ color: '#5a4430' })));
  })();

  // Your witch: Witch.vrm, loaded from GitHub
  var witch = null;
  var MODEL_URLS = [window.EVERDAWN_MODEL_URL,
    'https://raw.githubusercontent.com/8rkggbb6zw-oss/-/claude/coding-conversation-f08c0n/Witch.vrm',
    'https://cdn.jsdelivr.net/gh/8rkggbb6zw-oss/-@claude/coding-conversation-f08c0n/Witch.vrm'].filter(Boolean);

  function loadWitch(n) {
    if (!THREE.GLTFLoader) { console.warn('Everdawn: GLTFLoader is missing'); return; }
    if (n >= MODEL_URLS.length * 2) { toast('Your witch could not be loaded.'); return; }
    new THREE.GLTFLoader().load(MODEL_URLS[n % MODEL_URLS.length], function (gltf) {
      try { witch = makeWitch(gltf); } catch (err) { console.error(err); }
    }, undefined, function () { setTimeout(function () { loadWitch(n + 1); }, n + 1 >= MODEL_URLS.length ? 2500 : 0); });
  }

  function makeWitch(gltf) {
    var root = gltf.scene, json = gltf.parser.json, vrm = json.extensions && json.extensions.VRMC_vrm;
    if (!vrm) throw new Error('Witch.vrm is not a VRM 1.0 model');
    var holder = new THREE.Group(); holder.add(root); scene.add(holder);
    root.updateMatrixWorld(true);

    // Soft cel shading that still takes the world's light and shade
    var GRAD = new THREE.DataTexture(new Uint8Array([150, 150, 150, 255, 215, 215, 215, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
    GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter; GRAD.needsUpdate = true;
    var meshes = [];
    function toon(m) {
      if (/Eye(Iris|Highlight|White)/.test(m.name)) return m;
      return new THREE.MeshToonMaterial({ name: m.name, color: m.color, map: m.map, gradientMap: GRAD, transparent: m.transparent, alphaTest: m.alphaTest,
        side: m.side, depthWrite: m.depthWrite, opacity: m.opacity, emissive: 0xffffff, emissiveMap: m.map, emissiveIntensity: 0.18,
        skinning: m.skinning, morphTargets: !!m.morphTargets });
    }
    root.traverse(function (o) {
      if (!o.isMesh) return;
      o.frustumCulled = false; o.castShadow = true; o.receiveShadow = true; meshes.push(o);
      var mats = (Array.isArray(o.material) ? o.material : [o.material]).map(toon);
      o.material = mats.length === 1 ? mats[0] : mats;
      if (/Face|Eye|Brow|Lash/.test(o.name)) o.renderOrder = 2;
    });

    // Her bones, and a way to turn them from her standing pose
    var names = json.nodes.map(function (nd) { return THREE.PropertyBinding.sanitizeNodeName(nd.name || ''); });
    var B = {};
    Object.keys(vrm.humanoid.humanBones).forEach(function (k) { B[k] = root.getObjectByName(names[vrm.humanoid.humanBones[k].node]); });
    var rest = new Map(), rootQi = root.getWorldQuaternion(new THREE.Quaternion()).invert();
    Object.keys(B).forEach(function (k) { var o = B[k]; if (o) rest.set(o, { local: o.quaternion.clone(), model: rootQi.clone().multiply(o.getWorldQuaternion(new THREE.Quaternion())) }); });
    var qa = new THREE.Quaternion(), ea = new THREE.Euler();
    function pose(o, d) { var r = o && rest.get(o); if (!r) return; qa.copy(r.model).invert().multiply(d).multiply(r.model); o.quaternion.copy(r.local).multiply(qa); }
    function E(x, y, z) { return new THREE.Quaternion().setFromEuler(ea.set(x, y, z)); }

    // Her face: blinking
    function exprBinds(name) {
      var e = vrm.expressions && vrm.expressions.preset && vrm.expressions.preset[name], out = [];
      if (!e || !e.morphTargetBinds) return out;
      e.morphTargetBinds.forEach(function (b) {
        var nd = root.getObjectByName(names[b.node]); if (!nd) return;
        nd.traverse(function (m) { if (m.isMesh && m.morphTargetInfluences) out.push([m, b.index, b.weight]); });
      });
      return out;
    }
    var blinkBinds = exprBinds('blink');
    function blink(v) { blinkBinds.forEach(function (b) { if (b[1] < b[0].morphTargetInfluences.length) b[0].morphTargetInfluences[b[1]] = b[2] * v; }); }

    // Standing on the farm
    var x = 0, z = 0;
    holder.position.set(x, groundHeight(x, z, FARM), z);
    var nextBlink = 2, blinkT = -1;

    return {
      group: holder,
      update: function (t, dt) {
        var br = Math.sin(t * 1.4);
        pose(B.spine, E(0.01 * br, 0, 0));
        pose(B.chest, E(0.015 * br, 0, 0));
        [[B.leftShoulder, B.leftUpperArm, B.leftLowerArm, B.leftHand, 1], [B.rightShoulder, B.rightUpperArm, B.rightLowerArm, B.rightHand, -1]].forEach(function (a) {
          var s = a[4], sway = Math.sin(t * 1.4 + s * 0.6) * 0.02;
          pose(a[0], E(0, 0, -s * 0.06));
          pose(a[1], E(0.05, 0, -s * (1.3 + sway)));
          pose(a[2], E(0, -s * 0.3, 0));
          pose(a[3], E(0, -s * 0.1, -s * 0.15));
        });
        pose(B.neck, E(0.02, 0.03 * Math.sin(t * 0.3), 0));
        pose(B.head, E(0.04, 0.05 * Math.sin(t * 0.3 + 1), 0.05));
        pose(B.rightLowerLeg, E(0.12, 0, 0));
        pose(B.rightUpperLeg, E(-0.06, -0.08, 0.02));
        nextBlink -= dt;
        if (nextBlink <= 0) { blinkT = 0; nextBlink = 2 + Math.random() * 3.5; }
        if (blinkT >= 0) { blinkT += dt; var bv = blinkT < 0.08 ? blinkT / 0.08 : Math.max(0, 1 - (blinkT - 0.08) / 0.1); blink(bv); if (blinkT > 0.2) { blink(0); blinkT = -1; } }
      }
    };
  }
  loadWitch(0);

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
    if (witch) witch.update(now / 1000, dt);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  resize();
  buildHotbar();
  showTime();
  showMana();
  requestAnimationFrame(frame);
})();
