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
  camera.position.set(0, 9.5, 10.2);
  camera.lookAt(0, 0.95, 0);

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
  var LAWN = new THREE.Color('#7f9a3e'), LUSH = new THREE.Color('#3d6327'), OLIVE = new THREE.Color('#5b7232'), DRY = new THREE.Color('#8f8a4a'), DARK = new THREE.Color('#2c4a1c');
  function grassColour(x, z, out) {
    var a = fbm(x * 0.06, z * 0.06), b = fbm(x * 0.17 + 40, z * 0.17 + 40), dry = Math.max(0, fbm(x * 0.045 + 90, z * 0.045 + 90) - 0.55) * 2.4;
    out.copy(LUSH).lerp(OLIVE, a).lerp(DARK, Math.max(0, 0.45 - b) * 1.2).lerp(DRY, Math.min(0.55, dry));
    return out;
  }

  var grassTime = { value: 0 }, grassCenter = { value: new THREE.Vector2(0, 0) };
  // Bare soil spots
  var soilSpots = { value: [] }, farmGrass = null, farmGround = null;
  for (var si = 0; si < 32; si++) soilSpots.value.push(new THREE.Vector3(0, 0, -1));
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

  function baseHeight(x, z, w) {
    var edge = Math.min(w - Math.abs(x), w - Math.abs(z));
    var fade = Math.max(0, Math.min(1, edge / 4));
    return 0.12 + fade * (0.55 + 0.28 * Math.sin(x * 0.11 + 1.3) * Math.cos(z * 0.09 - 0.7) + 0.14 * Math.sin(x * 0.23 + z * 0.17) + 0.06 * Math.sin(x * 0.61 - z * 0.47)) + 0.04 * Math.sin(x * 1.3) * Math.sin(z * 1.1);
  }

  function groundHeight(x, z, w) { return pondDip(baseHeight(x, z, w), pondT(x, z)); }

  // The Pond
  var PX = 14, PZ = 10, WY = 0, PDEEP = 1.6;
  function pondR(a) { return 1.4 * (7.6 + 1.1 * Math.sin(2 * a + 1) + 0.6 * Math.sin(3 * a + 2) + 0.35 * Math.sin(5 * a + 0.5)); }
  function pondT(x, z) { var dx = x - PX, dz = z - PZ; return Math.hypot(dx, dz) / pondR(Math.atan2(dz, dx)); }
  function pondDip(g, t) {
    if (t >= 1.35) return g;
    if (t < 1) return WY - 0.05 - PDEEP * Math.pow(1 - t * t, 2);
    var s = (t - 1) / 0.35; s = s * s * (3 - 2 * s);
    return (WY - 0.05) * (1 - s) + g * s;
  }
  (function () {
    var lo = 1e9;
    for (var i = 0; i < 96; i++) { var a = i / 96 * Math.PI * 2; [1, 1.15, 1.35].forEach(function (k) { lo = Math.min(lo, baseHeight(PX + Math.cos(a) * pondR(a) * k, PZ + Math.sin(a) * pondR(a) * k, FARM)); }); }
    WY = lo - 0.08;
  })();
  var PONDGLSL = function (P, gy) {
    return 'vec2 pd = ' + P + ' - vec2(' + PX.toFixed(2) + ', ' + PZ.toFixed(2) + '); float pa = atan(pd.y, pd.x);\n' +
      'float pt = length(pd) / (1.4 * (7.6 + 1.1 * sin(2.0 * pa + 1.0) + 0.6 * sin(3.0 * pa + 2.0) + 0.35 * sin(5.0 * pa + 0.5)));\n' +
      'if (pt < 1.0) ' + gy + ' = ' + WY.toFixed(4) + ' - 0.05 - ' + PDEEP.toFixed(2) + ' * pow(1.0 - pt * pt, 2.0);\n' +
      'else if (pt < 1.35) ' + gy + ' = mix(' + WY.toFixed(4) + ' - 0.05, ' + gy + ', smoothstep(1.0, 1.35, pt));\n';
  };

  (function buildFarm() {
    var R = 7, w = FARM;

    // Soil body with a rounded rim
    var outline = [], N = 900;
    for (var i = 0; i < N; i++) { var pp = rimPoint(i / N, w, R); outline.push(new THREE.Vector2(pp.x, -pp.z)); }
    var shape = new THREE.Shape(outline), hole = [];
    for (var hi2 = 0; hi2 < 160; hi2++) { var ha = hi2 / 160 * Math.PI * 2, hr = pondR(ha) * 1.2; hole.push(new THREE.Vector2(PX + Math.cos(ha) * hr, -(PZ + Math.sin(ha) * hr))); }
    shape.holes.push(new THREE.Path(hole));                           // room for the pond
    var body = new THREE.ExtrudeGeometry(shape, { depth: 5, steps: 22, bevelEnabled: false });
    // Crumbly earth edge that leans inward as it goes down
    var bp2 = body.attributes.position;
    for (var k = 0; k < bp2.count; k++) {
      var vx = bp2.getX(k), vy = bp2.getY(k), vz = bp2.getZ(k), down = (5 - vz) / 5;
      var len = Math.hypot(vx, vy); if (len < w * 0.5 || pondT(vx, -vy) < 1.5) continue;
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
      grassColour(x, z, c).lerp(LAWN, 0.45).multiplyScalar(1.1);
      cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    var tex = grassTexture(); tex.repeat.set(w * 2 / 1.6, w * 2 / 1.6);
    farmGround = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, vertexColors: true, roughness: 0.95 })); farmGround.receiveShadow = true;
    scene.add(farmGround);

    // Real grass blades that sway in the breeze
    // Each piece of grass is a little tuft of five blades
    var blade = new THREE.BufferGeometry(), bp = [], bc = [], bi = [], tr = rand(5);
    for (var tb = 0; tb < 5; tb++) {
      var bw = 0.011 + tr() * 0.006, h = 0.65 + tr() * 0.35, lean = 0.04 + tr() * 0.1, ang = tr() * Math.PI * 2;
      var ox = (tr() - 0.5) * 0.05, oz = (tr() - 0.5) * 0.05, ca = Math.cos(ang), sa = Math.sin(ang), base = bp.length / 3;
      [[-bw, 0, 0], [bw, 0, 0], [-bw * 0.7, 0.45 * h, lean * 0.3], [bw * 0.7, 0.45 * h, lean * 0.3], [0, h, lean]].forEach(function (v) {
        bp.push(ox + v[0] * ca + v[2] * sa, v[1], oz - v[0] * sa + v[2] * ca);
      });
      var tint = 0.85 + tr() * 0.3;
      bc.push(0.18 * tint, 0.2 * tint, 0.1 * tint, 0.18 * tint, 0.2 * tint, 0.1 * tint, 0.42 * tint, 0.46 * tint, 0.26 * tint, 0.42 * tint, 0.46 * tint, 0.26 * tint, 0.72 * tint, 0.74 * tint, 0.5 * tint);
      bi.push(base, base + 1, base + 2, base + 1, base + 3, base + 2, base + 2, base + 3, base + 4);
    }
    blade.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3));
    blade.setAttribute('color', new THREE.Float32BufferAttribute(bc, 3));
    blade.setIndex(bi);
    blade.computeVertexNormals();
    var mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    mat.onBeforeCompile = function (sh) {
      sh.uniforms.uTime = grassTime;
      sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\n' +
        'vec4 bw = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);\n' +
        'float sway = sin(uTime * 1.5 + bw.x * 0.3 + bw.z * 0.22) * 0.6 + sin(uTime * 2.6 + bw.x * 0.9 - bw.z * 0.7) * 0.25;\n' +
        'transformed.x += sway * position.y * position.y * 0.07;\n' +
        'transformed.z += sway * position.y * position.y * 0.035;');
    };
    var COUNT = 220000, FRINGE = 13000, grass = new THREE.InstancedMesh(blade, mat, COUNT + FRINGE), r = rand(11);
    var m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), p = new THREE.Vector3(), tint = new THREE.Color(), placed = 0;
    while (placed < COUNT) {
      var bx = (r() * 2 - 1) * (w - 0.15), bz = (r() * 2 - 1) * (w - 0.15);
      if (!insideFarm(bx, bz, w - 0.15, R - 0.15)) continue;
      var ptt = pondT(bx, bz); if (ptt < 1.07 || (ptt < 1.16 && r() > (ptt - 1.07) / 0.09)) continue;   // no grass in the water
      var hgt = 0.05 + r() * r() * 0.09;
      e.set((r() - 0.5) * 0.5, r() * Math.PI * 2, (r() - 0.5) * 0.5); q.setFromEuler(e);
      p.set(bx, groundHeight(bx, bz, w) - 0.02, bz); sc.set(1.5 + r() * 0.9, hgt * 1.2, 1);
      m.compose(p, q, sc); grass.setMatrixAt(placed, m);
      grassColour(bx, bz, tint).multiplyScalar(1.55 + (r() - 0.5) * 0.6);
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
      p.set(fx, hang ? 0.05 : groundHeight(fx, fz, w) - 0.05, fz); sc.set(0.9 + r() * 0.6, hang ? 0.15 + r() * r() * 0.45 : 0.08 + r() * 0.16, 1);
      m.compose(p, q, sc); grass.setMatrixAt(COUNT + f, m);
      grassColour(fx, fz, tint).multiplyScalar(1.7 + (r() - 0.5) * 0.7);
      if (r() < 0.12) tint.lerp(DRY, 0.6).multiplyScalar(1.3);
      grass.setColorAt(COUNT + f, tint);
    }
    grass.instanceMatrix.needsUpdate = true;
    scene.add(grass); farmGrass = grass;

    // Thick lawn around wherever she is: a deep carpet of grass that moves along with her, so no bare ground shows
    function addLawn(TILE, NEAR, size, inner, seed, hole) {
    var ng = new THREE.InstancedBufferGeometry();
    ng.index = blade.index; ng.setAttribute('position', blade.attributes.position); ng.setAttribute('color', blade.attributes.color); ng.setAttribute('normal', blade.attributes.normal);
    var aOff = new Float32Array(NEAR * 2), aRot = new Float32Array(NEAR), aScl = new Float32Array(NEAR * 2), aCol = new Float32Array(NEAR * 3), nr = rand(seed), nc = new THREE.Color();
    for (var ni = 0; ni < NEAR; ni++) {
      var gx = (nr() - 0.5) * TILE, gz = (nr() - 0.5) * TILE;
      aOff[ni * 2] = gx; aOff[ni * 2 + 1] = gz; aRot[ni] = nr() * Math.PI * 2;
      aScl[ni * 2] = (0.9 + nr() * 0.6) * size; aScl[ni * 2 + 1] = (0.06 + nr() * nr() * 0.08) * Math.sqrt(size);
      grassColour(gx * 3.1, gz * 3.1, nc).multiplyScalar(1.55 + (nr() - 0.5) * 0.6);
      if (nr() < 0.05) nc.lerp(DRY, 0.5).multiplyScalar(1.2);
      aCol[ni * 3] = nc.r; aCol[ni * 3 + 1] = nc.g; aCol[ni * 3 + 2] = nc.b;
    }
    ng.setAttribute('aOff', new THREE.InstancedBufferAttribute(aOff, 2));
    ng.setAttribute('aRot', new THREE.InstancedBufferAttribute(aRot, 1));
    ng.setAttribute('aScl', new THREE.InstancedBufferAttribute(aScl, 2));
    ng.setAttribute('aCol', new THREE.InstancedBufferAttribute(aCol, 3));
    ng.instanceCount = NEAR;
    var nmat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    nmat.onBeforeCompile = function (sh) {
      sh.uniforms.uTime = grassTime; sh.uniforms.uCenter = grassCenter; sh.uniforms.uTile = { value: TILE }; sh.uniforms.uInner = { value: inner }; sh.uniforms.uHole = { value: hole };
      sh.uniforms.uFarm = { value: w }; sh.uniforms.uRound = { value: R }; sh.uniforms.uSoil = soilSpots;
      sh.vertexShader = 'uniform float uTime; uniform vec2 uCenter; uniform float uTile; uniform float uInner; uniform float uHole; uniform float uFarm; uniform float uRound; uniform vec3 uSoil[32];\n' +
        'attribute vec2 aOff; attribute float aRot; attribute vec2 aScl; attribute vec3 aCol;\n' +
        sh.vertexShader.replace('#include <color_vertex>', '#include <color_vertex>\nvColor.rgb *= aCol;').replace('#include <begin_vertex>',
        'vec3 transformed = vec3(position);\n' +
        'vec2 wp = aOff + uTile * floor((uCenter - aOff) / uTile + 0.5);\n' +
        'float fade = (1.0 - smoothstep(uTile * uInner, uTile * 0.48, length(wp - uCenter))) * (uHole > 0.0 ? smoothstep(uHole * 0.6, uHole, length(wp - uCenter)) : 1.0);\n' +
        'vec2 q = max(abs(wp) - (uFarm - uRound), 0.0);\n' +
        'float onIsland = step(length(q), uRound - 0.35);\n' +
        'float edgeD = min(uFarm - abs(wp.x), uFarm - abs(wp.y)), hf = clamp(edgeD / 4.0, 0.0, 1.0);\n' +
        'float gy = 0.12 + hf * (0.55 + 0.28 * sin(wp.x * 0.11 + 1.3) * cos(wp.y * 0.09 - 0.7) + 0.14 * sin(wp.x * 0.23 + wp.y * 0.17) + 0.06 * sin(wp.x * 0.61 - wp.y * 0.47)) + 0.04 * sin(wp.x * 1.3) * sin(wp.y * 1.1);\n' +
        PONDGLSL('wp', 'gy') + 'onIsland *= step(1.07, pt) * step(fract(aRot * 5.31), (pt - 1.07) / 0.09) * step(0.04, fade);\n' +
        'float bare = 1.0, jit = fract(aRot * 7.13);\n' +
        'float dryc = 1.0;\n' +
        'for (int i = 0; i < 32; i++) { vec3 sp = uSoil[i]; if (sp.z > 0.0) { float sd = length(wp - sp.xy); bare = min(bare, smoothstep(sp.z * 0.45, sp.z * (1.3 + jit * 0.7), sd)); dryc = min(dryc, smoothstep(sp.z * 0.45, sp.z * 2.2, sd)); } }\n' +
        'if (fract(aRot * 3.71) < 0.12) bare = max(bare, 0.35 + jit * 0.25);\n' +
        'vColor.rgb = mix(vColor.rgb, vColor.rgb * vec3(1.1, 0.9, 0.55), (1.0 - dryc) * 0.75);\n' +
        'transformed.xz *= aScl.x; transformed.y *= aScl.y * fade * onIsland * bare;\n' +
        'transformed.xz *= onIsland;\n' +
        'float cr = cos(aRot), sr = sin(aRot);\n' +
        'transformed.xz = vec2(cr * transformed.x - sr * transformed.z, sr * transformed.x + cr * transformed.z);\n' +
        'float sway = sin(uTime * 1.5 + wp.x * 0.3 + wp.y * 0.22) * 0.6 + sin(uTime * 2.6 + wp.x * 0.9 - wp.y * 0.7) * 0.25;\n' +
        'float ty = transformed.y / max(aScl.y, 0.001);\n' +
        'transformed.x += sway * ty * ty * 0.012; transformed.z += sway * ty * ty * 0.006;\n' +
        'transformed += vec3(wp.x, gy - 0.01, wp.y);');
    };
    var nearGrass = new THREE.Mesh(ng, nmat); nearGrass.frustumCulled = false;
    scene.add(nearGrass);
    }
    addLawn(28, 130000, 1, 0.18, 77, 0);

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

  // The Dawn Tree
  var TREE_X = -24, TREE_Z = -24;
  var dawn = (function () {
    var r = rand(4242), tree = new THREE.Group(), baseY = groundHeight(TREE_X, TREE_Z, FARM);
    tree.position.set(TREE_X, baseY, TREE_Z); tree.rotation.y = 0.4;
    function localGround(x, z) { var c = Math.cos(0.4), s = Math.sin(0.4); return groundHeight(TREE_X + x * c + z * s, TREE_Z - x * s + z * c, FARM) - baseY; }
    function paint(w, h, fn, srgb) { var c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return canvasTex(c, srgb); }
    // Soft Glow
    function glowTex(stops) {
      var S = 64, d = new Uint8Array(S * S * 4);
      for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
        var t = Math.hypot((x + 0.5) / S - 0.5, (y + 0.5) / S - 0.5) * 2, a = stops[stops.length - 1][1];
        for (var i = 1; i < stops.length; i++) if (t <= stops[i][0]) { a = stops[i - 1][1] + (stops[i][1] - stops[i - 1][1]) * (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]); break; }
        var k = (y * S + x) * 4; d[k] = d[k + 1] = d[k + 2] = 255; d[k + 3] = Math.round(Math.max(0, Math.min(1, a)) * 255);
      }
      var tx = new THREE.DataTexture(d, S, S, THREE.RGBAFormat); tx.magFilter = THREE.LinearFilter; tx.minFilter = THREE.LinearMipmapLinearFilter; tx.generateMipmaps = true; tx.needsUpdate = true; return tx;
    }
    var GLOW = glowTex([[0, 1], [0.3, 0.45], [1, 0]]);
    function glow(col, size, op) {
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }));
      sp.scale.set(size, size, 1); return sp;
    }

    // Bark
    var BW = 256, BH = 512;
    function barkPaint(g, bump) {
      g.fillStyle = bump ? '#808080' : '#5e3f5f'; g.fillRect(0, 0, BW, BH);
      function wrapStroke(fn) { for (var ox = -BW; ox <= BW; ox += BW) for (var oy = -BH; oy <= BH; oy += BH) fn(ox, oy); }
      var rr = rand(7);
      for (var i = 0; i < 520; i++) {
        var x = rr() * BW, y = rr() * BH, len = 20 + rr() * 70, wd = 3 + rr() * 9, lt = rr();
        var col = bump ? 'rgba(' + (140 + lt * 90 | 0) + ',' + (140 + lt * 90 | 0) + ',' + (140 + lt * 90 | 0) + ',.5)'
          : 'rgba(' + (110 + lt * 60 | 0) + ',' + (74 + lt * 44 | 0) + ',' + (112 + lt * 52 | 0) + ',.45)';
        g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'round';
        wrapStroke(function (ox, oy) { g.beginPath(); g.moveTo(x + ox, y + oy); g.bezierCurveTo(x + ox + 4, y + oy + len * 0.3, x + ox - 4, y + oy + len * 0.7, x + ox + (lt - 0.5) * 6, y + oy + len); g.stroke(); });
      }
      for (var f = 0; f < 70; f++) {                                   // fissures
        var fx = rr() * BW, fy = rr() * BH, fl = 60 + rr() * 200, fw = 1 + rr() * 3.5, j1 = rr() * 6, j2 = rr() * 6;
        g.strokeStyle = bump ? 'rgba(0,0,0,.9)' : 'rgba(26,12,26,.85)'; g.lineWidth = fw;
        wrapStroke(function (ox, oy) {
          g.beginPath();
          for (var s = 0; s <= 12; s++) { var k = s / 12, px = fx + ox + Math.sin(k * 5 + j1) * 5 + Math.sin(k * 13 + j2) * 1.6, py = fy + oy + k * fl; if (s) g.lineTo(px, py); else g.moveTo(px, py); }
          g.stroke();
        });
        if (!bump) { g.strokeStyle = 'rgba(206,168,206,.18)'; g.lineWidth = 1; wrapStroke(function (ox, oy) { g.beginPath(); g.moveTo(fx + ox + fw + 1, fy + oy); g.lineTo(fx + ox + fw + 1 + Math.sin(j1) * 4, fy + oy + fl); g.stroke(); }); }
      }
      for (var l = 0; l < 260; l++) {                                  // lenticels
        var lx = rr() * BW, ly = rr() * BH, lw = 4 + rr() * 9;
        g.fillStyle = bump ? 'rgba(40,40,40,.6)' : 'rgba(' + (150 + rr() * 50 | 0) + ',120,140,.35)';
        g.fillRect(lx, ly, lw, 1 + rr());
      }
      if (!bump) for (var m = 0; m < 900; m++) { var v = rr(); g.fillStyle = 'rgba(' + (v < 0.5 ? '20,10,22' : '220,190,220') + ',' + (0.05 + rr() * 0.1) + ')'; g.fillRect(rr() * BW, rr() * BH, 1 + rr() * 2, 1 + rr() * 2); }
    }
    var bark = paint(BW, BH, function (g) { barkPaint(g, false); }, true), barkBump = paint(BW, BH, function (g) { barkPaint(g, true); });
    // Glowing veins winding up the bark, with fine forks
    function veinPaint(g, w, h, soft) {
      var barkR = rand(19);
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.lineCap = 'round';
      for (var i = 0; i < 5; i++) {
        var x0 = barkR() * w, p1 = barkR() * 6.28, p2 = barkR() * 6.28, jag = [];
        for (var j = 0; j < h / 8; j++) jag.push((barkR() - 0.5) * 4);
        var vx = function (y, ox) { var k = y / h * Math.PI * 2, n = ((y / 8) % jag.length + jag.length) % jag.length; return x0 + ox + Math.sin(k + p1) * 10 + Math.sin(k * 3 + p2) * 4 + jag[n]; };
        (soft ? [[26, 'rgba(255,90,210,.16)', 26], [13, 'rgba(255,120,220,.3)', 16], [5, 'rgba(255,180,240,.6)', 8]]
          : [[8, 'rgba(255,120,220,.35)', 10], [2.6, 'rgba(255,180,240,1)', 5], [1.1, '#fff', 0]]).forEach(function (L) {
          g.lineWidth = L[0]; g.strokeStyle = L[1]; g.shadowColor = '#ff8fe0'; g.shadowBlur = L[2];
          for (var ox = -w; ox <= w; ox += w) { g.beginPath(); for (var y = -16; y <= h + 16; y += 8) { if (y === -16) g.moveTo(vx(y, ox), y); else g.lineTo(vx(y, ox), y); } g.stroke(); }
        });
        g.shadowBlur = soft ? 10 : 3; g.strokeStyle = soft ? 'rgba(255,140,225,.35)' : 'rgba(255,200,245,.85)'; g.lineWidth = soft ? 4 : 1;
        for (var b = 0; b < 7; b++) { var by = barkR() * h, bx = vx(by, 0), dir = barkR() < 0.5 ? -1 : 1; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + dir * 6, by + 8, bx + dir * (8 + barkR() * 8), by + 16 + barkR() * 14); g.stroke(); }
      }
      g.shadowBlur = 0;
    }
    var veins = paint(128, 512, function (g, w, h) { veinPaint(g, w, h, false); }), veinGlow = paint(128, 512, function (g, w, h) { veinPaint(g, w, h, true); });
    var barkMat = new THREE.MeshStandardMaterial({ map: bark, bumpMap: barkBump, bumpScale: 0.06, roughness: 0.88, vertexColors: true,
      emissive: new THREE.Color('#ff7ad8'), emissiveMap: veins, emissiveIntensity: 0.6 });

    // Wood: smooth tapering tubes that twist and ripple, all joined into one mesh
    var wood = [];
    function limb(points, r0, r1, opt) {
      opt = opt || {};
      var curve = new THREE.CatmullRomCurve3(points), L = opt.segs || 14, R = opt.sides || 12, len = curve.getLength();
      var fr = curve.computeFrenetFrames(L, false), pos = [], uv = [], idx = [];
      var uRep = Math.max(1, Math.round(r0 * 5)), vRate = uRep / (2 * Math.PI * r0) * 0.5;
      for (var i = 0; i <= L; i++) {
        var t = i / L, c = curve.getPointAt(t), N = fr.normals[i], Bn = fr.binormals[i];
        var rad0 = r0 + (r1 - r0) * Math.pow(t, 0.8);
        for (var j = 0; j <= R; j++) {
          var a = j / R * Math.PI * 2 + (opt.twist || 0) * t;
          var rad = opt.radius ? opt.radius(t, c.y, Math.atan2(N.z * Math.cos(a) + Bn.z * Math.sin(a), N.x * Math.cos(a) + Bn.x * Math.sin(a))) : rad0;
          var rr2 = rad * (1 + (opt.ridge || 0.05) * Math.sin(a * (opt.lobes || 5) + t * 3) + 0.04 * Math.sin(a * 11 + t * 17));
          var ca = Math.cos(a), sa = Math.sin(a);
          pos.push(c.x + (N.x * ca + Bn.x * sa) * rr2, c.y + (N.y * ca + Bn.y * sa) * rr2, c.z + (N.z * ca + Bn.z * sa) * rr2);
          uv.push(j / R * uRep, t * len * vRate);
        }
      }
      // faces turned outward, whichever way the frame spins
      var c1 = curve.getPointAt(0), q0 = new THREE.Vector3().fromArray(pos, 0), q1 = new THREE.Vector3().fromArray(pos, (R + 1) * 3), q2 = new THREE.Vector3().fromArray(pos, 3);
      var out = q1.clone().sub(q0).cross(q2.clone().sub(q0)).dot(q0.clone().sub(c1)) > 0;
      for (var i2 = 0; i2 < L; i2++) for (var j2 = 0; j2 < R; j2++) { var a2 = i2 * (R + 1) + j2, b2 = a2 + R + 1; if (out) idx.push(a2, b2, a2 + 1, b2, b2 + 1, a2 + 1); else idx.push(a2, a2 + 1, b2, b2, a2 + 1, b2 + 1); }
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
      g.computeVertexNormals();
      // close the seam: average normals where the ring wraps
      var nm = g.attributes.normal;
      for (var i3 = 0; i3 <= L; i3++) { var s0 = i3 * (R + 1), s1 = s0 + R; var nx = nm.getX(s0) + nm.getX(s1), ny = nm.getY(s0) + nm.getY(s1), nz = nm.getZ(s0) + nm.getZ(s1), nl = Math.hypot(nx, ny, nz) || 1; nm.setXYZ(s0, nx / nl, ny / nl, nz / nl); nm.setXYZ(s1, nx / nl, ny / nl, nz / nl); }
      wood.push(g);
      return curve;
    }
    function V(x, y, z) { return new THREE.Vector3(x, y, z); }

    // Trunk: one smooth piece that swells into buttresses where each root leaves it
    var TRUNK_H = 4.4, roots = [];
    for (var d = 0; d < 7; d++) roots.push({ a: d / 7 * Math.PI * 2 + r() * 0.4, l: 2.0 + r() * 0.9, w: (r() - 0.5) * 0.5 });
    limb([V(0, -0.4, 0), V(0.05, 1.2, 0.04), V(0.16, 2.6, -0.05), V(0.08, TRUNK_H, 0)], 0.6, 0.36, {
      segs: 40, sides: 64, twist: 1.6, lobes: 6, ridge: 0.09,
      radius: function (t, y, a) {
        var h = Math.max(0, y), b = 0;
        roots.forEach(function (rt) { b += Math.pow(Math.max(0, Math.cos(a - rt.a)), 14); });
        return 0.6 * (1 - 0.4 * h / TRUNK_H) + 0.12 * Math.exp(-h * 3) + 0.7 * Math.exp(-h * 1.7) * b;
      }
    });
    // Roots: running on from each buttress, half-buried in the soil, then diving under it; side roots fork off and dig in too
    var rr = rand(321), mounds = [];
    function at(x, z, up) { return V(x, localGround(x, z) + up, z); }
    roots.forEach(function (rt) {
      var rx = Math.cos(rt.a), rz = Math.sin(rt.a), rl = rt.l, wob = rt.w, sx = -rz, sz = rx;
      function pt(d, side, up) { return at(rx * d + sx * side, rz * d + sz * side, up); }
      var main = limb([V(rx * 0.3, 1.1, rz * 0.3), V(rx * 0.72, 0.45, rz * 0.72), pt(1.25, 0, 0.1), pt(rl * 0.5, wob * 0.3, 0.0), pt(rl * 0.78, wob * 0.8, -0.12), pt(rl * 1.05, wob, -0.5)], 0.3, 0.03, {
        segs: 30, sides: 14, lobes: 3, ridge: 0.06,
        radius: function (t) { return t < 0.25 ? 0.08 + 0.22 * Math.sin(t / 0.25 * Math.PI / 2) : 0.3 - 0.27 * Math.pow((t - 0.25) / 0.75, 0.7); } });
      mounds.push([main.getPoint(0.8), rt.a, 0.24]);
      for (var k = 0; k < 2; k++) {
        var f = 0.38 + rr() * 0.2, from = main.getPoint(f), sa = rt.a + (k ? 1 : -1) * (0.6 + rr() * 0.5), sl = 0.7 + rr() * 0.6;
        var dx = Math.cos(sa), dz = Math.sin(sa);
        var side = limb([from.clone().add(V(0, -0.04, 0)), at(from.x + dx * sl * 0.45, from.z + dz * sl * 0.45, 0.01), at(from.x + dx * sl, from.z + dz * sl, -0.35)], 0.11, 0.02, { segs: 12, sides: 9, lobes: 3, ridge: 0.06 });
        mounds.push([side.getPoint(0.62), sa, 0.12]);
      }
    });
    // Grass fading into the soil: patches of bare earth with ragged edges, the grass thinning, shortening and yellowing towards them
    // Soil patch: damp dark earth in the middle, drier and grittier towards its ragged edge, with leaf litter, twigs, pebbles, moss and roots
    function edgeAt(a) { return 0.3 + (vnoise(Math.cos(a) * 2.2 + 9, Math.sin(a) * 2.2 + 4) - 0.5) * 0.22 + (vnoise(Math.cos(a) * 6 + 2, Math.sin(a) * 6) - 0.5) * 0.08; }
    var patchTex = paint(512, 512, function (g, w) {
      var c = w / 2;
      // Earth, pixel by pixel: damp and dark in the middle, drier and paler outward, with a soft grainy edge that breaks up into the grass
      var img = g.createImageData(w, w), D = img.data;
      for (var py = 0; py < w; py++) for (var px = 0; px < w; px++) {
        var u = (px - c) / w, v = (py - c) / w, d = Math.hypot(u, v), an = Math.atan2(v, u);
        var big = fbm(px * 0.012 + 3, py * 0.012 + 7), mid = vnoise(px * 0.05, py * 0.05), grain = rr();
        var edge = edgeAt(an) + (big - 0.5) * 0.12;
        var tt = Math.max(0, Math.min(1, (edge - d) / 0.2)), al = Math.max(0, Math.min(1, tt * 1.9 - 0.25 + ((grain - 0.5) * 1.2 + (mid - 0.5) * 0.7) * (1 - tt)));   // solid earth inside, breaking into grains at the edge
        var damp = Math.max(0, Math.min(1, 1 - d / 0.3)) * 0.6 + (1 - big) * 0.4;
        var r0 = 104 - damp * 58, g0 = 84 - damp * 48, b0 = 62 - damp * 36, k = 0.8 + mid * 0.3 + (grain - 0.5) * 0.3;
        var worn = Math.max(0, Math.min(1, (d - edge + 0.18) / 0.18)) * 0.65;   // trampled, half-dead grass colour where it meets the lawn
        var o = (py * w + px) * 4;
        D[o] = (r0 * k) * (1 - worn) + 84 * worn; D[o + 1] = (g0 * k) * (1 - worn) + 86 * worn; D[o + 2] = (b0 * k) * (1 - worn) + 46 * worn; D[o + 3] = al * 255;
      }
      g.putImageData(img, 0, 0);
      g.globalCompositeOperation = 'source-atop';                          // details only where there's soil
      function sprinkle(n, fn, slack, bias) { for (var i = 0; i < n; i++) { var a = rr() * 6.28, d = Math.pow(rr(), bias || 0.5) * 0.5, x = c + Math.cos(a) * d * w, y = c + Math.sin(a) * d * w; fn(x, y, d, a); } }
      sprinkle(7000, function (x, y, d) {                              // crumbs and grit, each with a tiny shadow
        var v = rr(), r = 0.5 + rr() * rr() * 2.2;
        g.fillStyle = 'rgba(10,6,3,.45)'; g.beginPath(); g.arc(x + 0.6, y + 0.7, r, 0, 6.28); g.fill();
        g.fillStyle = v < 0.5 ? 'rgba(' + (60 + rr() * 30 | 0) + ',' + (44 + rr() * 22 | 0) + ',30,.9)' : v < 0.9 ? 'rgba(' + (110 + rr() * 30 | 0) + ',' + (92 + rr() * 24 | 0) + ',70,.85)' : 'rgba(160,150,135,.85)';
        g.beginPath(); g.arc(x, y, r, 0, 6.28); g.fill();
      }, 0, 0.6);
      sprinkle(140, function (x, y) {                                  // pebbles, lit from the top left
        var r = 1.5 + rr() * 4, t = 110 + rr() * 70; g.fillStyle = 'rgba(15,10,6,.5)'; g.beginPath(); g.ellipse(x + 1, y + 1.2, r, r * 0.75, 0, 0, 6.28); g.fill();
        var pg = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); pg.addColorStop(0, 'rgb(' + (t + 50) + ',' + (t + 42) + ',' + (t + 30) + ')'); pg.addColorStop(1, 'rgb(' + (t - 40) + ',' + (t - 46) + ',' + (t - 54) + ')');
        g.fillStyle = pg; g.beginPath(); g.ellipse(x, y, r, r * 0.75, rr() * 3, 0, 6.28); g.fill();
      });
      sprinkle(170, function (x, y) {                                  // old leaves, curled and browned
        g.save(); g.translate(x, y); g.rotate(rr() * 6.28); var L = 5 + rr() * 7, h = 20 + rr() * 22;
        g.fillStyle = 'hsl(' + h + ',' + (30 + rr() * 30) + '%,' + (18 + rr() * 16) + '%)'; g.beginPath(); g.moveTo(-L, 0); g.quadraticCurveTo(0, -L * 0.5, L, 0); g.quadraticCurveTo(0, L * 0.5, -L, 0); g.fill();
        g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(-L, 0); g.lineTo(L, 0); g.stroke(); g.restore();
      }, 0.06);
      sprinkle(26, function (x, y) {                                   // twigs
        var a = rr() * 6.28, L = 10 + rr() * 22; g.strokeStyle = 'rgb(' + (40 + rr() * 30 | 0) + ',28,20)'; g.lineWidth = 1 + rr() * 1.4; g.lineCap = 'round';
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.3) * L * 0.5, y + Math.sin(a + 0.3) * L * 0.5, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke();
        if (rr() < 0.5) { g.lineWidth *= 0.6; g.beginPath(); g.moveTo(x + Math.cos(a) * L * 0.5, y + Math.sin(a) * L * 0.5); g.lineTo(x + Math.cos(a + 0.7) * L * 0.8, y + Math.sin(a + 0.7) * L * 0.8); g.stroke(); }
      });
      sprinkle(30, function (x, y) {                                   // fine roots showing through the soil
        var a = rr() * 6.28; g.strokeStyle = 'rgba(70,50,40,.7)'; g.lineWidth = 0.7 + rr(); g.beginPath(); g.moveTo(x, y);
        for (var k = 1; k < 6; k++) { a += (rr() - 0.5) * 0.9; x += Math.cos(a) * 5; y += Math.sin(a) * 5; g.lineTo(x, y); } g.stroke();
      });
      sprinkle(900, function (x, y, d) {                               // moss creeping in from the edge
        if (d < 0.2) return; g.fillStyle = 'hsla(' + (75 + rr() * 30) + ',' + (35 + rr() * 25) + '%,' + (18 + rr() * 14) + '%,.75)'; g.beginPath(); g.arc(x, y, 0.8 + rr() * 2.2, 0, 6.28); g.fill();
      }, 0.1, 0.3);
      sprinkle(260, function (x, y, d) {                               // a few short blades still holding on
        if (d < 0.17) return; var a = -Math.PI / 2 + (rr() - 0.5) * 1.2, L = 3 + rr() * 6;
        g.strokeStyle = 'hsl(' + (70 + rr() * 30) + ',' + (35 + rr() * 20) + '%,' + (28 + rr() * 18) + '%)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke();
      }, 0.08, 0.3);
    }, true);
    patchTex.wrapS = patchTex.wrapT = THREE.ClampToEdgeWrapping;
    var patchMat = new THREE.MeshStandardMaterial({ map: patchTex, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 });
    var spots = mounds.map(function (m) { return [m[0].x, m[0].z, m[2] * 2.8]; }); spots.push([0, 0, 3]);
    tree.updateMatrixWorld(true);
    spots.forEach(function (sp, n) {
      var pg = new THREE.PlaneGeometry(1, 1, 12, 12); pg.rotateX(-Math.PI / 2); pg.rotateY(rr() * 6.28);
      var pp2 = pg.attributes.position, D = sp[2] * 2.3;
      for (var v = 0; v < pp2.count; v++) { var X = sp[0] + pp2.getX(v) * D, Z = sp[1] + pp2.getZ(v) * D; pp2.setXYZ(v, X, localGround(X, Z) + 0.012, Z); }
      var patch = new THREE.Mesh(pg, patchMat); patch.receiveShadow = true; tree.add(patch);
      var wpos = tree.localToWorld(V(sp[0], 0, sp[1])); soilSpots.value[n].set(wpos.x, wpos.z, sp[2]);
    });
    // Small stones half-sunk in the soil
    var pebG = new THREE.IcosahedronGeometry(1, 2), pbp = pebG.attributes.position;
    for (var pv2 = 0; pv2 < pbp.count; pv2++) { var kk = 0.9 + rr() * 0.15; pbp.setXYZ(pv2, pbp.getX(pv2) * kk, pbp.getY(pv2) * kk, pbp.getZ(pv2) * kk); }
    pebG.computeVertexNormals();
    var pebbles = new THREE.InstancedMesh(pebG, new THREE.MeshStandardMaterial({ roughness: 0.85 }), 160), pn = 0, pM = new THREE.Matrix4(), pQ = new THREE.Quaternion(), pE = new THREE.Euler(), pP = new THREE.Vector3(), pS = new THREE.Vector3(), pC = new THREE.Color();
    spots.forEach(function (sp) {
      for (var k = 0; k < Math.round(sp[2] * 26); k++) {
        var a = rr() * 6.28, d = Math.sqrt(rr()) * sp[2] * 0.8, x = sp[0] + Math.cos(a) * d, z = sp[1] + Math.sin(a) * d, sz = 0.015 + rr() * rr() * 0.05;
        if (Math.hypot(x, z) < 1.05 || pn >= 160) continue;
        pE.set(rr() * 3, rr() * 3, rr() * 3); pQ.setFromEuler(pE); pP.set(x, localGround(x, z) + sz * 0.15, z); pS.set(sz * 1.3, sz * 0.7, sz);
        pM.compose(pP, pQ, pS); pebbles.setMatrixAt(pn, pM); var t = 0.2 + rr() * 0.2; pC.setRGB(t * 1.08, t, t * 0.88); pebbles.setColorAt(pn, pC); pn++;
      }
    });
    pebbles.count = pn; pebbles.castShadow = pebbles.receiveShadow = true; tree.add(pebbles);
    if (farmGrass) {                                                    // the island's grass round each patch
      var ga = farmGrass.instanceMatrix.array, gc = farmGrass.instanceColor && farmGrass.instanceColor.array;
      for (var gi2 = 0; gi2 < farmGrass.count; gi2++) {
        var gx = ga[gi2 * 16 + 12], gz = ga[gi2 * 16 + 14];
        if (Math.abs(gx - TREE_X) > 7 || Math.abs(gz - TREE_Z) > 7) continue;
        var bare = 1, dry = 1, jt = rr(), hold = rr() < 0.12;
        soilSpots.value.forEach(function (sp) { if (sp.z > 0) { var dd = Math.hypot(gx - sp.x, gz - sp.y), lo = sp.z * 0.45, hi = sp.z * (1.3 + jt * 0.7), k = Math.max(0, Math.min(1, (dd - lo) / (hi - lo))); bare = Math.min(bare, k * k * (3 - 2 * k)); var kd = Math.max(0, Math.min(1, (dd - lo) / (sp.z * 2.2 - lo))); dry = Math.min(dry, kd * kd * (3 - 2 * kd)); } });
        if (hold) bare = Math.max(bare, 0.35 + jt * 0.25);                // a few tough tufts hang on in the soil
        if (dry >= 1) continue;
        for (var e = 4; e < 7; e++) ga[gi2 * 16 + e] *= bare;
        var wd = (1 - dry) * 0.75; if (gc) { gc[gi2 * 3] *= 1 + 0.1 * wd; gc[gi2 * 3 + 1] *= 1 - 0.1 * wd; gc[gi2 * 3 + 2] *= 1 - 0.45 * wd; }
      }
      farmGrass.instanceMatrix.needsUpdate = true; if (gc) farmGrass.instanceColor.needsUpdate = true;
    }
    if (farmGround) {                                                   // the ground under the grass turns earthy towards the tree
      var fg = farmGround.geometry, fpos = fg.attributes.position, fcol = fg.attributes.color, earth = new THREE.Color('#8f6c48'), fc = new THREE.Color();
      for (var fv = 0; fv < fpos.count; fv++) {
        var vx = fpos.getX(fv), vz = fpos.getZ(fv), near = 1;
        soilSpots.value.forEach(function (sp) { if (sp.z > 0) { var kd = Math.max(0, Math.min(1, (Math.hypot(vx - sp.x, vz - sp.y) - sp.z * 0.3) / (sp.z * 1.9))); near = Math.min(near, kd); } });
        if (near >= 1) continue;
        var amt = (1 - near * near * (3 - 2 * near)) * (0.75 + 0.25 * vnoise(vx * 1.7, vz * 1.7));
        fc.fromArray(fcol.array, fv * 3).lerp(earth, Math.min(1, amt * 1.05)); fc.toArray(fcol.array, fv * 3);
      }
      fcol.needsUpdate = true;
    }
    // Branches: a leader, wide curving limbs, side branches and fine twigs; blossom gathers at their ends
    var clumps = [], hang = [];
    var leader = limb([V(0.08, 3.6, 0), V(0.3, 5.3, 0.1), V(0.1, 6.7, -0.2)], 0.38, 0.08, { twist: 0.3, ridge: 0.05 });
    clumps.push({ p: leader.getPoint(1), r: 1.5 }, { p: leader.getPoint(0.6), r: 1.2 });
    function twigs(from, ang, rise, n, len, rad) {
      for (var k = 0; k < n; k++) {
        var a = ang + (r() - 0.5) * 1.6, l = len * (0.7 + r() * 0.5);
        var end = V(from.x + Math.cos(a) * l, from.y + rise * (0.4 + r() * 0.6), from.z + Math.sin(a) * l);
        var tw = limb([from, from.clone().lerp(end, 0.5).add(V(0, 0.12, 0)), end], rad, rad * 0.35, { segs: 6, sides: 6 });
        clumps.push({ p: tw.getPoint(1), r: 0.75 + r() * 0.25 });
      }
    }
    for (var li = 0; li < 7; li++) {
      var la = li / 7 * Math.PI * 2 + r() * 0.5, lx = Math.cos(la), lz = Math.sin(la), y0 = 3.2 + r() * 1.0, reach = 2.6 + r() * 0.7;
      var lb = limb([V(lx * 0.05, y0 - 0.7, lz * 0.05), V(lx * 0.6, y0 + 0.2, lz * 0.6), V(lx * 1.2, y0 + 0.8, lz * 1.2), V(lx * reach * 0.8, y0 + 1.3, lz * reach * 0.8), V(lx * reach, y0 + 1.5 + r() * 0.5, lz * reach)], 0.3, 0.07, { segs: 18, sides: 14, twist: 0.3, ridge: 0.04 });
      clumps.push({ p: lb.getPoint(1), r: 1.3 + r() * 0.3 }, { p: lb.getPoint(0.55), r: 1.0 });
      hang.push(lb.getPoint(0.75));
      twigs(lb.getPoint(1), la, 0.5, 2, 0.8, 0.06);
      for (var sb = 0; sb < 2; sb++) {
        var sa = la + (sb ? 0.7 : -0.7) + (r() - 0.5) * 0.3, from = lb.getPoint(0.6 + sb * 0.2), sl = 1.0 + r() * 0.5;
        var sub = limb([from, V(from.x + Math.cos(sa) * sl * 0.5, from.y + 0.5, from.z + Math.sin(sa) * sl * 0.5), V(from.x + Math.cos(sa) * sl, from.y + 0.7 + r() * 0.4, from.z + Math.sin(sa) * sl)], 0.13, 0.04, { segs: 8, sides: 8 });
        clumps.push({ p: sub.getPoint(1), r: 1.0 + r() * 0.3 });
        twigs(sub.getPoint(1), sa, 0.4, 2, 0.6, 0.04);
      }
    }
    // Join the wood, shading it darker underneath and damp near the ground
    var P = [], Nn = [], U = [], I = [], C = [], TH = [], off = 0;
    wood.forEach(function (g) {
      var p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
      for (var i = 0; i < p.count; i++) {
        P.push(p.getX(i), p.getY(i), p.getZ(i)); Nn.push(n.getX(i), n.getY(i), n.getZ(i)); U.push(u.getX(i), u.getY(i));
        var sh = 1 - 0.38 * Math.max(0, -n.getY(i)), low = Math.max(0, 1 - (p.getY(i) + 0.2) / 1.1);
        var moss = low * Math.max(0, n.getY(i)) * (0.5 + 0.5 * vnoise(p.getX(i) * 4, p.getZ(i) * 4));   // moss on the tops of the roots near the ground
        C.push(sh * (1 - low * 0.35) * (1 - moss * 0.5), sh * (1 - low * 0.22) * (1 + moss * 0.15), sh * (1 - low * 0.38) * (1 - moss * 0.7));
        TH.push(Math.max(0, Math.min(1, (p.getY(i) - 1.4) / 2.6)));
      }
      for (var j = 0; j < g.index.count; j++) I.push(g.index.getX(j) + off);
      off += p.count;
    });
    var wg = new THREE.BufferGeometry();
    wg.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); wg.setAttribute('normal', new THREE.Float32BufferAttribute(Nn, 3));
    wg.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); wg.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); wg.setIndex(I);
    wg.setAttribute('aThin', new THREE.Float32BufferAttribute(TH, 1));
    // Veins: only their bright cores glow higher up, so they're skinnier towards the top
    barkMat.onBeforeCompile = function (sh) {
      sh.vertexShader = 'attribute float aThin;\nvarying float vThin;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvThin = aThin;');
      sh.fragmentShader = 'varying float vThin;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>',
        'vec4 emissiveColor = texture2D(emissiveMap, vUv);\nemissiveColor.rgb = emissiveMapTexelToLinear(emissiveColor).rgb;\n' +
        'float vTh = vThin * 0.75, vL = max(emissiveColor.r, max(emissiveColor.g, emissiveColor.b));\n' +
        'totalEmissiveRadiance *= emissiveColor.rgb * smoothstep(vTh, vTh + 0.2, vL);');
    };
    var woodMesh = new THREE.Mesh(wg, barkMat); woodMesh.castShadow = woodMesh.receiveShadow = true; tree.add(woodMesh);
    // Vein glow: a soft pink haze just off the bark
    var gg = wg.clone(), gp = gg.attributes.position, gn = gg.attributes.normal;
    for (var gi = 0; gi < gp.count; gi++) { gp.setXYZ(gi, gp.getX(gi) + gn.getX(gi) * 0.02, gp.getY(gi) + gn.getY(gi) * 0.02, gp.getZ(gi) + gn.getZ(gi) * 0.02); var gf = 0.8 - 0.7 * TH[gi]; gg.attributes.color.setXYZ(gi, gf, gf, gf); }
    var glowMat = new THREE.MeshBasicMaterial({ map: veinGlow, color: '#ff62d2', vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    tree.add(new THREE.Mesh(gg, glowMat));

    // Blossom: loose clusters of real cherry flowers with notched petals, blushing hearts, gold stamens and young leaves
    var blossomTex = paint(512, 512, function (g) {
      var CL = []; for (var c = 0; c < 11; c++) { var ca = r() * 6.28, cr = c === 0 ? 0 : 80 + r() * 110; CL.push([256 + Math.cos(ca) * cr, 256 + Math.sin(ca) * cr * 0.9, 55 + r() * 45]); }
      function inCl() { var k = CL[Math.floor(r() * CL.length)], a = r() * 6.28, d = Math.sqrt(r()) * k[2]; return [k[0] + Math.cos(a) * d, k[1] + Math.sin(a) * d, k]; }
      for (var l = 0; l < 60; l++) {
        var lp = inCl(); g.save(); g.translate(lp[0], lp[1]); g.rotate(r() * 6.28);
        var lg = g.createLinearGradient(-18, 0, 18, 0); lg.addColorStop(0, 'hsl(' + (85 + r() * 25) + ',38%,24%)'); lg.addColorStop(1, 'hsl(' + (80 + r() * 25) + ',42%,' + (36 + r() * 10) + '%)');
        g.fillStyle = lg; g.beginPath(); g.moveTo(-18, 0); g.quadraticCurveTo(0, -9, 18, 0); g.quadraticCurveTo(0, 9, -18, 0); g.fill();
        g.strokeStyle = 'rgba(30,50,20,.5)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-16, 0); g.lineTo(16, 0); g.stroke(); g.restore();
      }
      for (var i = 0; i < 420; i++) {
        var fp = inCl(), x = fp[0], y = fp[1], sz = 10 + r() * 10, spin = r() * 6.28;
        var edge = Math.hypot(x - fp[2][0], y - fp[2][1]) / fp[2][2], lit = Math.max(0, Math.min(1, 0.6 - ((x - 256) + (y - 256)) / 520 + (1 - edge) * 0.15));
        var hue = r() < 0.15 ? 305 + r() * 15 : 334 + r() * 16, sat = 55 + r() * 25, lo = 76 + lit * 12 + r() * 5;
        for (var k = 0; k < 5; k++) {
          var pa = spin + k / 5 * Math.PI * 2 + (r() - 0.5) * 0.2; g.save(); g.translate(x, y); g.rotate(pa);
          var pg = g.createLinearGradient(0, 0, sz, 0); pg.addColorStop(0, 'hsl(' + hue + ',' + (sat + 15) + '%,' + (lo - 20) + '%)'); pg.addColorStop(0.55, 'hsl(' + hue + ',' + sat + '%,' + lo + '%)'); pg.addColorStop(1, 'hsl(' + hue + ',' + (sat - 15) + '%,' + Math.min(96, lo + 10) + '%)');
          g.fillStyle = pg; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(sz * 0.3, -sz * 0.5, sz * 0.95, -sz * 0.45, sz, -sz * 0.1); g.lineTo(sz * 0.85, 0); g.lineTo(sz, sz * 0.1); g.bezierCurveTo(sz * 0.95, sz * 0.45, sz * 0.3, sz * 0.5, 0, 0); g.fill();
          g.strokeStyle = 'rgba(190,80,130,.25)'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(sz * 0.15, 0); g.lineTo(sz * 0.75, 0); g.stroke();
          g.restore();
        }
        g.fillStyle = 'hsl(' + (338 + r() * 10) + ',58%,' + (55 + lit * 10) + '%)'; g.beginPath(); g.arc(x, y, sz * 0.15, 0, 6.28); g.fill();
        g.fillStyle = 'rgba(255,232,160,.95)'; for (var st = 0; st < 7; st++) { var sa = r() * 6.28, sr = sz * (0.22 + r() * 0.16); g.beginPath(); g.arc(x + Math.cos(sa) * sr, y + Math.sin(sa) * sr, 1.1, 0, 6.28); g.fill(); }
      }
    }, true);
    // Hanging strands: trailing sprays of pale blossom, thinning towards the tip
    var strandTex = paint(64, 256, function (g) {
      g.strokeStyle = 'rgba(70,40,50,.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(32, 0); g.bezierCurveTo(30, 90, 35, 170, 32, 250); g.stroke();
      for (var y = 4; y < 250; y += 5) {
        var f = y / 256, n = Math.max(1, Math.round(4 * (1 - f * 0.8)));
        for (var k = 0; k < n; k++) {
          var bx = 32 + (r() - 0.5) * 30 * (1 - f * 0.6), by = y + r() * 4, bs = 6 * (1 - f * 0.55) * (0.7 + r() * 0.5);
          for (var p = 0; p < 5; p++) { var a = p / 5 * 6.28 + r(); g.fillStyle = 'hsl(' + (328 + r() * 20) + ',' + (55 + r() * 25) + '%,' + (80 + r() * 10 - f * 6) + '%)'; g.beginPath(); g.ellipse(bx + Math.cos(a) * bs * 0.5, by + Math.sin(a) * bs * 0.5, bs * 0.5, bs * 0.34, a, 0, 6.28); g.fill(); }
          g.fillStyle = 'hsl(340,60%,52%)'; g.beginPath(); g.arc(bx, by, bs * 0.18, 0, 6.28); g.fill();
        }
      }
    }, true);
    bark.wrapS = bark.wrapT = barkBump.wrapS = barkBump.wrapT = veins.wrapS = veins.wrapT = veinGlow.wrapS = veinGlow.wrapT = THREE.RepeatWrapping;
    blossomTex.wrapS = blossomTex.wrapT = strandTex.wrapS = strandTex.wrapT = THREE.ClampToEdgeWrapping;
    // Each card lit as if it faced out of its cluster, so the canopy is bright on top and shaded beneath; swaying in the breeze
    function blossomMat(tex, glowAmt, droop) {
      var m = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.35, transparent: true, side: THREE.DoubleSide, roughness: 0.75,
        emissive: new THREE.Color('#ff86d6'), emissiveMap: tex, emissiveIntensity: glowAmt });
      m.onBeforeCompile = function (sh) {
        sh.uniforms.uTime = grassTime;
        sh.vertexShader = 'attribute vec3 aN;\nuniform float uTime;\n' + sh.vertexShader
          .replace('#include <defaultnormal_vertex>', 'vec3 transformedNormal = normalMatrix * aN;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\n' +
            'vec3 ip = instanceMatrix[3].xyz;\n' +
            'float wv = sin(uTime * 1.4 + ip.x * 0.8 + ip.z * 0.6) + 0.5 * sin(uTime * 2.3 + ip.y * 1.7);\n' +
            (droop ? 'transformed.x += wv * 0.06 * position.y * position.y; transformed.z += wv * 0.03 * position.y * position.y;\n' : 'transformed.xy += wv * 0.025;\n'));
        sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_begin>', 'float faceDirection = 1.0;\nvec3 normal = normalize(vNormal);\nvec3 geometryNormal = normal;');
      };
      return m;
    }
    var bMat = blossomMat(blossomTex, 0.22, false), sMat = blossomMat(strandTex, 0.45, true);
    function cards(geo, tex, mat, max) {
      geo.setAttribute('aN', new THREE.InstancedBufferAttribute(new Float32Array(max * 3), 3));
      var b = new THREE.InstancedMesh(geo, mat, max);
      b.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.35 });
      b.castShadow = true; b.n = 0; b.frustumCulled = false; return b;
    }
    var blossoms = cards(new THREE.PlaneGeometry(1, 1), blossomTex, bMat, 2400);
    var sGeo = new THREE.PlaneGeometry(0.34, 1.6); sGeo.translate(0, -0.8, 0);
    var strands = cards(sGeo, strandTex, sMat, 500);
    var M = new THREE.Matrix4(), Q = new THREE.Quaternion(), Q2 = new THREE.Quaternion(), Pp = new THREE.Vector3(), Sc = new THREE.Vector3(), Col = new THREE.Color(), Dir = new THREE.Vector3(), Z = new THREE.Vector3(0, 0, 1), Eu = new THREE.Euler();
    function addCard(b, n, shade, tint) {
      if (b.n >= b.instanceMatrix.count) return;
      M.compose(Pp, Q, Sc); b.setMatrixAt(b.n, M);
      b.geometry.attributes.aN.setXYZ(b.n, n.x, n.y, n.z);
      Col.setRGB(shade * (tint || 1), shade, shade); b.setColorAt(b.n, Col); b.n++;
    }
    clumps.forEach(function (c) {
      var many = Math.round(34 * c.r);
      for (var i = 0; i < many; i++) {
        Dir.set(r() - 0.5, (r() - 0.3) * 0.9, r() - 0.5).normalize();
        Pp.copy(Dir).multiplyScalar(c.r * (0.35 + r() * 0.75)); Pp.y *= 0.7; Pp.add(c.p);
        Q.setFromUnitVectors(Z, Dir); Q2.setFromAxisAngle(Z, r() * 6.28); Q.multiply(Q2);
        Eu.set((r() - 0.5) * 0.9, (r() - 0.5) * 0.9, 0); Q.multiply(Q2.setFromEuler(Eu));
        var s = c.r * (0.85 + r() * 0.5); Sc.set(s, s, s);
        var up = Dir.y, high = Math.max(0, Math.min(1, (Pp.y - 3.5) / 3.5));
        var shade = 0.72 + Math.max(0, Math.min(1, 0.45 + up * 0.5)) * 0.24 + high * 0.1 + (r() - 0.5) * 0.08;
        addCard(blossoms, Dir, shade, r() < 0.2 ? 0.94 : 1);
      }
      for (var h = 0; h < (c.r > 1.1 ? 2 : 1); h++) {
        Pp.set((r() - 0.5) * c.r * 1.3, -c.r * 0.3, (r() - 0.5) * c.r * 1.3).add(c.p);
        var hs = 0.45 + r() * 0.55, yaw = r() * 6.28;
        for (var x = 0; x < 2; x++) {
          Eu.set((r() - 0.5) * 0.12, yaw + x * Math.PI / 2, (r() - 0.5) * 0.12); Q.setFromEuler(Eu); Sc.set(1, hs, 1);
          addCard(strands, Dir.set(Pp.x - c.p.x, 0.4, Pp.z - c.p.z).normalize(), 0.9 + r() * 0.1);
        }
      }
    });
    [blossoms, strands].forEach(function (b) { b.count = b.n; b.instanceMatrix.needsUpdate = true; b.geometry.attributes.aN.needsUpdate = true; if (b.instanceColor) b.instanceColor.needsUpdate = true; tree.add(b); });

    // Soft glows inside the canopy
    for (var cg = 0; cg < 6; cg++) { var gl = glow(cg % 2 ? '#c9a0ff' : '#ff9be0', 3.6, 0.16), gc = clumps[cg * 5 % clumps.length].p; gl.position.set(gc.x * 0.7, gc.y - 0.3, gc.z * 0.7); tree.add(gl); }
    var halo = glow('#ffb6ec', 9, 0.18); halo.position.set(0, 5.4, 0); tree.add(halo);

    // Glass orbs hanging on fine threads, each with a warm glowing heart
    var threadMat = new THREE.MeshBasicMaterial({ color: '#f3d2ea' }), coreMat = new THREE.MeshBasicMaterial({ color: '#fff3cf' });
    var glassMat = new THREE.MeshStandardMaterial({ color: '#ffe6f6', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.32, emissive: new THREE.Color('#ffb0e0'), emissiveIntensity: 0.35, depthWrite: false });
    var capMat = new THREE.MeshStandardMaterial({ color: '#d9cfe8', metalness: 0.9, roughness: 0.3 });
    var orbs = [];
    hang.forEach(function (hp, n) {
      var pivot = new THREE.Group(), drop = 0.7 + r() * 0.6; pivot.position.copy(hp);
      var th = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, drop, 4), threadMat); th.position.y = -drop / 2; pivot.add(th);
      var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.05, 10), capMat); cap.position.y = -drop - 0.005; pivot.add(cap);
      var core = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 10), coreMat); core.position.y = -drop - 0.12; pivot.add(core);
      var shell = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), glassMat); shell.position.y = -drop - 0.12; pivot.add(shell);
      var hl = glow(n % 2 ? '#ffd27a' : '#ff9be0', 0.95, 0.7); hl.position.y = -drop - 0.12; pivot.add(hl);
      tree.add(pivot); orbs.push({ pivot: pivot, halo: hl, p: r() * 6.28 });
    });

    // Glowing mushrooms in little clusters between the roots
    var capProfile = [], stemProfile = [];
    for (var cp = 0; cp <= 10; cp++) { var ang = cp / 10 * Math.PI / 2; capProfile.push(new THREE.Vector2(Math.sin(ang) * 1.0, Math.cos(ang) * 0.62)); }
    capProfile.push(new THREE.Vector2(0.97, -0.05), new THREE.Vector2(0.55, -0.12), new THREE.Vector2(0.12, -0.06));
    for (var sp2 = 0; sp2 <= 6; sp2++) { var tt = sp2 / 6; stemProfile.push(new THREE.Vector2(0.14 + 0.06 * (1 - tt) * (1 - tt) + 0.02 * Math.sin(tt * 3), tt)); }
    var capGeo = new THREE.LatheGeometry(capProfile, 20), stemGeo = new THREE.LatheGeometry(stemProfile, 10);
    var capM = new THREE.MeshStandardMaterial({ color: '#2f86b8', emissive: new THREE.Color('#1c8fe6'), emissiveIntensity: 0.6, roughness: 0.45, side: THREE.DoubleSide });
    var stemM = new THREE.MeshStandardMaterial({ color: '#b9c6d6', roughness: 0.7, emissive: new THREE.Color('#8fd8ff'), emissiveIntensity: 0.08 });
    for (var mc = 0; mc < 6; mc++) {
      var ma = mc / 6 * Math.PI * 2 + 0.45 + r() * 0.3, md = 1.35 + r() * 0.8, many2 = 1 + Math.floor(r() * 3);
      for (var mu = 0; mu < many2; mu++) {
        var ms = (0.5 + r() * 0.7) * (mu ? 0.7 : 1), mx = Math.cos(ma) * md + (r() - 0.5) * 0.25, mz = Math.sin(ma) * md + (r() - 0.5) * 0.25, my = localGround(mx, mz) - 0.02, lean = (r() - 0.5) * 0.4;
        var mush = new THREE.Group(); mush.position.set(mx, my, mz); mush.rotation.set(lean, r() * 6.28, (r() - 0.5) * 0.4);
        var st2 = new THREE.Mesh(stemGeo, stemM); st2.scale.set(0.25 * ms, 0.22 * ms, 0.25 * ms); mush.add(st2);
        var cp2 = new THREE.Mesh(capGeo, capM); cp2.position.y = 0.21 * ms; cp2.scale.set(0.12 * ms, 0.12 * ms, 0.12 * ms); mush.add(cp2);
        tree.add(mush);
      }
      var mg = glow('#7fd6ff', 0.9, 0.45); mg.position.set(Math.cos(ma) * md, localGround(Math.cos(ma) * md, Math.sin(ma) * md) + 0.15, Math.sin(ma) * md); tree.add(mg);
    }

    // Petals: a notched, gently cupped petal shape
    var ps = new THREE.Shape(); ps.moveTo(0, 0); ps.bezierCurveTo(0.03, 0.01, 0.045, 0.045, 0.03, 0.07); ps.lineTo(0, 0.06); ps.lineTo(-0.03, 0.07); ps.bezierCurveTo(-0.045, 0.045, -0.03, 0.01, 0, 0);
    var petalGeo = new THREE.ShapeGeometry(ps, 4), pp = petalGeo.attributes.position;
    for (var pv = 0; pv < pp.count; pv++) pp.setZ(pv, pp.getX(pv) * pp.getX(pv) * 9);
    petalGeo.computeVertexNormals(); petalGeo.translate(0, -0.035, 0);
    var petalMat = new THREE.MeshStandardMaterial({ color: '#ffb3d3', side: THREE.DoubleSide, roughness: 0.6, emissive: new THREE.Color('#ff5aa8'), emissiveIntensity: 0.4 });
    // Fallen petals carpeting the ground around the roots
    var FALLEN = 3200, fallen = new THREE.InstancedMesh(petalGeo, petalMat, FALLEN);
    for (var fp = 0; fp < FALLEN; fp++) {
      var fa = r() * 6.28, fd = 0.9 + Math.pow(r(), 1.5) * 5.5, fx = Math.cos(fa) * fd, fz = Math.sin(fa) * fd;
      Eu.set(-Math.PI / 2 + (r() - 0.5) * 0.5, 0, r() * 6.28); Q.setFromEuler(Eu);
      Pp.set(fx, localGround(fx, fz) + 0.02, fz); var fs = 0.5 + r() * 0.45; Sc.set(fs, fs, fs);
      M.compose(Pp, Q, Sc); fallen.setMatrixAt(fp, M);
      var fl = 0.92 + r() * 0.08; Col.setRGB(fl, fl * (0.42 + r() * 0.14), fl * (0.6 + r() * 0.12)); if (r() < 0.25) Col.setRGB(fl * 0.9, fl * 0.36, fl * 0.52); fallen.setColorAt(fp, Col);
    }
    fallen.receiveShadow = true; tree.add(fallen);
    // Petals swirling round the tree in the wind, tumbling as they fall
    var FALL = 200, drift = new THREE.InstancedMesh(petalGeo, petalMat, FALL), dState = [];
    function resetPetal(s, any) { s.a = r() * 6.28; s.d = 0.8 + Math.sqrt(r()) * 3.4; s.y = any ? 0.3 + r() * 6 : 4.2 + r() * 2.2; s.v = 0.3 + r() * 0.3; s.p = r() * 6.28; s.s = r() * 2.5 + 1.5; s.k = 0.7 + r() * 0.6; s.x = Math.cos(s.a) * s.d; s.z = Math.sin(s.a) * s.d; }
    for (var dp = 0; dp < FALL; dp++) { var ds = {}; resetPetal(ds, true); dState.push(ds); var dc = 0.9 + r() * 0.1; Col.setRGB(dc, dc * (0.42 + r() * 0.14), dc * (0.6 + r() * 0.12)); drift.setColorAt(dp, Col); }
    drift.frustumCulled = false; tree.add(drift);

    // Sparkles rising from the ground round the tree
    var SPARKS = 120, spGeo = new THREE.BufferGeometry();
    spGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPARKS * 3), 3)); spGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(SPARKS * 3), 3));
    var sparks = new THREE.Points(spGeo, new THREE.PointsMaterial({ map: GLOW, size: 0.3, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    sparks.frustumCulled = false; tree.add(sparks);
    var tints = ['#ff9be0', '#ffe08a', '#c9a0ff', '#ffffff'].map(function (c) { return new THREE.Color(c); }), skS = [];
    function resetSpark(s, any) { var a = r() * 6.28, d = 1.3 + Math.sqrt(r()) * 2.2; s.x = Math.cos(a) * d; s.z = Math.sin(a) * d; s.g = localGround(s.x, s.z); s.y = any ? r() * 1.2 : 0.05; s.rise = 0.12 + r() * 0.2; s.p = r() * 6.28; s.sp = 2 + r() * 3; s.t = tints[Math.floor(r() * 4)]; }
    for (var k2 = 0; k2 < SPARKS; k2++) { var sk = {}; resetSpark(sk, true); skS.push(sk); }

    var light = new THREE.PointLight('#ffa8ee', 1.3, 14, 2); light.position.set(0, 4.6, 0); tree.add(light);
    scene.add(tree);

    // Mana
    var MOTES = 70, moGeo = new THREE.BufferGeometry(), moS = [];
    moGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MOTES * 3), 3)); moGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(MOTES * 3), 3));
    var motes = new THREE.Points(moGeo, new THREE.PointsMaterial({ map: GLOW, size: 0.42, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    motes.frustumCulled = false; scene.add(motes);
    for (var mo = 0; mo < MOTES; mo++) moS.push({ k: 2, a: new THREE.Vector3(), c: new THREE.Vector3(), tint: tints[mo % 3] });
    var moP = new THREE.Vector3(), moQ = new THREE.Vector3(), spawnT = 0;
    function feed(on, t, dt, tx, ty, tz) {
      spawnT += dt;
      if (on && spawnT > 0.05) {
        spawnT = 0;
        for (var i = 0; i < MOTES; i++) if (moS[i].k >= 1) {
          var m = moS[i], hi = r() < 0.5, a = r() * 6.28, d = hi ? 1 + r() * 2.2 : 0.75;
          m.a.set(Math.cos(a) * d, hi ? 3.6 + r() * 2.2 : 0.6 + r() * 2.6, Math.sin(a) * d); tree.localToWorld(m.a);
          m.c.set((m.a.x + tx) / 2 + (r() - 0.5) * 2, Math.max(m.a.y, ty) + 0.8 + r() * 1.2, (m.a.z + tz) / 2 + (r() - 0.5) * 2);
          m.k = 0; m.v = 0.55 + r() * 0.4; m.p = r() * 6.28; break;
        }
      }
      var pos = moGeo.attributes.position, col = moGeo.attributes.color;
      for (var j = 0; j < MOTES; j++) {
        var s = moS[j];
        if (s.k >= 1) { col.setXYZ(j, 0, 0, 0); continue; }
        s.k = Math.min(1, s.k + s.v * dt); var k = s.k, ik = 1 - k;
        moQ.set(tx, ty, tz);
        moP.copy(s.a).multiplyScalar(ik * ik).addScaledVector(s.c, 2 * ik * k).addScaledVector(moQ, k * k);
        moP.x += Math.sin(t * 6 + s.p) * 0.06 * ik; moP.y += Math.cos(t * 5 + s.p) * 0.06 * ik;
        pos.setXYZ(j, moP.x, moP.y, moP.z);
        var br = Math.min(1, k * 6) * (1 - Math.pow(k, 6)) * (0.8 + 0.2 * Math.sin(t * 9 + s.p));
        col.setXYZ(j, s.tint.r * br, s.tint.g * br, s.tint.b * br);
      }
      pos.needsUpdate = col.needsUpdate = true;
    }

    var fade = 1, pq = new THREE.Quaternion();
    return {
      feed: feed,
      near: function (x, z) { return Math.hypot(x - TREE_X, z - TREE_Z) < 4.4; },
      blocks: function (x, z) { return Math.hypot(x - TREE_X, z - TREE_Z) < 1.35; },
      update: function (t, dt, px, pz) {
        var pulse = Math.sin(t * 1.3), gust = 0.5 + 0.5 * Math.sin(t * 0.35) * Math.sin(t * 0.13 + 1);
        barkMat.emissiveIntensity = 0.6 + 0.15 * pulse; glowMat.opacity = 0.5 + 0.15 * pulse;
        orbs.forEach(function (o) { o.pivot.rotation.z = Math.sin(t * 0.9 + o.p) * 0.08; o.pivot.rotation.x = Math.cos(t * 0.7 + o.p) * 0.06; o.halo.material.opacity = 0.55 + 0.2 * Math.sin(t * 2 + o.p); });
        for (var i = 0; i < FALL; i++) {
          var s = dState[i];
          s.a += dt * (0.3 + gust * 1.1) * s.k * 1.8 / (0.8 + s.d * 0.4);
          s.d += dt * (0.18 * Math.sin(t * 0.6 + s.p) + gust * 0.22);
          s.y += dt * (-s.v + gust * 0.45 * Math.sin(t * 1.7 + s.p) + 0.3 * gust * Math.max(0, 1 - s.y / 3));
          s.x = Math.cos(s.a) * s.d + Math.sin(t * 2.3 + s.p) * 0.08; s.z = Math.sin(s.a) * s.d + Math.cos(t * 2.1 + s.p) * 0.08;
          if (s.y < localGround(s.x, s.z) + 0.03 || s.d > 8) resetPetal(s, false);
          Eu.set(t * s.s * (0.6 + gust) + s.p, t * s.s * 0.7, Math.sin(t * 2 + s.p)); pq.setFromEuler(Eu); Pp.set(s.x, s.y, s.z); Sc.set(1.3, 1.3, 1.3);
          M.compose(Pp, pq, Sc); drift.setMatrixAt(i, M);
        }
        drift.instanceMatrix.needsUpdate = true;
        var sp = spGeo.attributes.position, sc = spGeo.attributes.color;
        for (var j = 0; j < SPARKS; j++) {
          var k = skS[j]; k.y += k.rise * dt; if (k.y > 1.4) resetSpark(k, false);
          var tw = Math.max(0, Math.sin(t * k.sp + k.p)) * Math.max(0, 1 - k.y / 1.4);
          sp.setXYZ(j, k.x, k.g + k.y, k.z); sc.setXYZ(j, k.t.r * tw, k.t.g * tw, k.t.b * tw);
        }
        sp.needsUpdate = sc.needsUpdate = true;
        // the blossom goes see-through when you walk under it, so it never hides you
        var near = Math.hypot(px - TREE_X, pz - TREE_Z) < 4.5;
        fade += ((near ? 0.45 : 1) - fade) * Math.min(1, dt * 4);
        bMat.opacity = sMat.opacity = fade;
      }
    };
  })();

  // Arm Position
  var HOLD = [-0.05, 0.2, -0.25, 1.95, -2.1, -0.95, 0.25];
  var FINGERS = [['Thumb', 1, -0.3, -2.1, 0.6], ['Index', 1, 0, 0, 1.2], ['Middle', 1, 0, 0, 1.3], ['Ring', 1, 0, 0, 1.4], ['Little', 1, 0, 0, 1.5]];
  // Holding the Dawn Petal
  var petalTex = null;
  function makePetal() {
    if (!petalTex) { petalTex = new THREE.CanvasTexture(petalPaint(256, true)); petalTex.encoding = THREE.sRGBEncoding; }
    var sh = new THREE.Shape(), Y = function (y) { return -y; };
    sh.moveTo(0, Y(0.47));
    sh.bezierCurveTo(0.1, Y(0.4), 0.31, Y(0.2), 0.33, Y(-0.08)); sh.bezierCurveTo(0.35, Y(-0.33), 0.2, Y(-0.45), 0.08, Y(-0.43));
    sh.quadraticCurveTo(0.03, Y(-0.42), 0, Y(-0.35)); sh.quadraticCurveTo(-0.03, Y(-0.42), -0.08, Y(-0.43));
    sh.bezierCurveTo(-0.2, Y(-0.45), -0.35, Y(-0.33), -0.33, Y(-0.08)); sh.bezierCurveTo(-0.31, Y(0.2), -0.1, Y(0.4), 0, Y(0.47));
    var geo = new THREE.ShapeGeometry(sh, 24), P, k = 0.92;
    geo = geo.toNonIndexed(); P = geo.attributes.position;
    var pts = []; for (var i = 0; i < P.count; i += 3) pts.push([P.getX(i), P.getY(i)], [P.getX(i + 1), P.getY(i + 1)], [P.getX(i + 2), P.getY(i + 2)]);
    function split(tri, n) { if (!n) return [tri]; var m = function (a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }, ab = m(tri[0], tri[1]), bc = m(tri[1], tri[2]), ca = m(tri[2], tri[0]);
      return [].concat(split([tri[0], ab, ca], n - 1), split([ab, tri[1], bc], n - 1), split([ca, bc, tri[2]], n - 1), split([ab, bc, ca], n - 1)); }
    var all = []; for (var t = 0; t < pts.length; t += 3) all = all.concat(split([pts[t], pts[t + 1], pts[t + 2]], 2));
    var pos = [], uv = [], L = 0.05 / 0.9;
    all.forEach(function (tri) { tri.forEach(function (q) {
      var x = q[0], y = q[1], v = (y + 0.47) / 0.9;                          // v: 0 at the base, 1 at the tip
      var z = 0.11 * x * x / 0.11 * (0.4 + v) - 0.06 * v * v * v;
      pos.push(x * L, (y + 0.47) * L, z * L); uv.push(0.5 + x * k, 0.5 + y * k);
    }); });
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    var nm = g.attributes.normal, sum = {}, key = function (i) { return Math.round(pos[i * 3] * 1e5) + ',' + Math.round(pos[i * 3 + 1] * 1e5); };   // smooth, not faceted
    for (var i2 = 0; i2 < nm.count; i2++) { var kk = key(i2), a = sum[kk] || (sum[kk] = [0, 0, 0]); a[0] += nm.getX(i2); a[1] += nm.getY(i2); a[2] += nm.getZ(i2); }
    for (var i3 = 0; i3 < nm.count; i3++) { var b = sum[key(i3)], l = Math.hypot(b[0], b[1], b[2]) || 1; nm.setXYZ(i3, b[0] / l, b[1] / l, b[2] / l); }
    var mat = new THREE.MeshStandardMaterial({ map: petalTex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.55, emissive: new THREE.Color('#ff7fb8'), emissiveMap: petalTex, emissiveIntensity: 0.18 });
    var m = new THREE.Mesh(g, mat); m.castShadow = true;
    return m;
  }

  // The Pond
  var pond = (function () {
    var r = rand(909), g0 = function (x, z) { return groundHeight(x, z, FARM); };
    function paint(w, h, fn, srgb) { var c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return canvasTex(c, srgb); }
    function polar(t, a) { var R = pondR(a) * t; return [PX + Math.cos(a) * R, PZ + Math.sin(a) * R]; }
    var SEG = 160;
    function disc(T1, RINGS, fn) {
      var pos = [], idx = [], ex = [];
      for (var k = 0; k <= RINGS; k++) for (var j = 0; j <= SEG; j++) {
        var t = T1 * Math.pow(k / RINGS, 0.8), a = j / SEG * Math.PI * 2, p = polar(t, a);
        pos.push(p[0], 0, p[1]); ex.push(fn(p[0], p[1], t, pos.length / 3 - 1, pos));
      }
      for (var k2 = 0; k2 < RINGS; k2++) for (var j2 = 0; j2 < SEG; j2++) { var A = k2 * (SEG + 1) + j2, B = A + SEG + 1; idx.push(A, A + 1, B, B, A + 1, B + 1); }
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
      return g;
    }

    // Pond bed
    var bedTex = paint(512, 512, function (g, w) {
      g.fillStyle = '#cdbfa6'; g.fillRect(0, 0, w, w);
      for (var i = 0; i < 260; i++) { var x = r() * w, y = r() * w, rad = 10 + r() * 50, tone = r() < 0.5 ? '120,104,80' : '226,214,190'; var bl = g.createRadialGradient(x, y, 0, x, y, rad); bl.addColorStop(0, 'rgba(' + tone + ',.35)'); bl.addColorStop(1, 'rgba(' + tone + ',0)'); g.fillStyle = bl; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
      for (var s = 0; s < 9000; s++) { var v = r(); g.fillStyle = v < 0.4 ? 'rgba(90,76,58,.55)' : v < 0.8 ? 'rgba(240,230,210,.5)' : 'rgba(60,52,44,.6)'; g.fillRect(r() * w, r() * w, 1 + r() * 1.5, 1 + r() * 1.5); }
      for (var p = 0; p < 160; p++) {
        var px = r() * w, py = r() * w, pr = 1.5 + r() * r() * 7, t = 120 + r() * 90;
        g.fillStyle = 'rgba(30,24,18,.45)'; g.beginPath(); g.ellipse(px + 1, py + 1.3, pr, pr * 0.78, 0, 0, 6.29); g.fill();
        var pg = g.createRadialGradient(px - pr * 0.3, py - pr * 0.35, 0, px, py, pr); pg.addColorStop(0, 'rgb(' + (t + 40) + ',' + (t + 34) + ',' + (t + 24) + ')'); pg.addColorStop(1, 'rgb(' + (t - 40) + ',' + (t - 46) + ',' + (t - 54) + ')');
        g.fillStyle = pg; g.beginPath(); g.ellipse(px, py, pr, pr * 0.78, r() * 3, 0, 6.29); g.fill();
      }
    }, true);
    bedTex.repeat.set(1, 1);
    var bedG = disc(1.32, 48, function () { return 0; }), bp = bedG.attributes.position, bc = [], ba = [], bu = [];
    var SAND = new THREE.Color(0.44, 0.39, 0.29), SILT = new THREE.Color(0.13, 0.13, 0.09), WEED = new THREE.Color(0.17, 0.22, 0.09), MUD = new THREE.Color(0.24, 0.18, 0.12), DAMP = new THREE.Color(0.36, 0.29, 0.2), bcol = new THREE.Color();
    for (var bi = 0; bi < bp.count; bi++) {
      var x = bp.getX(bi), z = bp.getZ(bi), t = pondT(x, z), y = g0(x, z);
      bp.setY(bi, y + 0.01); bu.push(x * 0.32, z * 0.32);
      var n1 = vnoise(x * 0.6, z * 0.6), n2 = vnoise(x * 1.7 + 5, z * 1.7);
      if (t < 1) bcol.copy(SAND).lerp(SILT, Math.pow(Math.min(1, Math.max(0, WY - y) / 1.3), 0.7)).lerp(WEED, Math.max(0, n1 - 0.4) * 1.4 * Math.min(1, (WY - y) * 3));
      else bcol.copy(MUD).lerp(DAMP, Math.min(1, (t - 1) / 0.25));
      bcol.multiplyScalar(0.85 + n2 * 0.3); bc.push(bcol.r, bcol.g, bcol.b);
      var edge = 1.12 + (n1 - 0.5) * 0.12; ba.push(t < edge ? 1 : Math.max(0, 1 - (t - edge) / 0.18));
    }
    bedG.setAttribute('uv', new THREE.Float32BufferAttribute(bu, 2)); bedG.setAttribute('color', new THREE.Float32BufferAttribute(bc, 3)); bedG.setAttribute('aA', new THREE.Float32BufferAttribute(ba, 1));
    bedG.computeVertexNormals();
    var bedMat = new THREE.MeshStandardMaterial({ map: bedTex, vertexColors: true, transparent: true, roughness: 0.95 });
    bedMat.onBeforeCompile = function (sh) {
      sh.uniforms.uTime = grassTime; sh.uniforms.uWY = { value: WY };
      sh.vertexShader = 'attribute float aA;\nvarying float vA;\nvarying vec3 vWp;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvA = aA; vWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = 'uniform float uTime;\nuniform float uWY;\nvarying float vA;\nvarying vec3 vWp;\n' + sh.fragmentShader
        .replace('#include <alphamap_fragment>', '#include <alphamap_fragment>\ndiffuseColor.a *= vA;')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' +
          'float under = clamp((uWY - vWp.y) * 4.0, 0.0, 1.0) * exp(-(uWY - vWp.y) * 2.2);\n' +       // light rippling over the bed, under the water
          'vec2 q = vWp.xz * 1.7; float c1 = abs(sin(q.x + sin(q.y * 1.3 + uTime * 0.9)) * sin(q.y + sin(q.x * 1.1 - uTime * 0.7)));\n' +
          'vec2 q2 = vWp.xz * 2.6 + 3.0; float c2 = abs(sin(q2.x - sin(q2.y * 0.9 - uTime * 1.1)) * sin(q2.y + sin(q2.x * 1.4 + uTime * 0.8)));\n' +
          'totalEmissiveRadiance += vec3(0.85, 0.95, 0.8) * (pow(1.0 - c1, 8.0) + pow(1.0 - c2, 8.0)) * 0.12 * under;');
    };
    var bed = new THREE.Mesh(bedG, bedMat); bed.receiveShadow = true; bed.renderOrder = 1; scene.add(bed);

    // Water
    var wG = disc(1.1, 30, function () { return 0; }), wp = wG.attributes.position, wD = [], wT = [];
    for (var wi = 0; wi < wp.count; wi++) { var wx = wp.getX(wi), wz = wp.getZ(wi); wp.setY(wi, WY); wD.push(WY - g0(wx, wz)); wT.push(pondT(wx, wz)); }
    wG.setAttribute('aDepth', new THREE.Float32BufferAttribute(wD, 1)); wG.setAttribute('aT', new THREE.Float32BufferAttribute(wT, 1));
    var waterMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uTime: grassTime, uSky: { value: scene.background }, uSun: { value: sun.position.clone().normalize() } },
      vertexShader: 'attribute float aDepth; attribute float aT; varying float vD; varying float vT; varying vec3 vW;\n' +
        'void main() { vD = aDepth; vT = aT; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: 'uniform float uTime; uniform vec3 uSky; uniform vec3 uSun; varying float vD; varying float vT; varying vec3 vW;\n' +
        'vec2 wv(vec2 p, vec2 d, float f, float s, float a) { return a * f * cos(dot(normalize(d), p) * f + uTime * s) * normalize(d); }\n' +
        'void main() {\n' +
        '  vec2 p = vW.xz, gr = wv(p, vec2(1.0, 0.3), 1.3, 1.1, 0.02) + wv(p, vec2(-0.4, 1.0), 2.1, 1.6, 0.012) + wv(p, vec2(0.7, -0.8), 3.7, 2.3, 0.006)\n' +
        '    + wv(p, vec2(-1.0, -0.2), 6.3, 3.1, 0.003) + wv(p, vec2(0.2, 1.0), 11.0, 4.2, 0.0015) + wv(p, vec2(0.9, 0.5), 17.0, 5.0, 0.0008);\n' +
        '  vec3 n = normalize(vec3(-gr.x, 1.0, -gr.y)), v = normalize(cameraPosition - vW);\n' +
        '  vec3 sky = pow(uSky, vec3(2.2)), rf = reflect(-v, n);\n' +
        '  float day = clamp(dot(sky, vec3(0.3, 0.5, 0.2)) * 1.6, 0.08, 1.0);\n' +
        '  float fres = 0.02 + 0.98 * pow(1.0 - max(dot(n, v), 0.0), 5.0);\n' +
        '  vec3 refl = mix(sky * 1.05, sky * 0.55 + vec3(0.01, 0.03, 0.07) * day, clamp(rf.y * 1.3, 0.0, 1.0));\n' +
        '  refl = mix(refl, vec3(0.06, 0.09, 0.04) * day, smoothstep(0.82, 1.05, vT) * 0.55);\n' +            // the grassy banks mirrored near the edge
        '  float path = vD / max(dot(n, v), 0.3), k = 1.0 - exp(-path * 1.7);\n' +            // light fades the further it travels through the water
        '  vec3 body = mix(mix(vec3(0.16, 0.17, 0.08), vec3(0.04, 0.1, 0.07), smoothstep(0.0, 0.5, k)), vec3(0.008, 0.035, 0.04), smoothstep(0.45, 1.0, k)) * day;\n' +
        '  float sp = max(dot(rf, uSun), 0.0);\n' +
        '  vec3 col = mix(body, refl, fres) + vec3(1.0, 0.94, 0.82) * (pow(sp, 400.0) * 4.0 + pow(sp, 60.0) * 0.12) * day;\n' +
        '  col += vec3(0.5, 0.52, 0.48) * (1.0 - smoothstep(0.0, 0.05, vD)) * 0.18 * day;\n' +              // a faint bright line where it laps the shore
        '  float a = 0.05 + k * 0.93; a = clamp(a + fres * 0.7 * (1.0 - a), 0.0, 1.0);\n' +
        '  gl_FragColor = vec4(col, a);\n' +
        '  #include <tonemapping_fragment>\n  #include <encodings_fragment>\n}'
    });
    var water = new THREE.Mesh(wG, waterMat); water.renderOrder = 5; scene.add(water);

    var toC = new THREE.Vector2(-PX, -PZ).normalize(), da = Math.atan2(toC.y, toC.x);

    // The Dock
    var dU = new THREE.Vector3(-toC.x, 0, -toC.y), Sd = new THREE.Vector3(-dU.z, 0, dU.x), sp0 = polar(1.2, da), S0 = new THREE.Vector3(sp0[0], 0, sp0[1]);
    var DL = 9.8, DW = 1.8, DY = WY + 0.32, yawD = -Math.atan2(dU.z, dU.x);
    function dAt(al, ac, y) { return S0.clone().addScaledVector(dU, al).addScaledVector(Sd, ac).setY(y); }
    var dockWood = paint(512, 1024, function (g, w, h) {                  // sun-bleached, weathered boards
      g.fillStyle = '#8c8174'; g.fillRect(0, 0, w, h);
      for (var b = 0; b < 160; b++) { var x = r() * w, y = r() * h, rad = 20 + r() * 80, tone = r() < 0.5 ? '110,96,80' : '170,164,156'; var bl = g.createRadialGradient(x, y, 0, x, y, rad); bl.addColorStop(0, 'rgba(' + tone + ',.3)'); bl.addColorStop(1, 'rgba(' + tone + ',0)'); g.fillStyle = bl; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
      var knots = []; for (var k = 0; k < 9; k++) knots.push([r() * w, r() * h, 6 + r() * 10]);
      for (var i = 0; i < 260; i++) {                                    // grain flowing round the knots
        var x0 = r() * w, dark = r() < 0.6; g.strokeStyle = dark ? 'rgba(60,50,40,' + (0.12 + r() * 0.22) + ')' : 'rgba(205,198,188,' + (0.1 + r() * 0.15) + ')'; g.lineWidth = 0.5 + r() * 1.6;
        g.beginPath();
        for (var y2 = 0; y2 <= h; y2 += 8) {
          var x2 = x0 + Math.sin(y2 * 0.008 + i) * 4 + Math.sin(y2 * 0.031 + i * 3) * 1.5;
          knots.forEach(function (kn) { var dy = y2 - kn[1], dx = x2 - kn[0], d = Math.hypot(dx, dy); if (d < kn[2] * 4) x2 += (dx >= 0 ? 1 : -1) * kn[2] * 2.2 * Math.exp(-d / (kn[2] * 1.4)); });
          if (y2) g.lineTo(x2, y2); else g.moveTo(x2, y2);
        }
        g.stroke();
      }
      knots.forEach(function (kn) {
        var kg = g.createRadialGradient(kn[0], kn[1], 0, kn[0], kn[1], kn[2]); kg.addColorStop(0, '#3a2c22'); kg.addColorStop(0.6, '#5a4838'); kg.addColorStop(1, 'rgba(90,72,56,0)');
        g.fillStyle = kg; g.beginPath(); g.ellipse(kn[0], kn[1], kn[2] * 0.8, kn[2] * 1.3, 0, 0, 6.29); g.fill();
        g.strokeStyle = 'rgba(40,30,22,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(kn[0], kn[1] + kn[2]); g.lineTo(kn[0] + (r() - 0.5) * 6, kn[1] + kn[2] * 4); g.stroke();   // a check running from it
      });
      for (var c = 0; c < 30; c++) { var cx = r() * w, cy = r() * h, cl = 30 + r() * 160; g.strokeStyle = 'rgba(30,24,18,.7)'; g.lineWidth = 0.6 + r() * 1.2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + (r() - 0.5) * 4, cy + cl); g.stroke(); }   // cracks along the grain
      for (var d = 0; d < 3000; d++) { g.fillStyle = 'rgba(' + (r() < 0.5 ? '40,34,28' : '220,215,205') + ',' + (0.04 + r() * 0.08) + ')'; g.fillRect(r() * w, r() * h, 1, 1 + r() * 4); }
    }, true);
    var woodMat = new THREE.MeshStandardMaterial({ map: dockWood, bumpMap: dockWood, bumpScale: 0.012, roughness: 0.92, vertexColors: true });
    var metalMat = new THREE.MeshStandardMaterial({ color: '#8a8c8e', metalness: 0.75, roughness: 0.45, vertexColors: true });
    var dParts = [], dMetal = [], dQ = new THREE.Quaternion(), dE = new THREE.Euler(), dS = new THREE.Vector3();
    function dMat(pos, yawOff, rx, rz, s) { dE.set(rx || 0, yawD + (yawOff || 0), rz || 0); dQ.setFromEuler(dE); dS.set(s ? s[0] : 1, s ? s[1] : 1, s ? s[2] : 1); return new THREE.Matrix4().compose(pos, dQ, dS); }
    function boxUV(w, h, d, su, sv) { var g = new THREE.BoxGeometry(w, h, d, 1, 1, 3), uv = g.attributes.uv, ou = r(), ov = r(); for (var i = 0; i < uv.count; i++) uv.setXY(i, ou + uv.getX(i) * su, ov + uv.getY(i) * sv); return g; }
    var tints = [[0.9, 0.88, 0.85], [0.82, 0.76, 0.68], [0.78, 0.7, 0.6], [0.95, 0.93, 0.9]];
    // Deck boards across the beams, with narrow gaps, each a little different
    var nailHead = new THREE.CylinderGeometry(0.006, 0.006, 0.004, 6);
    for (var al = -0.35, n = 0; al < DL; n++) {
      var bw = 0.135 + r() * 0.025, newer = r() < 0.06, t = newer ? [1.05, 0.86, 0.66] : tints[Math.floor(r() * tints.length)], sh = 0.92 + r() * 0.12;
      var bg = boxUV(bw, 0.038, DW + (r() - 0.5) * 0.05, 0.12, 0.85), bp = bg.attributes.position;
      for (var i = 0; i < bp.count; i++) { var z = bp.getZ(i) / (DW / 2); bp.setY(i, bp.getY(i) + (r() < 0 ? 0 : 0.004 * (1 - z * z)) * (n % 3 === 0 ? 1 : 0.3)); }   // some boards bowed a touch
      bg.computeVertexNormals();
      var c = al + bw / 2, end = (r() - 0.5) * 0.03;
      dParts.push([bg, dMat(dAt(c, end, DY + (r() - 0.5) * 0.005), (r() - 0.5) * 0.012, 0, (r() - 0.5) * 0.02), [t[0] * sh, t[1] * sh, t[2] * sh]]);
      [-0.72, 0, 0.72].forEach(function (ac) { [-0.035, 0.035].forEach(function (o) {   // two nails into each beam
        var rust = r() < 0.4; dMetal.push([nailHead, dMat(dAt(c + o, ac + end, DY + 0.021)), rust ? [0.42, 0.26, 0.14] : [0.32, 0.31, 0.3]]);
      }); });
      al += bw + 0.008 + r() * 0.008;
    }
    // Beams under the boards, and a header at each end
    [-0.72, 0, 0.72].forEach(function (ac) { dParts.push([boxUV(DL + 0.4, 0.16, 0.09, 0.08, 1), dMat(dAt(DL / 2 - 0.15, ac, DY - 0.1)), [0.6, 0.55, 0.5]]); });
    [-0.3, DL - 0.04].forEach(function (al2) { dParts.push([boxUV(0.08, 0.2, DW + 0.1, 0.1, 1), dMat(dAt(al2, 0, DY - 0.09)), [0.62, 0.56, 0.5]]); });
    [DL * 0.2, DL * 0.4, DL * 0.6, DL * 0.8].forEach(function (al2) { dParts.push([boxUV(0.06, 0.12, DW - 0.1, 0.08, 1), dMat(dAt(al2, 0, DY - 0.12)), [0.55, 0.5, 0.45]]); });   // cross braces
    // Pilings driven into the bed: wet and dark at the water line, green with weed below it
    function pileColour(x, y, z) {
      if (y < WY - 0.02) { var k = Math.min(1, (WY - y) / 0.25); return [0.42 - k * 0.14, 0.44 - k * 0.1, 0.3 - k * 0.12]; }
      if (y < WY + 0.12) return [0.5, 0.46, 0.4];
      return [0.86, 0.8, 0.72];
    }
    var pileTops = [];
    var PILES = [-0.35, 1.9, 4.1, 6.1, 8.0, DL - 0.1]; PILES.forEach(function (al2, pi) { [-1, 1].forEach(function (sd) {
      var base = dAt(al2, sd * (DW / 2 + 0.07), 0), bot = Math.min(groundHeight(base.x, base.z, FARM), WY) - 0.35, tall = pi === 0 || pi === PILES.length - 1, top = DY + (tall ? 0.75 : 0.06), h = top - bot;
      var pg = new THREE.CylinderGeometry(0.105, 0.12, h, 16, 10), pp = pg.attributes.position, ph = r() * 9;
      for (var i = 0; i < pp.count; i++) { var a = Math.atan2(pp.getZ(i), pp.getX(i)), k = 1 + 0.05 * Math.sin(a * 3 + ph) + 0.03 * Math.sin(pp.getY(i) * 4 + a * 2 + ph); pp.setX(i, pp.getX(i) * k); pp.setZ(i, pp.getZ(i) * k); }
      var uvp = pg.attributes.uv, ou = r(); for (var j = 0; j < uvp.count; j++) uvp.setXY(j, ou + uvp.getX(j) * 0.35, uvp.getY(j) * h * 0.5);
      pg.computeVertexNormals();
      dParts.push([pg, new THREE.Matrix4().makeTranslation(base.x, bot + h / 2, base.z), pileColour]);
      var capG = new THREE.CylinderGeometry(0.1, 0.105, 0.02, 16); dParts.push([capG, new THREE.Matrix4().makeTranslation(base.x, top, base.z), [0.55, 0.48, 0.4]]);   // the sawn end, greyed
      if (tall) pileTops.push(new THREE.Vector3(base.x, top - 0.18, base.z));
    }); });
    // Cleats on the deck at the far end, and a ladder down into the water
    [-1, 1].forEach(function (sd) {
      var at = dAt(DL - 0.35, sd * 0.68, DY + 0.02);
      dMetal.push([new THREE.BoxGeometry(0.05, 0.02, 0.07), dMat(at.clone().setY(DY + 0.03)), [0.45, 0.45, 0.46]]);
      dMetal.push([new THREE.CylinderGeometry(0.013, 0.016, 0.24, 8), dMat(at.clone().setY(DY + 0.055), 0, Math.PI / 2), [0.5, 0.5, 0.52]]);
    });
    var ladY0 = Math.max(groundHeight(dAt(DL + 0.08, 0, 0).x, dAt(DL + 0.08, 0, 0).z, FARM), WY - 0.9);
    [-0.22, 0.22].forEach(function (ac) {
      var top = DY + 0.55, h = top - ladY0, rail = new THREE.TorusGeometry(0.12, 0.016, 8, 16, Math.PI);
      dMetal.push([new THREE.CylinderGeometry(0.016, 0.016, h, 10), new THREE.Matrix4().compose(dAt(DL + 0.12, ac, ladY0 + h / 2), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1)), [0.62, 0.63, 0.64]]);
      dMetal.push([rail, dMat(dAt(DL, ac, top), 0, 0, 0), [0.62, 0.63, 0.64]]);   // curving over onto the deck
    });
    for (var ry = DY - 0.05; ry > ladY0 + 0.05; ry -= 0.28) dMetal.push([new THREE.CylinderGeometry(0.014, 0.014, 0.44, 8), dMat(dAt(DL + 0.12, 0, ry), 0, Math.PI / 2, 0), ry < WY ? [0.36, 0.4, 0.3] : [0.6, 0.61, 0.62]]);
    var dockMesh = new THREE.Mesh(merge(dParts, true), woodMat), metalMesh = new THREE.Mesh(merge(dMetal, true), metalMat);
    dockMesh.castShadow = dockMesh.receiveShadow = metalMesh.castShadow = true; scene.add(dockMesh); scene.add(metalMesh);
    // Rope: twisted hemp slung between the tall posts and wrapped round them
    var ropeTex = paint(64, 256, function (g, w, h) {
      g.fillStyle = '#b39a6e'; g.fillRect(0, 0, w, h);
      for (var y = -h; y < h * 2; y += 9) { g.strokeStyle = 'rgba(70,55,35,.55)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + 22); g.stroke(); g.strokeStyle = 'rgba(230,215,180,.35)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, y + 3); g.lineTo(w, y + 25); g.stroke(); }
      for (var f = 0; f < 300; f++) { g.fillStyle = 'rgba(240,225,190,.25)'; g.fillRect(r() * w, r() * h, 1, 3); }
    }, true);
    var ropeMat = new THREE.MeshStandardMaterial({ map: ropeTex, roughness: 0.95 }), ropes = [];
    function ropeBetween(a, b, sag) {
      var pts = []; for (var i = 0; i <= 20; i++) { var k = i / 20; pts.push(a.clone().lerp(b, k).add(new THREE.Vector3(0, -sag * 4 * k * (1 - k), 0))); }
      var tg = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.022, 8, false), uv = tg.attributes.uv; for (var j = 0; j < uv.count; j++) uv.setXY(j, uv.getY(j), uv.getX(j) * a.distanceTo(b) * 3);
      ropes.push([tg, new THREE.Matrix4()]);
    }
    var byS = [[], []]; pileTops.forEach(function (p, i) { byS[i % 2].push(p); });
    byS.forEach(function (side) { ropeBetween(side[0], side[1], 0.32); side.forEach(function (p) { for (var w2 = 0; w2 < 3; w2++) ropes.push([new THREE.TorusGeometry(0.125, 0.021, 8, 20), new THREE.Matrix4().compose(p.clone().setY(p.y - 0.02 + w2 * 0.04), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), new THREE.Vector3(1, 1, 1))]); }); });
    var coil = new THREE.TorusGeometry(0.11, 0.02, 8, 24);                // a coil of spare line on the deck
    for (var cl2 = 0; cl2 < 4; cl2++) ropes.push([coil, new THREE.Matrix4().compose(dAt(DL - 0.75, -0.45, DY + 0.04 + cl2 * 0.03), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), new THREE.Vector3(1 - cl2 * 0.08, 1 - cl2 * 0.08, 1))]);
    var ropeMesh = new THREE.Mesh(merge(ropes), ropeMat); ropeMesh.castShadow = true; scene.add(ropeMesh);
    var onDock = function (x, z) { var v = new THREE.Vector3(x - S0.x, 0, z - S0.z), al3 = v.dot(dU), ac3 = v.dot(Sd); return al3 > -0.4 && al3 < DL && Math.abs(ac3) < DW / 2 - 0.12; };


    // Rocks
    var rockTex = rockTexture(false), rockMat = new THREE.MeshStandardMaterial({ map: rockTex, bumpMap: rockTex, bumpScale: 0.03, vertexColors: true, roughness: 0.88 });
    for (var rk = 0; rk < 26; rk++) {
      var ra = r() * 6.28; if (Math.abs(Math.atan2(Math.sin(ra - da), Math.cos(ra - da))) < 0.45) continue;
      var rp = polar(1.0 + r() * 0.16, ra), size = 0.25 + r() * r() * 0.55, rg = new THREE.IcosahedronGeometry(1, 3), rpp = rg.attributes.position, rc = [], ph = r() * 9;
      for (var v = 0; v < rpp.count; v++) {
        var X = rpp.getX(v), Y = rpp.getY(v), Z = rpp.getZ(v), k = 1 + 0.22 * (vnoise(X * 1.8 + ph, Z * 1.8 + Y) - 0.5) + 0.08 * (vnoise(X * 5 + ph, Y * 5) - 0.5);
        rpp.setXYZ(v, X * k, Y * k * 0.62, Z * k * (0.8 + 0.2 * Math.cos(ph)));
      }
      rg.computeVertexNormals();
      var rm = new THREE.Mesh(rg, rockMat); rm.scale.setScalar(size); rm.rotation.y = r() * 6.28; rm.position.set(rp[0], g0(rp[0], rp[1]) + size * 0.12, rp[1]); rm.updateMatrixWorld();
      var nrm = rg.attributes.normal, wv2 = new THREE.Vector3();
      for (var v2 = 0; v2 < rpp.count; v2++) {
        wv2.set(rpp.getX(v2), rpp.getY(v2), rpp.getZ(v2)).applyMatrix4(rm.matrixWorld);
        var wetK = Math.max(0, Math.min(1, (WY + 0.08 - wv2.y) / 0.1)), moss = Math.max(0, nrm.getY(v2) - 0.5) * Math.max(0, vnoise(wv2.x * 4, wv2.z * 4) - 0.35) * 3;
        var base2 = 0.42 + 0.22 * vnoise(wv2.x * 6, wv2.y * 6) + 0.1 * vnoise(wv2.x * 1.3 + 4, wv2.z * 1.3);
        rc.push(base2 * (1 - wetK * 0.45) * (1 - moss * 0.45), base2 * (1 - wetK * 0.4) * (1 + moss * 0.1), base2 * (1 - wetK * 0.35) * (1 - moss * 0.6));
      }
      rg.setAttribute('color', new THREE.Float32BufferAttribute(rc, 3)); rm.castShadow = rm.receiveShadow = true; scene.add(rm);
    }

    // Reeds and cattails
    function swayMat(rough) {
      var m = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: rough });
      m.onBeforeCompile = function (sh) {
        sh.uniforms.uTime = grassTime;
        sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' +
          'vec4 ib = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0); float sw = sin(uTime * 1.3 + ib.x * 0.7 + ib.z * 0.5) * 0.7 + sin(uTime * 2.7 + ib.x * 1.9) * 0.3;\n' +
          'transformed.x += sw * position.y * position.y * 0.05; transformed.z += sw * position.y * position.y * 0.025;');
      };
      return m;
    }
    var bladeG = new THREE.BufferGeometry(), bpos = [], bix = [];
    for (var s2 = 0; s2 <= 6; s2++) { var f = s2 / 6, wdt = 0.022 * (1 - f * 0.92), bend = f * f * 0.12; bpos.push(-wdt, f, bend, wdt, f, bend); }
    for (var s3 = 0; s3 < 6; s3++) { var a0 = s3 * 2; bix.push(a0, a0 + 1, a0 + 2, a0 + 1, a0 + 3, a0 + 2); }
    bladeG.setAttribute('position', new THREE.Float32BufferAttribute(bpos, 3)); bladeG.setIndex(bix); bladeG.computeVertexNormals();
    var stalkG = new THREE.CylinderGeometry(0.008, 0.011, 1.4, 5); stalkG.translate(0, 0.7, 0);
    var headG = new THREE.LatheGeometry([[0, 0], [0.028, 0.01], [0.034, 0.05], [0.034, 0.17], [0.028, 0.2], [0.006, 0.215], [0.004, 0.3], [0, 0.31]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 10); headG.translate(0, 1.18, 0);
    var REEDS = 1400, CATS = 100, reeds = new THREE.InstancedMesh(bladeG, swayMat(0.7), REEDS), stalks = new THREE.InstancedMesh(stalkG, swayMat(0.7), CATS), heads = new THREE.InstancedMesh(headG, swayMat(1), CATS);
    var M4 = new THREE.Matrix4(), Q4 = new THREE.Quaternion(), E4 = new THREE.Euler(), P4 = new THREE.Vector3(), S4 = new THREE.Vector3(), C4 = new THREE.Color();
    var clumps = []; for (var cl = 0; cl < 14; cl++) { var ca = r() * 6.28; if (Math.abs(Math.atan2(Math.sin(ca - da), Math.cos(ca - da))) < 0.6) { cl--; continue; } clumps.push(ca); }
    var nR = 0, nC = 0;
    clumps.forEach(function (ca, ci) {
      var span = 0.18 + r() * 0.2;
      for (var i = 0; i < REEDS / clumps.length; i++) {
        var a = ca + (r() - 0.5) * span, t = 0.86 + r() * 0.2, p = polar(t, a), h = (0.7 + r() * 0.8) * (t < 1 ? 1 : 0.8);
        E4.set((r() - 0.5) * 0.3, r() * 6.28, (r() - 0.5) * 0.3); Q4.setFromEuler(E4); P4.set(p[0], g0(p[0], p[1]), p[1]); S4.set(1, h, 1);
        M4.compose(P4, Q4, S4); reeds.setMatrixAt(nR, M4); var gtn = 0.75 + r() * 0.35; C4.setRGB(0.2 * gtn, 0.3 * gtn, 0.1 * gtn); if (r() < 0.15) C4.setRGB(0.42 * gtn, 0.38 * gtn, 0.2 * gtn); reeds.setColorAt(nR++, C4);
      }
      for (var c = 0; c < CATS / clumps.length && nC < CATS; c++) {
        var a2 = ca + (r() - 0.5) * span * 0.8, t2 = 0.88 + r() * 0.14, p2 = polar(t2, a2), h2 = 0.8 + r() * 0.45;
        E4.set((r() - 0.5) * 0.12, r() * 6.28, (r() - 0.5) * 0.12); Q4.setFromEuler(E4); P4.set(p2[0], g0(p2[0], p2[1]), p2[1]); S4.set(1, h2, 1);
        M4.compose(P4, Q4, S4); stalks.setMatrixAt(nC, M4); heads.setMatrixAt(nC, M4);
        C4.setRGB(0.2, 0.28, 0.11); stalks.setColorAt(nC, C4); var hb = 0.8 + r() * 0.3; C4.setRGB(0.36 * hb, 0.22 * hb, 0.12 * hb); heads.setColorAt(nC, C4); nC++;
      }
    });
    reeds.count = nR; stalks.count = nC; heads.count = nC;
    [reeds, stalks, heads].forEach(function (m) { m.castShadow = true; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; scene.add(m); });

    // Lily pads
    function padPaint(worn) {
      return paint(512, 512, function (g, w) {
        var c = w / 2, R0 = c * 0.985;
        g.save(); g.beginPath(); g.arc(c, c, R0, 0, 6.29); g.clip();
        var gr = g.createRadialGradient(c, c, 0, c, c, R0); gr.addColorStop(0, '#6f8a34'); gr.addColorStop(0.25, '#4f7029'); gr.addColorStop(0.75, '#3e5f22'); gr.addColorStop(0.95, '#34501d'); gr.addColorStop(1, '#4a3a1c');
        g.fillStyle = gr; g.fillRect(0, 0, w, w);
        for (var i = 0; i < 70; i++) { var x = r() * w, y = r() * w, rad = 15 + r() * 60, tone = r() < 0.5 ? '90,120,40' : '30,50,18'; var bl = g.createRadialGradient(x, y, 0, x, y, rad); bl.addColorStop(0, 'rgba(' + tone + ',.25)'); bl.addColorStop(1, 'rgba(' + tone + ',0)'); g.fillStyle = bl; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
        function vein(x, y, a, len, wd, depth) {                       // veins fan out from the middle and fork towards the rim
          var steps = 10, px = x, py = y;
          g.lineWidth = wd; g.strokeStyle = 'rgba(150,180,90,' + (0.5 - depth * 0.12) + ')';
          g.beginPath(); g.moveTo(px, py);
          for (var s = 1; s <= steps; s++) { a += (r() - 0.5) * 0.06; px += Math.cos(a) * len / steps; py += Math.sin(a) * len / steps; g.lineTo(px, py); }
          g.stroke();
          g.lineWidth = wd * 0.6; g.strokeStyle = 'rgba(20,35,12,.25)'; g.beginPath(); g.moveTo(x + 1.2, y + 1.2); g.lineTo(px + 1.2, py + 1.2); g.stroke();
          if (depth < 2) { vein(px, py, a - 0.16, len * 0.62, wd * 0.65, depth + 1); vein(px, py, a + 0.16, len * 0.62, wd * 0.65, depth + 1); }
        }
        for (var v = 0; v < 24; v++) vein(c, c, v / 24 * Math.PI * 2 + 0.13, R0 * 0.42, 2.6, 0);
        for (var n = 0; n < 2500; n++) { g.fillStyle = 'rgba(' + (r() < 0.5 ? '200,220,150' : '20,30,10') + ',' + (0.03 + r() * 0.06) + ')'; g.fillRect(r() * w, r() * w, 1 + r() * 2, 1 + r() * 2); }
        var sh = g.createLinearGradient(0, 0, w, w); sh.addColorStop(0.2, 'rgba(230,245,200,0)'); sh.addColorStop(0.42, 'rgba(230,245,200,.16)'); sh.addColorStop(0.6, 'rgba(230,245,200,0)');   // a waxy sheen
        g.fillStyle = sh; g.fillRect(0, 0, w, w);
        g.fillStyle = '#a8b860'; g.beginPath(); g.arc(c, c, 4, 0, 6.29); g.fill();
        if (worn) {                                                       // yellowing and brown spots creeping in from the rim
          for (var y2 = 0; y2 < 5; y2++) { var a2 = r() * 6.28, d2 = R0 * (0.65 + r() * 0.3), xx = c + Math.cos(a2) * d2, yy = c + Math.sin(a2) * d2, rr4 = 20 + r() * 45; var yb = g.createRadialGradient(xx, yy, 0, xx, yy, rr4); yb.addColorStop(0, 'rgba(170,140,50,.75)'); yb.addColorStop(0.6, 'rgba(150,130,50,.35)'); yb.addColorStop(1, 'rgba(150,130,50,0)'); g.fillStyle = yb; g.fillRect(xx - rr4, yy - rr4, rr4 * 2, rr4 * 2); }
          for (var b = 0; b < 9; b++) { g.fillStyle = 'rgba(' + (70 + r() * 30 | 0) + ',45,20,.7)'; g.beginPath(); g.arc(c + (r() - 0.5) * R0 * 1.6, c + (r() - 0.5) * R0 * 1.6, 2 + r() * 6, 0, 6.29); g.fill(); }
        }
        g.strokeStyle = 'rgba(110,40,40,.85)'; g.lineWidth = 4; g.beginPath(); g.arc(c, c, R0 - 2, 0, 6.29); g.stroke();   // a thin red-brown rim
        g.restore();
        for (var d = 0; d < 7; d++) {                                     // beads of water
          var dx = c + (r() - 0.5) * R0 * 1.3, dy = c + (r() - 0.5) * R0 * 1.3, dr = 2 + r() * 5;
          g.fillStyle = 'rgba(10,25,8,.35)'; g.beginPath(); g.arc(dx + 1.5, dy + 1.5, dr, 0, 6.29); g.fill();
          var dg = g.createRadialGradient(dx - dr * 0.3, dy - dr * 0.3, 0, dx, dy, dr); dg.addColorStop(0, 'rgba(255,255,255,.95)'); dg.addColorStop(0.35, 'rgba(190,220,170,.5)'); dg.addColorStop(1, 'rgba(60,100,40,.6)');
          g.fillStyle = dg; g.beginPath(); g.arc(dx, dy, dr, 0, 6.29); g.fill();
        }
        if (worn) {                                                       // nibbles and holes
          g.globalCompositeOperation = 'destination-out';
          for (var h = 0; h < 4; h++) { var ha = r() * 6.28; g.beginPath(); g.arc(c + Math.cos(ha) * R0, c + Math.sin(ha) * R0, 6 + r() * 14, 0, 6.29); g.fill(); }
          for (var h2 = 0; h2 < 3; h2++) { var ha2 = r() * 6.28, hd = R0 * (0.3 + r() * 0.5); g.beginPath(); g.ellipse(c + Math.cos(ha2) * hd, c + Math.sin(ha2) * hd, 3 + r() * 7, 2 + r() * 5, r() * 3, 0, 6.29); g.fill(); }
          g.globalCompositeOperation = 'source-over';
        }
      }, true);
    }
    var underTex = paint(256, 256, function (g, w) {                    // the underside: purple-red with raised pale veins
      var c = w / 2; g.fillStyle = '#5a2232'; g.fillRect(0, 0, w, w);
      g.strokeStyle = 'rgba(200,140,140,.35)'; g.lineWidth = 2;
      for (var i = 0; i < 24; i++) { var a = i / 24 * 6.29; g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.cos(a) * c, c + Math.sin(a) * c); g.stroke(); }
    }, true);
    var padG = new THREE.BufferGeometry(), pgp = [], pgu = [], pgi = [], RG = 14, SG = 96, NOTCH = 0.11;
    for (var pr = 0; pr <= RG; pr++) for (var pa = 0; pa <= SG; pa++) {
      var rr3 = pr / RG, th = NOTCH + (Math.PI * 2 - NOTCH * 2) * pa / SG, cx = Math.cos(th) * rr3, cz = Math.sin(th) * rr3;
      var lobe = Math.max(0, 1 - Math.min(th, Math.PI * 2 - th) / 0.6) * (th < Math.PI ? 1 : -1);   // the two lobes by the notch, one lifting a touch over the other
      var y = 0.014 * rr3 + 0.075 * Math.pow(rr3, 9) + 0.01 * Math.sin(th * 9 + 1) * Math.pow(rr3, 5) + 0.006 * Math.sin(th * 23) * Math.pow(rr3, 8) + Math.max(0, lobe) * 0.02 * rr3;
      pgp.push(cx, y, -cz); pgu.push(0.5 + cx * 0.5, 0.5 + cz * 0.5);
    }
    for (var pr2 = 0; pr2 < RG; pr2++) for (var pa3 = 0; pa3 < SG; pa3++) { var A3 = pr2 * (SG + 1) + pa3, B3 = A3 + SG + 1; pgi.push(A3, B3, A3 + 1, B3, B3 + 1, A3 + 1); }
    padG.setAttribute('position', new THREE.Float32BufferAttribute(pgp, 3)); padG.setAttribute('uv', new THREE.Float32BufferAttribute(pgu, 2)); padG.setIndex(pgi); padG.computeVertexNormals();
    var padKinds = [padPaint(false), padPaint(true)].map(function (tx) {
      var top = new THREE.InstancedMesh(padG, new THREE.MeshStandardMaterial({ map: tx, color: '#c4ccb4', alphaTest: 0.5, roughness: 0.3, side: THREE.FrontSide }), 64);
      var bottom = new THREE.InstancedMesh(padG, new THREE.MeshStandardMaterial({ map: underTex, alphaMap: tx, alphaTest: 0.5, roughness: 0.6, side: THREE.BackSide }), 64);
      top.receiveShadow = true; top.count = bottom.count = 0; scene.add(top); scene.add(bottom);
      return { top: top, bottom: bottom };
    });
    var pads = [], PADS = 70;
    for (var pd = 0; pd < PADS; pd++) {                                 // in loose drifts, the big ones and little ones mixed
      var pa2, pt2, pp3, tries = 0, ps2 = r() < 0.25 ? 0.12 + r() * 0.1 : 0.22 + r() * 0.24;
      do { pa2 = r() * 6.28; pt2 = 0.3 + r() * 0.62; pp3 = polar(pt2, pa2); tries++; }
      while (tries < 40 && (Math.abs(Math.atan2(Math.sin(pa2 - da), Math.cos(pa2 - da))) < 0.35 || pads.some(function (o) { return Math.hypot(o.x - pp3[0], o.z - pp3[1]) < (o.s + ps2) * 0.92; })));
      var kind = padKinds[r() < 0.3 ? 1 : 0], slot = kind.top.count++; kind.bottom.count++;
      pads.push({ x: pp3[0], z: pp3[1], s: ps2, yaw: r() * 6.28, ph: r() * 6.28, kind: kind, slot: slot });
    }
    // Water lilies
    function petalTex(tip, base) {
      return paint(128, 256, function (g, w, h) {
        var gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, base); gr.addColorStop(0.22, '#fbfaf2'); gr.addColorStop(0.62, '#ffffff'); gr.addColorStop(1, tip);
        g.fillStyle = gr; g.fillRect(0, 0, w, h);
        for (var i = 0; i < 20; i++) {                                   // fine veins running from base to tip
          var k = (i / 19 - 0.5) * 2; g.strokeStyle = 'rgba(160,150,170,' + (0.14 + r() * 0.1) + ')'; g.lineWidth = 1.4;
          g.beginPath(); g.moveTo(w / 2 + k * 6, h); g.bezierCurveTo(w / 2 + k * w * 0.55, h * 0.65, w / 2 + k * w * 0.5, h * 0.3, w / 2 + k * 10, 2); g.stroke();
        }
        var sd = g.createLinearGradient(0, 0, w, 0); sd.addColorStop(0, 'rgba(160,150,175,.45)'); sd.addColorStop(0.3, 'rgba(255,255,255,0)'); sd.addColorStop(0.5, 'rgba(120,110,130,.12)'); sd.addColorStop(0.7, 'rgba(255,255,255,0)'); sd.addColorStop(1, 'rgba(160,150,175,.45)');
        g.fillStyle = sd; g.fillRect(0, 0, w, h);
      }, true);
    }
    var lilyTex = [petalTex('#f8eef2', '#d8e2b8'), petalTex('#e9799f', '#efd2dc')];
    var sepalTex = paint(128, 256, function (g, w, h) {                 // green outside, with pink-white margins
      g.fillStyle = '#6d8a3e'; g.fillRect(0, 0, w, h);
      var m = g.createLinearGradient(0, 0, w, 0); m.addColorStop(0, 'rgba(235,215,220,.85)'); m.addColorStop(0.2, 'rgba(235,215,220,0)'); m.addColorStop(0.8, 'rgba(235,215,220,0)'); m.addColorStop(1, 'rgba(235,215,220,.85)');
      g.fillStyle = m; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 300; i++) { g.fillStyle = 'rgba(40,60,20,' + (0.05 + r() * 0.1) + ')'; g.fillRect(r() * w, r() * h, 1, 2 + r() * 5); }
    }, true);
    function petalG(len, wid, cup, lift) {                              // a boat-shaped petal: narrow base, full middle, softly pointed tip
      var NU = 8, NV = 14, pos = [], uv = [], idx = [];
      for (var j = 0; j <= NV; j++) for (var i = 0; i <= NU; i++) {
        var v = j / NV, u = i / NU * 2 - 1, hw = v < 0.45 ? wid * (0.22 + 0.78 * Math.sin(v / 0.45 * Math.PI / 2)) : wid * Math.sqrt(Math.max(0, 1 - Math.pow((v - 0.45) / 0.55, 2.4)));
        var x = u * hw, z = cup * u * u * Math.sin(Math.PI * Math.min(1, v * 1.2)) + lift * v * v - 0.004 * Math.cos(u * 1.57);
        pos.push(x, v * len, z); uv.push(0.5 + u * 0.5, v);
      }
      for (var j2 = 0; j2 < NV; j2++) for (var i2 = 0; i2 < NU; i2++) { var a = j2 * (NU + 1) + i2, b = a + NU + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
      return g;
    }
    function merge(parts, colors) {                                       // many small pieces as one mesh
      var P = [], N = [], U = [], C = [], I = [], off = 0, nm = new THREE.Matrix3();
      parts.forEach(function (pt, k) {
        var g = pt[0].index ? pt[0] : pt[0], p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv, v = new THREE.Vector3();
        nm.getNormalMatrix(pt[1]);
        for (var i = 0; i < p.count; i++) {
          v.fromBufferAttribute(p, i).applyMatrix4(pt[1]); P.push(v.x, v.y, v.z);
          if (colors) { var c = typeof pt[2] === 'function' ? pt[2](v.x, v.y, v.z) : (pt[2] || [1, 1, 1]); C.push(c[0], c[1], c[2]); }
          v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize(); N.push(v.x, v.y, v.z);
          U.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0);
        }
        if (g.index) for (var j = 0; j < g.index.count; j++) I.push(g.index.getX(j) + off); else for (var j2 = 0; j2 < p.count; j2++) I.push(j2 + off);
        off += p.count;
      });
      var m = new THREE.BufferGeometry(); m.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); m.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); m.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
      if (colors) m.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); m.setIndex(I); return m;
    }
    var lM = new THREE.Matrix4(), lQ = new THREE.Quaternion(), lE = new THREE.Euler(), lP = new THREE.Vector3(), lS = new THREE.Vector3();
    function placed(yaw, tilt, roll, y, s, out) {                          // turned round the middle, leaning out from it
      lE.set(0, yaw, 0); var qy = new THREE.Quaternion().setFromEuler(lE); lE.set(-tilt, 0, roll); lQ.setFromEuler(lE); qy.multiply(lQ);
      lP.set(0, y, 0); lS.set(s, s, s); return (out || new THREE.Matrix4()).compose(lP, qy, lS);
    }
    var crownGeo = (function () {                                         // stamens curling in round a ridged golden disc
      var parts = [], fil = new THREE.CylinderGeometry(0.003, 0.0045, 1, 5, 5); fil.translate(0, 0.5, 0);
      var fp = fil.attributes.position; for (var i = 0; i < fp.count; i++) { var y = fp.getY(i); fp.setZ(i, fp.getZ(i) + y * y * 0.012); } fil.computeVertexNormals();
      var anth = new THREE.SphereGeometry(1, 6, 5); anth.scale(0.0055, 0.015, 0.005);
      for (var k = 0; k < 90; k++) {
        var ring = k % 3, yaw = k / 90 * Math.PI * 2 * 3 + ring * 0.2, len = 0.05 + ring * 0.012 - r() * 0.006, tilt = 0.6 - ring * 0.2 + (r() - 0.5) * 0.15;
        var m = placed(yaw, tilt, 0, 0.012, 1); m.multiply(new THREE.Matrix4().makeTranslation(0, 0, -(0.018 + ring * 0.006)));
        var fm = m.clone().multiply(new THREE.Matrix4().makeScale(1, len, 1));
        parts.push([fil, fm, ring === 0 ? [1, 0.86, 0.42] : [0.98, 0.78, 0.2]]);
        var tip = new THREE.Vector3(0, len, 0.012).applyMatrix4(m);
        var am = placed(yaw, tilt - 0.5, 0, 0, 1); am.setPosition(tip); parts.push([anth, am, [0.93, 0.62, 0.1]]);
      }
      var disc = new THREE.LatheGeometry([[0, 0.01], [0.012, 0.008], [0.019, 0.012], [0.021, 0.016], [0.018, 0.017]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 18);
      parts.push([disc, new THREE.Matrix4(), [0.95, 0.8, 0.3]]);
      var ray = new THREE.BoxGeometry(0.002, 0.003, 0.016); ray.translate(0, 0, 0.009);
      for (var j = 0; j < 16; j++) parts.push([ray, placed(j / 16 * Math.PI * 2, 0.15, 0, 0.0135, 1), [0.98, 0.7, 0.15]]);
      return merge(parts, true);
    })();
    var crownMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, emissive: new THREE.Color('#704000'), emissiveIntensity: 0.25 });
    var sepalG = petalG(0.17, 0.045, 0.014, 0.012), petalOut = petalG(0.17, 0.045, 0.03, 0.035), petalIn = petalG(0.14, 0.038, 0.034, 0.04);
    var lilyMats = lilyTex.map(function (tx) { return new THREE.MeshStandardMaterial({ map: tx, side: THREE.DoubleSide, roughness: 0.65, emissive: new THREE.Color('#ffffff'), emissiveMap: tx, emissiveIntensity: 0.05 }); });
    var sepalMat = new THREE.MeshStandardMaterial({ map: sepalTex, side: THREE.DoubleSide, roughness: 0.5 });
    function lily(pink) {
      var f = new THREE.Group(), open = 0.85 + r() * 0.3, sp = [], pp = [];
      for (var s = 0; s < 4; s++) sp.push([sepalG, placed(s / 4 * Math.PI * 2 + 0.4, Math.min(1.52, 1.45 * open), (r() - 0.5) * 0.1, 0.002, 1)]);
      [[12, 1.3, petalOut, 1], [10, 0.98, petalOut, 0.95], [8, 0.66, petalIn, 0.9], [6, 0.38, petalIn, 0.8]].forEach(function (ring, ri) {
        for (var i = 0; i < ring[0]; i++) pp.push([ring[2], placed((i + ri * 0.5) / ring[0] * Math.PI * 2 + (r() - 0.5) * 0.12, Math.min(1.5, ring[1] * open) + (r() - 0.5) * 0.1, (r() - 0.5) * 0.12, 0.004 + ri * 0.006, ring[3] * (0.9 + r() * 0.18))]);
      });
      var sm = new THREE.Mesh(merge(sp), sepalMat), pm = new THREE.Mesh(merge(pp), lilyMats[pink ? 1 : 0]), cm = new THREE.Mesh(crownGeo, crownMat);
      sm.castShadow = pm.castShadow = true; cm.position.y = 0.014; cm.scale.setScalar(1.35); f.add(sm, pm, cm);
      return f;
    }
    function bud() {                                                    // a closed bud on its stem, just above the water
      var b = new THREE.Group();
      var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.12, 6), sepalMat); stem.position.y = 0.04; b.add(stem);
      var head = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.03, 0.02], [0.036, 0.06], [0.026, 0.1], [0, 0.14]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 12), new THREE.MeshStandardMaterial({ color: '#7c8a45', roughness: 0.5 }));
      head.position.y = 0.09; b.add(head);
      for (var i = 0; i < 4; i++) { var tip = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.05, 6), new THREE.MeshStandardMaterial({ color: '#f4d2de', roughness: 0.5 })); tip.position.set(Math.cos(i * 1.57) * 0.012, 0.2, Math.sin(i * 1.57) * 0.012); b.add(tip); }
      return b;
    }
    var flowers = [];
    pads.forEach(function (p, i) {
      if (p.s < 0.2) return;
      if (i % 5 === 1) { var fl = lily(r() < 0.35); fl.scale.setScalar(0.9 + r() * 0.35); scene.add(fl); flowers.push({ f: fl, pad: p }); }
      else if (i % 9 === 4) { var bd = bud(); bd.scale.setScalar(0.9 + r() * 0.3); scene.add(bd); flowers.push({ f: bd, pad: p }); }
    });

    // Koi
    function koiTex(seed) {
      var kr = rand(seed);
      return paint(256, 128, function (g, w, h) {
        g.fillStyle = '#f4efe6'; g.fillRect(0, 0, w, h);
        var orange = ['#e2531c', '#ea6a1e', '#d9401a', '#f08a2a'][Math.floor(kr() * 4)];
        for (var i = 0; i < 7; i++) { var x = kr() * w, y = kr() * h * 0.6 + h * 0.2, rx = 15 + kr() * 40, ry = 10 + kr() * 28; g.fillStyle = orange; g.beginPath(); g.ellipse(x, y, rx, ry, kr() * 3, 0, 6.29); g.fill(); }
        if (kr() < 0.5) for (var j = 0; j < 5; j++) { g.fillStyle = '#1b1614'; g.beginPath(); g.ellipse(kr() * w, kr() * h, 4 + kr() * 10, 3 + kr() * 6, 0, 0, 6.29); g.fill(); }
        for (var s = 0; s < 500; s++) { g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 0.6; var sx = (s % 25) / 25 * w + (Math.floor(s / 25) % 2) * 5, sy = Math.floor(s / 25) / 20 * h; g.beginPath(); g.arc(sx, sy, 4, 0.3, 2.8); g.stroke(); }   // scales
      }, true);
    }
    var koiBody = new THREE.SphereGeometry(1, 22, 14); koiBody.rotateZ(-Math.PI / 2);
    var kbp = koiBody.attributes.position;
    for (var kv = 0; kv < kbp.count; kv++) { var kx = kbp.getX(kv), kf2 = kx > 0 ? 1 : 0.35 + 0.65 * (1 + kx); kbp.setXYZ(kv, kx * 0.2, kbp.getY(kv) * 0.055 * kf2, kbp.getZ(kv) * 0.045 * kf2); }   // a rounded head, tapering to the tail
    koiBody.computeVertexNormals();
    var tailShape = new THREE.Shape(); tailShape.moveTo(0, 0); tailShape.quadraticCurveTo(-0.06, 0.06, -0.12, 0.08); tailShape.quadraticCurveTo(-0.09, 0, -0.12, -0.08); tailShape.quadraticCurveTo(-0.06, -0.06, 0, 0);
    var tailG = new THREE.ShapeGeometry(tailShape, 8), finMat = new THREE.MeshStandardMaterial({ color: '#f6c8a0', transparent: true, opacity: 0.75, side: THREE.DoubleSide, roughness: 0.5 });
    var koi = [];
    for (var kf = 0; kf < 9; kf++) {
      var fish = new THREE.Group(), body = new THREE.Mesh(koiBody, new THREE.MeshStandardMaterial({ map: koiTex(70 + kf), roughness: 0.35 }));
      fish.add(body);
      var tail = new THREE.Group(); tail.position.x = -0.19; fish.add(tail); tail.add(new THREE.Mesh(tailG, finMat));
      [-1, 1].forEach(function (sd) { var fin = new THREE.Mesh(new THREE.CircleGeometry(0.035, 10), finMat); fin.position.set(0.07, -0.03, sd * 0.04); fin.rotation.set(Math.PI / 2 - sd * 0.5, 0, 0.6); fish.add(fin); });
      var sc = 0.9 + r() * 0.6; fish.scale.setScalar(sc); scene.add(fish);
      koi.push({ g: fish, tail: tail, a: r() * 6.28, rt: 0.35 + r() * 0.35, sp: (0.12 + r() * 0.1) * (r() < 0.5 ? 1 : -1), depth: 0.22 + r() * 0.25, ph: r() * 6.28, wob: r() * 6.28 });
    }

    var kP = new THREE.Vector3(), kQ = new THREE.Quaternion(), kE = new THREE.Euler();
    return {
      walkable: function (x, z) { return onDock(x, z) || pondT(x, z) > 1.07; },
      floor: function (x, z) { var g = groundHeight(x, z, FARM); return onDock(x, z) ? Math.max(g, DY + 0.02) : g; },
      update: function (t, dt) {
        waterMat.uniforms.uSun.value.copy(sun.position).normalize();
        pads.forEach(function (p, i) {
          var bob = Math.sin(t * 0.8 + p.ph) * 0.006;
          E4.set(Math.sin(t * 0.9 + p.ph) * 0.02, p.yaw + Math.sin(t * 0.15 + p.ph) * 0.15, Math.cos(t * 0.7 + p.ph) * 0.02); Q4.setFromEuler(E4);
          P4.set(p.x + Math.sin(t * 0.1 + p.ph) * 0.05, WY + 0.008 + bob, p.z + Math.cos(t * 0.12 + p.ph) * 0.05); S4.set(p.s, p.s, p.s);
          M4.compose(P4, Q4, S4); p.kind.top.setMatrixAt(p.slot, M4); p.kind.bottom.setMatrixAt(p.slot, M4);
        });
        padKinds.forEach(function (k) { k.top.instanceMatrix.needsUpdate = true; k.bottom.instanceMatrix.needsUpdate = true; });
        flowers.forEach(function (f) { var p = f.pad; f.f.position.set(p.x + Math.sin(t * 0.1 + p.ph) * 0.05 + p.s * 0.25, WY + 0.02 + Math.sin(t * 0.8 + p.ph) * 0.006, p.z + Math.cos(t * 0.12 + p.ph) * 0.05); f.f.rotation.y = p.yaw + t * 0.02; });
        koi.forEach(function (k) {
          k.a += k.sp * dt / k.rt * (1 + 0.3 * Math.sin(t * 0.3 + k.ph));
          var rad = k.rt + 0.25 * Math.sin(t * 0.21 + k.ph), a = k.a, R = pondR(a) * rad;
          kP.set(PX + Math.cos(a) * R, 0, PZ + Math.sin(a) * R); var bedY = groundHeight(kP.x, kP.z, FARM); kP.y = Math.max(bedY + 0.12, WY - k.depth - 0.08 * Math.sin(t * 0.4 + k.ph));
          var dir = Math.atan2(-Math.cos(a) * k.sp, -Math.sin(a) * k.sp);
          k.g.position.copy(kP); k.g.rotation.set(0, dir, Math.sin(t * 2 + k.wob) * 0.04);
          k.tail.rotation.y = Math.sin(t * 5 + k.wob) * 0.45; k.g.children[0].rotation.y = Math.sin(t * 5 + k.wob - 1) * 0.06;
        });
      }
    };
  })();
  function floorAt(x, z) { return pond ? pond.floor(x, z) : groundHeight(x, z, FARM); }

  // The Witch
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
    var x = 0, z = 0, heading = 0, speed = 0, phase = 0, walkW = 0, holding = null, holdW = 0;
    // What she holds: a Dawn Petal pinched between thumb and finger
    var heldPetal = makePetal(); heldPetal.visible = false; scene.add(heldPetal);
    function tipOf(bone, out) { var p = bone.getWorldPosition(new THREE.Vector3()), q = bone.parent.getWorldPosition(new THREE.Vector3()); return out.copy(p).addScaledVector(p.sub(q).normalize(), 0.012); }   // a fingertip's pad, just past its last joint
    var hv = new THREE.Vector3(), hv2 = new THREE.Vector3(), hUp = new THREE.Vector3(), hFw = new THREE.Vector3(), hSd = new THREE.Vector3(), hM = new THREE.Matrix4();
    var hipsRestY = B.hips ? B.hips.position.y : 0;
    holder.position.set(x, floorAt(x, z), z);
    var nextBlink = 2, blinkT = -1;
    var WALK = 4.4, STRIDE = 2.9;

    return {
      group: holder,
      update: function (t, dt, mx, mz) {
        // Moving: ease up to walking pace, turn smoothly toward where she's heading, stay on the farm
        var want = Math.min(1, Math.hypot(mx, mz));
        if (want > 0.05) {
          var target = Math.atan2(mx, mz), diff = Math.atan2(Math.sin(target - heading), Math.cos(target - heading));
          heading += diff * Math.min(1, dt * 8);
        }
        var turning = want > 0.05 ? Math.abs(Math.atan2(Math.sin(Math.atan2(mx, mz) - heading), Math.cos(Math.atan2(mx, mz) - heading))) : 0;
        var goal = WALK * want * Math.max(0.25, 1 - turning / 1.6);
        speed += (goal - speed) * Math.min(1, dt * (goal > speed ? 4 : 6));
        var nx = x + Math.sin(heading) * speed * dt, nz = z + Math.cos(heading) * speed * dt;
        if (insideFarm(nx, nz, FARM - 0.5, 6.5) && !dawn.blocks(nx, nz) && pond.walkable(nx, nz)) { x = nx; z = nz; } else speed *= 0.5;
        phase += (speed * dt / STRIDE) * Math.PI * 2;
        walkW += (Math.min(1, speed / (WALK * 0.6)) - walkW) * Math.min(1, dt * 6);
        var W = walkW, I = 1 - W, p = phase;
        holder.rotation.y = heading;
        holder.position.set(x, floorAt(x, z), z);

        // Hips: rising over each step and sinking between, rolling toward the standing leg, turning with the stride
        if (B.hips) B.hips.position.y = hipsRestY + W * (0.018 * Math.cos(2 * p) - 0.022);
        pose(B.hips, E(0.03 * W, -0.09 * Math.sin(p) * W, 0.035 * Math.sin(p) * W));

        // Body: breathing when still; walking, a slight lean and the chest turning against the hips
        var br = Math.sin(t * 1.4) * I;
        pose(B.spine, E(0.01 * br + 0.035 * W, 0.05 * Math.sin(p) * W, -0.02 * Math.sin(p) * W));
        pose(B.chest, E(0.015 * br + 0.02 * W, 0.07 * Math.sin(p) * W, 0));

        // Legs: thigh swinging through, knee folding to lift the foot then straightening to land heel first,
        // ankle pushing off at the back
        [[B.leftUpperLeg, B.leftLowerLeg, B.leftFoot, B.leftToes, 0], [B.rightUpperLeg, B.rightLowerLeg, B.rightFoot, B.rightToes, Math.PI]].forEach(function (L, k) {
          var q = p + L[4], sw = Math.sin(q), c = Math.cos(q);
          var thigh = -0.46 * sw - 0.04, knee = 0.1 + 1.0 * Math.pow(Math.max(0, c), 1.6) + 0.12 * Math.max(0, sw);
          var ankle = -0.22 * Math.max(0, sw) * Math.max(0, -c * 0.5 + 0.5) + 0.32 * Math.pow(Math.max(0, -sw), 2) - 0.25 * Math.max(0, c) * 0.6;
          var idleThigh = k ? -0.06 : 0, idleKnee = k ? 0.12 : 0;
          pose(L[0], E(thigh * W + idleThigh * I, (k ? -0.08 : 0) * I, (k ? 0.02 : 0) * I));
          pose(L[1], E(knee * W + idleKnee * I, 0, 0));
          pose(L[2], E(ankle * W, 0, 0));
          pose(L[3], E(-0.35 * Math.pow(Math.max(0, -sw), 3) * W, 0, 0));
        });

        // Arms
        var pa = p - 0.45, jit = 1 + 0.1 * Math.sin(t * 0.7);
        [[B.leftShoulder, B.leftUpperArm, B.leftLowerArm, B.leftHand, 1], [B.rightShoulder, B.rightUpperArm, B.rightLowerArm, B.rightHand, -1]].forEach(function (a) {
          var s = a[4], sway = Math.sin(t * 1.4 + s * 0.6) * 0.015 * I;
          var sn = s * Math.sin(pa), lag = s * Math.sin(pa - 0.9), lag2 = s * Math.sin(pa - 1.5);
          var swing = (sn < 0 ? 0.2 : 0.13) * sn * W * jit;
          var h = s < 0 ? holdW : 0, hs = 1 - h * 0.8;                     // the hand holding something stays up in front of her
          pose(a[0], E(0.03 * swing * hs, 0, -s * 0.09));
          pose(a[1], E(-0.1 + swing * hs + h * HOLD[0], h * HOLD[1], -s * (1.2 + sway) + h * HOLD[2]));
          pose(a[2], E(0, -s * (0.22 + 0.16 * W * (0.5 - 0.5 * lag)) * (1 - h) + h * HOLD[3], 0));
          pose(a[3], E(0.12 * lag2 * W * hs + h * HOLD[4], -s * (0.2 + 0.06 * W) * (1 - h) + h * HOLD[5], -s * (0.1 + 0.05 * W) * (1 - h) + h * HOLD[6]));
        });

        // Fingers: a gentle pinch round the petal, the others softly curled
        holdW += ((holding ? 1 : 0) - holdW) * Math.min(1, dt * 6);
        FINGERS.forEach(function (f) { var c = holdW * f[1]; [0, 1, 2].forEach(function (j) { pose(B['right' + f[0] + ['Proximal', 'Intermediate', 'Distal'][j]] || B['right' + f[0] + ['Metacarpal', 'Proximal', 'Distal'][j]], E(f[2] * c, f[3] * c, f[4] * c * (j ? 0.8 : 1))); }); });
        if (holding && holdW > 0.5 && B.rightThumbDistal && B.rightIndexDistal) {
          holder.updateMatrixWorld(true);
          tipOf(B.rightThumbDistal, hv); tipOf(B.rightIndexDistal, hv2);       // the pads of her thumb and first finger
          var pinch = hv.clone().lerp(hv2, 0.5), face = hv.clone().sub(hv2).normalize();   // the petal lies flat between them
          B.rightHand.getWorldPosition(hFw); hUp.copy(pinch).sub(hFw).normalize().lerp(new THREE.Vector3(0, 1, 0), 0.35);   // pointing out past her fingertips, a little upward
          hUp.addScaledVector(face, -hUp.dot(face)).normalize();
          var side = new THREE.Vector3().crossVectors(hUp, face).normalize();
          hM.makeBasis(side, hUp, face); heldPetal.quaternion.setFromRotationMatrix(hM);
          heldPetal.position.copy(pinch).addScaledVector(hUp, -0.009);          // its narrow base held between them
          heldPetal.visible = true;
        } else heldPetal.visible = false;

        // Head: steady, looking ahead, settling against the bob of each step
        pose(B.neck, E(0.02 - 0.01 * W, (0.03 * Math.sin(t * 0.3)) * I - 0.04 * Math.sin(p) * W, 0));
        pose(B.head, E(0.04 - 0.02 * W - 0.01 * Math.cos(2 * p) * W, (0.05 * Math.sin(t * 0.3 + 1)) * I - 0.03 * Math.sin(p) * W, 0.05 * I));

        nextBlink -= dt;
        if (nextBlink <= 0) { blinkT = 0; nextBlink = 2 + Math.random() * 3.5; }
        if (blinkT >= 0) { blinkT += dt; var bv = blinkT < 0.08 ? blinkT / 0.08 : Math.max(0, 1 - (blinkT - 0.08) / 0.1); blink(bv); if (blinkT > 0.2) { blink(0); blinkT = -1; } }
      },
      position: function () { return holder.position; },
      hold: function (id) { holding = id; }
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
  // Dawn Tree Gives Mana
  var manaBar = manaEl.closest('.mana'), filling = false, chimeT = 0, audio = null;
  function wakeAudio() { if (!audio && (window.AudioContext || window.webkitAudioContext)) audio = new (window.AudioContext || window.webkitAudioContext)(); if (audio && audio.state === 'suspended') audio.resume(); }
  window.addEventListener('pointerdown', wakeAudio); window.addEventListener('keydown', wakeAudio);
  function chime(freq, vol, len) {
    if (!audio || audio.state !== 'running') return;
    var t0 = audio.currentTime;
    [1, 2.76, 5.4].forEach(function (h, i) {
      var o = audio.createOscillator(), g = audio.createGain();
      o.type = 'sine'; o.frequency.value = freq * h;
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol / (1 + i * 2.5), t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + len / (1 + i));
      o.connect(g); g.connect(audio.destination); o.start(t0); o.stop(t0 + len);
    });
  }
  function treeMana(t, dt) {
    var p = witch ? witch.position() : null, near = !!p && dawn.near(p.x, p.z), want = near && mana < MANA_MAX;
    if (want) {
      if (!filling) toast('The Dawn Tree is restoring your mana.');
      mana = Math.min(MANA_MAX, mana + 32 * dt); showMana();
      chimeT -= dt;
      if (chimeT <= 0) { chimeT = 0.22; chime(520 + 400 * mana / MANA_MAX + Math.random() * 30, 0.05, 0.9); }
      if (mana >= MANA_MAX) { toast('Your mana is full.'); [784, 988, 1175].forEach(function (f, i) { setTimeout(function () { chime(f, 0.07, 1.6); }, i * 110); }); }
    }
    filling = want; manaBar.classList.toggle('filling', want);
    dawn.feed(want, t, dt, p ? p.x : 0, p ? p.y + 1.1 : 0, p ? p.z : 0);
  }

  // Dawn Petal icon
  function petalPaint(S, flat) {
    var c = document.createElement('canvas'); c.width = c.height = S;
    var g = c.getContext('2d'), k = S * 0.92;
    g.translate(S / 2, S / 2); g.scale(k, k);
    g.beginPath(); g.moveTo(0, 0.47);
    g.bezierCurveTo(0.1, 0.4, 0.31, 0.2, 0.33, -0.08); g.bezierCurveTo(0.35, -0.33, 0.2, -0.45, 0.08, -0.43);
    g.quadraticCurveTo(0.03, -0.42, 0, -0.35); g.quadraticCurveTo(-0.03, -0.42, -0.08, -0.43);
    g.bezierCurveTo(-0.2, -0.45, -0.35, -0.33, -0.33, -0.08); g.bezierCurveTo(-0.31, 0.2, -0.1, 0.4, 0, 0.47);
    g.fillStyle = '#fff'; g.fill(); g.setTransform(1, 0, 0, 1, 0, 0);
    var img = g.getImageData(0, 0, S, S), D = img.data;
    for (var y = 0; y < S; y++) {
      var x0 = S, x1 = -1;
      for (var x = 0; x < S; x++) if (D[(y * S + x) * 4 + 3] > 0) { if (x < x0) x0 = x; x1 = x; }
      if (x1 < 0) continue;
      var mid = (x0 + x1) / 2, hw = Math.max(1, (x1 - x0) / 2), v = (S / 2 + 0.47 * k - y) / (0.82 * k);
      for (var x2 = x0; x2 <= x1; x2++) {
        var o = (y * S + x2) * 4, al = D[o + 3] / 255; if (!al) continue;
        var u = (x2 - mid) / hw, cup = Math.sqrt(Math.max(0, 1 - u * u));
        var ang = Math.atan2((x2 - S / 2) / k, Math.max(0.02, v + 0.06));
        var vein = Math.pow(Math.abs(Math.cos(ang * 21)), 30) * 0.06 * (1 - v * 0.5) + Math.pow(Math.abs(Math.cos(ang * 7.5)), 60) * 0.05;
        var light = flat ? 0.95 - vein * 1.4 : 0.5 + 0.46 * cup - 0.2 * u + 0.08 * v - vein;   // lit from the upper left, shaded where it curls away
        var blush = Math.max(0, 1 - v * 2.2), pearl = Math.max(0, v - 0.45) * 1.6;
        var R = 250 - blush * 50, G = 146 - blush * 104 + pearl * 48, B = 186 - blush * 62 + pearl * 26;
        var rim = Math.pow(Math.abs(u), 10) * (flat ? 0.5 : 1);                             // a thin bright edge where light comes through
        R = R * light + rim * 40; G = G * light + rim * 46; B = B * light + rim * 40;
        var n = ((Math.sin(x2 * 12.9898 + y * 78.233) * 43758.5453) % 1) * 5;
        D[o] = Math.min(255, R + n); D[o + 1] = Math.min(255, G + n); D[o + 2] = Math.min(255, B + n); D[o + 3] = 255 * al * (0.93 + 0.07 * cup);
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }
  function petalIcon() {
    var S = 192, c = petalPaint(S, false);
    var out = document.createElement('canvas'); out.width = out.height = S; var q = out.getContext('2d');
    q.translate(S / 2, S / 2); q.rotate(-0.5); q.translate(-S / 2, -S / 2);
    q.shadowColor = 'rgba(40,0,30,.55)'; q.shadowBlur = 12; q.shadowOffsetX = 4; q.shadowOffsetY = 7; q.drawImage(c, 0, 0);
    q.shadowColor = 'transparent';
    q.globalCompositeOperation = 'source-atop';                           // a satin sheen down the curve
    var sh = q.createLinearGradient(S * 0.38, 0, S * 0.56, 0); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,240,248,.3)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
    q.fillStyle = sh; q.fillRect(0, 0, S, S); q.globalCompositeOperation = 'source-over';
    var dx = S * 0.47, dy = S * 0.42, dr = S * 0.05;                       // a dewdrop
    q.fillStyle = 'rgba(110,10,60,.3)'; q.beginPath(); q.ellipse(dx + 2.5, dy + 3.5, dr * 1.05, dr * 0.9, 0, 0, 6.29); q.fill();
    var dg = q.createRadialGradient(dx + dr * 0.25, dy + dr * 0.35, dr * 0.1, dx, dy, dr);
    dg.addColorStop(0, 'rgba(255,235,244,.9)'); dg.addColorStop(0.6, 'rgba(240,150,190,.45)'); dg.addColorStop(1, 'rgba(170,40,100,.7)');
    q.fillStyle = dg; q.beginPath(); q.ellipse(dx, dy, dr, dr * 0.88, 0, 0, 6.29); q.fill();
    q.fillStyle = 'rgba(255,255,255,.95)'; q.beginPath(); q.ellipse(dx - dr * 0.38, dy - dr * 0.36, dr * 0.3, dr * 0.17, -0.7, 0, 6.29); q.fill();
    return out.toDataURL('image/png');
  }
  var ITEMS = { petal: { name: 'Dawn Petal', icon: null } };
  function itemIcon(id) { var it = ITEMS[id]; if (!it.icon) it.icon = petalIcon(); return it.icon; }

  // Hotbar
  var HOTBAR_SIZE = 6;
  var selected = 0, bag = [];
  function addItem(id, n) {
    for (var i = 0; i < HOTBAR_SIZE; i++) if (bag[i] && bag[i].id === id) { bag[i].count += n; buildHotbar(); return true; }
    for (var j = 0; j < HOTBAR_SIZE; j++) if (!bag[j]) { bag[j] = { id: id, count: n }; buildHotbar(); return true; }
    return false;
  }
  function buildHotbar() {
    hotbarEl.innerHTML = '';
    for (var i = 0; i < HOTBAR_SIZE; i++) {
      var b = document.createElement('button'), it = bag[i];
      b.type = 'button';
      b.className = 'slot' + (it ? '' : ' empty') + (i === selected ? ' selected' : '');
      b.setAttribute('aria-label', 'Slot ' + (i + 1) + ', ' + (it ? ITEMS[it.id].name + ' ×' + it.count : 'empty'));
      b.innerHTML = (it ? '<img class="slot-item" alt="" src="' + itemIcon(it.id) + '"><span class="count">' + it.count + '</span>' : '') + '<span class="slot-key">' + (i + 1) + '</span>';
      (function (n) { b.addEventListener('click', function () { selectSlot(n); }); })(i);
      hotbarEl.appendChild(b);
    }
  }
  function heldId() { return bag[selected] ? bag[selected].id : null; }
  function selectSlot(n) {
    selected = n;
    var slots = hotbarEl.children;
    for (var i = 0; i < slots.length; i++) slots[i].classList.toggle('selected', i === n);
  }

  // Buttons and keys
  var petalDay = 0;
  function interact() {
    var p = witch && witch.position();
    if (p && dawn.near(p.x, p.z)) {                                    // the Dawn Tree gives you one petal a day
      if (petalDay === day) { toast('The Dawn Tree has already given you a petal today.'); return; }
      if (!addItem('petal', 1)) { toast('Your hotbar is full.'); return; }
      petalDay = day; toast('The Dawn Tree gives you a Dawn Petal.');
      return;
    }
    toast('Nothing here yet.');
  }
  function castSpell() {
    if (mana < 20) { toast('Not enough mana.'); return; }
    mana -= 20;
    showMana();
    toast('Dawn Bloom! Nothing to water yet.');
  }
  function openBag() { var n = bag.filter(Boolean).map(function (it) { return ITEMS[it.id].name + ' ×' + it.count; }); toast(n.length ? 'In your bag: ' + n.join(', ') + '.' : 'Your bag is empty.'); }

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

  // Walking: WASD / arrow keys, or tap the ground to walk there
  // Looking around: drag with one finger to turn the camera, pinch (or scroll) to zoom
  var keys = {};
  window.addEventListener('keyup', function (e) { keys[e.code] = false; });
  window.addEventListener('blur', function () { keys = {}; });
  var cam = { yaw: 0, pitch: 0.75, dist: 14 };
  var pointerGoal = null, ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.3), hit = new THREE.Vector3();
  var touches = {}, dragged = false, pinchStart = 0, distStart = 14;
  function aimAt(x, y) {
    var r = canvas.getBoundingClientRect();
    ndc.set((x - r.left) / r.width * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(groundPlane, hit)) pointerGoal = hit.clone();
  }
  function pinchGap() { var ids = Object.keys(touches); return ids.length < 2 ? 0 : Math.hypot(touches[ids[0]].x - touches[ids[1]].x, touches[ids[0]].y - touches[ids[1]].y); }
  canvas.addEventListener('pointerdown', function (e) {
    touches[e.pointerId] = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY };
    canvas.setPointerCapture(e.pointerId);
    if (Object.keys(touches).length === 1) dragged = false;
    else { dragged = true; pinchStart = pinchGap(); distStart = cam.dist; }
  });
  canvas.addEventListener('pointermove', function (e) {
    var t = touches[e.pointerId]; if (!t) return;
    var dx = e.clientX - t.x, dy = e.clientY - t.y; t.x = e.clientX; t.y = e.clientY;
    var n = Object.keys(touches).length;
    if (n >= 2) { var g = pinchGap(); if (pinchStart > 0 && g > 0) cam.dist = Math.max(4, Math.min(30, distStart * pinchStart / g)); return; }
    if (!dragged && Math.hypot(e.clientX - t.sx, e.clientY - t.sy) > 8) dragged = true;
    if (dragged) { cam.yaw -= dx * 0.008; cam.pitch = Math.max(0.12, Math.min(1.35, cam.pitch + dy * 0.005)); }
  });
  function lift(e) {
    var t = touches[e.pointerId]; delete touches[e.pointerId];
    if (t && !dragged && e.type === 'pointerup' && !Object.keys(touches).length) aimAt(e.clientX, e.clientY);
  }
  canvas.addEventListener('pointerup', lift);
  canvas.addEventListener('pointercancel', lift);
  canvas.addEventListener('wheel', function (e) { e.preventDefault(); cam.dist = Math.max(4, Math.min(30, cam.dist * (1 + e.deltaY * 0.001))); }, { passive: false });
  function moveInput() {
    var mx = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
    var mz = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0);
    if (mx || mz) {
      pointerGoal = null; var l = Math.hypot(mx, mz), c = Math.cos(cam.yaw), s = Math.sin(cam.yaw);
      mx /= l; mz /= l; return [mx * c + mz * s, -mx * s + mz * c];
    }
    if (pointerGoal && witch) {
      var p = witch.position(), dx = pointerGoal.x - p.x, dz = pointerGoal.z - p.z, d = Math.hypot(dx, dz);
      if (d < 0.3) { pointerGoal = null; return [0, 0]; }
      var f = Math.min(1, d / 0.8); return [dx / d * f, dz / d * f];
    }
    return [0, 0];
  }

  // Camera: follows her, turned and zoomed with your finger
  var camLook = new THREE.Vector3(0, 0.95, 0), camAim = new THREE.Vector3();
  function followCamera(dt) {
    if (!witch) return;
    var p = witch.position(), k = Math.min(1, dt * 6);
    camLook.lerp(camAim.set(p.x, p.y + 0.95, p.z), k);
    var flat = Math.cos(cam.pitch) * cam.dist;
    camera.position.set(camLook.x + Math.sin(cam.yaw) * flat, camLook.y + Math.sin(cam.pitch) * cam.dist, camLook.z + Math.cos(cam.yaw) * flat);
    camera.lookAt(camLook);
  }

  window.addEventListener('keydown', function (e) {
    keys[e.code] = true;
    if (/^Arrow/.test(e.code)) e.preventDefault();
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
    var mv = moveInput();
    if (witch) { witch.hold(heldId()); witch.update(now / 1000, dt, mv[0], mv[1]); }
    followCamera(dt);
    pond.update(now / 1000, dt);
    dawn.update(now / 1000, dt, witch ? witch.position().x : 0, witch ? witch.position().z : 0);
    treeMana(now / 1000, dt);
    if (witch) grassCenter.value.set(witch.position().x, witch.position().z);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  resize();
  buildHotbar();
  showTime();
  showMana();
  requestAnimationFrame(frame);
})();
