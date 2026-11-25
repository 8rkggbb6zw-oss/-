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

  var scene = new THREE.Scene();
  scene.background = new THREE.Color('#9fd8ff');

  var camera = new THREE.PerspectiveCamera(45, 3 / 2, 0.1, 2000);
  camera.position.set(0, 50, 66);
  camera.lookAt(0, -3, 0);

  // Light
  var hemi = new THREE.HemisphereLight('#dff1ff', '#5a6b3a', 0.75);
  scene.add(hemi);
  var sun = new THREE.DirectionalLight('#fff4e0', 0.95);
  sun.position.set(-40, 70, 30);
  scene.add(sun);
  scene.fog = new THREE.Fog('#9fd8ff', 120, 260);

  // The farm: a grassy square with softly rounded corners
  var FARM = 34;
  function rand(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  function grassTexture() {
    var S = 2048, c = document.createElement('canvas'); c.width = c.height = S;
    var g = c.getContext('2d'), r = rand(7);
    g.fillStyle = '#5f8f3e'; g.fillRect(0, 0, S, S);
    for (var i = 0; i < 260; i++) {
      var x = r() * S, y = r() * S, rad = 60 + r() * 220;
      var tone = ['rgba(120,165,70,', 'rgba(70,115,45,', 'rgba(140,170,80,', 'rgba(85,130,55,'][i % 4];
      var grd = g.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, tone + (0.25 + r() * 0.2) + ')'); grd.addColorStop(1, tone + '0)');
      g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    var shades = ['#4f7f32', '#679a42', '#7aac4e', '#5a8a38', '#8bbb5a', '#466f2c', '#9cc767'];
    g.lineCap = 'round';
    for (var j = 0; j < 90000; j++) {
      var bx = r() * S, by = r() * S, len = 3 + r() * 7, lean = (r() - 0.5) * 4;
      g.strokeStyle = shades[(r() * shades.length) | 0];
      g.globalAlpha = 0.35 + r() * 0.5;
      g.lineWidth = 0.8 + r() * 1.1;
      g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + lean, by - len); g.stroke();
    }
    g.globalAlpha = 1;
    for (var k = 0; k < 1400; k++) {
      g.fillStyle = r() < 0.5 ? 'rgba(40,60,25,.25)' : 'rgba(200,220,140,.18)';
      g.beginPath(); g.arc(r() * S, r() * S, 0.8 + r() * 1.6, 0, 6.3); g.fill();
    }
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }

  function soilTexture() {
    var W = 1024, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H;
    var g = c.getContext('2d'), r = rand(3);
    var grd = g.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, '#4c6b2c'); grd.addColorStop(0.12, '#6b4a2e'); grd.addColorStop(0.5, '#5a3d26'); grd.addColorStop(1, '#3c2818');
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    for (var i = 0; i < 9000; i++) {
      g.fillStyle = ['rgba(30,18,10,.35)', 'rgba(120,90,60,.3)', 'rgba(90,65,40,.35)'][i % 3];
      g.fillRect(r() * W, 30 + r() * (H - 30), 1 + r() * 3, 1 + r() * 2);
    }
    for (var k = 0; k < 70; k++) {
      var x = r() * W, y = 50 + r() * (H - 60), rw = 4 + r() * 10, rh = 3 + r() * 6;
      g.fillStyle = 'rgba(140,128,118,.85)'; g.beginPath(); g.ellipse(x, y, rw, rh, 0, 0, 6.3); g.fill();
      g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(x - rw * .25, y - rh * .3, rw * .5, rh * .35, 0, 0, 6.3); g.fill();
    }
    for (var j = 0; j < 160; j++) {
      g.strokeStyle = 'rgba(80,110,50,.8)'; g.lineWidth = 1.2;
      var rx = r() * W; g.beginPath(); g.moveTo(rx, 26); g.quadraticCurveTo(rx + (r() - .5) * 10, 34, rx + (r() - .5) * 6, 30 + r() * 26); g.stroke();
    }
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.wrapS = THREE.RepeatWrapping;
    return t;
  }

  (function buildFarm() {
    var R = 7, w = FARM, shape = new THREE.Shape();
    shape.moveTo(-w + R, -w); shape.lineTo(w - R, -w); shape.quadraticCurveTo(w, -w, w, -w + R);
    shape.lineTo(w, w - R); shape.quadraticCurveTo(w, w, w - R, w);
    shape.lineTo(-w + R, w); shape.quadraticCurveTo(-w, w, -w, w - R);
    shape.lineTo(-w, -w + R); shape.quadraticCurveTo(-w, -w, -w + R, -w);
    var geo = new THREE.ExtrudeGeometry(shape, { depth: 4, bevelEnabled: true, bevelThickness: 0.6, bevelSize: 0.6, bevelSegments: 4, curveSegments: 24 });
    var top = grassTexture();
    top.repeat.set(1 / (w * 2), 1 / (w * 2)); top.offset.set(0.5, 0.5);
    var side = soilTexture();
    side.repeat.set(0.06, 1 / 5.2); side.offset.set(0, 0.12);
    var mats = [
      new THREE.MeshStandardMaterial({ map: top, roughness: 0.95 }),
      new THREE.MeshStandardMaterial({ map: side, roughness: 1 })
    ];
    var farm = new THREE.Mesh(geo, mats);
    farm.rotation.x = -Math.PI / 2;
    farm.position.y = -4.6;
    scene.add(farm);
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
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  resize();
  buildHotbar();
  showTime();
  showMana();
  requestAnimationFrame(frame);
})();
