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

  var camera = new THREE.PerspectiveCamera(50, 3 / 2, 0.1, 2000);
  camera.position.set(0, 12, 18);
  camera.lookAt(0, 0, 0);

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
  var HOTBAR_SIZE = 4;
  var selected = 0;
  function buildHotbar() {
    hotbarEl.innerHTML = '';
    for (var i = 0; i < HOTBAR_SIZE; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot empty' + (i === selected ? ' selected' : '');
      b.setAttribute('aria-label', 'Slot ' + (i + 1) + ', empty');
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
    else if (/^Digit[1-4]$/.test(k)) selectSlot(+k.slice(5) - 1);
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
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  resize();
  buildHotbar();
  showTime();
  showMana();
  requestAnimationFrame(frame);
})();
