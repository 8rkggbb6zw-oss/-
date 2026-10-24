// ===== Everdawn: Controller =====
// Play with a PlayStation, Xbox or Nintendo Switch controller, plugged in or paired by Bluetooth. The game notices
// when one connects and which kind it is. Each button in BUTTONS stands in for a key: pressing it presses that key
// (the one you've chosen on the Mouse & Keyboard page, if you have), and letting go lets go of it, so holding a
// button works just like holding the key. The Controller page in Settings lists them, with each controller's own
// button, and lights up the one you're using.
//
// To add a button: { name, section, button (its number in the browser's standard layout: 0 is the bottom face button,
// 1 right, 2 left, 3 top, 4/5 the bumpers, 6/7 the triggers, 8 Select/Share/−, 9 Start/Options/+, 10/11 the stick
// clicks, 12-15 the D-pad up, down, left, right), ps, xbox, sw (what it's called on each controller), and key (the
// setting it follows, and its usual key), or instead of key, call (a function the game gives, told true when the
// button goes down and false when it comes up). Two can share a button: one with when (a function the game gives)
// does its job when that says yes, and the other does its job the rest of the time. A stick direction has axis
// (0 the left stick across, 1 up and down; 2 and 3 the right stick) and dir (-1 or 1) instead of button. unlisted: true
// leaves it off the Controller page. button can also be { ps, xbox, sw }, when it's a different button on each. A whole stick has stick: [its across axis, its up-and-down axis] and a call that's
// told how far to turn each frame. hold: (how long, in thousandths of a second) makes it one you have to hold down: it
// presses its key once it's been held that long, and a quick press does nothing }
(function () {
  var LSTICK = '<svg viewBox="0 0 26 26" width="24" height="24" role="img" aria-label="Left stick" style="display:block"><circle cx="13" cy="13" r="11.5" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".55"/>' +   // (a joystick seen from above, L on its cap)
    '<circle cx="13" cy="13" r="8" fill="currentColor" opacity=".2"/><circle cx="13" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10.6 8.6v8h5.2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var RSTICK = LSTICK.replace('Left stick', 'Right stick').replace('M10.6 8.6v8h5.2', 'M10.4 16.8V8.6h2.9a2.3 2.3 0 0 1 0 4.6h-2.9M13.2 13.2l2.6 3.6');   // (the same joystick, R on its cap)
  var RSTICK_UP = RSTICK.replace('viewBox="0 0 26 26" width="24" height="24"', 'viewBox="0 -9 26 35" width="24" height="32"').replace('</svg>', '<path d="M13 -9l6.5 7h-13z" fill="currentColor"/></svg>');   // (the right stick with an arrow: pushed forward)
  var RSTICK_DOWN = RSTICK.replace('viewBox="0 0 26 26" width="24" height="24"', 'viewBox="0 0 26 35" width="24" height="32"').replace('</svg>', '<path d="M13 35l6.5-7h-13z" fill="currentColor"/></svg>');   // (and pulled back)
  var DPAD_UP = '<svg viewBox="0 0 26 26" width="24" height="24" role="img" aria-label="D-pad up" style="display:block"><path d="M9.5 2.5h7v7h7v7h-7v7h-7v-7h-7v-7h7z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" opacity=".6"/><path d="M9.5 2.5h7v7.5h-7z" fill="currentColor"/></svg>';   // (a D-pad, its up arm filled in)
  var DPAD_RIGHT = DPAD_UP.replace('D-pad up', 'D-pad right').replace('M9.5 2.5h7v7.5h-7z', 'M16 9.5h7.5v7h-7.5z');   // (the same D-pad, its right arm filled in)
  var BUTTONS = [
    { name: 'Interact', section: 'Gameplay', button: 0, ps: '✕', xbox: 'A', sw: 'B', key: ['everdawn-interact', 'KeyE'] },
    { name: 'Use Tool', section: 'Gameplay', button: 2, ps: '□', xbox: 'X', sw: 'Y', call: 'everdawnPadUseTool' },   // (tools only: the game's own Use Tool/Place Item key would place things too)
    { name: 'Skip Cutscene (Hold)', section: 'Gameplay', button: 0, ps: '✕', xbox: 'A', sw: 'B', call: 'everdawnPadSkipHold', when: 'everdawnPadCutscene' },   // (the same button again: while a cutscene plays, holding it skips; a tap still moves dialogue along)
    { name: 'Advance Dialogue', section: 'Gameplay', button: 0, ps: '✕', xbox: 'A', sw: 'B', key: ['everdawn-advance-key', 'KeyE'], when: 'everdawnPadTalking' },   // (the same button as Interact: while someone's talking, it moves the conversation along)
    { name: 'Place Item', section: 'Gameplay', button: 0, ps: '✕', xbox: 'A', sw: 'B', call: 'everdawnPadPlace', when: 'everdawnPadCanPlace' },   // (the same button as Interact: it places when you're holding something placeable)
    { name: 'Cast Spell', section: 'Gameplay', button: 3, ps: '△', xbox: 'Y', sw: 'X', key: ['everdawn-spell-key', 'KeyQ'] },   // (the top face button: Dawn Bloom, or your own Spell Casting key)
    { name: 'Call Moonstone Mooring', section: 'Gameplay', button: 3, ps: '△', xbox: 'Y', sw: 'X', key: ['everdawn-mooring-key', 'KeyX'], when: 'everdawnPadUnderwater' },   // (the same button as Cast Spell: underwater, where there are no spells, it calls the Mooring)
    { name: 'Sprint', section: 'Gameplay', button: 10, ps: 'L3', xbox: 'LS', sw: 'LS', key: ['everdawn-sprint-key', 'ShiftLeft'] },   // (held: clicking the left stick in)
    { name: 'Strafe', section: 'Gameplay', button: 11, ps: 'R3', xbox: 'RS', sw: 'RS', key: ['everdawn-strafe-key', 'KeyC'] },   // (held: clicking the right stick in)
    { name: 'Walk', section: 'Gameplay', axis: 1, dir: -1, ps: LSTICK, xbox: LSTICK, sw: LSTICK, key: ['everdawn-move-up', 'KeyW'] },   // (the left stick: tilted far enough, it holds that way's key; one row on the Controller page for all four ways)
    { name: 'Move Down', unlisted: true, axis: 1, dir: 1, key: ['everdawn-move-down', 'KeyS'] },
    { name: 'Move Right', unlisted: true, axis: 0, dir: 1, key: ['everdawn-move-right', 'KeyD'] },
    { name: 'Move Left', unlisted: true, axis: 0, dir: -1, key: ['everdawn-move-left', 'KeyA'] },
    { name: 'Move Camera', section: 'Gameplay', stick: [2, 3], ps: RSTICK, xbox: RSTICK, sw: RSTICK, call: 'everdawnPadCam' },   // (the right stick turns the camera round and tips it up and down, faster the further it's pushed),
    { name: 'Switch Toolbar Row', section: 'Gameplay', button: 7, ps: 'L2 / R2', xbox: 'LT / RT', sw: 'ZL / ZR', call: 'everdawnPadRowNext' },   // (the triggers: the right one shows the next row of the toolbar, the left one the row before)
    { name: 'Previous Toolbar Row', unlisted: true, button: 6, call: 'everdawnPadRowPrev' },
    { name: 'Switch Toolbar Column', section: 'Gameplay', button: 5, ps: 'L1 / R1', xbox: 'LB / RB', sw: 'L / R', call: 'everdawnPadColNext' },   // (the bumpers, while playing: the right one picks the next slot along the toolbar, the left one the slot before)
    { name: 'Previous Toolbar Column', unlisted: true, button: 4, call: 'everdawnPadColPrev' },
    { name: 'World Map', section: 'Gameplay', button: 9, ps: 'OPTIONS', xbox: '☰', sw: '+', call: 'everdawnPadMap', menuToo: true, gameOnly: true },   // (Start: the map, and again to close it)
    { name: 'Open Pause Menu', section: 'Gameplay', button: 8, ps: 'CREATE', xbox: '⧉', sw: '−', key: ['everdawn-pause-key', 'KeyP'], menuToo: true, gameOnly: true },   // (Select: the pause menu, and again to close it)
    { name: 'Previous Tab', section: 'Gameplay', button: 4, ps: 'L1', xbox: 'LB', sw: 'L', menuOnly: true, call: 'everdawnPadTabPrev' },   // (the bumpers turn the pages of an open screen, or of Settings)
    { name: 'Next Tab', section: 'Gameplay', button: 5, ps: 'R1', xbox: 'RB', sw: 'R', menuOnly: true, call: 'everdawnPadTabNext' },
    { name: 'Sort List Shortcut', section: 'Gameplay', button: 4, ps: 'L1', xbox: 'LB', sw: 'L', key: ['everdawn-sort-key', 'Tab'], menuToo: true, when: 'everdawnPadSorting' },   // (the left bumper again: while a storage chest or the shipping bin is open, it sorts)
    { name: 'Cursor', section: 'Gameplay', ps: LSTICK, xbox: LSTICK, sw: LSTICK, note: true },   // (on a screen, the left stick moves the cursor: shown here, worked below)
    { name: 'Enter Decor Mode (Hold)', section: 'Decor Mode', button: 12, ps: DPAD_UP, xbox: DPAD_UP, sw: DPAD_UP, key: ['everdawn-decor-key', 'KeyG'], hold: 1000 },   // (hold up on the D-pad for a second, inside your house)
    { name: 'Exit Decor Mode (Hold)', section: 'Decor Mode', button: 12, ps: DPAD_UP, xbox: DPAD_UP, sw: DPAD_UP, key: ['everdawn-decor-exit-key', 'KeyG'], hold: 1000, when: 'everdawnPadDecor', menuToo: true },   // (and again to leave)
    { name: 'Pick Up', section: 'Decor Mode', ps: '✕', xbox: 'A', sw: 'B', note: true },   // (✕ / A / B is a click with the Decor Mode pointer: worked in decorNav below)
    { name: 'Put Down', section: 'Decor Mode', ps: '✕', xbox: 'A', sw: 'B', note: true },
    { name: 'Rotate', section: 'Decor Mode', button: 2, ps: '□', xbox: 'X', sw: 'Y', key: ['everdawn-decor-rotate-key', 'KeyR'], when: 'everdawnPadDecor', menuToo: true },   // (the Use Tool button: in Decor Mode it turns the piece you're holding)
    { name: 'Open Storage', section: 'Decor Mode', button: 15, ps: DPAD_RIGHT, xbox: DPAD_RIGHT, sw: DPAD_RIGHT, key: ['everdawn-decor-storage-key', 'Space'], when: 'everdawnPadDecor', menuToo: true },   // (right on the D-pad: your house storage, and again to close it)
    { name: 'Close Storage', section: 'Decor Mode', ps: DPAD_RIGHT, xbox: DPAD_RIGHT, sw: DPAD_RIGHT, note: true },
    { name: 'Select Item', section: 'Decor Mode', ps: '✕', xbox: 'A', sw: 'B', note: true },
    { name: 'Deselect Item', section: 'Decor Mode', ps: '✕', xbox: 'A', sw: 'B', note: true },
    { name: 'Cursor', section: 'World Map', ps: LSTICK, xbox: LSTICK, sw: LSTICK, note: true },   // (on the map: moves the cursor, and the map too at its edges; worked below)
    { name: 'Zoom In Map', section: 'World Map', ps: RSTICK_UP, xbox: RSTICK_UP, sw: RSTICK_UP, note: true },
    { name: 'Zoom Out Map', section: 'World Map', ps: RSTICK_DOWN, xbox: RSTICK_DOWN, sw: RSTICK_DOWN, note: true },
    { name: 'Center Map Focus', section: 'World Map', ps: 'R3', xbox: 'RS', sw: 'RS', note: true },
    { name: 'Previous Tab', section: 'Menu', ps: 'L1', xbox: 'LB', sw: 'L', note: true },   // (the same in Settings and on the title screen: shown again under Menu)
    { name: 'Next Tab', section: 'Menu', ps: 'R1', xbox: 'RB', sw: 'R', note: true },
    { name: 'Cursor', section: 'Menu', ps: LSTICK, xbox: LSTICK, sw: LSTICK, note: true }
  ];
  function settingsUp() { return !!(window.everdawnSettingsOpen && window.everdawnSettingsOpen()); }
  window.everdawnPadTabPrev = function (on) { if (!on) return; if (settingsUp()) window.everdawnSettingsPrevPage(); else if (window.everdawnPadTab) window.everdawnPadTab(-1); };
  window.everdawnPadTabNext = function (on) { if (!on) return; if (settingsUp()) window.everdawnSettingsNextPage(); else if (window.everdawnPadTab) window.everdawnPadTab(1); };
  window.everdawnPadRowNext = function (on) { if (on && window.everdawnPadRow) window.everdawnPadRow(1); };
  window.everdawnPadRowPrev = function (on) { if (on && window.everdawnPadRow) window.everdawnPadRow(-1); };
  window.everdawnPadColNext = function (on) { if (on && window.everdawnPadCol) window.everdawnPadCol(1); };
  window.everdawnPadColPrev = function (on) { if (on && window.everdawnPadCol) window.everdawnPadCol(-1); };
  window.everdawnPadDecor = function () { return document.body.classList.contains('ev-decor-on'); };   // (in Decor Mode?)
  window.everdawnPadTalking = function () { var d = document.querySelector('.ev-dlg'); return !!d && !d.hidden; };   // (is a conversation box open?)
  // ---- skipping a cutscene: hold ✕ / A / B ----
  // While a cutscene plays, the Skip button at the top right says "Hold to skip" with your controller's button on it, and
  // fills up as you hold; held for a second, it skips (with your Skip Events key). Let go sooner and it was a tap: if
  // anyone's talking, it moves them along
  var HOLD = 1000, holdStart = 0, skipLabelled = null;
  (function () { var st = document.createElement('style'); st.textContent =
    '.ev-skip.ev-skiphold{background:linear-gradient(90deg,rgba(255,158,203,.9) var(--ev-hold,0%),rgba(58,34,112,.85) var(--ev-hold,0%))}' +
    '.ev-skippad{display:inline-block;min-width:1.4em;margin-right:.35em;padding:0 .3em;border-radius:999px;background:#fff;color:#4e2b9c;text-align:center}';
    document.head.appendChild(st); })();
  window.everdawnPadCutscene = function () { var s = document.querySelector('.ev-skip'); return !!s && !s.hidden; };
  window.everdawnPadSkipHold = function (on) {
    if (on) { holdStart = performance.now(); return; }
    var tapped = holdStart; holdStart = 0; holdFill(0);
    if (tapped && window.everdawnPadTalking()) { var k = keyFor(byName('Advance Dialogue')); send('keydown', k); send('keyup', k); }
  };
  function byName(n) { return BUTTONS.filter(function (b) { return b.name === n; })[0]; }
  function holdFill(f) { var s = document.querySelector('.ev-skip'); if (s) s.style.setProperty('--ev-hold', Math.round(f * 100) + '%'); }
  function holdTick(now) {                                             // (each frame: fill the button, skip once it's full, and say "Hold to skip" while a controller's in)
    var s = document.querySelector('.ev-skip'); if (!s) return;
    var want = padKind && !s.hidden ? padKind : null;
    if (want !== skipLabelled) {
      skipLabelled = want; s.classList.toggle('ev-skiphold', !!want);
      if (want) s.innerHTML = '<b class="ev-skippad" translate="no">' + byName('Skip Cutscene (Hold)')[want] + '</b>Hold to skip';
      else if (window.everdawnSetSkipKey) { var k = null; try { k = localStorage.getItem('everdawn-skip-key'); } catch (err) {} window.everdawnSetSkipKey(k); }   // (back to the keyboard's own label)
    }
    if (!holdStart) return;
    var f = (now - holdStart) / HOLD; holdFill(Math.min(1, f));
    if (f >= 1) { holdStart = 0; holdFill(0); var c = keyFor({ key: ['everdawn-skip-key', 'KeyN'] }); send('keydown', c); send('keyup', c); }
  }
  var DEAD = 0.35;
  // ---- on a screen (the bag and its pages, the shops, the shipping bin, the pause menu): the left stick is a cursor ----
  // On most screens it hops from box to box (each slot, tile and button), one at a time, with a glowing frame round the
  // one it's on; ✕ / A / B presses it, ○ / B / A closes the screen. On the world map it's a free cursor instead, to
  // point at a pin, and pushed against the map's edge it moves the map along; the right stick forward and back zooms
  // in and out, and clicking it in centres the map on you
  (function () { var st = document.createElement('style'); st.textContent =
    '.ev-padfocus{outline:3px solid #ffd36e!important;outline-offset:2px!important;box-shadow:0 0 0 6px rgba(255,211,110,.35),0 0 16px rgba(255,190,90,.6)!important;position:relative;z-index:2;transition:outline-color .1s}' +
    '.ev-padcursor{position:fixed;left:0;top:0;z-index:99999;width:26px;height:26px;margin:-3px 0 0 -3px;pointer-events:none;filter:drop-shadow(0 2px 3px rgba(40,20,80,.6))}';
    document.head.appendChild(st); })();
  var cursor = document.createElement('div'); cursor.className = 'ev-padcursor'; cursor.hidden = true;
  cursor.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M3 2l15 9-6.5 1.6L15 20l-3 1.4-3.4-7.6L3 18z" fill="#fff" stroke="#7b4fd6" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  document.body.appendChild(cursor);
  var focusEl = null, lastC = null, navKey = '', navNext = 0, navDir = '', navReps = 0, cx = -1, cy = -1, prevB = {}, cursorOn = false, zoomDir = 0, zoomNext = 0;
  function seen(el) { if (!el || el.hidden) return false; var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function screensUp() {                                               // (Settings, the title screen and its save slots, or the game's own screens)
    if (settingsUp()) return [document.querySelector('.ev-sett .ev-scard') || document.querySelector('.ev-sett')];
    if (window.EVERDAWN_TITLE) { var sl = [].slice.call(document.querySelectorAll('#evTitle .ev-slots.open')).filter(seen); return sl.length ? sl : [].slice.call(document.querySelectorAll('#evTitle .ev-btns')).filter(seen); }
    return [].slice.call(document.querySelectorAll('.inventory, .ev-pause')).filter(seen);
  }
  function centre(el) { var r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
  function boxes(scr) {
    var out = []; scr.forEach(function (s) { [].slice.call(s.querySelectorAll('button, [role="button"], a[href], input, select, .shop-tile')).forEach(function (el) {
      if (el.disabled || !seen(el) || out.indexOf(el) >= 0) return; var cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.pointerEvents === 'none') return; out.push(el); }); });
    return out;
  }
  function setFocus(el) {
    if (focusEl && focusEl !== el) focusEl.classList.remove('ev-padfocus');
    focusEl = el; if (!el) return; el.classList.add('ev-padfocus'); lastC = centre(el);
    try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (err) {}
  }
  function nearestTo(list, c) { var best = null, bd = 1e9; list.forEach(function (el) { var p = centre(el), d = c ? Math.hypot(p[0] - c[0], p[1] - c[1]) : p[1] * 4 + p[0]; if (d < bd) { bd = d; best = el; } }); return best; }
  function hop(dx, dy, list) {                                         // (to the nearest box that way, keeping close to the same line)
    var f = centre(focusEl), best = null, bs = 1e9;
    list.forEach(function (el) { if (el === focusEl) return; var p = centre(el), ex = p[0] - f[0], ey = p[1] - f[1], along = ex * dx + ey * dy, side = Math.abs(ex * dy - ey * dx);
      if (along <= 4) return; var s = along + side * 2.5; if (s < bs) { bs = s; best = el; } });
    if (best) setFocus(best);
  }
  function clickAt(x, y) {
    var el = document.elementFromPoint(x, y); if (!el) return;
    if (el.closest('button, [role="button"], a[href]')) { el.closest('button, [role="button"], a[href]').click(); return; }
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, view: window }));
  }
  function pointAt(el, type, x, y) { el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', isPrimary: true, button: type === 'pointermove' ? -1 : 0, buttons: type === 'pointerdown' ? 1 : 0, view: window })); }
  function decorNav(pad, dt, press, back) {                            // (Decor Mode: the left stick is a mouse pointer over the room and its panel)
    if (focusEl) setFocus(null);
    if (back) { send('keydown', 'Escape'); send('keyup', 'Escape'); return true; }   // (○ / B / A: puts a piece back, or leaves Decor Mode)
    var room = (document.querySelector('.ev-decor') || document.body).parentNode.getBoundingClientRect(), sx = pad.axes[0] || 0, sy = pad.axes[1] || 0, mag = Math.hypot(sx, sy), moved = false;
    if (!cursorOn) { cx = room.left + room.width * 0.4; cy = room.top + room.height / 2; cursorOn = moved = true; }
    if (mag > 0.18) { var k = (mag - 0.18) / (1 - 0.18) / mag * 650 * dt; cx = Math.max(room.left, Math.min(room.right - 4, cx + sx * k)); cy = Math.max(room.top, Math.min(room.bottom - 4, cy + sy * k)); moved = true; }
    var el = document.elementFromPoint(cx, cy);
    if (moved && el) pointAt(el, 'pointermove', cx, cy);               // (a piece you're holding follows it)
    cursor.hidden = false; cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
    if (press && el) { if (el.tagName === 'CANVAS') { pointAt(el, 'pointerdown', cx, cy); pointAt(el, 'pointerup', cx, cy); } else clickAt(cx, cy); }   // (✕ / A / B: a click, on the room or the panel)
    return true;
  }
  function edge(pad, i) { var b = pad.buttons[i], on = !!b && (b.pressed || b.value > 0.5), was = prevB[i]; prevB[i] = on; return on && !was; }
  function menuNav(pad, dt) {                                          // (told each frame: true while a screen is up)
    var scr = screensUp(), press = edge(pad, 0), back = edge(pad, 1);
    if (!scr.length && window.everdawnPadDecor && window.everdawnPadDecor()) return decorNav(pad, dt, press, back);
    if (!scr.length) { if (focusEl) setFocus(null); cursor.hidden = true; cursorOn = false; return false; }
    var map = [].slice.call(document.querySelectorAll('.ev-mapbox')).filter(seen)[0];
    var sx = pad.axes[0] || 0, sy = pad.axes[1] || 0, mag = Math.hypot(sx, sy);
    if (back) { send('keydown', 'Escape'); send('keyup', 'Escape'); return true; }
    if (map) {                                                         // (the world map: a free cursor)
      if (focusEl) setFocus(null);
      var area = map.getBoundingClientRect();
      if (!cursorOn) { cx = area.left + area.width / 2; cy = area.top + area.height / 2; cursorOn = true; }
      if (mag > 0.18) {
        var k = (mag - 0.18) / (1 - 0.18) / mag * 650 * dt, nx = cx + sx * k, ny = cy + sy * k;
        cx = Math.max(area.left + 2, Math.min(area.right - 6, nx)); cy = Math.max(area.top + 2, Math.min(area.bottom - 6, ny));
        if (nx !== cx || ny !== cy) {                                  // (pushed against an edge: the map moves along under it, and stops following you, as it does for the mouse wheel)
          map.dispatchEvent(new WheelEvent('wheel', { bubbles: false })); map.scrollLeft += (nx - cx) * 1.6; map.scrollTop += (ny - cy) * 1.6;
        }
      }
      var ry = pad.axes[3] || 0, zd = ry < -0.5 ? 1 : ry > 0.5 ? -1 : 0, tnow = performance.now();   // (the right stick: forward zooms in, back zooms out, a step at a time)
      if (!zd) zoomDir = 0;
      else if (zd !== zoomDir || tnow >= zoomNext) { var zc = zd > 0 ? keyFor({ key: ['everdawn-map-zoom-in', 'Equal'] }) : keyFor({ key: ['everdawn-map-zoom-out', 'Minus'] }); send('keydown', zc); send('keyup', zc); zoomNext = tnow + (zd !== zoomDir ? 450 : 260); zoomDir = zd; }
      if (edge(pad, 11)) { var mc = keyFor({ key: ['everdawn-map-center', 'KeyM'] }); send('keydown', mc); send('keyup', mc); }   // (clicking the right stick in: back to you)
      cursor.hidden = false; cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      if (press) { cursor.hidden = true; clickAt(cx, cy); cursor.hidden = false; }
      return true;
    }
    cursor.hidden = true; cursorOn = false;
    var list = boxes(scr); if (!list.length) return true;
    var key = scr.map(function (s) { var h = s.querySelector('.inv-head b, h2'); return s.className + '|' + (h ? h.textContent : ''); }).join();
    if (key !== navKey) { navKey = key; lastC = null; if (focusEl) setFocus(null); }   // (a new screen or page: start on its first slot or tile)
    if (!focusEl || !document.contains(focusEl) || list.indexOf(focusEl) < 0) {
      var items = list.filter(function (el) { return el.matches('.slot, .shop-tile'); });
      setFocus(lastC ? nearestTo(list, lastC) : nearestTo(items.length ? items : list, null));   // (or, if it was redrawn, the box where it was)
    }
    if (focusEl && focusEl.matches('input[type="range"]') && Math.abs(sx) > 0.5 && Math.abs(sx) > Math.abs(sy)) {   // (on a slider, left and right slide it)
      if ((sx > 0 ? 'R' : 'L') !== navDir || performance.now() >= navNext) { var stp = +focusEl.step || 1; focusEl.value = Math.max(+focusEl.min, Math.min(+focusEl.max, +focusEl.value + (sx > 0 ? stp : -stp))); focusEl.dispatchEvent(new Event('input', { bubbles: true })); focusEl.dispatchEvent(new Event('change', { bubbles: true }));
        navNext = performance.now() + ((sx > 0 ? 'R' : 'L') !== navDir ? 380 : 140); navDir = sx > 0 ? 'R' : 'L'; }
      if (press) focusEl.click();
      return true;
    }
    var dir = mag < 0.5 ? '' : Math.abs(sx) > Math.abs(sy) ? (sx > 0 ? 'R' : 'L') : (sy > 0 ? 'D' : 'U'), now = performance.now();
    if (!dir) { navDir = ''; navReps = 0; }
    else if (dir !== navDir || now >= navNext) {
      hop(dir === 'R' ? 1 : dir === 'L' ? -1 : 0, dir === 'D' ? 1 : dir === 'U' ? -1 : 0, list);
      navNext = now + (dir !== navDir ? 380 : 140); navDir = dir;
    }
    if (press && focusEl) { var f = focusEl; f.click(); }
    return true;
  }                                                     // (how far a stick has to tilt before it counts: a little wobble does nothing)
  var KINDS = { ps: 'PlayStation', xbox: 'Xbox', sw: 'Switch' };
  function kindOf(pad) {                                               // (which controller it is, from the name the browser gives it)
    var id = (pad && pad.id || '').toLowerCase();
    if (/054c|playstation|dualshock|dualsense|wireless controller/.test(id)) return 'ps';
    if (/057e|nintendo|pro controller|joy-con|switch/.test(id)) return 'sw';
    return 'xbox';
  }
  function keyFor(b) { var k = null; try { k = localStorage.getItem(b.key[0]); } catch (err) {} return k || b.key[1]; }
  function send(type, code) { window.dispatchEvent(new KeyboardEvent(type, { code: code, key: code, bubbles: true, cancelable: true })); }
  var padIndex = null, padKind = null, down = {}, held = {}, holdAt = {};
  function releaseAll() { BUTTONS.forEach(function (b) { if (!down[b.name]) return; if (b.call) { if (window[b.call]) window[b.call](false); } else send('keyup', down[b.name]); }); down = {}; held = {}; }
  function changed() { if (window.everdawnControllerChanged) window.everdawnControllerChanged(padKind); }
  window.addEventListener('gamepadconnected', function (e) {
    if (padIndex !== null) return;                                    // (the first one plugged in is the one that plays)
    padIndex = e.gamepad.index; padKind = kindOf(e.gamepad);
    if (window.showToast) showToast('🎮 Controller connected: ' + KINDS[padKind], 2400);
    changed();
  });
  window.addEventListener('gamepaddisconnected', function (e) {
    if (e.gamepad.index !== padIndex) return;
    releaseAll(); if (window.showToast) showToast('🎮 Controller disconnected: ' + KINDS[padKind], 2400);
    padIndex = padKind = null; changed();
  });
  window.everdawnControllerKind = function () { return padKind; };
  window.everdawnControllerButtons = function () { return BUTTONS; };
  window.everdawnControllerKinds = KINDS;
  function idx(b) { return typeof b.button === 'object' ? b.button[padKind] : b.button; }   // (which button it is on the controller you're using)
  function poll() {
    requestAnimationFrame(poll);
    if (padIndex === null || !navigator.getGamepads) return;
    var pad = navigator.getGamepads()[padIndex]; if (!pad) return;
    var paused = !document.hasFocus() || (window.everdawnKeyGrabbing && window.everdawnKeyGrabbing()), inMenus = !!window.EVERDAWN_TITLE || settingsUp();   // (on the title screen and in Settings, only the menu buttons work)
    var now = performance.now(), dt = Math.min(0.05, (now - (poll.t || now)) / 1000); poll.t = now;
    holdTick(now);
    var screen = !paused && (menuNav(pad, dt) || inMenus);
    var seenB = {};
    BUTTONS.forEach(function (b0) {
      if (b0.note) return;
      if (b0.stick) {                                                  // (a whole stick: past a little wobble, it turns smoothly)
        if (paused || screen || !window[b0.call]) return;
        var sx = pad.axes[b0.stick[0]] || 0, sy = pad.axes[b0.stick[1]] || 0, mag = Math.hypot(sx, sy);
        if (mag < 0.18) return; var k2 = (mag - 0.18) / (1 - 0.18) / mag;
        window[b0.call](sx * k2 * 2.6 * dt, sy * k2 * 1.4 * dt);
        return;
      }
      if (b0.axis !== undefined) {                                     // (a stick direction)
        var tilt = !paused && !screen && (pad.axes[b0.axis] || 0) * b0.dir > DEAD;
        if (tilt && !down[b0.name]) { down[b0.name] = keyFor(b0); send('keydown', down[b0.name]); }
        else if (!tilt && down[b0.name]) { send('keyup', down[b0.name]); delete down[b0.name]; }
        return;
      }
      var i = idx(b0); if (seenB[i]) return; seenB[i] = true;
      var btn = pad.buttons[i], on = !paused && !!btn && (btn.pressed || btn.value > 0.5), was = held[i];
      if (on && !was) {                                                 // (pressed: of the jobs on this button, the one that fits right now)
        var all = BUTTONS.filter(function (x) { return x.button !== undefined && idx(x) === i && (screen ? x.menuOnly || x.menuToo : !x.menuOnly) && !(x.gameOnly && inMenus); });   // (on a screen only the menu buttons; off it, the rest)
        var b = all.filter(function (x) { return x.when && window[x.when] && window[x.when](); })[0] || all.filter(function (x) { return !x.when; })[0];
        if (!b) return; held[i] = b;
        if (b.hold) { holdAt[i] = now; return; }                      // (one you hold: nothing yet)
        if (b.call) { down[b.name] = true; if (window[b.call]) window[b.call](true); } else { down[b.name] = keyFor(b); send('keydown', down[b.name]); }
      } else if (on && was && was.hold) {                               // (still held: once it's been long enough, it presses that key)
        if (holdAt[i] && now - holdAt[i] >= was.hold) { holdAt[i] = 0; var hk = keyFor(was); send('keydown', hk); send('keyup', hk); }
      } else if (!on && was) {                                          // (let go: that same job lets go)
        held[i] = null;
        if (was.hold) { holdAt[i] = 0; return; }                       // (let go too soon: nothing happens)
        if (was.call) { if (window[was.call]) window[was.call](false); } else send('keyup', down[was.name]);
        delete down[was.name];
      }
    });
  }
  requestAnimationFrame(poll);
})();
