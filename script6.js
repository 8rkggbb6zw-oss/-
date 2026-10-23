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
// button goes down and false when it comes up) }
(function () {
  var BUTTONS = [
    { name: 'Interact', section: 'Gameplay', button: 0, ps: '✕', xbox: 'A', sw: 'B', key: ['everdawn-interact', 'KeyE'] },
    { name: 'Use Tool', section: 'Gameplay', button: 2, ps: '□', xbox: 'X', sw: 'Y', call: 'everdawnPadUseTool' }   // (tools only: the game's own Use Tool/Place Item key would place things too)
  ];
  var KINDS = { ps: 'PlayStation', xbox: 'Xbox', sw: 'Switch' };
  function kindOf(pad) {                                               // (which controller it is, from the name the browser gives it)
    var id = (pad && pad.id || '').toLowerCase();
    if (/054c|playstation|dualshock|dualsense|wireless controller/.test(id)) return 'ps';
    if (/057e|nintendo|pro controller|joy-con|switch/.test(id)) return 'sw';
    return 'xbox';
  }
  function keyFor(b) { var k = null; try { k = localStorage.getItem(b.key[0]); } catch (err) {} return k || b.key[1]; }
  function send(type, code) { window.dispatchEvent(new KeyboardEvent(type, { code: code, key: code, bubbles: true, cancelable: true })); }
  var padIndex = null, padKind = null, down = {};
  function releaseAll() { BUTTONS.forEach(function (b) { if (!down[b.name]) return; if (b.call) { if (window[b.call]) window[b.call](false); } else send('keyup', down[b.name]); }); down = {}; }
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
  function poll() {
    requestAnimationFrame(poll);
    if (padIndex === null || !navigator.getGamepads) return;
    var pad = navigator.getGamepads()[padIndex]; if (!pad) return;
    var paused = window.EVERDAWN_TITLE || (window.everdawnSettingsOpen && window.everdawnSettingsOpen()) || !document.hasFocus();   // (not on the title screen or in Settings)
    BUTTONS.forEach(function (b) {
      var btn = pad.buttons[b.button], on = !paused && !!btn && (btn.pressed || btn.value > 0.5);
      if (b.call) { if (on !== !!down[b.name]) { down[b.name] = on; if (window[b.call]) window[b.call](on); } return; }
      if (on && !down[b.name]) { down[b.name] = keyFor(b); send('keydown', down[b.name]); }
      else if (!on && down[b.name]) { send('keyup', down[b.name]); delete down[b.name]; }
    });
  }
  requestAnimationFrame(poll);
})();
