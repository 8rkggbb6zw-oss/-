// Everdawn's title screen, and starting it all up (see the note at the top of script.js). It comes after script.js,
// script2.js and script3.js, which hold the game itself

// ---------- The title screen ----------
// While the game loads, a painted dawn sky: deep violet melting into rose and peach toward the bottom, twinkling stars
// and the odd shooting star, ribbons of aurora, a crescent moon, wisps of pink cloud, blossom petals drifting down,
// sparkles rising and fireflies blinking. No land: once the game is built, the real you floats in front of it in 3D
// with your wand and three of your animals (that part is made inside the game, just before it starts). The name shines
// over it all, a vine grows along the bottom as the game loads (with little notes about what's being got ready), and
// when it's done a big glowing Play button pops up
var EVERDAWN_TITLE = true;
function everdawnKeyName(code) {                                       // (a key's name to show: "F", "5", "Space", "Left Shift"...)
  var N = { ShiftLeft: 'Left Shift', ShiftRight: 'Right Shift', ControlLeft: 'Left Ctrl', ControlRight: 'Right Ctrl', AltLeft: 'Left Alt', AltRight: 'Right Alt', MetaLeft: 'Left ⌘', MetaRight: 'Right ⌘',
    ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', CapsLock: 'Caps Lock', Backquote: '`', Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']', Backslash: '\\', Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/' };
  return N[code] || String(code).replace(/^Key|^Digit/, '').replace(/^Numpad/, 'Num ');
}
var everdawnTitle = (function () {
  // Master Volume, on the Audio page: 0 to 10, starting at 5 (everything as loud as it's always been). Every sound in
  // the game, and the title music, passes through one volume knob on its way to the speakers, so this scales them all:
  // 0 is silent and 10 is twice as loud. It's remembered
  var masterGains = [];
  function volumeNow() { try { var v = parseInt(localStorage.getItem('everdawn-master-volume'), 10); if (v >= 0 && v <= 10) return v; } catch (err) {} return 5; }
  function applyVolume(v) { masterGains.forEach(function (g) { g.gain.setTargetAtTime(v / 5, g.context.currentTime, 0.02); }); }
  // SFX Volume, on the Audio page: 0 to 10, starting at 5. It scales just the sound effects (everything the game plays
  // as you do things and touch things), on top of Master Volume; the music and the ambient sounds aren't touched.
  // It's remembered
  var sfxGains = [];
  function sfxNow() { try { var v = parseInt(localStorage.getItem('everdawn-sfx-volume'), 10); if (v >= 0 && v <= 10) return v; } catch (err) {} return 5; }
  function applySfx(v) { sfxGains.forEach(function (g) { g.gain.setTargetAtTime(v / 5, g.context.currentTime, 0.02); }); }
  // Ambient Volume, on the Audio page: 0 to 10, starting at 5. It scales the background sounds of the island and its
  // weather, on top of Master Volume. There aren't any yet; when there are, each one is marked as ambient before it's
  // sent to the speakers (node.evAmbient = true; node.connect(ctx.destination)) and it follows this. It's remembered
  var ambientGains = [];
  function ambientNow() { try { var v = parseInt(localStorage.getItem('everdawn-ambient-volume'), 10); if (v >= 0 && v <= 10) return v; } catch (err) {} return 5; }
  function applyAmbient(v) { ambientGains.forEach(function (g) { g.gain.setTargetAtTime(v / 5, g.context.currentTime, 0.02); }); }
  // Music Volume, on the Audio page: 0 to 10, starting at 5. It scales all the music and only the music (the title
  // tune now; any music added to the game later is marked as music before it's sent to the speakers, with
  // node.evMusic = true, and follows it too), on top of Master Volume. It's remembered
  var musicGains = [];
  function musicNow() { try { var v = parseInt(localStorage.getItem('everdawn-music-volume'), 10); if (v >= 0 && v <= 10) return v; } catch (err) {} return 5; }
  function applyMusic(v) { musicGains.forEach(function (g) { g.gain.setTargetAtTime(v / 5, g.context.currentTime, 0.02); }); }
  // Pet Sound, on the Audio page: 0 to 10, starting at 5. It scales the noises your farm pets make, on top of Master
  // Volume. They don't make any yet; when they do, each noise is marked as a pet sound before it's sent to the speakers
  // (node.evPet = true; node.connect(ctx.destination)) and it follows this. It's remembered
  var petGains = [];
  function petNow() { try { var v = parseInt(localStorage.getItem('everdawn-pet-sound'), 10); if (v >= 0 && v <= 10) return v; } catch (err) {} return 5; }
  function applyPet(v) { petGains.forEach(function (g) { g.gain.setTargetAtTime(v / 5, g.context.currentTime, 0.02); }); }
  if (window.AudioNode && window.AudioDestinationNode) (function () {   // (anything heading for the speakers goes through the knob instead)
    var plain = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (to) {
      if (to instanceof AudioDestinationNode && !this.evMaster) {
        var ctx = to.context;
        if (!ctx.evMaster) { ctx.evMaster = ctx.createGain(); ctx.evMaster.evMaster = true; ctx.evMaster.gain.value = volumeNow() / 5; plain.call(ctx.evMaster, to); masterGains.push(ctx.evMaster); }
        if (this.evPet) {                                              // (the farm pets' noises go through the Pet Sound knob first)
          if (!ctx.evPetG) { ctx.evPetG = ctx.createGain(); ctx.evPetG.gain.value = petNow() / 5; plain.call(ctx.evPetG, ctx.evMaster); petGains.push(ctx.evPetG); }
          return plain.apply(this, [ctx.evPetG].concat(Array.prototype.slice.call(arguments, 1)));
        }
        if (this.evAmbient) {                                          // (background and weather sounds go through the Ambient knob first)
          if (!ctx.evAmb) { ctx.evAmb = ctx.createGain(); ctx.evAmb.gain.value = ambientNow() / 5; plain.call(ctx.evAmb, ctx.evMaster); ambientGains.push(ctx.evAmb); }
          return plain.apply(this, [ctx.evAmb].concat(Array.prototype.slice.call(arguments, 1)));
        }
        if (ctx.evMusic || this.evMusic) {                             // (music goes through the Music knob first)
          if (!ctx.evMus) { ctx.evMus = ctx.createGain(); ctx.evMus.gain.value = musicNow() / 5; plain.call(ctx.evMus, ctx.evMaster); musicGains.push(ctx.evMus); }
          return plain.apply(this, [ctx.evMus].concat(Array.prototype.slice.call(arguments, 1)));
        }
        if (!ctx.evSfx) { ctx.evSfx = ctx.createGain(); ctx.evSfx.gain.value = sfxNow() / 5; plain.call(ctx.evSfx, ctx.evMaster); sfxGains.push(ctx.evSfx); }   // (sound effects go through the SFX knob first)
        return plain.apply(this, [ctx.evSfx].concat(Array.prototype.slice.call(arguments, 1)));
      }
      return plain.apply(this, arguments);
    };
  })();
  try { document.documentElement.classList.toggle('ev-calm', localStorage.getItem('everdawn-excessive-anim') === 'no'); } catch (err) {}   // ("Enable Excessive Animations": No keeps the title screen still)
  var css = document.createElement('style');
  css.textContent =
    '#evTitle{position:fixed;inset:0;z-index:1000;overflow:hidden;background:#241a4a;font-family:Fredoka,system-ui,sans-serif;color:#fff;transition:opacity 1s ease,transform 1.1s ease;user-select:none;-webkit-user-select:none}' +
    '#evTitle.gone{opacity:0;transform:scale(1.08);pointer-events:none}#evTitle.ingame{background:transparent;transition:none;transform:none}' +
    '#evTitle canvas{position:absolute;inset:0;width:100%;height:100%;display:block}' +
    '#evTitle .ev-ui{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:clamp(24px,7vh,70px) 16px clamp(22px,6vh,56px);box-sizing:border-box;pointer-events:none}' +
    '#evTitle .ev-name{position:relative;text-align:center;animation:evFloat 6s ease-in-out infinite}' +
    '#evTitle h1{margin:0;font-weight:600;font-size:clamp(48px,11vw,112px);letter-spacing:.02em;line-height:1;background:linear-gradient(180deg,#fff8e0 0%,#ffd88a 35%,#ff9ec8 70%,#c8a0ff 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 18px rgba(255,190,230,.55)) drop-shadow(0 4px 0 rgba(80,40,130,.55))}' +
    '#evTitle .ev-sub{margin-top:10px;font-size:clamp(15px,2.6vw,21px);font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:#ffe6f4;text-shadow:0 2px 10px rgba(60,20,110,.8)}' +
    '#evTitle .ev-star{position:absolute;color:#ffe9a8;text-shadow:0 0 12px #ffd27a;animation:evTwinkle 2.4s ease-in-out infinite}' +
    '#evTitle .ev-bottom{display:flex;flex-direction:column;align-items:center;gap:14px;width:min(520px,92vw);pointer-events:auto}' +
    '#evTitle .ev-load{width:100%;transition:opacity .5s,transform .5s}' +
    '#evTitle .ev-load.done{opacity:0;transform:translateY(10px)}' +
    '#evTitle .ev-track{position:relative;height:18px;border-radius:999px;background:rgba(30,16,60,.55);box-shadow:inset 0 2px 6px rgba(0,0,0,.45),0 0 0 2px rgba(255,220,250,.35);overflow:visible}' +
    '#evTitle .ev-fill{position:absolute;left:3px;top:3px;bottom:3px;width:0;border-radius:999px;background:linear-gradient(90deg,#5fbf72,#9be07c 50%,#d6f59a);box-shadow:0 0 12px rgba(160,240,140,.7);overflow:hidden}' +
    '#evTitle .ev-fill::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.65) 50%,transparent 70%);background-size:200% 100%;animation:evShine 1.6s linear infinite}' +
    '#evTitle .ev-bud{position:absolute;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;left:0;font-size:22px;line-height:26px;text-align:center;filter:drop-shadow(0 0 6px #ffb3e6);transition:left .25s linear}' +
    '#evTitle .ev-leaf{position:absolute;top:-7px;width:10px;height:7px;background:#7ed37a;border-radius:10px 0 10px 0;transform-origin:bottom left;opacity:0;transition:opacity .4s,transform .4s;transform:scale(.2) rotate(-20deg)}' +
    '#evTitle .ev-leaf.b{top:auto;bottom:-7px;border-radius:0 10px 0 10px;transform-origin:top left}' +
    '#evTitle .ev-leaf.on{opacity:1;transform:scale(1) rotate(-20deg)}' +
    '#evTitle .ev-status{margin-top:12px;display:flex;justify-content:space-between;gap:12px;font-size:clamp(13px,2.2vw,16px);color:#f6e6ff;text-shadow:0 1px 6px rgba(40,10,80,.9)}' +
    '#evTitle .ev-tip{transition:opacity .4s}' +
    '#evTitle .ev-play{position:relative;display:none;padding:.55em 1.2em;font:600 clamp(16px,3vw,21px) Fredoka,system-ui,sans-serif;letter-spacing:.04em;color:#fff;border:2px solid #ffe2a0;border-radius:999px;cursor:pointer;background:linear-gradient(180deg,#c48cff 0%,#8f5be8 55%,#7442d0 100%);box-shadow:0 6px 0 #4e2b9c,0 10px 30px rgba(120,60,220,.6),0 0 40px rgba(255,170,230,.55),inset 0 2px 0 rgba(255,255,255,.45);text-shadow:0 2px 0 rgba(60,20,120,.6);overflow:hidden;transform:scale(.2);opacity:0;transition:transform .25s}' +
    '#evTitle .ev-play.show{display:block;animation:evPop .7s cubic-bezier(.2,1.6,.4,1) forwards,evPulse 2.6s ease-in-out .8s infinite}' +
    '#evTitle .ev-play::before{content:"";position:absolute;top:0;bottom:0;width:40%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-20deg);animation:evSweep 3s ease-in-out 1s infinite}' +
    '#evTitle .ev-play:hover{filter:brightness(1.08)}#evTitle .ev-play:active{transform:translateY(4px) scale(.98)!important;box-shadow:0 2px 0 #4e2b9c,0 6px 20px rgba(120,60,220,.6)}' +
    '#evTitle .ev-play:focus-visible{outline:3px solid #fff;outline-offset:5px}' +
    '#evTitle .ev-hint{display:none;font-size:clamp(13px,2.2vw,15px);color:#f3e2ff;text-shadow:0 1px 6px rgba(40,10,80,.9);opacity:0;animation:evFade 1s ease .6s forwards}' +
    '#evTitle .ev-hint.show{display:block}' +
    '#evTitle .ev-slots{position:absolute;inset:0;z-index:4;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(20,10,45,.42);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}' +
    '#evTitle .ev-slots.open{display:flex;animation:evFade .3s ease forwards}' +
    '#evTitle .ev-scard{width:min(520px,100%);max-height:calc(100% - 8px);overflow:auto;box-sizing:border-box;padding:20px 18px 16px;border-radius:24px;border:2.5px solid #ffe2a0;background:linear-gradient(180deg,rgba(100,64,170,.94),rgba(58,34,112,.96));box-shadow:0 18px 50px rgba(10,0,30,.6),inset 0 2px 0 rgba(255,255,255,.25);color:#fff;font-family:Fredoka,system-ui,sans-serif}' +
    '#evTitle .ev-scard h2{margin:0 0 14px;text-align:center;font-size:clamp(22px,4.5vw,28px);font-weight:600;color:#ffe9b8;text-shadow:0 2px 8px rgba(255,170,230,.5)}' +
    '#evTitle .ev-slot{display:flex;align-items:stretch;gap:8px;margin:0 0 10px}' +
    '#evTitle .ev-sbtn{flex:1;display:flex;align-items:center;gap:12px;min-width:0;padding:10px 14px;text-align:left;font:inherit;color:#fff;border:2px solid rgba(255,220,250,.35);border-radius:16px;cursor:pointer;background:rgba(30,15,65,.55);transition:background .15s,border-color .15s,transform .1s}' +
    '#evTitle .ev-sbtn:hover{background:rgba(120,80,200,.55);border-color:#ffe2a0}#evTitle .ev-sbtn:active{transform:scale(.98)}#evTitle .ev-sbtn:focus-visible,#evTitle .ev-sdel:focus-visible,#evTitle .ev-back:focus-visible{outline:3px solid #fff;outline-offset:3px}' +
    '#evTitle .ev-snum{flex:none;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:600;color:#4e2b9c;background:linear-gradient(180deg,#fff2c8,#ffd27a);box-shadow:0 2px 0 #b8892e}' +
    '#evTitle .ev-sbtn.empty .ev-snum{color:#fff;background:rgba(255,255,255,.12);box-shadow:none;border:2px dashed rgba(255,220,250,.45)}' +
    '#evTitle .ev-stxt{min-width:0;display:flex;flex-direction:column;gap:2px}#evTitle .ev-stxt b{font-size:17px;font-weight:600}#evTitle .ev-stxt span{font-size:14px;color:#f0e2ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '#evTitle .ev-stxt i{font-style:normal;font-size:12px;color:#ffd6f0;opacity:.85}#evTitle .ev-last{margin-left:6px;padding:1px 8px;border-radius:999px;font-size:11px;font-weight:600;color:#4e2b9c;background:#ffd27a;vertical-align:2px}' +
    '#evTitle .ev-sdel{flex:none;width:46px;font-size:18px;color:#fff;border:2px solid rgba(255,220,250,.3);border-radius:14px;cursor:pointer;background:rgba(30,15,65,.55)}#evTitle .ev-sdel:hover{background:rgba(200,70,110,.6)}' +
    '#evTitle .ev-sask{flex:1;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 14px;border-radius:16px;border:2px solid #ff9ab8;background:rgba(120,30,70,.55);font-size:16px}' +
    '#evTitle .ev-sask button{padding:.3em .9em;font:600 15px Fredoka,system-ui,sans-serif;color:#fff;border:2px solid rgba(255,255,255,.6);border-radius:999px;cursor:pointer;background:rgba(255,255,255,.12);margin-left:6px}#evTitle .ev-sask .yes{background:#d8507c;border-color:#ffb0c8}' +
    '#evTitle .ev-back{display:block;margin:12px auto 0;padding:.4em 1.8em;font:600 17px Fredoka,system-ui,sans-serif;color:#fff;border:2px solid #ffe2a0;border-radius:999px;cursor:pointer;background:linear-gradient(180deg,rgba(150,110,220,.75),rgba(90,55,160,.8));box-shadow:0 3px 0 #3e2580}' +
    '#evTitle .ev-sname{flex:1;display:flex;flex-direction:column;gap:8px;padding:12px 14px;border-radius:16px;border:2px solid #ffe2a0;background:rgba(60,30,110,.7)}#evTitle .ev-sname label{font-size:17px;font-weight:600;color:#ffe9b8}' +
    '#evTitle .ev-sname input{box-sizing:border-box;width:100%;padding:.5em .8em;font:500 17px Fredoka,system-ui,sans-serif;color:#3a2270;border:2px solid #ffd27a;border-radius:12px;background:#fff8ee;outline:none}#evTitle .ev-sname input:focus{box-shadow:0 0 0 3px rgba(255,158,203,.6)}' +
    '#evTitle .ev-sname span{display:flex;gap:8px;justify-content:flex-end}#evTitle .ev-sname button{padding:.35em 1.2em;font:600 16px Fredoka,system-ui,sans-serif;color:#fff;border:2px solid rgba(255,255,255,.6);border-radius:999px;cursor:pointer;background:rgba(255,255,255,.12)}' +
    '#evTitle .ev-sname .go{background:linear-gradient(180deg,#ff9ecb,#d8609c);border-color:#ffe2a0}#evTitle .ev-sname .go:disabled{opacity:.45;cursor:default}#evTitle .ev-sname button:focus-visible{outline:3px solid #fff;outline-offset:3px}' +
    '#evTitle .ev-sethead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 6px}' +
    '#evTitle .ev-sethead h2{margin:0;flex:1}' +
    '#evTitle .ev-pg{flex:none;width:42px;height:42px;font:600 24px Fredoka,system-ui,sans-serif;line-height:1;color:#fff;border:2px solid #ffe2a0;border-radius:50%;cursor:pointer;background:linear-gradient(180deg,rgba(150,110,220,.75),rgba(90,55,160,.8));box-shadow:0 3px 0 #3e2580}' +
    '#evTitle .ev-pg:disabled{opacity:.3;cursor:default;box-shadow:none}#evTitle .ev-pg:focus-visible{outline:3px solid #fff;outline-offset:3px}' +
    '#evTitle .ev-dots{display:flex;justify-content:center;gap:7px;margin:0 0 12px}#evTitle .ev-dots i{width:8px;height:8px;border-radius:50%;background:rgba(255,220,250,.3)}#evTitle .ev-dots i.on{background:#ffd27a}' +
    '#evTitle .ev-setbody{min-height:clamp(160px,32vh,280px);border-radius:16px;border:2px solid rgba(255,220,250,.25);background:rgba(30,15,65,.45)}#evTitle .ev-bk .ev-sbtn{flex:none}#evTitle .ev-empty{margin:24px 0;text-align:center;font-size:16px;color:#f0e2ff;opacity:.75}html.ev-bright #game,html.ev-bright #evTitle canvas{filter:brightness(var(--ev-bright,1))}#evTitle .ev-dlg-sample{margin:4px 0 0;padding:10px 14px;border-radius:14px;background:rgba(255,248,238,.95);color:#3a2270;font-size:var(--ev-dialogue-size,17px);font-weight:var(--ev-dialogue-weight,400);line-height:1.4}#evTitle .ev-srow.ev-tog{flex-direction:row;align-items:center;justify-content:space-between;gap:12px}#evTitle .ev-tog .ev-lbl{flex:1;min-width:0}#evTitle .ev-tog .ev-seg{align-self:center;flex:none}@media (max-width:520px){#evTitle .ev-tog .ev-lbl{font-size:16px}#evTitle .ev-tog .ev-seg button{padding:.35em .8em;font-size:14px}}#evTitle .ev-sbak{font-size:20px}#evTitle .ev-sett .ev-scard{display:flex;flex-direction:column;overflow:hidden}#evTitle .ev-sett .ev-scard>*{flex:none}#evTitle .ev-sett .ev-scard>.ev-setbody{flex:0 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain}' +
    '#evTitle .ev-setbody{box-sizing:border-box;padding:14px 16px}' +
    '#evTitle .ev-ksec{display:flex;align-items:center;gap:10px;margin:2px 0 4px;font-size:13px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#ffc6e6}#evTitle .ev-ksec::after{content:"";flex:1;height:1px;background:rgba(255,198,230,.35)}#evTitle .ev-ksec+.ev-srow{padding-top:6px}#evTitle .ev-srow+.ev-ksec,#evTitle .ev-ksec+.ev-ksec{margin-top:14px}#evTitle .ev-srow{display:flex;flex-direction:column;gap:8px;padding:6px 2px 12px;border-bottom:1px solid rgba(255,220,250,.18)}' +
    '#evTitle .ev-lrow{display:flex;align-items:baseline;justify-content:space-between;gap:10px}#evTitle .ev-lrow output{font-size:17px;font-weight:600;color:#ffd6f0;min-width:3.2em;text-align:right}' +
    '#evTitle .ev-srow label,#evTitle .ev-srow .ev-lbl{font-size:18px;font-weight:600;color:#ffe9b8}#evTitle .ev-srow+.ev-srow{padding-top:12px}' +
    '#evTitle .ev-seg{display:inline-flex;align-self:flex-start;border:2px solid #ffe2a0;border-radius:999px;overflow:hidden;background:rgba(30,15,60,.6)}' +
    '#evTitle .ev-seg button{padding:.35em 1.5em;font:600 16px Fredoka,system-ui,sans-serif;color:#f0e2ff;border:0;background:transparent;cursor:pointer}#evTitle .ev-seg button+button{border-left:2px solid rgba(255,226,160,.5)}' +
    '#evTitle .ev-seg button.on{color:#fff;background:linear-gradient(180deg,#ff9ecb,#d8609c)}#evTitle .ev-seg button:focus-visible{outline:3px solid #fff;outline-offset:-3px}' +
    '#evTitle .ev-range{display:flex;align-items:center;gap:10px;font-size:14px;color:#f0e2ff}' +
    '#evTitle .ev-range input{flex:1;min-width:0;height:28px;accent-color:#ff9ecb;cursor:pointer}#evTitle .ev-range input:focus-visible{outline:2px solid #fff;outline-offset:3px;border-radius:6px}' +
    '#evTitle .ev-btns{display:flex;align-items:center;justify-content:center;gap:clamp(10px,2.5vw,18px);flex-wrap:nowrap;width:max-content;max-width:96vw}' +
    '#evTitle .ev-opt{display:none;padding:.55em 1.2em;font:600 clamp(16px,3vw,21px) Fredoka,system-ui,sans-serif;letter-spacing:.04em;color:#fff;border:2px solid rgba(255,226,160,.85);border-radius:999px;cursor:pointer;background:linear-gradient(180deg,rgba(150,110,220,.75),rgba(90,55,160,.8));box-shadow:0 4px 0 #3e2580,0 8px 20px rgba(60,20,120,.45),inset 0 2px 0 rgba(255,255,255,.35);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:0;animation:evFade .6s ease .3s forwards}' +
    '#evTitle .ev-opt.show{display:inline-block}#evTitle .ev-opt:hover{filter:brightness(1.1)}#evTitle .ev-opt:active{transform:translateY(3px);box-shadow:0 1px 0 #3e2580,0 4px 12px rgba(60,20,120,.45)}#evTitle .ev-opt:focus-visible{outline:3px solid #fff;outline-offset:4px}' +
    '#evTitle .ev-music{position:absolute;top:max(12px,env(safe-area-inset-top));right:12px;z-index:3;padding:.45em .9em;font:500 14px Fredoka,system-ui,sans-serif;color:#fff;background:rgba(40,20,80,.45);border:1.5px solid rgba(255,220,250,.55);border-radius:999px;cursor:pointer;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}' +
    '#evTitle .ev-music:hover{background:rgba(70,40,120,.6)}#evTitle .ev-music:focus-visible{outline:2px solid #fff;outline-offset:3px}' +
    '@keyframes evFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}' +
    '@keyframes evTwinkle{0%,100%{opacity:.35;transform:scale(.7) rotate(0)}50%{opacity:1;transform:scale(1.15) rotate(20deg)}}' +
    '@keyframes evShine{from{background-position:200% 0}to{background-position:-200% 0}}' +
    '@keyframes evPop{to{transform:scale(1);opacity:1}}' +
    '@keyframes evPulse{0%,100%{box-shadow:0 6px 0 #4e2b9c,0 10px 30px rgba(120,60,220,.6),0 0 30px rgba(255,170,230,.45),inset 0 2px 0 rgba(255,255,255,.45)}50%{box-shadow:0 6px 0 #4e2b9c,0 10px 34px rgba(120,60,220,.7),0 0 60px rgba(255,190,240,.85),inset 0 2px 0 rgba(255,255,255,.45)}}' +
    '@keyframes evSweep{0%,60%{left:-60%}100%{left:130%}}' +
    '@keyframes evFade{to{opacity:1}}' +
    '@media (prefers-reduced-motion:reduce){#evTitle *{animation-duration:0s!important;animation-iteration-count:1!important}}' +
    'html.ev-calm #evTitle *,html.ev-calm #evTitle *::before,html.ev-calm #evTitle *::after,html.ev-calm .spark,html.ev-calm .coins{animation-duration:0s!important;animation-iteration-count:1!important}';   // ("Enable Excessive Animations" set to No: all of it keeps still)
  document.head.appendChild(css);
  var root = document.createElement('div'); root.id = 'evTitle';
  root.innerHTML = '<canvas></canvas><div class="ev-ui"><div class="ev-name"><span class="ev-star" style="left:-.9em;top:.1em;font-size:34px">✦</span><span class="ev-star" style="right:-.7em;top:-.3em;font-size:24px;animation-delay:.8s">✧</span><span class="ev-star" style="right:-1.2em;bottom:.4em;font-size:16px;animation-delay:1.5s">✦</span><h1>Everdawn</h1><div class="ev-sub">a cozy, magical farm</div></div>' +
    '<div class="ev-bottom"><div class="ev-load"><div class="ev-track"><div class="ev-fill"></div><div class="ev-bud">🌸</div></div><div class="ev-status"><span class="ev-tip">Opening the gate…</span><span class="ev-pct">0%</span></div></div>' +
    '<div class="ev-btns"><button type="button" class="ev-play">✦ Play ✦</button><button type="button" class="ev-opt"><span aria-hidden="true">⚙</span> Settings</button></div><div class="ev-hint">Press Enter or tap Play</div></div></div>';
  (document.body || document.documentElement).appendChild(root);
  var prevOverflow = document.body ? document.body.style.overflow : ''; if (document.body) document.body.style.overflow = 'hidden';
  var cv = root.querySelector('canvas'), g = cv.getContext('2d'), track = root.querySelector('.ev-track'), fill = root.querySelector('.ev-fill'), bud = root.querySelector('.ev-bud');
  var tipEl = root.querySelector('.ev-tip'), pctEl = root.querySelector('.ev-pct'), playBtn = root.querySelector('.ev-play'), optBtn = root.querySelector('.ev-opt'), hint = root.querySelector('.ev-hint'), load = root.querySelector('.ev-load');
  for (var lf = 0; lf < 9; lf++) { var leaf = document.createElement('i'); leaf.className = 'ev-leaf' + (lf % 2 ? ' b' : ''); leaf.style.left = (8 + lf * 10.5) + '%'; track.appendChild(leaf); }
  var leaves = track.querySelectorAll('.ev-leaf');

  // ----- the painted scene -----
  var W = 0, H = 0, DPR = 1, t0 = performance.now(), last = t0;
  function rnd(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  var moonSpr = null, stars = [], clouds = [], motes = [], flies = [], petals = [], shoot = null;
  var planetSpr = null;
  for (var i = 0; i < 260; i++) stars.push({ x: rnd(i), y: Math.pow(rnd(i + 500), 1.6) * 0.62, r: 0.4 + rnd(i + 900) * 1.4, p: rnd(i + 1300) * 6.28, s: 0.6 + rnd(i + 1700) * 2.2, big: rnd(i + 2100) > 0.96 });
  for (i = 0; i < 9; i++) clouds.push({ x: rnd(i + 40), y: [0.3, 0.42, 0.9][i % 3] + rnd(i + 60) * 0.1, w: 0.14 + rnd(i + 80) * 0.16, sp: 0.004 + rnd(i + 99) * 0.008, layer: i % 3 });
  for (i = 0; i < 70; i++) motes.push({ x: rnd(i + 3000), y: rnd(i + 3100), r: 0.6 + rnd(i + 3200) * 1.8, sp: 0.01 + rnd(i + 3300) * 0.03, p: rnd(i + 3400) * 6.28, hue: [320, 280, 45, 190][i % 4] });
  for (i = 0; i < 26; i++) flies.push({ x: rnd(i + 4000), y: 0.6 + rnd(i + 4100) * 0.38, p: rnd(i + 4200) * 6.28, sp: 0.3 + rnd(i + 4300) * 0.6 });
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1); W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); g.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize(); window.addEventListener('resize', resize);
  var glowCache = {};
  function glow(x, y, r, col, a) {                                   // (a soft round glow, from a little picture made once for each colour)
    if (a <= 0.003 || r <= 0) return;
    var key = col, spr = glowCache[key];
    if (!spr) { spr = glowCache[key] = document.createElement('canvas'); spr.width = spr.height = 64; var sg = spr.getContext('2d'), gr = sg.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, col.replace('A', 1)); gr.addColorStop(0.4, col.replace('A', 0.45)); gr.addColorStop(1, col.replace('A', 0)); sg.fillStyle = gr; sg.fillRect(0, 0, 64, 64); }
    g.globalAlpha = Math.min(1, a); g.drawImage(spr, x - r, y - r, r * 2, r * 2); g.globalAlpha = 1;
  }
  function cloud(x, y, w, col) {
    g.fillStyle = col; g.beginPath();
    for (var k = 0; k < 7; k++) { var cx = x + (k / 6 - 0.5) * w, cy = y - Math.sin(k / 6 * Math.PI) * w * 0.16, r = w * (0.12 + Math.sin(k / 6 * Math.PI) * 0.1); g.moveTo(cx + r, cy); g.arc(cx, cy, r, 0, 6.2832); }
    g.rect(x - w / 2, y - w * 0.04, w, w * 0.1); g.fill();
  }
  var TAU = 6.2832;
  function spark4(x, y, r, col) {                                    // (a little four-pointed twinkle)
    g.fillStyle = col; g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r); g.fill();
  }
  var isles = {};
  function makeIsle(kind) {                                          // (a little floating island, painted once at double size: 320 wide, its grassy top at y 200, with room above for the tower's weather vane)
    var c = document.createElement('canvas'); c.width = 960; c.height = 1170; var q = c.getContext('2d'); q.scale(3, 3); q.translate(0, 30);
    var k, j, N = 22, pts = [], sd = kind === 'tower' ? 10 : 90, tower = kind === 'tower', TX = 170;
    function R(n) { return rnd(n * 1.37 + sd); }
    function rr(x, y, w, h, r) { q.beginPath(); q.moveTo(x + r, y); q.arcTo(x + w, y, x + w, y + h, r); q.arcTo(x + w, y + h, x, y + h, r); q.arcTo(x, y + h, x, y, r); q.arcTo(x, y, x + w, y, r); q.closePath(); }
    function E(x, y, rx, ry, col, rot) { q.fillStyle = col; q.beginPath(); q.ellipse(x, y, rx, ry, rot || 0, 0, TAU); q.fill(); }
    function leaf(x, y, s, a, col) { q.save(); q.translate(x, y); q.rotate(a); q.fillStyle = col; q.beginPath(); q.moveTo(0, 0); q.quadraticCurveTo(s * 0.6, -s * 0.5, s * 1.2, 0); q.quadraticCurveTo(s * 0.6, s * 0.5, 0, 0); q.fill(); q.restore(); }
    // ----- the rock underneath -----
    for (k = 0; k <= N; k++) { var f = k / N; pts.push([28 + 264 * f + (k && k < N ? (R(k) - 0.5) * 10 : 0), 204 + Math.pow(Math.sin(Math.PI * f), 0.8) * (118 + R(k + 30) * 42) * (k % 2 ? 0.8 : 1)]); }
    function rock() { q.beginPath(); q.moveTo(28, 200); pts.forEach(function (p) { q.lineTo(p[0], p[1]); }); q.lineTo(292, 200); q.closePath(); }
    var rg = q.createLinearGradient(0, 195, 0, 350); rg.addColorStop(0, '#8a68ab'); rg.addColorStop(0.3, '#4c3676'); rg.addColorStop(1, '#1a1034');
    rock(); q.fillStyle = rg; q.fill();
    q.save(); rock(); q.clip();
    if (tower) for (k = 0; k < 16; k++) {                             // (the rock built of great rounded boulders, each lit from the upper left)
      var lbx = 40 + k * 15.5 + (R(k + 3500) - 0.5) * 8, lbf = (lbx - 28) / 264, lbd = Math.pow(Math.sin(Math.PI * Math.max(0.02, Math.min(0.98, lbf))), 0.8) * 120, lby = 210 + lbd * (0.25 + R(k + 3510) * 0.45), lbr = 14 + R(k + 3520) * 12;
      var lbg = q.createRadialGradient(lbx - lbr * 0.4, lby - lbr * 0.45, lbr * 0.1, lbx, lby, lbr); lbg.addColorStop(0, 'rgba(150,118,190,.75)'); lbg.addColorStop(0.5, 'rgba(84,60,124,.6)'); lbg.addColorStop(1, 'rgba(26,16,52,.75)');
      q.fillStyle = lbg; q.beginPath(); q.ellipse(lbx, lby, lbr, lbr * 0.8, (R(k + 3530) - 0.5) * 0.6, 0, TAU); q.fill();
      q.strokeStyle = 'rgba(255,220,250,.16)'; q.lineWidth = 0.8; q.beginPath(); q.ellipse(lbx, lby, lbr * 0.96, lbr * 0.77, (R(k + 3530) - 0.5) * 0.6, Math.PI * 1.05, Math.PI * 1.5); q.stroke();
    }
    for (k = 0; k < N; k++) { var p1 = pts[k], p2 = pts[k + 1], fx = (p1[0] + p2[0]) / 2 + (R(k + 70) - 0.5) * 24, fy = 204 + (Math.max(p1[1], p2[1]) - 204) * (0.3 + R(k + 80) * 0.3);   // (chiseled facets, lit from the left)
      q.fillStyle = k < N * 0.45 ? 'rgba(255,200,240,' + (0.05 + R(k + 60) * 0.1) + ')' : 'rgba(20,8,45,' + (0.1 + R(k + 60) * 0.18) + ')'; q.beginPath(); q.moveTo(p1[0], p1[1]); q.lineTo(p2[0], p2[1]); q.lineTo(fx, fy); q.closePath(); q.fill(); }
    for (k = 0; k < 6; k++) { q.strokeStyle = 'rgba(20,10,40,.35)'; q.lineWidth = 2; q.beginPath(); q.moveTo(20, 222 + k * 20); q.bezierCurveTo(110, 214 + k * 22 + R(k) * 12, 210, 230 + k * 18, 300, 218 + k * 21); q.stroke(); q.strokeStyle = 'rgba(255,220,250,.08)'; q.lineWidth = 1; q.beginPath(); q.moveTo(20, 224 + k * 20); q.bezierCurveTo(110, 216 + k * 22 + R(k) * 12, 210, 232 + k * 18, 300, 220 + k * 21); q.stroke(); }   // (layers of rock)
    for (k = 0; k < 16; k++) { var cx = 38 + k * 16 + R(k + 100) * 8, yy = 206; q.strokeStyle = 'rgba(12,6,30,.28)'; q.lineWidth = 0.5 + R(k + 110) * 0.6; q.beginPath(); q.moveTo(cx, yy); while (yy < 345) { yy += 6 + R(yy + k * 7) * 12; cx += (R(yy * 3 + k) - 0.5) * 7; q.lineTo(cx, yy); } q.stroke(); }   // (cracks)
    for (k = 0; k < 40; k++) { var bx = 34 + R(k + 140) * 252, by = 210 + R(k + 150) * 100, br = 1.5 + R(k + 160) * 3.5; E(bx, by + 0.6, br, br * 0.6, 'rgba(15,6,35,.35)'); E(bx - 0.4, by - 0.4, br * 0.8, br * 0.45, 'rgba(255,225,250,.12)'); }   // (knobbly stones in it)
    for (k = 0; k < 24; k++) { var mx = 34 + R(k + 200) * 252, my = 206 + R(k + 210) * 44 * (1 - Math.abs(mx - 160) / 170); E(mx, my, 3 + R(k + 230) * 6, 1.2 + R(k + 240) * 1.6, 'rgba(84,165,118,' + (0.2 + R(k + 220) * 0.25) + ')'); E(mx - 0.6, my - 0.5, 2 + R(k + 230) * 3, 0.6, 'rgba(170,240,190,.22)'); }   // (moss on the ledges)
    var lg = q.createLinearGradient(30, 0, 290, 0); lg.addColorStop(0, 'rgba(255,190,230,.32)'); lg.addColorStop(0.3, 'rgba(255,190,230,0)'); lg.addColorStop(0.75, 'rgba(120,200,255,0)'); lg.addColorStop(1, 'rgba(140,210,255,.22)'); q.fillStyle = lg; q.fillRect(0, 190, 320, 170);
    if (tower) {
      var cvg = q.createRadialGradient(112, 246, 1, 112, 244, 20); cvg.addColorStop(0, '#05030e'); cvg.addColorStop(1, '#2a1a48');   // (a little cave, with glowing mushrooms in it)
      q.fillStyle = cvg; q.beginPath(); q.moveTo(94, 252); q.quadraticCurveTo(96, 232, 112, 231); q.quadraticCurveTo(128, 232, 130, 252); q.quadraticCurveTo(112, 256, 94, 252); q.fill();
      q.strokeStyle = 'rgba(255,220,250,.25)'; q.lineWidth = 1; q.beginPath(); q.moveTo(94, 252); q.quadraticCurveTo(96, 232, 112, 231); q.stroke();
      [[100, 251, 3.4], [106, 252, 2.2], [119, 251, 2.8], [125, 252, 2], [112, 252.5, 1.6]].forEach(function (m) { var mg2 = q.createRadialGradient(m[0], m[1] - 2, 0, m[0], m[1] - 2, m[2] * 4); mg2.addColorStop(0, 'rgba(120,255,230,.55)'); mg2.addColorStop(1, 'rgba(120,255,230,0)'); q.fillStyle = mg2; q.fillRect(m[0] - m[2] * 4, m[1] - 2 - m[2] * 4, m[2] * 8, m[2] * 8); q.fillStyle = '#d8fff4'; q.fillRect(m[0] - 0.5, m[1] - m[2], 1, m[2]); q.fillStyle = '#7af0e0'; q.beginPath(); q.arc(m[0], m[1] - m[2], m[2] * 0.75, Math.PI, 0); q.fill(); });
      q.save(); q.shadowColor = '#8ee8ff'; q.shadowBlur = 4; q.strokeStyle = 'rgba(175,240,255,.55)'; q.lineWidth = 0.6;   // (old runes carved in the rock, still glowing)
      [[160, 254], [190, 238], [142, 276], [118, 280], [172, 296]].forEach(function (p, i) { q.save(); q.translate(p[0], p[1]); q.scale(0.62, 0.62); q.translate(-p[0], -p[1]); q.beginPath(); q.arc(p[0], p[1], 4.5, 0, TAU); if (i % 3 === 0) { q.moveTo(p[0], p[1] - 4.5); q.lineTo(p[0], p[1] + 4.5); q.moveTo(p[0] - 3, p[1] - 1); q.lineTo(p[0] + 3, p[1] - 1); } else if (i % 3 === 1) { q.moveTo(p[0], p[1] - 3); q.lineTo(p[0] + 2.6, p[1] + 2); q.lineTo(p[0] - 2.6, p[1] + 2); q.closePath(); } else { q.moveTo(p[0] - 2.5, p[1] + 2.5); q.lineTo(p[0], p[1] - 2.5); q.lineTo(p[0] + 2.5, p[1] + 2.5); q.moveTo(p[0] + 0.6, p[1] + 1); q.arc(p[0], p[1] + 1, 0.6, 0, TAU); } q.stroke(); q.restore(); });
      q.restore();
      q.save(); q.shadowColor = '#7ae0ff'; q.shadowBlur = 3; q.strokeStyle = 'rgba(150,230,255,.4)'; q.lineWidth = 0.6;   // (veins of light running through the rock)
      for (k = 0; k < 7; k++) { var vx0 = 50 + k * 34 + R(k + 1300) * 10, vy0 = 214 + R(k + 1310) * 20; q.beginPath(); q.moveTo(vx0, vy0); for (j = 0; j < 6; j++) { vx0 += (R(k * 9 + j + 1320) - 0.5) * 14; vy0 += 6 + R(k * 9 + j + 1330) * 10; q.lineTo(vx0, vy0); } q.stroke(); }
      q.restore();
      var wet = q.createLinearGradient(214, 0, 248, 0); wet.addColorStop(0, 'rgba(10,20,45,0)'); wet.addColorStop(0.5, 'rgba(10,20,45,.55)'); wet.addColorStop(1, 'rgba(10,20,45,0)'); q.fillStyle = wet; q.fillRect(212, 212, 38, 130);   // (rock dark and wet behind the waterfall)
      q.strokeStyle = 'rgba(160,230,255,.18)'; q.lineWidth = 0.5; for (k = 0; k < 6; k++) { q.beginPath(); q.moveTo(220 + k * 4, 216); q.lineTo(221 + k * 4.2, 300); q.stroke(); }
      var ao = q.createLinearGradient(0, 204, 0, 226); ao.addColorStop(0, 'rgba(10,5,25,.6)'); ao.addColorStop(1, 'rgba(10,5,25,0)'); q.fillStyle = ao; q.fillRect(20, 204, 280, 22);   // (deep shade under the turf)
    }
    q.restore();
    rock(); q.strokeStyle = 'rgba(12,6,28,.55)'; q.lineWidth = 1; q.stroke();
    for (k = 0; k < 10; k++) { var ox = 46 + k * 25 + R(k + 300) * 10; q.strokeStyle = 'rgba(92,62,48,.8)'; q.lineWidth = 1.2; q.beginPath(); q.moveTo(ox, 204); q.bezierCurveTo(ox - 4, 214, ox + 5, 220, ox + 1, 226 + R(k + 310) * 16); q.stroke(); }   // (roots poking out)
    for (k = 0; k < 15; k++) {                                        // (vines hanging down, with leaves)
      var vx = 44 + k * 16.5 + R(k + 70) * 8, vl = 30 + R(k + 9) * 55, vb = R(k + 5) * 10 - 5;
      if (tower && vx > 208 && vx < 252) continue;                    // (not where the waterfall goes over)
      q.strokeStyle = 'rgba(70,140,100,.85)'; q.lineWidth = 1.1; q.beginPath(); q.moveTo(vx, 205); q.quadraticCurveTo(vx + vb, 205 + vl * 0.5, vx + vb * 0.4, 205 + vl); q.stroke();
      for (j = 1; j < 7; j++) { var tt = j / 7, lx2 = vx + vb * 2 * tt * (1 - tt) + vb * 0.4 * tt * tt, ly2 = 205 + vl * tt; leaf(lx2, ly2, 3 + R(k * 7 + j) * 1.6, (j % 2 ? 0.6 : 2.5) + R(j + k) * 0.4, ['#4fa070', '#6cc08a', '#3b8058'][(j + k) % 3]); }
      if (k % 4 === 1) E(vx + vb * 0.4, 205 + vl + 2, 1.8, 1.8, '#ffd0ea');
    }
    if (tower) {
      for (k = 0; k < 7; k++) { var sx4 = 76 + k * 3, sy4 = 212 + k * 6; q.fillStyle = 'rgba(15,6,35,.5)'; q.fillRect(sx4 - 5, sy4 + 1.4, 11, 1.8); q.fillStyle = '#b4a8cc'; q.fillRect(sx4 - 5, sy4, 11, 1.9); q.fillStyle = 'rgba(255,255,255,.3)'; q.fillRect(sx4 - 5, sy4, 11, 0.5); }   // (steps cut down the rock to the cave)
      q.strokeStyle = '#8a6a4a'; q.lineWidth = 0.7; for (k = 0; k < 7; k += 2) { q.beginPath(); q.moveTo(71 + k * 3, 212 + k * 6); q.lineTo(71 + k * 3, 206 + k * 6); q.stroke(); }
      q.strokeStyle = 'rgba(220,190,140,.85)'; q.lineWidth = 0.4; q.beginPath(); q.moveTo(71, 206); for (k = 2; k < 7; k += 2) q.quadraticCurveTo(71 + k * 3 - 3, 206 + k * 6 - 3, 71 + k * 3, 206 + k * 6); q.stroke();   // (a rope rail)
      q.strokeStyle = '#2e2438'; q.lineWidth = 0.7; q.beginPath(); q.moveTo(131, 238); q.lineTo(135, 238); q.lineTo(135, 240); q.stroke(); q.fillStyle = '#2e2438'; q.fillRect(133, 240, 4, 0.8); q.fillStyle = '#ffd486'; q.fillRect(133.3, 240.8, 3.4, 4); q.fillStyle = '#2e2438'; q.fillRect(133, 244.8, 4, 0.8);   // (a lantern at the cave)
      [[60, 236, 8], [178, 272, 7], [128, 300, 6], [262, 230, 5]].forEach(function (l) { E(l[0], l[1] + 1.2, l[2], 1.8, 'rgba(10,5,25,.5)'); E(l[0], l[1], l[2], 1.8, '#7a62a0'); E(l[0], l[1] - 0.8, l[2] * 0.9, 1, '#5aa88a');   // (little ledges, with grass and a toadstool)
        q.strokeStyle = '#7ad0a0'; q.lineWidth = 0.5; for (j = 0; j < 4; j++) { q.beginPath(); q.moveTo(l[0] - l[2] * 0.6 + j * l[2] * 0.4, l[1] - 0.8); q.lineTo(l[0] - l[2] * 0.6 + j * l[2] * 0.4 + 0.5, l[1] - 3.5); q.stroke(); }
        q.fillStyle = '#f2e6d8'; q.fillRect(l[0] + l[2] * 0.4 - 0.3, l[1] - 2.6, 0.6, 1.8); E(l[0] + l[2] * 0.4, l[1] - 2.6, 1.6, 1.1, '#ff7aa8'); });
    }
    // ----- the grassy top -----
    E(160, 205.5, 133, 17, '#5c3e34'); for (k = 0; k < 30; k++) { var sa3 = Math.PI * (0.08 + k / 30 * 0.84); E(160 + Math.cos(sa3) * 128, 200 + Math.sin(sa3) * 19.5, 0.9 + R(k + 1700) * 0.8, 0.6, 'rgba(180,170,200,.6)'); }   // (a band of soil, with pebbles in it)
    var gg = q.createLinearGradient(0, 186, 0, 212); gg.addColorStop(0, '#a4e6bc'); gg.addColorStop(1, '#3f8a70'); E(160, 200, 134, 17, gg);
    for (k = 0; k < 22; k++) { q.fillStyle = '#4f9a7c'; q.beginPath(); q.arc(32 + k * 12.2, 206 + R(k + 40) * 3, 5 + R(k + 50) * 3, 0, Math.PI); q.fill(); }   // (grass spilling over the edge)
    if (tower) for (k = 0; k < 120; k++) { var ba = Math.PI * (0.04 + k / 120 * 0.92), bx6 = 160 + Math.cos(ba) * 132, by6 = 200 + Math.sin(ba) * 18.5; if (bx6 > 216 && bx6 < 244) continue; q.strokeStyle = ['#4f9a7c', '#6cc08a', '#3f8a70'][k % 3]; q.lineWidth = 0.6; q.beginPath(); q.moveTo(bx6, by6 - 1); q.quadraticCurveTo(bx6 + (R(k + 3600) - 0.5) * 3, by6 + 1.5, bx6 + (R(k + 3610) - 0.5) * 4, by6 + 2 + R(k + 3620) * 4); q.stroke(); }   // (grass blades hanging over the lip)
    q.strokeStyle = 'rgba(210,255,225,.55)'; q.lineWidth = 1; q.beginPath(); q.ellipse(160, 200, 133, 16, 0, Math.PI * 1.05, Math.PI * 1.95); q.stroke();
    for (k = 0; k < 18; k++) E(40 + R(k + 330) * 240, 190 + R(k + 340) * 18, 6 + R(k + 350) * 8, 1.4, 'rgba(60,130,95,.35)');   // (patches of shade in the grass)
    for (k = 0; k < 110; k++) { var tx = 36 + R(k + 200) * 248, ty = 188 + R(k + 300) * 22; if (Math.pow((tx - 160) / 132, 2) + Math.pow((ty - 200) / 15, 2) > 1) continue; q.strokeStyle = ['rgba(190,255,215,.65)', 'rgba(70,150,105,.8)'][k % 2]; q.lineWidth = 0.8; q.beginPath(); q.moveTo(tx, ty); q.lineTo(tx + (R(k) - 0.5) * 3, ty - 3 - R(k + 1) * 4); q.stroke(); }
    for (k = 0; k < 34; k++) { var fx2 = 44 + R(k + 400) * 232, fy2 = 192 + R(k + 500) * 14; E(fx2, fy2, 1.7, 1.7, ['#ffd2ec', '#fff2b0', '#c8e4ff', '#ff9ccc'][k % 4]); E(fx2, fy2, 0.6, 0.6, '#fff8d8'); }   // (tiny flowers)
    if (tower) {
      // the pond, and the stream that spills off the front edge into the waterfall
      E(226, 202.6, 16, 4.6, '#2c6a8a');
      var pw = q.createLinearGradient(0, 197, 0, 208); pw.addColorStop(0, '#a8ecff'); pw.addColorStop(1, '#3e8cc2'); E(226, 202.2, 14.5, 3.8, pw);
      q.fillStyle = pw; q.beginPath(); q.moveTo(220, 204.5); q.quadraticCurveTo(222, 210, 221.5, 214.6); q.lineTo(238.5, 214.6); q.quadraticCurveTo(236, 210, 233, 204.5); q.closePath(); q.fill();
      q.strokeStyle = 'rgba(255,255,255,.75)'; q.lineWidth = 0.6; [[218, 201, 226, 200.6], [228, 203.6, 234, 203.2], [224, 208, 229, 208.4], [231, 211.5, 235, 212]].forEach(function (l) { q.beginPath(); q.moveTo(l[0], l[1]); q.lineTo(l[2], l[3]); q.stroke(); });
      E(219, 203, 2.8, 1.1, '#4f9a6a'); E(232, 201.4, 2.4, 1, '#5aa874'); E(219.4, 202.4, 1.1, 0.7, '#ffb6d8'); E(219.4, 202.4, 0.4, 0.3, '#fff2b0');   // (lily pads, one in flower)
      for (k = 0; k < 18; k++) { var pa = k / 18 * TAU; if (pa > 0.9 && pa < 2.3) continue; E(226 + Math.cos(pa) * 16.5, 202.6 + Math.sin(pa) * 5, 1.8 + R(k + 600) * 1.2, 1.1 + R(k + 610) * 0.5, ['#b0a6c8', '#8e84aa', '#c8c0dc'][k % 3]); }   // (stones round the pond)
      [[219, 212.5, 2.6], [241, 212, 2.8], [217.5, 208.6, 2], [242.5, 208, 2.2]].forEach(function (s) { E(s[0], s[1] + 0.6, s[2], s[2] * 0.62, 'rgba(10,5,25,.5)'); E(s[0], s[1], s[2], s[2] * 0.6, '#9e94b8'); E(s[0] - 0.6, s[1] - 0.5, s[2] * 0.55, s[2] * 0.22, 'rgba(255,255,255,.45)'); E(s[0] + 0.4, s[1] - s[2] * 0.45, s[2] * 0.5, 0.5, 'rgba(90,168,138,.8)'); });   // (mossy boulders at the lip)
      [[210, 200], [240, 199]].forEach(function (r) { q.strokeStyle = '#4f9a6a'; q.lineWidth = 0.6; for (j = 0; j < 5; j++) { q.beginPath(); q.moveTo(r[0] + j * 0.8, r[1] + 3); q.quadraticCurveTo(r[0] + j * 1.2 - 1, r[1] - 3, r[0] + j * 1.6 - 1.4, r[1] - 6 - j % 2 * 2); q.stroke(); } E(r[0] + 1.2, r[1] - 5.6, 0.7, 1.9, '#7a4a34'); });   // (reeds and cattails)
      // barrels, crates and a bench out on the right, with a lamp post and the string of lights from the balcony
      [[252, 196], [259, 198.5]].forEach(function (b) { E(b[0], b[1] + 0.2, 3.4, 1, 'rgba(20,40,40,.4)'); q.fillStyle = '#8a5a3a'; rr(b[0] - 3, b[1] - 8, 6, 8, 1.4); q.fill(); q.fillStyle = 'rgba(0,0,0,.25)'; q.fillRect(b[0] + 0.8, b[1] - 8, 2.2, 8); q.fillStyle = '#4a4050'; q.fillRect(b[0] - 3.1, b[1] - 6.6, 6.2, 0.7); q.fillRect(b[0] - 3.1, b[1] - 2, 6.2, 0.7); E(b[0], b[1] - 8, 3, 0.8, '#a87a54'); });
      q.fillStyle = '#b08a5a'; q.fillRect(264, 189, 8, 8); q.strokeStyle = '#7a5a3a'; q.lineWidth = 0.5; q.strokeRect(264, 189, 8, 8); q.beginPath(); q.moveTo(264, 189); q.lineTo(272, 197); q.moveTo(272, 189); q.lineTo(264, 197); q.stroke(); q.fillStyle = '#c8a070'; q.fillRect(265.5, 183.5, 5.5, 5.5); q.strokeRect(265.5, 183.5, 5.5, 5.5);   // (crates)
      E(270, 182.6, 2, 1.5, '#e8862e'); q.fillStyle = '#5a7a3a'; q.fillRect(269.7, 180.6, 0.6, 1.2);   // (a pumpkin on top)
      q.fillStyle = '#7a5038'; q.fillRect(248, 205, 13, 1.4); q.fillRect(249, 206.4, 1, 3); q.fillRect(259, 206.4, 1, 3); q.fillRect(248, 200.6, 13, 1); q.fillRect(249, 201.6, 0.8, 3.4); q.fillRect(259.2, 201.6, 0.8, 3.4);   // (a bench by the pond)
      q.strokeStyle = '#2a2040'; q.lineWidth = 1.2; q.beginPath(); q.moveTo(276, 199); q.lineTo(276, 172); q.stroke(); q.lineWidth = 0.8; q.beginPath(); q.moveTo(276, 173); q.quadraticCurveTo(280, 170, 281, 174); q.stroke(); q.fillStyle = '#2a2040'; q.fillRect(278.5, 174, 5, 1); q.fillStyle = '#ffdc8a'; q.fillRect(279, 175, 4, 5); q.fillStyle = '#2a2040'; q.fillRect(278.5, 180, 5, 1);   // (a lamp post)
      q.strokeStyle = 'rgba(40,30,60,.8)'; q.lineWidth = 0.4; q.beginPath(); q.moveTo(TX + 32, 92); q.quadraticCurveTo(TX + 70, 158, 276, 173); q.stroke();   // (string lights)
      for (k = 0; k < 12; k++) { var lt = (k + 0.5) / 12, lx3 = (1 - lt) * (1 - lt) * (TX + 32) + 2 * (1 - lt) * lt * (TX + 70) + lt * lt * 276, ly3 = (1 - lt) * (1 - lt) * 92 + 2 * (1 - lt) * lt * 158 + lt * lt * 173; E(lx3, ly3 + 1, 0.9, 1.2, ['#ffd27a', '#ff9ccc', '#9ae0ff', '#b8ff9a'][k % 4]); }
      for (k = 0; k < 8; k++) { var fa2 = k / 8 * TAU, fx4 = 200 + Math.cos(fa2) * 9, fy4 = 211 + Math.sin(fa2) * 2.6; q.fillStyle = '#e0fff8'; q.fillRect(fx4 - 0.3, fy4 - 1.6, 0.6, 1.6); q.fillStyle = '#7af0e0'; q.beginPath(); q.arc(fx4, fy4 - 1.6, 1.1, Math.PI, 0); q.fill(); }   // (a fairy ring of glowing mushrooms)
      // a wishing well, with a little roof, a crank and a bucket
      var wx2 = 98, wy2 = 210; E(wx2, wy2 + 0.6, 9.4, 2.6, 'rgba(20,40,40,.4)');
      q.fillStyle = '#5e5280'; q.fillRect(wx2 - 8, wy2 - 7, 16, 7); E(wx2, wy2, 8, 2.2, '#5e5280');
      for (j = 0; j < 2; j++) for (k = 0; k < 4; k++) { q.fillStyle = 'hsl(' + (255 + R(j * 4 + k + 1500) * 15) + ',22%,' + Math.round(70 - k * 7 - R(j * 4 + k + 1510) * 6) + '%)'; rr(wx2 - 8 + k * 4 + (j % 2) * 1.4, wy2 - 6.6 + j * 3.4, 3.5, 3, 0.6); q.fill(); }
      E(wx2, wy2 - 7, 8, 2.2, '#b4a8cc'); E(wx2, wy2 - 7, 6.4, 1.5, '#13203e'); E(wx2 - 1.5, wy2 - 7.3, 2, 0.4, 'rgba(150,220,255,.7)');
      q.fillStyle = '#6a4630'; q.fillRect(wx2 - 7.6, wy2 - 21, 1.4, 14); q.fillRect(wx2 + 6.2, wy2 - 21, 1.4, 14);
      q.fillStyle = '#9a3e66'; q.beginPath(); q.moveTo(wx2 - 10.5, wy2 - 19.5); q.lineTo(wx2, wy2 - 27); q.lineTo(wx2 + 10.5, wy2 - 19.5); q.closePath(); q.fill(); q.fillStyle = 'rgba(0,0,0,.25)'; q.beginPath(); q.moveTo(wx2, wy2 - 27); q.lineTo(wx2 + 10.5, wy2 - 19.5); q.lineTo(wx2, wy2 - 19.5); q.closePath(); q.fill();
      q.strokeStyle = 'rgba(40,10,30,.45)'; q.lineWidth = 0.4; for (j = 1; j < 4; j++) { q.beginPath(); q.moveTo(wx2 - 10.5 + j * 2.6, wy2 - 19.5 - j * 1.85); q.lineTo(wx2 + 10.5 - j * 2.6, wy2 - 19.5 - j * 1.85); q.stroke(); }
      q.strokeStyle = '#4a3020'; q.lineWidth = 0.9; q.beginPath(); q.moveTo(wx2 - 6.2, wy2 - 15); q.lineTo(wx2 + 8.6, wy2 - 15); q.lineTo(wx2 + 8.6, wy2 - 12.6); q.stroke();
      q.strokeStyle = '#d8c090'; q.lineWidth = 0.4; q.beginPath(); q.moveTo(wx2, wy2 - 15); q.lineTo(wx2, wy2 - 11.4); q.stroke(); q.fillStyle = '#8a5a3a'; q.beginPath(); q.moveTo(wx2 - 1.8, wy2 - 11.4); q.lineTo(wx2 + 1.8, wy2 - 11.4); q.lineTo(wx2 + 1.4, wy2 - 8.6); q.lineTo(wx2 - 1.4, wy2 - 8.6); q.closePath(); q.fill();
      q.strokeStyle = '#4a7a5a'; q.lineWidth = 0.6; q.beginPath(); q.moveTo(wx2 - 7, wy2 - 21); q.quadraticCurveTo(wx2 - 9, wy2 - 14, wx2 - 7.6, wy2 - 8); q.stroke(); for (j = 0; j < 5; j++) leaf(wx2 - 8 + (j % 2), wy2 - 20 + j * 2.6, 1.8, j % 2 ? 0.4 : 2.7, '#6cc08a');   // (ivy on a post)
      // a signpost
      q.fillStyle = '#6a4630'; q.fillRect(39.4, 186, 1.2, 18); q.fillStyle = '#b08a5a'; q.beginPath(); q.moveTo(41, 187); q.lineTo(51, 187); q.lineTo(53, 189); q.lineTo(51, 191); q.lineTo(41, 191); q.closePath(); q.fill(); q.beginPath(); q.moveTo(39, 192.5); q.lineTo(30, 192.5); q.lineTo(28, 194.5); q.lineTo(30, 196.5); q.lineTo(39, 196.5); q.closePath(); q.fill();
      q.strokeStyle = 'rgba(60,30,20,.7)'; q.lineWidth = 0.4; q.beginPath(); q.moveTo(43, 189); q.lineTo(49, 189); q.moveTo(31, 194.5); q.lineTo(37, 194.5); q.stroke();
      [[150, 212, 1.5], [62, 208, 1.3], [186, 214, 1.2], [118, 211, 1.4], [256, 212, 1.2]].forEach(function (m) { q.fillStyle = '#f2e6d8'; q.fillRect(m[0] - 0.35 * m[2], m[1] - 2 * m[2], 0.7 * m[2], 2 * m[2]); q.fillStyle = '#e04a5a'; q.beginPath(); q.arc(m[0], m[1] - 2 * m[2], 1.6 * m[2], Math.PI, 0); q.fill(); q.fillStyle = '#fff'; q.beginPath(); q.arc(m[0] - 0.6 * m[2], m[1] - 2.7 * m[2], 0.3 * m[2], 0, TAU); q.arc(m[0] + 0.6 * m[2], m[1] - 2.4 * m[2], 0.25 * m[2], 0, TAU); q.fill(); });   // (toadstools)
      // a little picket fence, and a pumpkin patch
      for (k = 0; k < 8; k++) { var fx3 = 48 + k * 7; q.fillStyle = '#e8dcc8'; q.beginPath(); q.moveTo(fx3 - 1.4, 195); q.lineTo(fx3 - 1.4, 187.5); q.lineTo(fx3, 186); q.lineTo(fx3 + 1.4, 187.5); q.lineTo(fx3 + 1.4, 195); q.closePath(); q.fill(); q.fillStyle = 'rgba(80,60,90,.35)'; q.fillRect(fx3 + 0.5, 187.5, 0.9, 7.5); }
      q.fillStyle = '#d8ccb6'; q.fillRect(46, 189, 52, 1.3); q.fillRect(46, 192.5, 52, 1.3);
      for (k = 0; k < 6; k++) { leaf(52 + k * 8, 196.5, 2.4, -2.4, '#6cc08a'); leaf(52 + k * 8, 196.5, 2.4, -0.7, '#4fa070'); }   // (a row of seedlings)
      [[58, 201, 4.6], [72, 203, 3.6], [86, 200.5, 4]].forEach(function (pk) {
        q.strokeStyle = '#4f9a6a'; q.lineWidth = 0.8; q.beginPath(); q.moveTo(pk[0], pk[1] - pk[2] * 0.6); q.bezierCurveTo(pk[0] + 4, pk[1] - 7, pk[0] + 8, pk[1] - 1, pk[0] + 10, pk[1] - 4); q.stroke(); leaf(pk[0] + 5, pk[1] - 4, 3.2, -0.6, '#5fb07a');
        for (j = -1; j <= 1; j++) E(pk[0] + j * pk[2] * 0.42, pk[1], pk[2] * 0.55, pk[2] * 0.68, j ? '#e8862e' : '#f59a3c');
        E(pk[0] - pk[2] * 0.3, pk[1] - pk[2] * 0.3, pk[2] * 0.2, pk[2] * 0.12, 'rgba(255,230,180,.6)'); q.fillStyle = '#5a7a3a'; q.fillRect(pk[0] - 0.5, pk[1] - pk[2] * 0.68 - 1.6, 1, 2);
      });
      // a little apple tree beside the tower: a twisting trunk, layers of leaves lit from the upper left, apples, blossoms, a birdhouse and a lantern
      E(112, 200.4, 17, 2.6, 'rgba(20,50,45,.4)');
      [[-1, 10, 2.2], [1, 9, 2.6], [-1, 6, 3.2], [1, 5, 3.4]].forEach(function (rt) { q.fillStyle = '#5a3c32'; q.beginPath(); q.moveTo(111.5 + rt[0] * 3, 197); q.quadraticCurveTo(111.5 + rt[0] * rt[1] * 0.7, 198.6, 111.5 + rt[0] * rt[1], 199.8 + rt[2] * 0.3); q.quadraticCurveTo(111.5 + rt[0] * rt[1] * 0.4, 200, 111.5, 200.6); q.closePath(); q.fill(); });
      var tb = q.createLinearGradient(103, 0, 120, 0); tb.addColorStop(0, '#9a7660'); tb.addColorStop(0.45, '#6a4a3c'); tb.addColorStop(1, '#3a2620');
      function ltTrunk() { q.beginPath(); q.moveTo(104, 200); q.bezierCurveTo(108.5, 194, 106.5, 181, 108.5, 169); q.bezierCurveTo(110, 160, 106.5, 152, 108.2, 143); q.lineTo(114.4, 142.4); q.bezierCurveTo(113.4, 152, 117, 160, 115.6, 170); q.bezierCurveTo(114.6, 182, 116, 194, 120, 200); q.closePath(); }
      ltTrunk(); q.fillStyle = tb; q.fill(); q.save(); ltTrunk(); q.clip();
      q.lineWidth = 0.4; for (k = 0; k < 6; k++) { q.strokeStyle = k % 3 ? 'rgba(30,18,14,.5)' : 'rgba(255,225,205,.2)'; q.beginPath(); q.moveTo(105 + k * 2.4, 200); q.bezierCurveTo(108 + k * 1.6, 184, 106 + k * 1.6, 160, 109 + k * 1, 142); q.stroke(); }
      E(112.6, 182, 1.2, 1.7, '#2a1a16'); E(106.6, 192, 1.6, 0.8, 'rgba(90,170,110,.7)'); E(108, 186, 1.1, 0.6, 'rgba(90,170,110,.6)');
      var lsh = q.createLinearGradient(0, 142, 0, 156); lsh.addColorStop(0, 'rgba(10,30,20,.6)'); lsh.addColorStop(1, 'rgba(10,30,20,0)'); q.fillStyle = lsh; q.fillRect(100, 140, 22, 18);
      q.restore();
      function twig(x0, y0, cx, cy, x1, y1, w0) { q.lineCap = 'round'; for (var s = 0; s < 8; s++) { var a = s / 8, b = (s + 1) / 8; q.strokeStyle = '#5a3c32'; q.lineWidth = w0 * (1 - a * 0.75); q.beginPath(); q.moveTo((1 - a) * (1 - a) * x0 + 2 * (1 - a) * a * cx + a * a * x1, (1 - a) * (1 - a) * y0 + 2 * (1 - a) * a * cy + a * a * y1); q.lineTo((1 - b) * (1 - b) * x0 + 2 * (1 - b) * b * cx + b * b * x1, (1 - b) * (1 - b) * y0 + 2 * (1 - b) * b * cy + b * b * y1); q.stroke(); } }
      [[110, 148, 100, 142, 93, 130, 2.6], [113, 147, 124, 142, 131, 131, 2.6], [111.5, 145, 109, 134, 112, 118, 2.4], [114.6, 162, 122, 155, 130, 158, 1.8]].forEach(function (b) { twig.apply(null, b); });
      function leafClump(x, y, r, c0, c1, hl) { var lg2 = q.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.1, x, y, r); lg2.addColorStop(0, hl); lg2.addColorStop(0.55, c0); lg2.addColorStop(1, c1); q.fillStyle = lg2; q.beginPath(); q.arc(x, y, r, 0, TAU); q.fill(); }
      for (k = 0; k < 16; k++) { var la = R(k + 3000) * TAU, ld = Math.sqrt(R(k + 3100)) * 0.7, lx4 = 109 + Math.cos(la) * ld * 26, ly4 = 129 + Math.sin(la) * ld * 16; leafClump(lx4, ly4, 8 + R(k + 3200) * 4, '#2a5e40', '#143424', '#3b7a52'); }   // (dark, dense heart of the tree)
      var lvs = [];                                                     // (hundreds of real leaves, each with a vein, shaded by where the light falls)
      for (k = 0; k < 560; k++) { var la3 = R(k + 3700) * TAU, ld3 = Math.pow(R(k + 3710), 0.45), dx3 = Math.cos(la3) * ld3, dy3 = Math.sin(la3) * ld3, lit2 = 0.5 + 0.5 * (-dx3 * 0.6 - dy3 * 0.8) * (0.4 + 0.6 * ld3) + (R(k + 3720) - 0.5) * 0.35;
        if (dy3 * 19 + 129 > 147) continue; lvs.push([109 + dx3 * 30, 129 + dy3 * 20, 2.2 + R(k + 3730) * 1.6, la3 + (R(k + 3740) - 0.5) * 1.3 + (dy3 > 0.3 ? 0.5 * Math.cos(la3) : 0), Math.max(0, Math.min(1, lit2)), R(k + 3750) < 0.12]); }
      lvs.sort(function (a, b) { return a[4] - b[4]; });
      lvs.forEach(function (v) { var hue = 150 - v[4] * 40, lum = 16 + v[4] * 44; q.save(); q.translate(v[0], v[1]); q.rotate(v[3]); var s5 = v[2];
        q.fillStyle = v[5] ? 'hsl(' + Math.round(hue + 15) + ',30%,' + Math.round(lum + 14) + '%)' : 'hsl(' + Math.round(hue) + ',' + Math.round(42 + v[4] * 16) + '%,' + Math.round(lum) + '%)';
        q.beginPath(); q.moveTo(0, 0); q.bezierCurveTo(s5 * 0.3, -s5 * 0.48, s5 * 0.85, -s5 * 0.42, s5 * 1.35, 0); q.bezierCurveTo(s5 * 0.85, s5 * 0.42, s5 * 0.3, s5 * 0.48, 0, 0); q.fill();
        q.strokeStyle = 'hsla(' + Math.round(hue - 10) + ',40%,' + Math.round(Math.min(85, lum + 22)) + '%,.7)'; q.lineWidth = 0.14; q.beginPath(); q.moveTo(s5 * 0.08, 0); q.lineTo(s5 * 1.15, 0); q.stroke();
        q.strokeStyle = 'rgba(10,30,20,.25)'; q.lineWidth = 0.1; q.beginPath(); q.moveTo(0, 0); q.bezierCurveTo(s5 * 0.3, s5 * 0.48, s5 * 0.85, s5 * 0.42, s5 * 1.35, 0); q.stroke(); q.restore(); });
      var lrim = q.createRadialGradient(96, 112, 2, 96, 112, 28); lrim.addColorStop(0, 'rgba(240,255,230,.22)'); lrim.addColorStop(1, 'rgba(240,255,230,0)'); q.fillStyle = lrim; q.fillRect(66, 82, 60, 60);
      [[96, 134], [104, 140], [118, 138], [126, 127], [110, 118], [99, 121], [116, 143], [88, 128], [121, 114], [131, 136], [86, 138]].forEach(function (ap, ai) { E(ap[0], ap[1], 1.7, 1.6, ai % 3 ? '#e8485a' : '#ff8a6a'); E(ap[0] - 0.5, ap[1] - 0.5, 0.5, 0.4, 'rgba(255,255,255,.7)'); q.strokeStyle = '#4a3020'; q.lineWidth = 0.3; q.beginPath(); q.moveTo(ap[0], ap[1] - 1.6); q.lineTo(ap[0] + 0.3, ap[1] - 2.4); q.stroke(); });   // (apples)
      for (k = 0; k < 12; k++) { var bx5 = 86 + R(k + 3400) * 46, by5 = 112 + R(k + 3410) * 32; for (j = 0; j < 5; j++) { var fa6 = j / 5 * TAU; E(bx5 + Math.cos(fa6) * 0.7, by5 + Math.sin(fa6) * 0.7, 0.6, 0.6, k % 2 ? '#ffffff' : '#ffd2ec'); } E(bx5, by5, 0.35, 0.35, '#fff2b0'); }   // (blossoms)
      q.fillStyle = '#5ab0a8'; q.fillRect(108.6, 172, 5.4, 5.4); q.fillStyle = 'rgba(0,0,0,.2)'; q.fillRect(112, 172, 2, 5.4); q.fillStyle = '#c0504a'; q.beginPath(); q.moveTo(107.6, 172.4); q.lineTo(111.3, 168.8); q.lineTo(115, 172.4); q.closePath(); q.fill(); E(111.3, 174.4, 1, 1, '#1a1020'); q.fillStyle = '#8a5a3a'; q.fillRect(110.9, 176.2, 0.8, 1.6);   // (a birdhouse on the trunk)
      E(98, 200.6, 1.5, 1.4, '#e8485a'); E(124, 201.4, 1.4, 1.3, '#ff8a6a'); leaf(102, 201, 1.8, 0.4, '#8a6a3a'); leaf(120, 199.6, 1.8, 2.4, '#a07a40');   // (windfalls)
      q.strokeStyle = 'rgba(40,30,50,.8)'; q.lineWidth = 0.5; q.beginPath(); q.moveTo(129, 158); q.lineTo(129, 163); q.stroke();
      q.fillStyle = '#3a2a4a'; q.fillRect(126.5, 163, 5, 1.2); q.fillRect(126.5, 170, 5, 1.2); q.fillStyle = '#ffd486'; q.fillRect(127, 164, 4, 6); q.fillStyle = '#3a2a4a'; q.fillRect(128.6, 164, 0.8, 6);
      // a cauldron bubbling over a little fire
      E(130, 200.6, 4, 1.3, '#ff9a3a'); E(130, 200, 2, 1, '#fff0a0');
      q.strokeStyle = '#2a2236'; q.lineWidth = 1; q.beginPath(); q.moveTo(125.5, 199); q.lineTo(124.5, 202); q.moveTo(134.5, 199); q.lineTo(135.5, 202); q.stroke();
      E(130, 195, 6.5, 5, '#2a2236'); E(128, 193.6, 2.4, 2.2, 'rgba(255,255,255,.12)'); E(130, 190.6, 6.2, 1.7, '#3e3450'); E(130, 190.6, 5, 1.1, '#7af08a'); E(129, 190.3, 1.6, 0.4, '#d8ffd8');
      // ----- the tower -----
      E(TX + 8, 200, 34, 5, 'rgba(20,50,45,.35)');                    // (its shadow on the grass)
      function stones(xa, xb, yb, rows, rh, seed) {                   // (rows of stones, each its own shade, lit from the left)
        for (var row = 0; row < rows; row++) { var y0 = yb - (row + 1) * rh, xs = xa - (row % 2) * 6, st = 0, hw2 = (xb - xa) / 2, mid = (xa + xb) / 2;
          while (xs < xb) { var sw = 8 + R(seed + row * 20 + st) * 7, u = Math.max(-1, Math.min(1, (xs + sw / 2 - mid) / hw2)), L = 82 - (u + 1) * 18 - R(seed + row * 31 + st) * 9;
            q.fillStyle = 'hsl(' + Math.round(255 + R(seed + st + row * 5) * 18) + ',' + Math.round(20 + R(seed + row + st * 3) * 12) + '%,' + Math.round(L) + '%)'; rr(xs + 0.6, y0 + 0.6, sw - 1.2, rh - 1.2, 1.6); q.fill();
            q.fillStyle = 'rgba(255,255,255,' + (0.1 + (1 - u) * 0.06) + ')'; q.fillRect(xs + 1.4, y0 + 1, Math.max(0, sw - 2.8), 0.8); xs += sw; st++; } }
      }
      function shade(xa, xb, ya, yb) { var s2 = q.createLinearGradient(xa, 0, xb, 0); s2.addColorStop(0, 'rgba(255,230,255,.15)'); s2.addColorStop(0.35, 'rgba(255,230,255,0)'); s2.addColorStop(0.7, 'rgba(20,10,50,.1)'); s2.addColorStop(1, 'rgba(20,10,50,.5)'); q.fillStyle = s2; q.fillRect(xa, ya, xb - xa, yb - ya); }
      q.save(); q.beginPath(); q.rect(TX - 17, 60, 34, 42); q.clip(); q.fillStyle = '#4e4272'; q.fillRect(TX - 17, 60, 34, 42); stones(TX - 17, TX + 17, 100, 5, 8, 500); shade(TX - 17, TX + 17, 60, 102); q.restore();   // (the little room up top)
      E(TX, 69, 17, 2.4, 'rgba(20,10,40,.4)');                         // (shadow under the eaves)
      E(TX, 81, 7, 7, '#d4cae4'); var rw = q.createRadialGradient(TX - 1, 79, 0.5, TX, 81, 5.4); rw.addColorStop(0, '#fff6d0'); rw.addColorStop(1, '#ffae50'); E(TX, 81, 5.3, 5.3, rw);   // (a round window, lamplit)
      q.strokeStyle = '#3c3064'; q.lineWidth = 0.8; q.beginPath(); q.moveTo(TX, 75.7); q.lineTo(TX, 86.3); q.moveTo(TX - 5.3, 81); q.lineTo(TX + 5.3, 81); q.stroke(); q.beginPath(); q.arc(TX, 81, 5.3, 0, TAU); q.stroke();
      function body() { q.beginPath(); q.moveTo(TX - 26, 200); q.lineTo(TX - 21, 100); q.lineTo(TX + 21, 100); q.lineTo(TX + 26, 200); q.closePath(); }
      body(); q.fillStyle = '#4e4272'; q.fill(); q.save(); body(); q.clip(); stones(TX - 26, TX + 26, 200, 12, 8.4, 0); shade(TX - 27, TX + 27, 96, 202); q.restore();
      q.save(); body(); q.clip();                                      // (moss and cracks in the old stones)
      for (k = 0; k < 40; k++) E(TX - 26 + R(k + 1600) * 52, 140 + Math.pow(R(k + 1610), 0.6) * 58, 0.8 + R(k + 1620) * 1.8, 0.5 + R(k + 1630) * 0.6, 'rgba(90,170,110,' + (0.35 + R(k + 1640) * 0.35) + ')');
      q.strokeStyle = 'rgba(30,20,50,.55)'; q.lineWidth = 0.4; [[TX + 14, 108], [TX - 18, 128], [TX + 16, 168]].forEach(function (c0) { var cx3 = c0[0], cy3 = c0[1]; q.beginPath(); q.moveTo(cx3, cy3); for (j = 0; j < 5; j++) { cx3 += (R(j + c0[1]) - 0.5) * 4; cy3 += 2 + R(j + c0[0]) * 2; q.lineTo(cx3, cy3); } q.stroke(); });
      q.restore();
      q.fillStyle = '#6a5e92'; q.beginPath(); q.moveTo(TX - 28.5, 200); q.lineTo(TX - 27.5, 192); q.lineTo(TX + 27.5, 192); q.lineTo(TX + 28.5, 200); q.closePath(); q.fill();   // (a plinth of bigger stones)
      q.strokeStyle = 'rgba(30,20,60,.5)'; q.lineWidth = 0.7; for (k = 0; k < 7; k++) { q.beginPath(); q.moveTo(TX - 24 + k * 8, 192); q.lineTo(TX - 24 + k * 8, 200); q.stroke(); } q.fillStyle = 'rgba(255,255,255,.2)'; q.fillRect(TX - 27.5, 192, 55, 0.9);
      // windows, with shutters, sills and flower boxes
      function arch(x, y, w, h) { q.beginPath(); q.moveTo(x - w / 2, y + h / 2); q.lineTo(x - w / 2, y - h / 2 + w / 2); q.arc(x, y - h / 2 + w / 2, w / 2, Math.PI, 0); q.lineTo(x + w / 2, y + h / 2); q.closePath(); }
      function win(x, y, w, h) {
        q.fillStyle = '#3c3064'; q.fillRect(x - w / 2 - 6.5, y - h / 2 + 1, 5, h); q.fillRect(x + w / 2 + 1.5, y - h / 2 + 1, 5, h);
        q.fillStyle = '#5b6fb8'; q.fillRect(x - w / 2 - 6, y - h / 2 + 1.5, 4, h - 1); q.fillRect(x + w / 2 + 2, y - h / 2 + 1.5, 4, h - 1);
        q.strokeStyle = 'rgba(20,20,60,.55)'; q.lineWidth = 0.4; for (j = 0; j < 4; j++) { var ly = y - h / 2 + 3 + j * (h - 3) / 4; q.beginPath(); q.moveTo(x - w / 2 - 6, ly); q.lineTo(x - w / 2 - 2, ly); q.moveTo(x + w / 2 + 2, ly); q.lineTo(x + w / 2 + 6, ly); q.stroke(); }
        q.fillStyle = '#d4cae4'; arch(x, y, w + 3.6, h + 3.6); q.fill();
        var wg2 = q.createLinearGradient(0, y - h / 2, 0, y + h / 2); wg2.addColorStop(0, '#fff2c0'); wg2.addColorStop(1, '#ffb050'); q.fillStyle = wg2; arch(x, y, w, h); q.fill();
        q.strokeStyle = '#3c3064'; q.lineWidth = 0.8; q.beginPath(); q.moveTo(x, y - h / 2); q.lineTo(x, y + h / 2); q.moveTo(x - w / 2, y + 0.5); q.lineTo(x + w / 2, y + 0.5); q.stroke();
        q.fillStyle = '#d4cae4'; q.fillRect(x - w / 2 - 2.5, y + h / 2, w + 5, 1.6);
        q.fillStyle = '#7a4a34'; q.fillRect(x - w / 2 - 1.5, y + h / 2 + 1.6, w + 3, 3); q.fillStyle = 'rgba(0,0,0,.25)'; q.fillRect(x - w / 2 - 1.5, y + h / 2 + 3.8, w + 3, 0.8);
        for (j = 0; j < 6; j++) { leaf(x - w / 2 + j * w / 5, y + h / 2 + 2.4, 2.4, 1.2 + j * 0.3, '#5fb07a'); E(x - w / 2 + j * w / 5, y + h / 2 + 0.8, 1.1, 1.1, ['#ff8cc0', '#fff2b0', '#ffb0d8'][j % 3]); }
      }
      win(TX - 7, 152, 8, 13); win(TX + 8, 124, 7, 12);
      // ivy climbing up the left side
      q.strokeStyle = '#3b6e48'; q.lineWidth = 1.2; q.beginPath(); q.moveTo(TX - 25, 199); q.bezierCurveTo(TX - 18, 175, TX - 26, 150, TX - 14, 128); q.stroke(); q.beginPath(); q.moveTo(TX - 21, 170); q.quadraticCurveTo(TX - 12, 166, TX - 10, 178); q.stroke();
      for (k = 0; k < 46; k++) { var it = R(k + 800), i1 = 1 - it, ix2 = i1 * i1 * i1 * (TX - 25) + 3 * i1 * i1 * it * (TX - 18) + 3 * i1 * it * it * (TX - 26) + it * it * it * (TX - 14), iy2 = i1 * i1 * i1 * 199 + 3 * i1 * i1 * it * 175 + 3 * i1 * it * it * 150 + it * it * it * 128;
        leaf(ix2 + (R(k + 810) - 0.5) * 8, iy2 + (R(k + 820) - 0.5) * 6, 2.6 + R(k + 830) * 1.6, R(k + 840) * TAU, ['#3f8a5a', '#5fb07a', '#2f6e48', '#78c890'][k % 4]); }
      for (k = 0; k < 7; k++) E(TX - 24 + R(k + 850) * 14, 135 + R(k + 860) * 60, 1.2, 1.2, '#ffc0e0');
      // the door: a stone arch, planks, iron straps, a ring, a little window, a step and a mat
      for (k = 0; k < 8; k++) { var da = Math.PI + k / 8 * Math.PI, db = Math.PI + (k + 1) / 8 * Math.PI; q.fillStyle = k % 2 ? '#c8bedc' : '#b4a8cc'; q.beginPath(); q.arc(TX, 185, 12.5, da, db); q.arc(TX, 185, 9, db, da, true); q.closePath(); q.fill(); q.strokeStyle = 'rgba(40,30,70,.5)'; q.lineWidth = 0.5; q.stroke(); }
      q.fillStyle = '#b4a8cc'; q.fillRect(TX - 12.5, 185, 3.5, 14); q.fillRect(TX + 9, 185, 3.5, 14);
      q.fillStyle = '#6a3e2a'; q.beginPath(); q.moveTo(TX - 9, 199); q.lineTo(TX - 9, 185); q.arc(TX, 185, 9, Math.PI, 0); q.lineTo(TX + 9, 199); q.closePath(); q.fill();
      q.strokeStyle = 'rgba(30,15,10,.5)'; q.lineWidth = 0.6; for (k = -2; k <= 2; k++) { q.beginPath(); q.moveTo(TX + k * 3.6, 177 + Math.abs(k) * 1.4); q.lineTo(TX + k * 3.6, 199); q.stroke(); }
      q.fillStyle = '#2e2438'; q.fillRect(TX - 9, 186, 13, 1.4); q.fillRect(TX - 9, 194, 13, 1.4); q.strokeStyle = '#e8c070'; q.lineWidth = 0.8; q.beginPath(); q.arc(TX + 5, 191, 1.6, 0, TAU); q.stroke();
      E(TX - 2, 181.5, 2.2, 1.7, '#ffd486'); q.strokeStyle = '#2e2438'; q.lineWidth = 0.5; q.beginPath(); q.moveTo(TX - 2, 179.8); q.lineTo(TX - 2, 183.2); q.moveTo(TX - 4.2, 181.5); q.lineTo(TX + 0.2, 181.5); q.stroke();
      q.fillStyle = '#d4cae4'; q.fillRect(TX - 12, 199, 24, 2.4); q.fillStyle = 'rgba(0,0,0,.15)'; q.fillRect(TX - 12, 200.8, 24, 0.6);
      E(TX, 203.4, 7, 1.4, '#b04a6a'); E(TX, 203.2, 5.5, 0.9, '#d06a88');
      [[TX + 1, 206.5, 6], [TX - 10, 208, 5.5], [TX - 22, 208.5, 5.5], [TX - 34, 207, 5], [TX - 45, 205.5, 4.6]].forEach(function (s) { E(s[0], s[1], s[2], 1.9, '#a69cc0'); E(s[0] - 0.8, s[1] - 0.5, s[2] * 0.6, 0.8, 'rgba(255,255,255,.35)'); });   // (stepping stones)
      q.strokeStyle = '#2e2438'; q.lineWidth = 0.9; q.beginPath(); q.moveTo(TX + 13, 178); q.lineTo(TX + 17, 178); q.lineTo(TX + 17, 180); q.stroke();   // (a lantern by the door)
      q.fillStyle = '#2e2438'; q.fillRect(TX + 14.6, 180, 4.8, 1); q.fillStyle = '#ffd486'; q.fillRect(TX + 15, 181, 4, 4.6); q.fillStyle = '#2e2438'; q.fillRect(TX + 14.6, 185.6, 4.8, 1); q.fillRect(TX + 16.6, 181, 0.6, 4.6);
      var px = TX - 16, py = 199; q.fillStyle = '#c87650'; q.beginPath(); q.moveTo(px - 3.4, py - 5); q.lineTo(px + 3.4, py - 5); q.lineTo(px + 2.6, py); q.lineTo(px - 2.6, py); q.closePath(); q.fill(); q.fillStyle = '#e09470'; q.fillRect(px - 3.8, py - 5.8, 7.6, 1.4);   // (a potted flower)
      for (j = 0; j < 6; j++) leaf(px, py - 5.5, 3.4, -Math.PI / 2 + (j - 2.5) * 0.45, ['#4fa070', '#6cc08a'][j % 2]); E(px - 2, py - 10, 1.3, 1.3, '#ff8cc0'); E(px + 2.2, py - 9.2, 1.2, 1.2, '#ffb0d8'); E(px, py - 11.4, 1.2, 1.2, '#fff2b0');
      q.strokeStyle = '#8a5a3a'; q.lineWidth = 1.2; q.beginPath(); q.moveTo(TX + 28, 193); q.lineTo(TX + 34, 168); q.stroke();   // (a broom leaning on the wall)
      q.fillStyle = '#d8b060'; q.beginPath(); q.moveTo(TX + 26.2, 193.6); q.lineTo(TX + 29.4, 193); q.lineTo(TX + 31.6, 200); q.lineTo(TX + 23.4, 200); q.closePath(); q.fill(); q.fillStyle = '#a0402a'; q.fillRect(TX + 26, 193, 3.6, 1.4);
      q.strokeStyle = 'rgba(150,110,40,.6)'; q.lineWidth = 0.4; for (j = 0; j < 5; j++) { q.beginPath(); q.moveTo(TX + 27 + j * 0.5, 194.6); q.lineTo(TX + 24.6 + j * 1.6, 200); q.stroke(); }
      // the balcony: corbels, bunting, a railing, a telescope, and a black cat
      q.fillStyle = '#5a4e80'; for (k = -3; k <= 3; k++) { q.beginPath(); q.moveTo(TX + k * 8 - 2.5, 103); q.lineTo(TX + k * 8 + 2.5, 103); q.lineTo(TX + k * 8, 110); q.closePath(); q.fill(); }
      q.strokeStyle = 'rgba(60,40,80,.7)'; q.lineWidth = 0.5; q.beginPath(); q.moveTo(TX - 31, 103.5); q.quadraticCurveTo(TX, 120.5, TX + 31, 103.5); q.stroke();
      for (k = 0; k < 9; k++) { var bt2 = (k + 0.5) / 9, bx2 = TX - 31 + 62 * bt2, by2 = 103.5 + 17 * bt2 * (1 - bt2); q.fillStyle = ['#ff9ccc', '#fff2b0', '#9ae0d0', '#c8b0ff'][k % 4]; q.beginPath(); q.moveTo(bx2 - 2, by2); q.lineTo(bx2 + 2, by2); q.lineTo(bx2, by2 + 4.5); q.closePath(); q.fill(); }
      q.fillStyle = '#b8acd0'; q.fillRect(TX - 32, 99, 64, 4.4); q.fillStyle = 'rgba(255,255,255,.3)'; q.fillRect(TX - 32, 99, 64, 0.9); q.fillStyle = 'rgba(20,10,50,.35)'; q.fillRect(TX + 10, 99, 22, 4.4);
      q.strokeStyle = '#4a3a5a'; q.lineWidth = 0.6; q.beginPath(); q.moveTo(TX + 22, 98.6); q.lineTo(TX + 24, 92); q.lineTo(TX + 26, 98.6); q.stroke();
      q.save(); q.translate(TX + 24, 92); q.rotate(-0.55); var tg2 = q.createLinearGradient(0, -2, 0, 2); tg2.addColorStop(0, '#ffe2a0'); tg2.addColorStop(1, '#b07a30'); q.fillStyle = tg2; q.fillRect(-5, -1.4, 14, 2.8); q.fillRect(9, -1.9, 4, 3.8); q.fillStyle = '#5a3a20'; q.fillRect(2, -1.6, 1, 3.2); q.restore();
      q.fillStyle = '#c8bedc'; for (k = 0; k <= 16; k++) q.fillRect(TX - 31 + k * 3.875 - 0.6, 91, 1.2, 8); q.fillRect(TX - 32, 90, 2.4, 9); q.fillRect(TX + 29.6, 90, 2.4, 9);
      q.fillStyle = '#d4cae4'; q.fillRect(TX - 32.5, 89.6, 65, 2); q.fillStyle = 'rgba(20,10,50,.3)'; q.fillRect(TX + 10, 89.6, 22.5, 9.4);
      E(TX - 24, 86, 3.4, 3.2, '#1e1630'); E(TX - 22.6, 81.6, 2.4, 2.2, '#1e1630'); q.fillStyle = '#1e1630'; q.beginPath(); q.moveTo(TX - 24.8, 80.6); q.lineTo(TX - 24.4, 77.6); q.lineTo(TX - 23, 80); q.moveTo(TX - 22.2, 80); q.lineTo(TX - 20.8, 77.6); q.lineTo(TX - 20.4, 80.6); q.fill();
      q.strokeStyle = '#1e1630'; q.lineWidth = 1; q.beginPath(); q.moveTo(TX - 27, 88.6); q.bezierCurveTo(TX - 31, 92, TX - 30, 96, TX - 27, 97.5); q.stroke(); E(TX - 23.5, 81.4, 0.5, 0.5, '#ffe066'); E(TX - 21.6, 81.4, 0.5, 0.5, '#ffe066');
      [[TX - 30, 99, 16], [TX + 27, 99, 12], [TX - 6, 99, 9]].forEach(function (hv, hi) { q.strokeStyle = '#3b6e48'; q.lineWidth = 0.6; q.beginPath(); q.moveTo(hv[0], hv[1]); q.quadraticCurveTo(hv[0] + 2, hv[1] + hv[2] * 0.6, hv[0] - 1, hv[1] + hv[2]); q.stroke(); for (j = 1; j < 7; j++) leaf(hv[0] + Math.sin(j) * 1.2, hv[1] + hv[2] * j / 7, 2, j % 2 ? 0.5 : 2.6, ['#5fb07a', '#3f8a5a'][j % 2]); E(hv[0] - 1, hv[1] + hv[2] + 1, 1, 1, hi % 2 ? '#fff2b0' : '#ff9ccc'); });   // (vines trailing off the balcony)
      [[TX - 23, 67, 7], [TX + 23, 67, 9], [TX - 14, 68, 4]].forEach(function (hs) { q.strokeStyle = 'rgba(232,200,120,.7)'; q.lineWidth = 0.3; q.beginPath(); q.moveTo(hs[0], hs[1]); q.lineTo(hs[0], hs[1] + hs[2]); q.stroke(); q.fillStyle = '#ffe08a'; q.beginPath(); for (j = 0; j < 10; j++) { var sa2 = j / 10 * TAU - Math.PI / 2, sr2 = j % 2 ? 0.9 : 2.1; q[j ? 'lineTo' : 'moveTo'](hs[0] + Math.cos(sa2) * sr2, hs[1] + hs[2] + 2 + Math.sin(sa2) * sr2); } q.closePath(); q.fill(); });   // (stars hung from the eaves)
      // the roof: a crooked witch's hat of scalloped slates, with a patch, a gold band, a dormer and a chimney
      function roof() { q.beginPath(); q.moveTo(TX - 29, 66); q.quadraticCurveTo(TX - 9, 52, TX - 5, 22); q.quadraticCurveTo(TX - 2, 4, TX + 15, -2); q.quadraticCurveTo(TX + 4, 10, TX + 6, 26); q.quadraticCurveTo(TX + 10, 54, TX + 29, 66); q.quadraticCurveTo(TX, 70, TX - 29, 66); q.closePath(); }
      roof(); q.fillStyle = '#5a30a0'; q.fill(); q.save(); roof(); q.clip();
      for (var sy3 = 70, sr3 = 0; sy3 > -6; sy3 -= 3.6, sr3++) for (var sx3 = TX - 32 + (sr3 % 2) * 2.4; sx3 < TX + 32; sx3 += 4.8) { var sl = (sx3 - TX) / 30; q.fillStyle = 'hsl(' + Math.round(268 + R(sx3 * 3 + sr3) * 14) + ',55%,' + Math.round(52 - sl * 16 - R(sx3 + sr3 * 7) * 8) + '%)'; q.beginPath(); q.arc(sx3, sy3, 2.6, 0, Math.PI); q.fill(); q.strokeStyle = 'rgba(30,10,60,.45)'; q.lineWidth = 0.5; q.stroke(); }
      q.fillStyle = '#4a7ac0'; q.fillRect(TX + 2, 44, 6, 5.5); q.strokeStyle = '#ffe2a0'; q.lineWidth = 0.4; q.setLineDash([0.8, 0.8]); q.strokeRect(TX + 2, 44, 6, 5.5); q.setLineDash([]);
      var rs = q.createLinearGradient(TX - 30, 0, TX + 30, 0); rs.addColorStop(0, 'rgba(255,220,255,.25)'); rs.addColorStop(0.4, 'rgba(255,220,255,0)'); rs.addColorStop(1, 'rgba(15,5,40,.5)'); q.fillStyle = rs; q.fillRect(TX - 32, -6, 64, 78);
      q.restore(); roof(); q.strokeStyle = 'rgba(20,8,45,.6)'; q.lineWidth = 0.7; q.stroke();
      q.strokeStyle = '#ffd88a'; q.lineWidth = 2.6; q.beginPath(); q.moveTo(TX - 25, 63.2); q.quadraticCurveTo(TX, 58, TX + 25, 63.2); q.stroke(); q.strokeStyle = 'rgba(160,100,30,.6)'; q.lineWidth = 0.6; q.stroke();
      E(TX + 0.5, 60.6, 2.2, 2.2, '#ffd88a'); E(TX + 0.5, 60.6, 1, 1, '#c070ff');   // (a buckle with a gem in it)
      q.fillStyle = '#4a2a80'; q.fillRect(TX - 11, 49, 9, 8); q.fillStyle = '#ffd486'; arch(TX - 6.5, 53.4, 5, 6); q.fill(); q.strokeStyle = '#3c3064'; q.lineWidth = 0.5; q.beginPath(); q.moveTo(TX - 6.5, 50.4); q.lineTo(TX - 6.5, 56.4); q.stroke();   // (a dormer window)
      q.fillStyle = '#7a4ad0'; q.beginPath(); q.moveTo(TX - 13, 49.5); q.lineTo(TX - 6.5, 42.5); q.lineTo(TX, 49.5); q.closePath(); q.fill(); q.strokeStyle = '#ffd88a'; q.lineWidth = 0.6; q.beginPath(); q.moveTo(TX - 13, 49.5); q.lineTo(TX - 6.5, 42.5); q.lineTo(TX, 49.5); q.stroke();
      q.fillStyle = '#8a5a4a'; q.fillRect(TX + 10, 36, 6, 16); q.strokeStyle = 'rgba(40,20,20,.5)'; q.lineWidth = 0.4; for (j = 0; j < 5; j++) { q.beginPath(); q.moveTo(TX + 10, 38.5 + j * 3); q.lineTo(TX + 16, 38.5 + j * 3); q.stroke(); q.beginPath(); q.moveTo(TX + 13 + (j % 2) * 1.5 - 0.75, 38.5 + j * 3); q.lineTo(TX + 13 + (j % 2) * 1.5 - 0.75, 41.5 + j * 3); q.stroke(); }   // (a brick chimney)
      q.fillStyle = 'rgba(20,10,30,.35)'; q.fillRect(TX + 14, 36, 2, 16); q.fillStyle = '#5a3a3a'; q.fillRect(TX + 9, 34.4, 8, 2);
      // the weather vane: a gold ball, a rod and a crescent moon
      q.strokeStyle = '#e8c070'; q.lineWidth = 0.8; q.beginPath(); q.moveTo(TX + 15, -2); q.lineTo(TX + 15, -21); q.stroke(); E(TX + 15, -2, 1.7, 1.7, '#ffd88a');
      q.save(); E(TX + 15, -24.5, 3.6, 3.6, '#ffe08a'); q.globalCompositeOperation = 'destination-out'; E(TX + 16.8, -25.6, 3, 3, '#000'); q.restore();
      E(TX + 15, -8, 1, 1, '#ffd88a');
    } else {
      if (kind === 'tree') {
      q.fillStyle = '#5c3e34'; q.beginPath(); q.moveTo(146, 202); q.quadraticCurveTo(156, 160, 152, 120); q.lineTo(168, 120); q.quadraticCurveTo(166, 160, 176, 202); q.closePath(); q.fill();   // (the trunk)
      q.strokeStyle = '#5c3e34'; q.lineCap = 'round'; [[156, 132, 112, 96, 6], [164, 126, 212, 92, 6], [158, 124, 150, 74, 5], [162, 140, 196, 120, 4], [156, 146, 124, 128, 4]].forEach(function (b) { q.lineWidth = b[4]; q.beginPath(); q.moveTo(b[0], b[1]); q.quadraticCurveTo((b[0] + b[2]) / 2, b[1] - 10, b[2], b[3]); q.stroke(); });
      var halo = q.createRadialGradient(160, 92, 10, 160, 92, 110); halo.addColorStop(0, 'rgba(255,190,230,.45)'); halo.addColorStop(1, 'rgba(255,190,230,0)'); q.fillStyle = halo; q.fillRect(40, 0, 240, 200);
      for (k = 0; k < 70; k++) { var a2 = rnd(k + 600) * TAU, d2 = Math.sqrt(rnd(k + 700)), cx2 = 160 + Math.cos(a2) * d2 * 78, cy2 = 90 + Math.sin(a2) * d2 * 46 - (1 - d2) * 6, r2 = 9 + rnd(k + 800) * 10, sh = cy2 < 80 ? 1 : 0;
        var bg2 = q.createRadialGradient(cx2 - r2 * 0.3, cy2 - r2 * 0.4, 1, cx2, cy2, r2); bg2.addColorStop(0, sh ? '#ffe6f4' : '#ffc4e2'); bg2.addColorStop(1, ['#f27ab4', '#e86aa8', '#ff94c8', '#d860a0'][k % 4]); q.fillStyle = bg2; q.beginPath(); q.arc(cx2, cy2, r2, 0, TAU); q.fill(); }
      for (k = 0; k < 30; k++) { q.fillStyle = 'rgba(255,250,255,' + (0.5 + rnd(k + 900) * 0.5) + ')'; q.beginPath(); q.arc(90 + rnd(k + 950) * 140, 52 + rnd(k + 990) * 80, 1.4, 0, TAU); q.fill(); }   // (glints of light in the blossom)
      }
      q.fillStyle = 'rgba(255,170,215,.8)'; for (k = 0; k < 16; k++) { q.beginPath(); q.ellipse(70 + rnd(k + 1100) * 180, 196 + rnd(k + 1200) * 8, 3, 1.5, rnd(k) * 3, 0, TAU); q.fill(); }   // (fallen petals)
      [[94, 190], [228, 192]].forEach(function (m) { q.fillStyle = '#f2e6d8'; q.fillRect(m[0] - 1.5, m[1], 3, 7); q.fillStyle = '#ff7aa8'; q.beginPath(); q.arc(m[0], m[1], 6, Math.PI, 0); q.fill(); q.fillStyle = '#fff'; q.beginPath(); q.arc(m[0] - 2, m[1] - 3, 1, 0, TAU); q.arc(m[0] + 2.5, m[1] - 2, 0.9, 0, TAU); q.fill(); });   // (little toadstools)
    }
    return c;
  }
  var whaleStars = []; for (var ws = 0; ws < 26; ws++) whaleStars.push([-0.42 + rnd(ws + 8000) * 0.86, (rnd(ws + 8100) - 0.5) * 0.14, rnd(ws + 8200) * 6.28]);
  var isPetals = [];
  var SEA = [                                                       // (the cloud sea, back to front: hazy lavender far off, rosy and bright up close)
    { dy: -0.01, r: 0.085, v: 4, hl: '#f6e2f6', mid: '#c9a6dc', sh: '#8f74b4', hlA: '250,236,250', shA: '120,92,160', base: '#9b7cbc', rim: 'rgba(255,240,250,.45)', blur: 2 },
    { dy: 0.06, r: 0.11, v: 8, hl: '#ffe6f2', mid: '#e8b4d4', sh: '#a87cbc', hlA: '255,238,246', shA: '150,104,170', base: '#b688c4', rim: 'rgba(255,236,230,.6)', blur: 1 },
    { dy: 0.13, r: 0.14, v: 13, hl: '#fff6f2', mid: '#f8cadc', sh: '#c48cbc', hlA: '255,250,244', shA: '180,120,176', base: '#d39ac8', rim: 'rgba(255,240,220,.8)', blur: 0 }
  ], seaSpr = {};
  function makeSea(li, W0, rB) {                                     // (one band of billowing cloud, painted once, wide enough to wrap round)
    var sl = SEA[li], h = Math.round(rB * 3.2), S = Math.min(2, window.devicePixelRatio || 1), c = document.createElement('canvas'); c.width = Math.round(W0 * S); c.height = Math.round(h * S);
    var q = c.getContext('2d'); q.scale(S, S); var tops = [], k, j, base = rB * 1.7;
    function R(n) { return rnd(n * 1.91 + li * 131 + 7); }
    if (sl.blur) q.filter = 'blur(' + sl.blur + 'px)';
    var under = q.createLinearGradient(0, base - rB * 0.2, 0, h); under.addColorStop(0, sl.mid); under.addColorStop(1, sl.base); q.fillStyle = under; q.fillRect(0, base, W0, h - base);
    var circ = [], n = Math.ceil(W0 / (rB * 1.25));
    for (k = 0; k < n; k++) {                                         // (each billow a heap of puffs: big ones low, smaller ones piled on top)
      var bx = (k + R(k) * 0.5) * W0 / n, bh = 0.7 + R(k + 40) * 0.6, bw = rB * (0.9 + R(k + 80) * 0.5);
      for (j = 0; j < 14; j++) { var u = R(k * 31 + j), lvl = j < 6 ? 0 : j < 11 ? 1 : 2, px = bx + (u - 0.5) * bw * (lvl === 0 ? 2.2 : lvl === 1 ? 1.4 : 0.8), pr = rB * (lvl === 0 ? 0.55 : lvl === 1 ? 0.42 : 0.3) * (0.75 + R(k * 31 + j + 9) * 0.5), py = base + rB * 0.25 - lvl * rB * 0.42 * bh - R(k * 31 + j + 17) * rB * 0.15; circ.push([px, py, pr]); }
    }
    circ.sort(function (a, b) { return b[1] - a[1]; });               // (lower puffs first, so the ones above sit over them)
    var body = q.createLinearGradient(0, base - rB * 1.4, 0, base + rB * 0.5); body.addColorStop(0, sl.hl); body.addColorStop(0.45, sl.mid); body.addColorStop(1, sl.sh);   // (all the puffs merged into one soft mass)
    q.fillStyle = body; q.beginPath(); circ.forEach(function (cc) { [-W0, 0, W0].forEach(function (wx) { var x = cc[0] + wx; if (x + cc[2] < 0 || x - cc[2] > W0) return; q.moveTo(x + cc[2], cc[1]); q.arc(x, cc[1], cc[2], 0, TAU); }); }); q.fill();
    q.filter = 'none'; q.globalCompositeOperation = 'source-atop';   // (then light and shade painted softly onto it: shade beneath each puff, light on its crown)
    circ.forEach(function (cc) { [-W0, 0, W0].forEach(function (wx) { var x = cc[0] + wx; if (x + cc[2] < 0 || x - cc[2] > W0) return;
      var sg = q.createRadialGradient(x + cc[2] * 0.1, cc[1] + cc[2] * 0.75, 0, x + cc[2] * 0.1, cc[1] + cc[2] * 0.75, cc[2] * 0.95); sg.addColorStop(0, 'rgba(' + sl.shA + ',.42)'); sg.addColorStop(1, 'rgba(' + sl.shA + ',0)'); q.fillStyle = sg; q.fillRect(x - cc[2] * 1.2, cc[1] - cc[2] * 0.3, cc[2] * 2.4, cc[2] * 2.2);
      var hg2 = q.createRadialGradient(x - cc[2] * 0.25, cc[1] - cc[2] * 0.45, 0, x - cc[2] * 0.25, cc[1] - cc[2] * 0.45, cc[2] * 0.85); hg2.addColorStop(0, 'rgba(' + sl.hlA + ',.75)'); hg2.addColorStop(0.6, 'rgba(' + sl.hlA + ',.25)'); hg2.addColorStop(1, 'rgba(' + sl.hlA + ',0)'); q.fillStyle = hg2; q.fillRect(x - cc[2] * 1.2, cc[1] - cc[2] * 1.4, cc[2] * 2.2, cc[2] * 2); }); });
    var warm = q.createLinearGradient(0, 0, 0, base); warm.addColorStop(0, 'rgba(255,214,190,.35)'); warm.addColorStop(1, 'rgba(255,214,190,0)'); q.fillStyle = warm; q.fillRect(0, 0, W0, base);   // (the sunrise warming their tops)
    q.globalCompositeOperation = 'source-over';
    circ.forEach(function (cc, ci) { if (ci % 5 === 0 && cc[1] < base - rB * 0.3 && cc[0] > 0 && cc[0] < W0) tops.push([cc[0] - cc[2] * 0.2, cc[1] - cc[2] * 0.85]); });
    var haze = q.createLinearGradient(0, 0, 0, h); haze.addColorStop(0, 'rgba(255,220,235,0)'); haze.addColorStop(0.7, 'rgba(255,220,235,0)'); haze.addColorStop(1, 'rgba(160,110,180,.35)'); q.fillStyle = haze; q.fillRect(0, 0, W0, h);
    return { c: c, h: h, tops: tops.slice(0, 14) };
  }
  var branchSpr = {};
  function makeBranch(sz, seed) {                                    // (a flowering branch, dark against the sky, thick with blossom)
    var c = document.createElement('canvas'); c.width = Math.round(sz * 1.25 * 2); c.height = sz * 2; var q = c.getContext('2d'); q.scale(2, 2); var W2 = sz * 1.25, H2 = sz, k, j;
    function R(n) { return rnd(n * 2.17 + seed * 97 + 11); }
    var limbs = [[0, H2 * 0.14, W2 * 0.5, H2 * 0.1, W2 * 0.98, H2 * (0.36 + seed * 0.06), sz * 0.05]];
    for (k = 0; k < 5; k++) { var tt = 0.2 + k * 0.15, bx = (1 - tt) * (1 - tt) * limbs[0][0] + 2 * (1 - tt) * tt * limbs[0][2] + tt * tt * limbs[0][4], by = (1 - tt) * (1 - tt) * limbs[0][1] + 2 * (1 - tt) * tt * limbs[0][3] + tt * tt * limbs[0][5], up = k % 2 ? -1 : 1;
      limbs.push([bx, by, bx + W2 * 0.06, by + up * H2 * 0.12, bx + W2 * (0.1 + R(k) * 0.1), by + up * H2 * (0.16 + R(k + 5) * 0.16), sz * 0.022 * (1 - tt * 0.5)]); }
    var pts2 = [];
    limbs.forEach(function (lb, li) { for (var s = 0; s < 14; s++) { var a = s / 14, b = (s + 1) / 14; function pt(u) { return [(1 - u) * (1 - u) * lb[0] + 2 * (1 - u) * u * lb[2] + u * u * lb[4], (1 - u) * (1 - u) * lb[1] + 2 * (1 - u) * u * lb[3] + u * u * lb[5]]; } var p0 = pt(a), p1 = pt(b);
      q.strokeStyle = '#2e1830'; q.lineCap = 'round'; q.lineWidth = lb[6] * (1 - a * 0.75); q.beginPath(); q.moveTo(p0[0], p0[1]); q.lineTo(p1[0], p1[1]); q.stroke();
      q.strokeStyle = 'rgba(160,110,150,.35)'; q.lineWidth = lb[6] * (1 - a * 0.75) * 0.3; q.beginPath(); q.moveTo(p0[0], p0[1] - lb[6] * 0.2); q.lineTo(p1[0], p1[1] - lb[6] * 0.2); q.stroke();
      if (s % (li ? 3 : 2) === 1 && a > 0.12) pts2.push(p1); } });
    pts2.forEach(function (p, pi) { var nfl = 4 + Math.floor(R(pi + 40) * 5), fs = sz * 0.018;   // (clusters of blossom along it)
      for (j = 0; j < nfl; j++) { var fx = p[0] + (R(pi * 9 + j) - 0.5) * sz * 0.07, fy = p[1] + (R(pi * 9 + j + 3) - 0.5) * sz * 0.06, s2 = fs * (0.8 + R(pi * 9 + j + 6) * 0.6), lit = fy < p[1] ? 1 : 0;
        for (var pe = 0; pe < 5; pe++) { var pa = pe / 5 * TAU + R(pi + j) * 2; q.fillStyle = lit ? (j % 3 ? '#ffd2e8' : '#fff0f6') : (j % 3 ? '#f0a0c8' : '#e488b8'); q.beginPath(); q.ellipse(fx + Math.cos(pa) * s2 * 0.55, fy + Math.sin(pa) * s2 * 0.55, s2 * 0.52, s2 * 0.42, pa, 0, TAU); q.fill(); }
        q.fillStyle = '#d0507e'; q.beginPath(); q.arc(fx, fy, s2 * 0.24, 0, TAU); q.fill(); q.fillStyle = '#ffe08a'; q.beginPath(); q.arc(fx, fy, s2 * 0.1, 0, TAU); q.fill(); }
      if (pi % 3 === 0) { q.fillStyle = '#5a8a4a'; q.save(); q.translate(p[0], p[1]); q.rotate(R(pi + 70) * 6); q.beginPath(); q.moveTo(0, 0); q.quadraticCurveTo(fs, -fs * 0.8, fs * 2.4, 0); q.quadraticCurveTo(fs, fs * 0.8, 0, 0); q.fill(); q.restore(); }
    });
    return c;
  }
  function drawScene(now) {                                          // (the dawn sky, with no land in it: you float in front of it in 3D once the game's built)
    var t = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
    var sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#140f36'); sky.addColorStop(0.32, '#2e2268'); sky.addColorStop(0.58, '#6e3f98'); sky.addColorStop(0.78, '#d0789e'); sky.addColorStop(0.92, '#f6b896'); sky.addColorStop(1, '#ffdcb4');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    glow(W * 0.5, H * 1.02, Math.max(W, H) * 0.7, 'rgba(255,206,160,A)', 0.6);   // (the dawn coming up from below)
    glow(W * 0.5, H * 0.55, Math.min(W, H) * 0.55, 'rgba(255,170,230,A)', 0.18); // (a soft pink haze behind where you float)
    for (var a = 0; a < 3; a++) {                                      // (the aurora)
      g.beginPath(); var base = H * (0.12 + a * 0.06);
      for (var x = -20; x <= W + 20; x += 20) { var y = base + Math.sin(x * 0.006 + t * 0.25 + a * 2) * H * 0.04 + Math.sin(x * 0.017 - t * 0.4) * H * 0.012; if (x === -20) g.moveTo(x, y); else g.lineTo(x, y); }
      for (x = W + 20; x >= -20; x -= 20) { y = base + H * 0.11 + Math.sin(x * 0.006 + t * 0.25 + a * 2 + 0.6) * H * 0.04; g.lineTo(x, y); }
      g.closePath(); var ag = g.createLinearGradient(0, base, 0, base + H * 0.13); ag.addColorStop(0, 'rgba(255,255,255,0)'); ag.addColorStop(0.5, ['rgba(120,255,210,.16)', 'rgba(200,140,255,.14)', 'rgba(255,150,220,.12)'][a]); ag.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = ag; g.fill();
    }
    stars.forEach(function (s) {                                       // (the stars, fading toward the dawn)
      var tw = 0.45 + 0.55 * Math.sin(t * s.s + s.p), fade = 1 - s.y / 0.62 * 0.7;
      g.fillStyle = 'rgba(255,248,235,' + (tw * fade) + ')'; g.beginPath(); g.arc(s.x * W, s.y * H, s.r, 0, TAU); g.fill();
      if (s.big) { glow(s.x * W, s.y * H, 10, 'rgba(255,240,220,A)', tw * 0.5 * fade); spark4(s.x * W, s.y * H, 3 + tw * 5, 'rgba(255,245,230,' + (tw * 0.7 * fade) + ')'); }
    });
    if (!shoot && Math.random() < dt * 0.25) shoot = { x: Math.random() * W * 0.7 + W * 0.2, y: Math.random() * H * 0.25, life: 0 };   // (now and then, a shooting star)
    if (shoot) { shoot.life += dt; var sp = shoot.life * 700, sx = shoot.x - sp, sy = shoot.y + sp * 0.35, sa = Math.max(0, 1 - shoot.life / 0.9); var sg = g.createLinearGradient(sx, sy, sx + 120, sy - 42); sg.addColorStop(0, 'rgba(255,255,255,' + sa + ')'); sg.addColorStop(1, 'rgba(255,255,255,0)'); g.strokeStyle = sg; g.lineWidth = 2; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + 120, sy - 42); g.stroke(); if (shoot.life > 0.9) shoot = null; }
    var mx = W * 0.16, my = H * 0.17, mr = Math.min(W, H) * 0.055;       // (the crescent moon)
    glow(mx, my, mr * 4, 'rgba(255,240,210,A)', 0.25);
    if (!moonSpr) {
      moonSpr = document.createElement('canvas'); moonSpr.width = moonSpr.height = 128; var mg = moonSpr.getContext('2d');
      var mgr = mg.createRadialGradient(54, 54, 10, 64, 64, 60); mgr.addColorStop(0, '#fffaf0'); mgr.addColorStop(1, '#ffe6b8'); mg.fillStyle = mgr; mg.beginPath(); mg.arc(64, 64, 58, 0, TAU); mg.fill();
      mg.fillStyle = 'rgba(230,200,170,.35)'; [[40, 80, 7], [52, 42, 5], [30, 58, 4]].forEach(function (c) { mg.beginPath(); mg.arc(c[0], c[1], c[2], 0, TAU); mg.fill(); });
      mg.globalCompositeOperation = 'destination-out'; mg.beginPath(); mg.arc(94, 52, 54, 0, TAU); mg.fill();
    }
    g.drawImage(moonSpr, mx - mr, my - mr, mr * 2, mr * 2);
    clouds.forEach(function (c) {                                      // (soft wisps of cloud drifting by, nearer ones faster)
      c.x = (c.x + c.sp * dt * (0.5 + c.layer * 0.6)) % 1.3;
      cloud((c.x - 0.15) * W, (c.layer === 2 ? 0.88 : c.y) * H, c.w * W * (1 + c.layer * 0.3), ['rgba(255,190,220,.12)', 'rgba(255,205,225,.15)', 'rgba(255,215,230,.22)'][c.layer]);
    });
      g.save(); g.translate(W / 2, H * 0.6); g.rotate(t * 0.012); var RL = Math.max(W, H) * 1.1;   // (rays of dawn light fanning out from behind you all)
      for (var ry = 0; ry < 16; ry++) { g.rotate(TAU / 16); var rg2 = g.createLinearGradient(0, 0, 0, -RL); rg2.addColorStop(0, 'rgba(255,225,205,' + (ry % 2 ? 0.07 : 0.12) + ')'); rg2.addColorStop(1, 'rgba(255,225,205,0)'); g.fillStyle = rg2; g.beginPath(); g.moveTo(0, 0); g.lineTo(-RL * (ry % 3 ? 0.07 : 0.11), -RL); g.lineTo(RL * (ry % 3 ? 0.07 : 0.11), -RL); g.closePath(); g.fill(); }
      g.restore();
    // ----- the magic in the sky -----
    var px0 = W * (W < H ? 0.8 : 0.84), py0 = H * (W < H ? 0.24 : 0.2), pr = Math.min(W, H) * 0.075;   // (a ringed pastel planet)
    if (!planetSpr) {
      planetSpr = document.createElement('canvas'); planetSpr.width = 256; planetSpr.height = 160; var pg = planetSpr.getContext('2d');
      pg.translate(128, 80); pg.rotate(-0.32);
      pg.strokeStyle = 'rgba(255,220,250,.45)'; pg.lineWidth = 7; pg.beginPath(); pg.ellipse(0, 0, 112, 26, 0, Math.PI, TAU); pg.stroke();
      pg.strokeStyle = 'rgba(200,170,255,.35)'; pg.lineWidth = 4; pg.beginPath(); pg.ellipse(0, 0, 96, 21, 0, Math.PI, TAU); pg.stroke();
      var pgr = pg.createRadialGradient(-18, -20, 6, 0, 0, 56); pgr.addColorStop(0, '#ffe2f4'); pgr.addColorStop(0.55, '#d8a6f0'); pgr.addColorStop(1, '#7a58b8');
      pg.fillStyle = pgr; pg.beginPath(); pg.arc(0, 0, 54, 0, TAU); pg.fill();
      pg.save(); pg.clip(); pg.fillStyle = 'rgba(255,255,255,.12)'; [-26, -6, 16, 34].forEach(function (b, k) { pg.fillRect(-60, b, 120, 6 + k * 2); }); pg.restore();
      pg.strokeStyle = 'rgba(255,220,250,.75)'; pg.lineWidth = 7; pg.beginPath(); pg.ellipse(0, 0, 112, 26, 0, 0, Math.PI); pg.stroke();
      pg.strokeStyle = 'rgba(200,170,255,.6)'; pg.lineWidth = 4; pg.beginPath(); pg.ellipse(0, 0, 96, 21, 0, 0, Math.PI); pg.stroke();
    }
    glow(px0, py0, pr * 3.2, 'rgba(220,170,255,A)', 0.3);
    g.globalAlpha = 0.9; g.drawImage(planetSpr, px0 - pr * 2.37, py0 - pr * 1.48 + Math.sin(t * 0.3) * 3, pr * 4.74, pr * 2.96); g.globalAlpha = 1;
    var WL = Math.min(W, H) * (W < H ? 0.5 : 0.36), wx = ((t * 0.011 + 0.35) % 1.5 - 0.25) * W, wy = H * (W < H ? 0.27 : 0.34) + Math.sin(t * 0.25) * H * 0.02;   // (a great whale of starlight, swimming slowly across the sky)
    g.save(); g.translate(wx, wy); g.rotate(Math.sin(t * 0.25 + 1) * 0.04);
    var wg = g.createLinearGradient(0, -WL * 0.12, 0, WL * 0.12); wg.addColorStop(0, 'rgba(160,200,255,.2)'); wg.addColorStop(1, 'rgba(220,170,255,.12)');
    var fl2 = Math.sin(t * 1.1) * 0.35;
    g.fillStyle = wg; g.strokeStyle = 'rgba(220,235,255,.35)'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(WL * 0.5, -WL * 0.01); g.bezierCurveTo(WL * 0.46, -WL * 0.12, WL * 0.1, -WL * 0.13, -WL * 0.25, -WL * 0.05); g.quadraticCurveTo(-WL * 0.4, -WL * 0.02, -WL * 0.47, WL * fl2 * 0.05);
    g.quadraticCurveTo(-WL * 0.4, WL * 0.05, -WL * 0.2, WL * 0.07); g.bezierCurveTo(WL * 0.1, WL * 0.15, WL * 0.42, WL * 0.13, WL * 0.5, -WL * 0.01); g.fill(); g.stroke();
    g.save(); g.translate(-WL * 0.47, WL * fl2 * 0.05); g.rotate(fl2 * 0.6); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-WL * 0.06, -WL * 0.1, -WL * 0.16, -WL * 0.11); g.quadraticCurveTo(-WL * 0.08, -WL * 0.02, 0, 0); g.quadraticCurveTo(-WL * 0.08, WL * 0.02, -WL * 0.16, WL * 0.11); g.quadraticCurveTo(-WL * 0.06, WL * 0.1, 0, 0); g.fill(); g.stroke(); g.restore();   // (the tail flukes)
    g.save(); g.translate(WL * 0.16, WL * 0.08); g.rotate(0.5 + Math.sin(t * 1.1 + 1) * 0.25); g.beginPath(); g.ellipse(-WL * 0.06, 0, WL * 0.08, WL * 0.022, 0, 0, TAU); g.fill(); g.stroke(); g.restore();   // (a flipper)
    g.strokeStyle = 'rgba(220,235,255,.18)'; for (var gv = 0; gv < 4; gv++) { g.beginPath(); g.moveTo(WL * 0.42, WL * (0.04 + gv * 0.018)); g.quadraticCurveTo(WL * 0.2, WL * (0.1 + gv * 0.016), WL * 0.02, WL * (0.07 + gv * 0.012)); g.stroke(); }   // (the grooves of its belly)
    whaleStars.forEach(function (st) { var tw = 0.5 + 0.5 * Math.sin(t * 2 + st[2] * 3); g.fillStyle = 'rgba(255,250,240,' + (0.35 + 0.5 * tw) + ')'; g.beginPath(); g.arc(st[0] * WL, st[1] * WL * (1 - Math.abs(st[0]) * 0.9), 0.8 + tw, 0, TAU); g.fill(); });
    g.strokeStyle = 'rgba(255,250,240,.3)'; g.beginPath(); whaleStars.slice(0, 7).forEach(function (st, k) { g[k ? 'lineTo' : 'moveTo'](st[0] * WL, st[1] * WL * (1 - Math.abs(st[0]) * 0.9)); }); g.stroke();   // (a constellation inside it)
    g.restore();
    glow(wx + WL * 0.36, wy - WL * 0.03, 8, 'rgba(255,255,255,A)', 0.8); g.fillStyle = '#fff'; g.beginPath(); g.arc(wx + WL * 0.36, wy - WL * 0.03, 1.8, 0, TAU); g.fill();   // (its kind eye)
    for (var tr = 0; tr < 10; tr++) { var tf = tr / 10; glow(wx - WL * (0.6 + tf * 0.9), wy + Math.sin(t * 1.3 - tr * 0.7) * WL * 0.05, 6 - tf * 4, 'rgba(210,225,255,A)', 0.6 * (1 - tf)); }   // (a trail of stardust)
    var tall2 = W < H, TX = 170;                                       // (two floating islands, far off: a wizard's tower with its waterfall, and a blossom tree)
    [['tower', tall2 ? 0.25 : 0.16, tall2 ? 0.37 : 0.6, 0, tall2 ? W * 0.5 : Math.min(W * 0.3, H * 0.56)], ['tree', tall2 ? 0.83 : 0.87, tall2 ? 0.44 : 0.56, 2, tall2 ? W * 0.32 : Math.min(W * 0.18, H * 0.34)]].forEach(function (il) {
      var kind2 = il[0] === 'tree' && window.EVERDAWN_TREE_IMG ? 'treebare' : il[0], spr = isles[kind2] || (isles[kind2] = makeIsle(kind2)), sc = il[4] / 320, ix = il[1] * W, iy = il[2] * H + Math.sin(t * 0.5 + il[3]) * 6, d;
      function P(x, y) { return [ix + (x - 160) * sc, iy + (y - 200) * sc]; }
      glow(ix, iy + 40 * sc, 170 * sc, il[0] === 'tree' ? 'rgba(255,160,220,A)' : 'rgba(170,160,255,A)', 0.25);
      if (il[0] === 'tower') {
        var cp = P(TX + 13, 33);                                       // (smoke curling up from the chimney)
        for (d = 0; d < 8; d++) { var sp2 = (t * 0.18 + d / 8) % 1; g.fillStyle = 'rgba(232,222,250,' + (0.32 * (1 - sp2) * Math.min(1, sp2 * 6)) + ')'; g.beginPath(); g.arc(cp[0] + (sp2 * 26 + Math.sin(t + d * 2) * 3 * sp2) * sc, cp[1] - sp2 * 64 * sc, (2.4 + sp2 * 10) * sc, 0, TAU); g.fill(); }
      }
      g.drawImage(spr, ix - 160 * sc, iy - 230 * sc, 320 * sc, 390 * sc);
      if (il[0] === 'tower') {
        [[96, 330, 9, 0], [214, 356, 7, 1.7], [256, 300, 6, 3.1]].forEach(function (fr) {   // (little rocks floating loose beneath it)
          var fp3 = P(fr[0], fr[1] + Math.sin(t * 0.9 + fr[3]) * 5), r3 = fr[2] * sc;
          glow(fp3[0], fp3[1] + r3 * 0.6, r3 * 2.4, 'rgba(200,170,255,A)', 0.25);
          g.fillStyle = '#6c5294'; g.beginPath(); g.moveTo(fp3[0] - r3, fp3[1]); g.lineTo(fp3[0] + r3, fp3[1] - r3 * 0.1); g.lineTo(fp3[0] + r3 * 0.3, fp3[1] + r3 * 1.3); g.lineTo(fp3[0] - r3 * 0.4, fp3[1] + r3 * 0.9); g.closePath(); g.fill();
          g.fillStyle = 'rgba(30,15,60,.45)'; g.beginPath(); g.moveTo(fp3[0] + r3, fp3[1] - r3 * 0.1); g.lineTo(fp3[0] + r3 * 0.3, fp3[1] + r3 * 1.3); g.lineTo(fp3[0] + r3 * 0.1, fp3[1] + r3 * 0.2); g.closePath(); g.fill();
          g.fillStyle = '#5aa88a'; g.beginPath(); g.ellipse(fp3[0], fp3[1] - r3 * 0.05, r3, r3 * 0.25, 0, 0, TAU); g.fill();
        });
        var L0 = P(230, 214), bot = P(233, 480), ws1 = 8.5 * sc, wsb = 26 * sc, wd;   // (the waterfall: over the lip, and away into the clouds below)
        glow(L0[0], (L0[1] + bot[1]) / 2 - 40 * sc, 80 * sc, 'rgba(150,215,255,A)', 0.35);
        function sheet(x0, y0, wa, x1, y1, wb, a0) { var gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(230,250,255,' + a0 + ')'); gr.addColorStop(0.55, 'rgba(165,218,255,' + a0 * 0.8 + ')'); gr.addColorStop(1, 'rgba(165,218,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x0 - wa, y0); g.bezierCurveTo(x0 - wa - sc, y0 + (y1 - y0) * 0.3, x1 - wb, y1 - (y1 - y0) * 0.4, x1 - wb, y1); g.lineTo(x1 + wb, y1); g.bezierCurveTo(x1 + wb, y1 - (y1 - y0) * 0.4, x0 + wa + sc, y0 + (y1 - y0) * 0.3, x0 + wa, y0); g.closePath(); g.fill(); }
        function edges(x0, y0, wa, x1, y1, wb) { g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = Math.max(1, 1.1 * sc); [-1, 1].forEach(function (s) { g.beginPath(); g.moveTo(x0 + s * wa * 0.9, y0); g.quadraticCurveTo(x0 + s * (wa + sc), (y0 + y1) / 2, x0 + (x1 - x0) * 0.7 + s * (wa + (wb - wa) * 0.7) * 0.9, y0 + (y1 - y0) * 0.7); g.stroke(); }); }
        function streaks(x0, y0, wa, x1, y1, wb, n, spd, seed) { for (var s = 0; s < n; s++) { var ph = (t * spd + s / n + rnd(s + seed) * 0.5) % 1, x = x0 + (x1 - x0) * ph + (rnd(s + seed + 50) - 0.5) * 1.7 * (wa + (wb - wa) * ph), a = (1 - ph * 0.85) * (0.45 + 0.55 * rnd(s + seed + 90)); g.fillStyle = 'rgba(255,255,255,' + a * 0.9 + ')'; g.fillRect(x - 0.6 * Math.max(1, sc), y0 + (y1 - y0) * ph, 1.2 * Math.max(1, sc), (5 + 16 * ph) * sc); } }
        sheet(L0[0], L0[1], ws1, bot[0], bot[1], wsb, 0.9); edges(L0[0], L0[1], ws1, bot[0], bot[1], wsb); streaks(L0[0], L0[1], ws1, bot[0], bot[1], wsb, 60, 0.5, 9700);
        for (wd = 0; wd < 6; wd++) glow(L0[0] + (wd - 2.5) * 3 * sc, L0[1] + sc, (4 + 2 * Math.sin(t * 6 + wd * 2)) * sc, 'rgba(255,255,255,A)', 0.75);   // (foam where it curls over the lip)
        for (wd = 0; wd < 12; wd++) { var dp2 = (t * 0.7 + wd / 12) % 1, sd3 = wd % 2 ? 1 : -1; g.fillStyle = 'rgba(230,248,255,' + 0.7 * (1 - dp2) + ')'; g.beginPath(); g.arc(L0[0] + sd3 * (ws1 + dp2 * 9 * sc), L0[1] + dp2 * dp2 * 90 * sc, Math.max(0.6, sc), 0, TAU); g.fill(); }   // (droplets breaking off)
        for (wd = 0; wd < 14; wd++) { var sp5 = (t * 0.45 + wd / 14) % 1, sx5 = L0[0] + (bot[0] - L0[0]) * sp5 + (rnd(wd + 9900) - 0.5) * 1.6 * (ws1 * 1.25 + (wsb - ws1 * 1.25) * sp5), tw2 = Math.max(0, Math.sin(t * 9 + wd * 2.3)); spark4(sx5, L0[1] + (bot[1] - L0[1]) * sp5, (1.2 + 2.4 * tw2) * Math.max(1, sc), 'rgba(255,255,255,' + tw2 * (1 - sp5) + ')'); }   // (glints of light in the water)
        var mb = bot[1] - 70 * sc; for (wd = 0; wd < 10; wd++) { var mp = (t * 0.16 + wd / 10) % 1; glow(bot[0] + (wd - 4.5) * 8 * sc + mp * 12 * sc * (wd % 2 ? 1 : -1), mb + 24 * sc - mp * 36 * sc, (18 + mp * 30) * sc, 'rgba(232,244,255,A)', 0.45 * Math.sin(mp * Math.PI)); }   // (mist billowing up from far below)
        g.save(); g.globalAlpha = 0.3 + 0.08 * Math.sin(t * 0.7); g.lineWidth = 2.4 * sc; ['#ff7a8a', '#ffc070', '#fff08a', '#8ef0a0', '#8ac8ff', '#c09aff'].forEach(function (col, ci) { g.strokeStyle = col; g.beginPath(); g.arc(bot[0], mb + 26 * sc, (44 - ci * 2.4) * sc, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); }); g.restore();   // (a rainbow in the spray)
        var pc = P(226, 202.4); for (wd = 0; wd < 3; wd++) { var rp2 = (t * 0.35 + wd / 3) % 1; g.strokeStyle = 'rgba(255,255,255,' + 0.55 * (1 - rp2) + ')'; g.lineWidth = Math.max(0.5, 0.5 * sc); g.beginPath(); g.ellipse(pc[0] + (wd - 1) * 5 * sc, pc[1] + (wd % 2) * sc, (0.6 + rp2 * 5) * sc, (0.2 + rp2 * 1.3) * sc, 0, 0, TAU); g.stroke(); }   // (ripples on the pond)
        for (wd = 0; wd < 5; wd++) { var sp4 = (t * 0.9 + wd / 5) % 1, a1 = P(222 + wd * 3.2, 205 + sp4 * 9); g.fillStyle = 'rgba(255,255,255,' + 0.8 * Math.sin(sp4 * Math.PI) + ')'; g.fillRect(a1[0], a1[1], 2 * sc, 0.6 * sc); }   // (the stream running to the edge)
        for (wd = 0; wd < 12; wd++) { var lt2 = (wd + 0.5) / 12, lp = P((1 - lt2) * (1 - lt2) * (TX + 32) + 2 * (1 - lt2) * lt2 * (TX + 70) + lt2 * lt2 * 276, (1 - lt2) * (1 - lt2) * 92 + 2 * (1 - lt2) * lt2 * 158 + lt2 * lt2 * 173 + 1); glow(lp[0], lp[1], 3.4 * sc, ['rgba(255,210,122,A)', 'rgba(255,156,204,A)', 'rgba(154,224,255,A)', 'rgba(184,255,154,A)'][wd % 4], 0.5 + 0.5 * Math.sin(t * 3 + wd * 1.3)); }   // (the string lights twinkling)
        for (wd = 0; wd < 8; wd++) { var fr2 = P(200 + Math.cos(wd / 8 * TAU) * 9, 209.4 + Math.sin(wd / 8 * TAU) * 2.6); glow(fr2[0], fr2[1], 3 * sc, 'rgba(120,255,230,A)', 0.4 + 0.3 * Math.sin(t * 2 + wd)); }   // (the fairy ring glowing)
        var cvp = P(112, 253), ch = 70 * sc, cg3 = g.createLinearGradient(0, cvp[1], 0, cvp[1] + ch); cg3.addColorStop(0, 'rgba(180,240,255,.55)'); cg3.addColorStop(1, 'rgba(180,240,255,0)'); g.fillStyle = cg3; g.fillRect(cvp[0] - 1.2 * sc, cvp[1], 2.4 * sc, ch);   // (a trickle from the spring in the cave)
        for (d = 0; d < 3; d++) { var tp2 = (t * 0.5 + d / 3) % 1; g.fillStyle = 'rgba(255,255,255,' + 0.7 * (1 - tp2) + ')'; g.fillRect(cvp[0] - 0.5, cvp[1] + tp2 * ch, 1, 5 * sc); }
        var fk = 0.75 + 0.25 * Math.sin(t * 7) * Math.sin(t * 3.3);   // (lamplight in the windows, flickering)
        [[TX - 7, 152, 12], [TX + 8, 124, 11], [TX, 81, 11], [TX - 6.5, 53, 8], [TX + 17, 183, 9], [129, 167, 9], [TX - 2, 181.5, 5], [135, 242.8, 7], [281, 177.5, 9]].forEach(function (w, wi) { var wp = P(w[0], w[1]); glow(wp[0], wp[1], w[2] * sc * 1.6, 'rgba(255,205,120,A)', 0.6 * (wi % 2 ? fk : 1.6 - fk)); });
        var cpot = P(130, 190.6); glow(cpot[0], cpot[1], 10 * sc, 'rgba(120,255,150,A)', 0.55 + 0.15 * Math.sin(t * 5));   // (the cauldron bubbling)
        for (d = 0; d < 4; d++) { var bp = (t * 0.7 + d / 4) % 1; g.strokeStyle = 'rgba(170,255,180,' + (0.8 * (1 - bp)) + ')'; g.lineWidth = 0.8; g.beginPath(); g.arc(cpot[0] + (rnd(d + 9200) - 0.5) * 7 * sc + Math.sin(t * 3 + d) * sc, cpot[1] - bp * 14 * sc, (0.8 + bp * 1.4) * sc, 0, TAU); g.stroke(); }
        var pp2 = P(TX + 15, -15), wv = Math.sin(t * 4); g.fillStyle = '#ff8cc0'; g.beginPath(); g.moveTo(pp2[0], pp2[1]); g.quadraticCurveTo(pp2[0] + 7 * sc, pp2[1] + (wv * 2 - 0.5) * sc, pp2[0] + 14 * sc, pp2[1] + (2.6 + Math.sin(t * 4 - 1.2) * 2) * sc); g.quadraticCurveTo(pp2[0] + 7 * sc, pp2[1] + (5 + wv * 2) * sc, pp2[0], pp2[1] + 5 * sc); g.fill();   // (a pennant on the weather vane)
        for (d = 0; d < 9; d++) { var fa = t * (0.3 + rnd(d + 9300) * 0.3) + d * 0.7, fp = P(160 + Math.cos(fa) * (60 + rnd(d + 9400) * 80), 170 + Math.sin(fa * 1.3) * 40 - rnd(d + 9500) * 40), fo = Math.max(0, Math.sin(t * 2 + d * 1.9)); glow(fp[0], fp[1], 5 * sc, 'rgba(230,255,150,A)', fo * 0.8); }   // (fireflies)
      } else {
        var tp = P(160, 90); glow(tp[0], tp[1], 90 * sc, 'rgba(255,190,235,A)', 0.2 + 0.08 * Math.sin(t * 1.5));
        var DT = window.EVERDAWN_TREE_IMG; if (DT) { var dtw = 330 * sc, dth = dtw * DT.aspect, db = P(160, 201); g.drawImage(DT.img, db[0] - DT.bx * dtw, db[1] - DT.by * dth, dtw, dth); }   // (your very own Dawn Tree)
        if (isPetals.length < 14 && Math.random() < dt * 3) isPetals.push({ x: (Math.random() - 0.5) * 140, y: 100, life: 0, r: Math.random() * 6 });
        isPetals = isPetals.filter(function (pp) { pp.life += dt; pp.x += Math.sin(pp.life * 2 + pp.r) * 12 * dt + 6 * dt; pp.y += 16 * dt; pp.r += dt * 2; var pq = P(160 + pp.x, pp.y); g.fillStyle = 'rgba(255,180,220,' + Math.max(0, 1 - pp.life / 9) + ')'; g.beginPath(); g.ellipse(pq[0], pq[1], 2.4, 1.2, pp.r, 0, TAU); g.fill(); return pp.life < 9; });   // (petals drifting off the tree)
      }
    });
    if (petals.length < 30 && Math.random() < dt * 4) petals.push({ x: Math.random() * W, y: -10, vx: 10 + Math.random() * 25, vy: 18 + Math.random() * 18, r: Math.random() * TAU, life: 0 });   // (blossom petals drifting down)
    petals = petals.filter(function (p) { p.life += dt; p.x += (p.vx + Math.sin(p.life * 2 + p.r) * 22) * dt; p.y += p.vy * dt; p.r += dt * 2; return p.y < H + 10; });
    petals.forEach(function (p) { g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.scale(1, 0.5 + 0.5 * Math.abs(Math.sin(p.life * 3))); g.fillStyle = 'rgba(255,175,215,.85)'; g.beginPath(); g.ellipse(0, 0, 5, 2.6, 0, 0, TAU); g.fill(); g.restore(); });
    motes.forEach(function (m) {                                       // (sparkles rising through the air)
      m.y -= m.sp * dt; if (m.y < -0.02) { m.y = 1.02; m.x = Math.random(); }
      var a = 0.35 + 0.35 * Math.sin(t * 2 + m.p), px = (m.x + Math.sin(t * 0.3 + m.p) * 0.01) * W, py = m.y * H;
      glow(px, py, m.r * 5, 'hsla(' + m.hue + ',100%,80%,A)', a * 0.5); g.fillStyle = 'hsla(' + m.hue + ',100%,92%,' + a + ')'; g.beginPath(); g.arc(px, py, m.r, 0, TAU); g.fill();
    });
    flies.forEach(function (f) {                                       // (and a few fireflies, blinking)
      var fx = (f.x + Math.sin(t * f.sp + f.p) * 0.03) * W, fy = (f.y - 0.1 + Math.cos(t * f.sp * 0.8 + f.p) * 0.02) * H, on = Math.max(0, Math.sin(t * 1.7 + f.p * 3));
      glow(fx, fy, 14, 'rgba(230,255,150,A)', on * 0.55); g.fillStyle = 'rgba(250,255,200,' + on + ')'; g.beginPath(); g.arc(fx, fy, 1.8, 0, TAU); g.fill();
    });
      var seaY = H * (W < H ? 0.8 : 0.79), cu = Math.min(W, H);           // (a sea of clouds far below, lit by the dawn, that everything floats above)
      SEA.forEach(function (sl, li) {
        var yb = seaY + H * sl.dy, rB = cu * sl.r, key = Math.round(W) + 'x' + Math.round(H) + ':' + li, spr = seaSpr[key] || (seaSpr[key] = makeSea(li, W, rB)), off = (t * sl.v) % W, top = yb - rB * 1.7;
        g.drawImage(spr.c, off - W, top, W, spr.h); g.drawImage(spr.c, off, top, W, spr.h);
        g.fillStyle = sl.base; g.fillRect(0, top + spr.h - 1, W, H);
        if (li === SEA.length - 1) spr.tops.forEach(function (tp2, k) { var tw = Math.max(0, Math.sin(t * 1.7 + k * 2.3)); if (tw < 0.2) return; var gx4 = (tp2[0] + off) % W; glow(gx4, top + tp2[1], 10, 'rgba(255,236,200,A)', tw * 0.6); spark4(gx4, top + tp2[1], 2 + tw * 4, 'rgba(255,250,235,' + tw + ')'); });   // (glints of sunrise on the cloud tops)
      });
      glow(W / 2, seaY + H * 0.05, Math.max(W, H) * 0.45, 'rgba(255,225,200,A)', 0.3);
      var bs = Math.min(W, H) * (W < H ? 0.42 : 0.5);                    // (blossom branches reaching in from the top corners, framing the picture)
      [[0, 1, 0], [W, -1, 1]].forEach(function (b) { var key = b[2] + ':' + Math.round(bs); if (!branchSpr[key]) branchSpr[key] = makeBranch(Math.round(bs), b[2]); g.save(); g.translate(b[0], 0); g.scale(b[1], 1); g.rotate(Math.sin(t * 0.6 + b[2] * 2) * 0.012); g.drawImage(branchSpr[key], -bs * 0.05, -bs * 0.08, bs * 1.25, bs); g.restore(); });
    var vg = g.createRadialGradient(W / 2, H * 0.5, Math.min(W, H) * 0.3, W / 2, H * 0.5, Math.max(W, H) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(20,10,40,.45)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);   // (a soft vignette)
  }

  // ----- loading, and the Play button -----
  var shown = 0, target = 0, tipAt = 0, ready = false, alive = true;
  var TIPS = ['Watering the moonblooms…', 'Waking the Glimmerwings…', 'Fluffing the hay…', 'Polishing the stars…', 'Lighting the lanterns…', 'Stirring the cauldron…', 'Shaking out the petals…', 'Tuning the wind chimes…'], tipN = 0;
  function setTip(txt) { tipEl.style.opacity = 0; setTimeout(function () { tipEl.textContent = txt; tipEl.style.opacity = 1; }, 200); }
  function loop(now) {
    if (!alive) return;
    drawScene(now);
    shown += (target - shown) * 0.08; if (target - shown < 0.3) shown = target;
    fill.style.width = 'calc(' + shown + '% - 6px)'; bud.style.left = 'calc(' + shown + '% - ' + shown * 0.06 + 'px)'; pctEl.textContent = Math.round(shown) + '%';
    for (var k = 0; k < leaves.length; k++) leaves[k].classList.toggle('on', shown > 8 + k * 10.5 + 3);
    if (!ready && now - tipAt > 1600) { tipAt = now; setTip(TIPS[tipN++ % TIPS.length]); }
    if (ready && shown >= 99.5 && !playBtn.classList.contains('show')) { load.classList.add('done'); setTimeout(function () { load.style.display = 'none'; playBtn.classList.add('show'); optBtn.classList.add('show'); hint.classList.add('show'); playBtn.focus(); }, 450); }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  // ----- the title music: "The Witch's Waltz-Step", a cute, sneaky little tune in D minor -----
  // A music-box celesta sings the tune over bouncy plucked strings (bass on 1 and 3, a pluck of the chord on 2 and 4,
  // like tiptoeing). In the second part a hollow,
  // woody clarinet takes the tune; then the first tune comes back with a glockenspiel
  // doubling it, and a short spooky-cute bridge where a theremin glides and swoops. It all fades away when you press
  // Play. Browsers only allow sound after a tap or a key, so it starts on your first one, and the ♪ button in the
  // corner turns it on or off (and remembers)
  var titleMusic = (function () {
    var KEY = 'everdawn-title-music', want = true; try { want = localStorage.getItem(KEY) !== 'off'; } catch (err) {}
    var ac = null, out = null, verb = null, timer = 0, next = 0, bar = 0, done = false, BPM = 116, SPB = 60 / BPM;
    var CH = { Dm: [38, [50, 53, 57]], Gm: [43, [50, 55, 58]], A7: [45, [49, 55, 57]], Bb: [46, [50, 53, 58]], F: [41, [48, 53, 57]], C: [36, [48, 52, 55]], Eo: [40, [46, 52, 55]] };
    var A = [['Dm', [[0, 74, 0.5], [0.5, 73, 0.5], [1, 74, 1], [2, 69, 1], [3, 65, 1]]], ['Dm', [[0, 67, 0.5], [0.5, 69, 0.5], [1, 70, 1], [2, 69, 2]]], ['Gm', [[0, 70, 0.5], [0.5, 72, 0.5], [1, 74, 1], [2, 70, 1], [3, 67, 1]]], ['A7', [[0, 69, 1], [1, 73, 1], [2, 76, 2]]],
             ['Dm', [[0, 77, 0.5], [0.5, 76, 0.5], [1, 74, 1], [2, 73, 1], [3, 74, 1]]], ['Bb', [[0, 70, 1], [1, 74, 1], [2, 77, 2]]], ['Eo', [[0, 79, 0.5], [0.5, 77, 0.5], [1, 76, 1], [2, 73, 1], [3, 70, 1]]], ['A7', [[0, 69, 1], [1, 73, 0.5], [1.5, 76, 0.5], [2, 74, 2]]]];
    var B = [['F', [[0, 65, 1.5], [1.5, 67, 0.5], [2, 69, 2]]], ['C', [[0, 67, 1], [1, 64, 1], [2, 60, 2]]], ['Dm', [[0, 62, 1.5], [1.5, 65, 0.5], [2, 69, 1], [3, 74, 1]]], ['A7', [[0, 73, 3], [3, 69, 1]]],
             ['Bb', [[0, 70, 1.5], [1.5, 69, 0.5], [2, 67, 1], [3, 65, 1]]], ['Gm', [[0, 67, 1.5], [1.5, 65, 0.5], [2, 62, 2]]], ['Eo', [[0, 64, 1], [1, 67, 1], [2, 70, 1], [3, 73, 1]]], ['A7', [[0, 76, 2], [2, 73, 1], [3, 69, 1]]]];
    var BR = [['Dm', [[0, 74, 2], [2, 77, 2]]], ['Bb', [[0, 74, 4]]], ['Gm', [[0, 70, 2], [2, 73, 2]]], ['A7', [[0, 76, 4]]]];
    var SONG = []; A.forEach(function (b) { SONG.push({ part: 'A', b: b }); }); B.forEach(function (b) { SONG.push({ part: 'B', b: b }); }); A.forEach(function (b) { SONG.push({ part: 'A2', b: b }); }); BR.forEach(function (b) { SONG.push({ part: 'BR', b: b }); });
    function hz(n) { return 440 * Math.pow(2, (n - 69) / 12); }
    function at(t0, beat) { var f = beat - Math.floor(beat); return t0 + (Math.floor(beat) + (Math.abs(f - 0.5) < 0.01 ? 0.6 : f)) * SPB; }   // (lightly swung)
    function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
    function osc(type, f, t, end, dest, detune) { var o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (detune) o.detune.value = detune; o.connect(dest); o.start(t); o.stop(end); return o; }
    function voice(gain, wet) { var g = ac.createGain(); g.connect(out); if (wet) { var s = ac.createGain(); s.gain.value = wet; g.connect(s); s.connect(verb); } return g; }
    function celesta(t, n, len, v) { var g = voice(1, 0.45); env(g, t, 0.012, 0.16 * v, 0.9 + len * SPB * 0.5); osc('sine', hz(n), t, t + 2.4, g); var g2 = voice(1, 0.3); env(g2, t, 0.012, 0.035 * v, 0.25); osc('sine', hz(n) * 4, t, t + 0.4, g2); var g3 = voice(1, 0.3); env(g3, t, 0.012, 0.03 * v, 0.5); osc('triangle', hz(n) * 2, t, t + 0.7, g3); }
    function glock(t, n, v) { var g = voice(1, 0.5); env(g, t, 0.01, 0.07 * v, 0.7); osc('sine', hz(n + 12), t, t + 1, g); var g2 = voice(1, 0.4); env(g2, t, 0.01, 0.015 * v, 0.15); osc('sine', hz(n + 12) * 2.76, t, t + 0.25, g2); }
    function pizz(t, n, v) { var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(hz(n) * 6, t); lp.frequency.exponentialRampToValueAtTime(hz(n) * 1.5, t + 0.18); var g = voice(1, 0.18); lp.connect(g); env(g, t, 0.014, 0.2 * v, 0.3); osc('triangle', hz(n), t, t + 0.45, lp); }   // (a soft, round pluck, with no click at the start)
    function clarinet(t, n, len, v) { var e = t + len * SPB * 0.95, lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1300; lp.Q.value = 2; var g = voice(1, 0.35); lp.connect(g);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07 * v, t + 0.06); g.gain.setValueAtTime(0.07 * v, Math.max(t + 0.07, e - 0.08)); g.gain.exponentialRampToValueAtTime(0.0001, e + 0.12);
      var o = osc('square', hz(n), t, e + 0.2, lp), vib = ac.createOscillator(), vg = ac.createGain(); vib.frequency.value = 5; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(hz(n) * 0.006, t + 0.4); vib.connect(vg); vg.connect(o.frequency); vib.start(t); vib.stop(e + 0.2); }
    function theremin(t, n, len, prev) { var e = t + len * SPB, g = voice(1, 0.6); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.2); g.gain.setValueAtTime(0.06, e - 0.25); g.gain.exponentialRampToValueAtTime(0.0001, e + 0.05);
      var o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(hz(prev || n), t); o.frequency.exponentialRampToValueAtTime(hz(n), t + 0.28); o.connect(g);
      var vib = ac.createOscillator(), vg = ac.createGain(); vib.frequency.value = 6.2; vg.gain.value = hz(n) * 0.014; vib.connect(vg); vg.connect(o.frequency); o.start(t); o.stop(e + 0.1); vib.start(t); vib.stop(e + 0.1); }
    function playBar(t0, s, idx) {
      var ch = CH[s.b[0]], part = s.part, bridge = part === 'BR', last = idx === 7 || (bridge && idx === 27);
      pizz(at(t0, 0), ch[0], 1); if (!bridge) { ch[1].forEach(function (n) { pizz(at(t0, 1), n, 0.42); }); pizz(at(t0, 2), ch[0] + 7, 0.85); ch[1].forEach(function (n) { pizz(at(t0, 3), n, 0.42); }); }   // (oom-pah, on tiptoe)
      else pizz(at(t0, 2), ch[0] + 7, 0.7);
      var prev = null;
      s.b[1].forEach(function (nt) { var t = at(t0, nt[0]);
        if (part === 'A' || part === 'A2') { celesta(t, nt[1], nt[2], 1); if (part === 'A2') glock(t, nt[1], 0.8); }
        else if (part === 'B') clarinet(t, nt[1] - 12 + 12, nt[2], 1);
        else { theremin(t, nt[1], nt[2], prev); prev = nt[1]; } });
    }
    function tick() { if (!ac || done) return; var now = ac.currentTime; if (next < now) next = now + 0.1;
      while (next < now + 0.7) { playBar(next, SONG[bar % SONG.length], bar % SONG.length); next += 4 * SPB; bar++; } }
    function start() {
      if (done || !want) return; var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      if (!ac) { ac = new AC(); ac.evMusic = true; out = ac.createGain(); out.gain.value = 0; var comp = ac.createDynamicsCompressor(); out.connect(comp); comp.connect(ac.destination);
        verb = ac.createConvolver(); var len = Math.floor(ac.sampleRate * 2.4), ir = ac.createBuffer(2, len, ac.sampleRate); for (var c = 0; c < 2; c++) { var d = ir.getChannelData(c); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); } verb.buffer = ir; var vg = ac.createGain(); vg.gain.value = 0.5; verb.connect(vg); vg.connect(comp);
        timer = setInterval(tick, 120); }
      if (ac.state === 'suspended') ac.resume();
      out.gain.cancelScheduledValues(ac.currentTime); out.gain.setValueAtTime(out.gain.value, ac.currentTime); out.gain.linearRampToValueAtTime(0.9, ac.currentTime + 1.2); tick();
    }
    function silence(t) { if (!ac) return; out.gain.cancelScheduledValues(ac.currentTime); out.gain.setValueAtTime(out.gain.value, ac.currentTime); out.gain.linearRampToValueAtTime(0, ac.currentTime + t); }
    function toggle() { if (want && !done && (!ac || ac.state !== 'running')) { start(); return want; }   // (the very first press just starts it)
      want = !want; try { localStorage.setItem(KEY, want ? 'on' : 'off'); } catch (err) {} if (want) start(); else silence(0.5); return want; }
    function stop() { if (done) return; done = true; silence(1.4); setTimeout(function () { clearInterval(timer); if (ac) ac.close(); }, 1700); }
    function first(e) { if (e && e.target && e.target.classList && e.target.classList.contains('ev-music')) return; start(); ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { window.removeEventListener(ev, first, true); }); }
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, first, true); });
    document.addEventListener('visibilitychange', function () { if (ac && !done) { if (document.hidden) ac.suspend(); else if (want) ac.resume(); } });
    return { toggle: toggle, stop: stop, on: function () { return want; } };
  })();
  var musBtn = document.createElement('button'); musBtn.type = 'button'; musBtn.className = 'ev-music';
  function musLabel() { musBtn.textContent = titleMusic.on() ? '♪ Music: On' : '♪ Music: Off'; musBtn.setAttribute('aria-pressed', titleMusic.on() ? 'true' : 'false'); }
  musLabel(); root.appendChild(musBtn); musBtn.addEventListener('click', function (e) { e.stopPropagation(); titleMusic.toggle(); musLabel(); });
  function play() {
    if (!ready || root.classList.contains('gone')) return;
    titleMusic.stop(); musBtn.style.display = 'none';
    window.EVERDAWN_TITLE = false; EVERDAWN_TITLE = false;
    root.classList.add('gone'); if (document.body) document.body.style.overflow = prevOverflow;
    var game = document.getElementById('game'); if (game) { try { game.focus(); } catch (err) {} }
    setTimeout(function () {                                           // (the title screen goes, all but its Settings panel, which the pause menu opens)
      alive = false; Array.prototype.slice.call(root.children).forEach(function (c) { if (c !== sett) c.remove(); });
      root.classList.add('ingame'); window.removeEventListener('resize', resize);
    }, 1200);
  }
  // ----- the save slots: Play opens a list of five; pick one with a game in it to carry on, or an empty one to start anew -----
  var SEAS = ['Spring', 'Summer', 'Fall', 'Winter'], WDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var slots = document.createElement('div'); slots.className = 'ev-slots'; slots.setAttribute('role', 'dialog'); slots.setAttribute('aria-modal', 'true'); slots.setAttribute('aria-label', 'Choose a save slot');
  slots.innerHTML = '<div class="ev-scard"><h2>✦ Choose a Save ✦</h2><div class="ev-slist"></div><button type="button" class="ev-back">Back</button></div>';
  root.appendChild(slots);
  var slist = slots.querySelector('.ev-slist'), btnRow = root.querySelector('.ev-btns');
  function readSlot(n) { try { var d = JSON.parse(localStorage.getItem('everdawn-save-' + n)); return d && d.v === 1 && d.state ? d : null; } catch (err) { return null; } }
  function lastSlot() { try { return parseInt(localStorage.getItem('everdawn-last-slot'), 10) || 0; } catch (err) { return 0; } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function slotRow(n) {
    var d = readSlot(n), row = document.createElement('div'); row.className = 'ev-slot';
    if (d) {
      var day = d.state.day || 1, when = WDAYS[(day - 1) % 7] + ' · ' + SEAS[Math.floor((day - 1) / 28) % 4] + ', Day ' + ((day - 1) % 28 + 1);
      var saved = d.savedAt ? 'Saved ' + new Date(d.savedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
      row.innerHTML = '<button type="button" class="ev-sbtn"><span class="ev-snum">' + n + '</span><span class="ev-stxt"><b>' + esc(d.name || when) + (n === lastSlot() ? '<span class="ev-last">Last played</span>' : '') + '</b>' + (d.name ? '<span>' + esc(when) + '</span>' : '') +
        '<span>🪙 ' + (d.state.coins || 0) + ' coins · 🌾 ' + (d.state.harvest || 0) + ' harvested</span>' + (saved ? '<i>' + esc(saved) + '</i>' : '') + '</span></button>' +
        (showBackups() && readBackups(n).length ? '<button type="button" class="ev-sdel ev-sbak" aria-label="Backups of the game in slot ' + n + '" title="Backups">⟲</button>' : '') +
        '<button type="button" class="ev-sdel" aria-label="Delete the game in slot ' + n + '" title="Delete">🗑</button>';
      row.querySelector('.ev-sbtn').addEventListener('click', function () { pickSlot(n, false); });
      var bakBtn = row.querySelector('.ev-sbak'); if (bakBtn) bakBtn.addEventListener('click', function () { backupList(n, row); });
      row.querySelector('.ev-sdel:not(.ev-sbak)').addEventListener('click', function () {   // (asking first: a deleted game can't come back)
        row.innerHTML = '<div class="ev-sask"><span>Delete the game in slot ' + n + '?</span><span><button type="button" class="yes">Delete</button><button type="button" class="no">Keep it</button></span></div>';
        row.querySelector('.yes').addEventListener('click', function () { try { localStorage.removeItem('everdawn-save-' + n); localStorage.removeItem('everdawn-save-' + n + '-backups'); } catch (err) {} var fresh = slotRow(n); slist.replaceChild(fresh, row); fresh.querySelector('.ev-sbtn').focus(); });
        row.querySelector('.no').addEventListener('click', function () { var back = slotRow(n); slist.replaceChild(back, row); back.querySelector('.ev-sbtn').focus(); });
        row.querySelector('.no').focus();
      });
    } else {
      row.innerHTML = '<button type="button" class="ev-sbtn empty"><span class="ev-snum">' + n + '</span><span class="ev-stxt"><b>✦ New Game</b><span>An empty slot</span></span></button>';
      row.querySelector('.ev-sbtn').addEventListener('click', function () { nameSlot(n, row); });
    }
    return row;
  }
  // ----- day backups ("Show Backup" set to Yes in Settings): a ⟲ button on a slot lists the backups of earlier days -----
  function showBackups() { try { return localStorage.getItem('everdawn-show-backup') === 'yes'; } catch (err) { return false; } }
  function readBackups(n) { try { return (JSON.parse(localStorage.getItem('everdawn-save-' + n + '-backups')) || []).filter(function (b) { return b && b.v === 1 && b.state; }); } catch (err) { return []; } }
  function dayName(day) { return WDAYS[(day - 1) % 7] + ' · ' + SEAS[Math.floor((day - 1) / 28) % 4] + ', Day ' + ((day - 1) % 28 + 1); }
  function backupList(n, row) {
    var list = readBackups(n);
    function back() { var fresh = slotRow(n); slist.replaceChild(fresh, row); fresh.querySelector('.ev-sbtn').focus(); }
    row.innerHTML = '<div class="ev-sname ev-bk"><label>Backups of slot ' + n + '</label>' + list.map(function (b, i) {
      var saved = b.savedAt ? 'Saved ' + new Date(b.savedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
      return '<button type="button" class="ev-sbtn" data-i="' + i + '"><span class="ev-stxt"><b>' + esc(dayName(b.state.day || 1)) + '</b><span>🪙 ' + (b.state.coins || 0) + ' coins · 🌾 ' + (b.state.harvest || 0) + ' harvested</span>' + (saved ? '<i>' + esc(saved) + '</i>' : '') + '</span></button>';
    }).join('') + '<span><button type="button" class="no">Back</button></span></div>';
    row.querySelector('.no').addEventListener('click', back);
    Array.prototype.forEach.call(row.querySelectorAll('.ev-bk .ev-sbtn'), function (btn) {
      btn.addEventListener('click', function () {                      // (asking first: it takes the slot back to that day)
        var b = list[+btn.getAttribute('data-i')];
        row.innerHTML = '<div class="ev-sask"><span>Go back to ' + esc(dayName(b.state.day || 1)) + '? Your game now becomes a backup.</span><span><button type="button" class="yes">Restore</button><button type="button" class="no">Cancel</button></span></div>';
        row.querySelector('.no').addEventListener('click', function () { backupList(n, row); });
        row.querySelector('.yes').addEventListener('click', function () {
          var now = readSlot(n), rest = list.filter(function (x) { return x !== b; });
          if (now) rest = [now].concat(rest.filter(function (x) { return x.state.day !== now.state.day; }));
          try { localStorage.setItem('everdawn-save-' + n, JSON.stringify(b)); localStorage.setItem('everdawn-save-' + n + '-backups', JSON.stringify(rest.slice(0, 3))); } catch (err) {}
          pickSlot(n, false);                                           // (and straight into the game, back on that day)
        });
        row.querySelector('.yes').focus();
      });
    });
    var first = row.querySelector('.ev-bk .ev-sbtn'); if (first) first.focus();
  }
  function openSlots() {
    if (!ready || root.classList.contains('gone')) return;
    slist.innerHTML = ''; for (var n = 1; n <= 5; n++) slist.appendChild(slotRow(n));
    slots.classList.add('open'); btnRow.style.visibility = 'hidden'; hint.style.visibility = 'hidden';
    var ls = lastSlot(), first = slist.children[(ls >= 1 && ls <= 5 ? ls : 1) - 1].querySelector('.ev-sbtn'); if (first) first.focus();
  }
  function closeSlots() { slots.classList.remove('open'); btnRow.style.visibility = ''; hint.style.visibility = ''; playBtn.focus(); }
  function pickSlot(n, fresh, name) { if (window.everdawnPickSlot) window.everdawnPickSlot(n, fresh, name); slots.classList.remove('open'); play(); }
  var naming = null;
  function nameSlot(n, row) {                                          // (a new game has to be named before it starts)
    row.innerHTML = '<div class="ev-sname"><label for="evName' + n + '">Name your save</label><input id="evName' + n + '" type="text" maxlength="24" autocomplete="off" spellcheck="false" placeholder="e.g. Moonpetal Farm">' +
      '<span><button type="button" class="go" disabled>Start</button><button type="button" class="no">Cancel</button></span></div>';
    var inp = row.querySelector('input'), go = row.querySelector('.go');
    function cancel() { naming = null; var back = slotRow(n); slist.replaceChild(back, row); back.querySelector('.ev-sbtn').focus(); }
    function start() { var nm = inp.value.replace(/\s+/g, ' ').trim(); if (!nm) { inp.focus(); return; } naming = null; pickSlot(n, true, nm); }
    inp.addEventListener('input', function () { go.disabled = !inp.value.trim(); });
    inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); start(); } else if (e.key === 'Escape') { e.preventDefault(); cancel(); } });   // (typing a name never reaches the game's own keys)
    go.addEventListener('click', start); row.querySelector('.no').addEventListener('click', cancel);
    naming = cancel; inp.focus();
  }
  slots.querySelector('.ev-back').addEventListener('click', closeSlots);
  slots.addEventListener('click', function (e) { if (e.target === slots) closeSlots(); });
  // ----- the Settings panel: pages you flip through with the arrows (Game, Display, Audio, then Mouse & Keyboard) -----
  // Brightness, on the Display page: 0 to 12, starting in the middle at 6 (the game as it's always looked). Lower
  // darkens the game, higher brightens it, from half as bright at 0 to half as bright again at 12; the title screen
  // follows along, so you can see the change as you slide it. It's remembered
  function brightNow() { try { var b = parseInt(localStorage.getItem('everdawn-brightness'), 10); if (b >= 0 && b <= 12) return b; } catch (err) {} return 6; }
  function applyBright(b) { document.documentElement.classList.toggle('ev-bright', b !== 6); document.documentElement.style.setProperty('--ev-bright', String(0.5 + b / 12)); }
  applyBright(brightNow());
  // Text Size, on the Display page: how big what the townsfolk say is, from 80% to 150% (100% to start). There's no one
  // to talk to yet; when there is, their dialogue box uses font-size: var(--ev-dialogue-size) and follows this. It's
  // remembered
  function textSizeNow() { try { var t = parseInt(localStorage.getItem('everdawn-text-size'), 10); if (t >= 80 && t <= 150) return t; } catch (err) {} return 100; }
  function applyTextSize(t) { document.documentElement.style.setProperty('--ev-dialogue-size', (17 * t / 100) + 'px'); }
  applyTextSize(textSizeNow());
  // Bold Text, on the Display page: On puts everything the townsfolk say in bold; Off (to start) leaves it as normal
  // text. Their dialogue box uses font-weight: var(--ev-dialogue-weight). It's remembered
  function boldNow() { try { return localStorage.getItem('everdawn-bold-text') === 'on'; } catch (err) { return false; } }
  function applyBold(on) { document.documentElement.style.setProperty('--ev-dialogue-weight', on ? '700' : '400'); }
  applyBold(boldNow());
  function timeNow() { try { var t = parseFloat(localStorage.getItem('everdawn-time-speed')); if (t >= 50 && t <= 100) return t; } catch (err) {} return 50; }
  function zoomNow() { try { var z = parseFloat(localStorage.getItem('everdawn-zoom')); if (z >= 6 && z <= 26) return z; } catch (err) {} return 14; }
  (function () { var st = document.createElement('style'); st.textContent =   // (the Language page: the six languages as big round buttons, two to a row)
    '#evTitle .ev-langs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}' +
    '#evTitle .ev-langs button{padding:.6em 1em;font:600 17px Fredoka,system-ui,sans-serif;color:#f0e2ff;border:2px solid #ffe2a0;border-radius:999px;background:rgba(30,15,60,.6);cursor:pointer}' +
    '#evTitle .ev-langs button.on{color:#fff;background:linear-gradient(180deg,#ff9ecb,#d8609c)}#evTitle .ev-langs button:focus-visible{outline:3px solid #fff;outline-offset:2px}';
    document.head.appendChild(st); })();
  var SET_PAGES = [{ name: 'Game', build: function (body) {                // (Game: how far the camera sits from you, how fast time goes, and more)
    body.innerHTML = '<div class="ev-srow"><div class="ev-lrow"><label for="evZoom">Adjust Camera Zoom</label><output for="evZoom" id="evZoomPct"></output></div><div class="ev-range"><span>0%</span><input type="range" id="evZoom" min="0" max="20" step="0.5"><span>100%</span></div></div>' +
      '<div class="ev-srow"><div class="ev-lrow"><label for="evTime">Game Time Speed</label><output for="evTime" id="evTimePct"></output></div><div class="ev-range"><span>50%</span><input type="range" id="evTime" min="50" max="100" step="5"><span>100%</span></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evMoveL">Movement Type</span><div class="ev-seg" role="group" aria-labelledby="evMoveL"><button type="button" data-m="walk">Walk</button><button type="button" data-m="jog">Jog</button></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evStoreL">Storage Drag &amp; Drop</span><div class="ev-seg" role="group" aria-labelledby="evStoreL"><button type="button" data-s="off">Disabled</button><button type="button" data-s="on">Enabled</button></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evQuestL">Display Quest HUD</span><div class="ev-seg" role="group" aria-labelledby="evQuestL"><button type="button" data-q="show">Show</button><button type="button" data-q="hide">Hide</button></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evTypeL">Typewriter Effect</span><div class="ev-seg" role="group" aria-labelledby="evTypeL"><button type="button" data-t="off">Disabled</button><button type="button" data-t="on">Enabled</button></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evTileL">Tile Highlight While Moving</span><div class="ev-seg" role="group" aria-labelledby="evTileL"><button type="button" data-h="off">Disabled</button><button type="button" data-h="on">Enabled</button></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evHourL">Game Time Hour Format</span><div class="ev-seg" role="group" aria-labelledby="evHourL"><button type="button" data-f="12">AM/PM</button><button type="button" data-f="24">24 Hour</button></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evCombatL">Combat Mode</span><div class="ev-seg" role="group" aria-labelledby="evCombatL"><button type="button" data-c="default">Default</button><button type="button" data-c="passive">Passive</button></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evBakL">Show Backup</span><div class="ev-seg" role="group" aria-labelledby="evBakL"><button type="button" data-k="no">No</button><button type="button" data-k="yes">Yes</button></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evJealL">Enable Jealousy</span><div class="ev-seg" role="group" aria-labelledby="evJealL"><button type="button" data-j="no">No</button><button type="button" data-j="yes">Yes</button></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evAnimL">Enable Excessive Animations</span><div class="ev-seg" role="group" aria-labelledby="evAnimL"><button type="button" data-a="no">No</button><button type="button" data-a="yes">Yes</button></div></div>';
    var mv = 'walk'; try { if (localStorage.getItem('everdawn-move') === 'jog') mv = 'jog'; } catch (err) {}
    var segBtns = body.querySelectorAll('.ev-seg button[data-m]');
    function showMove() { for (var b = 0; b < segBtns.length; b++) { var on = segBtns[b].getAttribute('data-m') === mv; segBtns[b].classList.toggle('on', on); segBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb = 0; sb < segBtns.length; sb++) segBtns[sb].addEventListener('click', function () {   // (Movement Type: Walk or Jog)
      mv = this.getAttribute('data-m'); showMove(); try { localStorage.setItem('everdawn-move', mv); } catch (err) {} if (window.everdawnSetMove) window.everdawnSetMove(mv); });
    showMove();
    var sd = 'off'; try { if (localStorage.getItem('everdawn-storage-drag') === 'on') sd = 'on'; } catch (err) {}   // (Storage Drag & Drop: Disabled or Enabled)
    var sdBtns = body.querySelectorAll('.ev-seg button[data-s]');
    function showStore() { for (var b = 0; b < sdBtns.length; b++) { var on = sdBtns[b].getAttribute('data-s') === sd; sdBtns[b].classList.toggle('on', on); sdBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb2 = 0; sb2 < sdBtns.length; sb2++) sdBtns[sb2].addEventListener('click', function () {
      sd = this.getAttribute('data-s'); showStore(); try { localStorage.setItem('everdawn-storage-drag', sd); } catch (err) {} if (window.everdawnSetStorageDrag) window.everdawnSetStorageDrag(sd === 'on'); });
    showStore();
    var qh = 'show'; try { if (localStorage.getItem('everdawn-quest-hud') === 'hide') qh = 'hide'; } catch (err) {}   // (Display Quest HUD: Show or Hide)
    var qhBtns = body.querySelectorAll('.ev-seg button[data-q]');
    function showQuest() { for (var b = 0; b < qhBtns.length; b++) { var on = qhBtns[b].getAttribute('data-q') === qh; qhBtns[b].classList.toggle('on', on); qhBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb3 = 0; sb3 < qhBtns.length; sb3++) qhBtns[sb3].addEventListener('click', function () {
      qh = this.getAttribute('data-q'); showQuest(); try { localStorage.setItem('everdawn-quest-hud', qh); } catch (err) {} if (window.everdawnSetQuestHud) window.everdawnSetQuestHud(qh === 'show'); });
    showQuest();
    var tw = 'off'; try { if (localStorage.getItem('everdawn-typewriter') === 'on') tw = 'on'; } catch (err) {}   // (Typewriter Effect: Disabled or Enabled)
    var twBtns = body.querySelectorAll('.ev-seg button[data-t]');
    function showType() { for (var b = 0; b < twBtns.length; b++) { var on = twBtns[b].getAttribute('data-t') === tw; twBtns[b].classList.toggle('on', on); twBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb4 = 0; sb4 < twBtns.length; sb4++) twBtns[sb4].addEventListener('click', function () {
      tw = this.getAttribute('data-t'); showType(); try { localStorage.setItem('everdawn-typewriter', tw); } catch (err) {} if (window.everdawnSetTypewriter) window.everdawnSetTypewriter(tw === 'on'); });
    showType();
    var th = 'on'; try { if (localStorage.getItem('everdawn-tile-highlight') === 'off') th = 'off'; } catch (err) {}   // (Tile Highlight While Moving: Disabled or Enabled)
    var thBtns = body.querySelectorAll('.ev-seg button[data-h]');
    function showTileHl() { for (var b = 0; b < thBtns.length; b++) { var on = thBtns[b].getAttribute('data-h') === th; thBtns[b].classList.toggle('on', on); thBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb5 = 0; sb5 < thBtns.length; sb5++) thBtns[sb5].addEventListener('click', function () {
      th = this.getAttribute('data-h'); showTileHl(); try { localStorage.setItem('everdawn-tile-highlight', th); } catch (err) {} if (window.everdawnSetTileHighlight) window.everdawnSetTileHighlight(th === 'on'); });
    showTileHl();
    var hf = '12'; try { if (localStorage.getItem('everdawn-hour-format') === '24') hf = '24'; } catch (err) {}   // (Game Time Hour Format: AM/PM or 24 Hour)
    var hfBtns = body.querySelectorAll('.ev-seg button[data-f]');
    function showHourFmt() { for (var b = 0; b < hfBtns.length; b++) { var on = hfBtns[b].getAttribute('data-f') === hf; hfBtns[b].classList.toggle('on', on); hfBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb6 = 0; sb6 < hfBtns.length; sb6++) hfBtns[sb6].addEventListener('click', function () {
      hf = this.getAttribute('data-f'); showHourFmt(); try { localStorage.setItem('everdawn-hour-format', hf); } catch (err) {} if (window.everdawnSetHourFormat) window.everdawnSetHourFormat(hf === '24'); });
    showHourFmt();
    var cm = 'default'; try { if (localStorage.getItem('everdawn-combat-mode') === 'passive') cm = 'passive'; } catch (err) {}   // (Combat Mode: Default or Passive)
    var cmBtns = body.querySelectorAll('.ev-seg button[data-c]');
    function showCombat() { for (var b = 0; b < cmBtns.length; b++) { var on = cmBtns[b].getAttribute('data-c') === cm; cmBtns[b].classList.toggle('on', on); cmBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb7 = 0; sb7 < cmBtns.length; sb7++) cmBtns[sb7].addEventListener('click', function () {
      cm = this.getAttribute('data-c'); showCombat(); try { localStorage.setItem('everdawn-combat-mode', cm); } catch (err) {} if (window.everdawnSetCombatMode) window.everdawnSetCombatMode(cm === 'passive'); });
    showCombat();
    var bk = showBackups() ? 'yes' : 'no';                               // (Show Backup: No or Yes; Yes puts a ⟲ Backups button on save slots that have them)
    var bkBtns = body.querySelectorAll('.ev-seg button[data-k]');
    function showBak() { for (var b = 0; b < bkBtns.length; b++) { var on = bkBtns[b].getAttribute('data-k') === bk; bkBtns[b].classList.toggle('on', on); bkBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb8 = 0; sb8 < bkBtns.length; sb8++) bkBtns[sb8].addEventListener('click', function () {
      bk = this.getAttribute('data-k'); showBak(); try { localStorage.setItem('everdawn-show-backup', bk); } catch (err) {} });
    showBak();
    var jl = 'no'; try { if (localStorage.getItem('everdawn-jealousy') === 'yes') jl = 'yes'; } catch (err) {}   // (Enable Jealousy: No or Yes)
    var jlBtns = body.querySelectorAll('.ev-seg button[data-j]');
    function showJeal() { for (var b = 0; b < jlBtns.length; b++) { var on = jlBtns[b].getAttribute('data-j') === jl; jlBtns[b].classList.toggle('on', on); jlBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb9 = 0; sb9 < jlBtns.length; sb9++) jlBtns[sb9].addEventListener('click', function () {
      jl = this.getAttribute('data-j'); showJeal(); try { localStorage.setItem('everdawn-jealousy', jl); } catch (err) {} if (window.everdawnSetJealousy) window.everdawnSetJealousy(jl === 'yes'); });
    showJeal();
    var an = 'yes'; try { if (localStorage.getItem('everdawn-excessive-anim') === 'no') an = 'no'; } catch (err) {}   // (Enable Excessive Animations: No or Yes)
    var anBtns = body.querySelectorAll('.ev-seg button[data-a]');
    function showAnim() { for (var b = 0; b < anBtns.length; b++) { var on = anBtns[b].getAttribute('data-a') === an; anBtns[b].classList.toggle('on', on); anBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb10 = 0; sb10 < anBtns.length; sb10++) anBtns[sb10].addEventListener('click', function () {
      an = this.getAttribute('data-a'); showAnim(); document.documentElement.classList.toggle('ev-calm', an === 'no'); try { localStorage.setItem('everdawn-excessive-anim', an); } catch (err) {} if (window.everdawnSetExcessiveAnim) window.everdawnSetExcessiveAnim(an === 'yes'); });
    showAnim();
    var zi = body.querySelector('#evZoom'), zp = body.querySelector('#evZoomPct'); zi.value = 26 - zoomNow();
    function showPct() { zp.textContent = Math.round(parseFloat(zi.value) * 5) + '%'; } showPct();   // (0% is as far out as it goes, 100% as close in)
    zi.addEventListener('input', function () { showPct(); var d = 26 - parseFloat(zi.value); try { localStorage.setItem('everdawn-zoom', String(d)); } catch (err) {} if (window.everdawnSetZoom) window.everdawnSetZoom(d); });
    var ti = body.querySelector('#evTime'), tp = body.querySelector('#evTimePct'); ti.value = timeNow();   // (Game Time Speed: 50% is the usual pace, 100% twice as fast)
    function showTime() { tp.textContent = Math.round(parseFloat(ti.value)) + '%'; } showTime();
    ti.addEventListener('input', function () { showTime(); var t = parseFloat(ti.value); try { localStorage.setItem('everdawn-time-speed', String(t)); } catch (err) {} if (window.everdawnSetTimeSpeed) window.everdawnSetTimeSpeed(t); });
  } }, { name: 'Display', build: function (body) {                     // (Display: how bright the game looks, and how big and bold the dialogue is)
    body.innerHTML = '<div class="ev-srow"><div class="ev-lrow"><label for="evBright">Brightness</label><output for="evBright" id="evBrightNum"></output></div><div class="ev-range"><span>0</span><input type="range" id="evBright" min="0" max="12" step="1"><span>12</span></div></div>';
    var bi = body.querySelector('#evBright'), bn = body.querySelector('#evBrightNum'); bi.value = brightNow();   // (Brightness: 0 to 12, 6 in the middle is the usual look)
    function showBright() { bn.textContent = bi.value; } showBright();
    bi.addEventListener('input', function () { showBright(); try { localStorage.setItem('everdawn-brightness', bi.value); } catch (err) {} applyBright(+bi.value); });
    body.insertAdjacentHTML('beforeend', '<div class="ev-srow"><div class="ev-lrow"><label for="evText">Text Size</label><output for="evText" id="evTextPct"></output></div><div class="ev-range"><span>A</span><input type="range" id="evText" min="80" max="150" step="10"><span style="font-size:20px">A</span></div>' +
      '<p class="ev-dlg-sample">“Good morning! The Dawn Tree is blooming today.”</p></div>');
    var ts = body.querySelector('#evText'), tsp = body.querySelector('#evTextPct'); ts.value = textSizeNow();   // (Text Size: 80% to 150%, with a sample line that changes as you slide)
    function showTextSize() { tsp.textContent = ts.value + '%'; } showTextSize();
    ts.addEventListener('input', function () { showTextSize(); try { localStorage.setItem('everdawn-text-size', ts.value); } catch (err) {} applyTextSize(+ts.value); });
    body.insertAdjacentHTML('beforeend', '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evBoldL">Bold Text</span><div class="ev-seg" role="group" aria-labelledby="evBoldL"><button type="button" data-b="on">On</button><button type="button" data-b="off">Off</button></div></div>');
    var bd = boldNow() ? 'on' : 'off', bdBtns = body.querySelectorAll('.ev-seg button[data-b]');   // (Bold Text: On or Off; the sample line above shows it)
    function showBold() { for (var b = 0; b < bdBtns.length; b++) { var on = bdBtns[b].getAttribute('data-b') === bd; bdBtns[b].classList.toggle('on', on); bdBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var bb = 0; bb < bdBtns.length; bb++) bdBtns[bb].addEventListener('click', function () {
      bd = this.getAttribute('data-b'); showBold(); try { localStorage.setItem('everdawn-bold-text', bd); } catch (err) {} applyBold(bd === 'on'); });
    showBold();
  } }, { name: 'Audio', build: function (body) {                       // (Audio: how loud everything is, the sound effects, the background sounds, her footsteps, the music and the pets)
    body.innerHTML = '<div class="ev-srow"><div class="ev-lrow"><label for="evVol">Master Volume</label><output for="evVol" id="evVolNum"></output></div><div class="ev-range"><span>0</span><input type="range" id="evVol" min="0" max="10" step="1"><span>10</span></div></div>';
    var vi = body.querySelector('#evVol'), vn = body.querySelector('#evVolNum'); vi.value = volumeNow();   // (Master Volume: 0 to 10, 5 is the usual)
    function showVol() { vn.textContent = vi.value; } showVol();
    vi.addEventListener('input', function () { showVol(); try { localStorage.setItem('everdawn-master-volume', vi.value); } catch (err) {} applyVolume(+vi.value); });
    body.insertAdjacentHTML('beforeend', '<div class="ev-srow"><div class="ev-lrow"><label for="evSfx">SFX Volume</label><output for="evSfx" id="evSfxNum"></output></div><div class="ev-range"><span>0</span><input type="range" id="evSfx" min="0" max="10" step="1"><span>10</span></div></div>');
    var si = body.querySelector('#evSfx'), sn = body.querySelector('#evSfxNum'); si.value = sfxNow();   // (SFX Volume: 0 to 10, 5 is the usual)
    function showSfx() { sn.textContent = si.value; } showSfx();
    si.addEventListener('input', function () { showSfx(); try { localStorage.setItem('everdawn-sfx-volume', si.value); } catch (err) {} applySfx(+si.value); });
    body.insertAdjacentHTML('beforeend', '<div class="ev-srow"><div class="ev-lrow"><label for="evAmb">Ambient Volume</label><output for="evAmb" id="evAmbNum"></output></div><div class="ev-range"><span>0</span><input type="range" id="evAmb" min="0" max="10" step="1"><span>10</span></div></div>');
    var ai = body.querySelector('#evAmb'), an2 = body.querySelector('#evAmbNum'); ai.value = ambientNow();   // (Ambient Volume: 0 to 10, 5 is the usual)
    function showAmb() { an2.textContent = ai.value; } showAmb();
    ai.addEventListener('input', function () { showAmb(); try { localStorage.setItem('everdawn-ambient-volume', ai.value); } catch (err) {} applyAmbient(+ai.value); });
    body.insertAdjacentHTML('beforeend', '<div class="ev-srow"><div class="ev-lrow"><label for="evFoot">Footsteps Volume</label><output for="evFoot" id="evFootNum"></output></div><div class="ev-range"><span>0</span><input type="range" id="evFoot" min="0" max="10" step="1"><span>10</span></div></div>');
    var fi = body.querySelector('#evFoot'), fn2 = body.querySelector('#evFootNum'), fv = 5;   // (Footsteps Volume: 0 to 10, 5 is the usual)
    try { var fs = parseInt(localStorage.getItem('everdawn-footsteps-volume'), 10); if (fs >= 0 && fs <= 10) fv = fs; } catch (err) {}
    fi.value = fv; function showFoot() { fn2.textContent = fi.value; } showFoot();
    fi.addEventListener('input', function () { showFoot(); try { localStorage.setItem('everdawn-footsteps-volume', fi.value); } catch (err) {} if (window.everdawnSetFootsteps) window.everdawnSetFootsteps(+fi.value); });
    body.insertAdjacentHTML('beforeend', '<div class="ev-srow"><div class="ev-lrow"><label for="evMus">Music Volume</label><output for="evMus" id="evMusNum"></output></div><div class="ev-range"><span>0</span><input type="range" id="evMus" min="0" max="10" step="1"><span>10</span></div></div>');
    var mi = body.querySelector('#evMus'), mn = body.querySelector('#evMusNum'); mi.value = musicNow();   // (Music Volume: 0 to 10, 5 is the usual)
    function showMus() { mn.textContent = mi.value; } showMus();
    mi.addEventListener('input', function () { showMus(); try { localStorage.setItem('everdawn-music-volume', mi.value); } catch (err) {} applyMusic(+mi.value); });
    body.insertAdjacentHTML('beforeend', '<div class="ev-srow"><div class="ev-lrow"><label for="evPet">Pet Sound</label><output for="evPet" id="evPetNum"></output></div><div class="ev-range"><span>0</span><input type="range" id="evPet" min="0" max="10" step="1"><span>10</span></div></div>');
    var pi = body.querySelector('#evPet'), pn = body.querySelector('#evPetNum'); pi.value = petNow();   // (Pet Sound: 0 to 10, 5 is the usual)
    function showPet() { pn.textContent = pi.value; } showPet();
    pi.addEventListener('input', function () { showPet(); try { localStorage.setItem('everdawn-pet-sound', pi.value); } catch (err) {} applyPet(+pi.value); });
  } }, { name: 'Mouse & Keyboard', build: function (body) {          // (Mouse & Keyboard: which keys interact, use your tools and place items, move you about, cast spells, sprint, strafe, open your quests, crafting, bag, map, friends and skills, flip the hotbar, pick its slots and call the Moonstone Mooring)
    body.innerHTML = '';
    var stops = [];
    keyGrabStop = function () { stops.forEach(function (f) { f(); }); };   // (leaving the page stops waiting for a key)
    var KEY_SECTIONS = { 'Interact': 'Gameplay', 'Confirm': 'Menu' };                  // (a little label over the row each section starts at)
    [['Interact', 'everdawn-interact', 'everdawnSetInteract', 'E/Space-bar'], ['Use Tool/Place Item', 'everdawn-use-key', 'everdawnSetUseKey', 'E/Space-bar'], ['Move Up', 'everdawn-move-up', 'everdawnSetMoveUp', 'W/Up Arrow'], ['Move Down', 'everdawn-move-down', 'everdawnSetMoveDown', 'S/Down Arrow'], ['Move Right', 'everdawn-move-right', 'everdawnSetMoveRight', 'D/Right Arrow'], ['Move Left', 'everdawn-move-left', 'everdawnSetMoveLeft', 'A/Left Arrow'], ['Spell Casting', 'everdawn-spell-key', 'everdawnSetSpellKey', 'Q'], ['Sprint', 'everdawn-sprint-key', 'everdawnSetSprintKey', 'Shift'], ['Strafe', 'everdawn-strafe-key', 'everdawnSetStrafeKey', 'C'], ['Quest Screen', 'everdawn-quest-key', 'everdawnSetQuestKey', 'J'], ['Craft Screen', 'everdawn-craft-key', 'everdawnSetCraftKey', 'K'], ['Inventory Screen', 'everdawn-bag-key', 'everdawnSetBagKey', 'I'], ['Map Screen', 'everdawn-map-key', 'everdawnSetMapKey', 'T'], ['Relationship Screen', 'everdawn-rel-key', 'everdawnSetRelKey', 'H'], ['Skills Screen', 'everdawn-skill-key', 'everdawnSetSkillKey', 'L'], ['Switch To next Toolbar Row', 'everdawn-row-key', 'everdawnSetRowKey', 'R'], ['Toolbar 1', 'everdawn-slot1-key', 'everdawnSetSlot1Key', '1'], ['Toolbar 2', 'everdawn-slot2-key', 'everdawnSetSlot2Key', '2'], ['Toolbar 3', 'everdawn-slot3-key', 'everdawnSetSlot3Key', '3'], ['Toolbar 4', 'everdawn-slot4-key', 'everdawnSetSlot4Key', '4'], ['Call Moonstone Mooring', 'everdawn-mooring-key', 'everdawnSetMooringKey', 'X'], ['Cast/Cut fishing rod', 'everdawn-rod-key', 'everdawnSetRodKey', 'E/Space'], ['Advance Dialogue', 'everdawn-advance-key', 'everdawnSetAdvanceKey', 'E'], ['Skip Events', 'everdawn-skip-key', 'everdawnSetSkipKey', 'N'], ['Open Pause Menu', 'everdawn-pause-key', 'everdawnSetPauseKey', 'P'], ['Zoom In Map', 'everdawn-map-zoom-in', 'everdawnSetZoomInKey', '+'], ['Zoom Out Map', 'everdawn-map-zoom-out', 'everdawnSetZoomOutKey', '−'], ['Center Map Focus', 'everdawn-map-center', 'everdawnSetCenterMapKey', 'M'], ['Sort List Shortcut', 'everdawn-sort-key', 'everdawnSetSortKey', 'Tab'], ['Enter Decor Mode', 'everdawn-decor-key', 'everdawnSetDecorKey', 'G'], ['Exit Decor Mode', 'everdawn-decor-exit-key', 'everdawnSetDecorExitKey', 'G'], ['Pick Up', 'everdawn-decor-pick-key', 'everdawnSetDecorPickKey', '<svg viewBox="0 0 24 28" width="20" height="23" role="img" aria-label="Left mouse click" style="display:block;margin:0 auto"><path d="M12 2.5A8.5 8.5 0 0 0 3.5 11v.5H12z" fill="currentColor"/><rect x="3" y="2" width="18" height="24" rx="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v10M3 12h18" stroke="currentColor" stroke-width="2"/></svg>'], ['Put Down', 'everdawn-decor-drop-key', 'everdawnSetDecorDropKey', '<svg viewBox="0 0 24 28" width="20" height="23" role="img" aria-label="Left mouse click" style="display:block;margin:0 auto"><path d="M12 2.5A8.5 8.5 0 0 0 3.5 11v.5H12z" fill="currentColor"/><rect x="3" y="2" width="18" height="24" rx="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v10M3 12h18" stroke="currentColor" stroke-width="2"/></svg>'], ['Rotate', 'everdawn-decor-rotate-key', 'everdawnSetDecorRotateKey', 'R'], ['Select Item', 'everdawn-decor-select-key', 'everdawnSetDecorSelectKey', '<svg viewBox="0 0 24 28" width="20" height="23" role="img" aria-label="Left mouse click" style="display:block;margin:0 auto"><path d="M12 2.5A8.5 8.5 0 0 0 3.5 11v.5H12z" fill="currentColor"/><rect x="3" y="2" width="18" height="24" rx="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v10M3 12h18" stroke="currentColor" stroke-width="2"/></svg>'], ['Toggle Grid', 'everdawn-decor-grid-key', 'everdawnSetDecorGridKey', 'T'], ['Open Storage', 'everdawn-decor-storage-key', 'everdawnSetDecorStorageKey', 'Space'], ['Open Inventory', 'everdawn-decor-inventory-key', 'everdawnSetDecorInventoryKey', 'I'], ['Zoom In Decor Mode', 'everdawn-decor-zoom-in', 'everdawnSetDecorZoomInKey', '+'], ['Zoom Out Decor Mode', 'everdawn-decor-zoom-out', 'everdawnSetDecorZoomOutKey', '−'], ['Reset Decor Mode Camera', 'everdawn-decor-camera-reset', 'everdawnSetDecorCamResetKey', 'C'], ['Enter Farm View Mode', 'everdawn-farm-view-key', 'everdawnSetFarmViewKey', 'V'], ['Exit Farm View Mode', 'everdawn-farm-view-exit-key', 'everdawnSetFarmViewExitKey', 'V'], ['Minigame Primary Action', 'everdawn-minigame-primary', 'everdawnSetMinigamePrimaryKey', 'Space'], ['Minigame Secondary Action', 'everdawn-minigame-secondary', 'everdawnSetMinigameSecondaryKey', 'W'], ['Minigame Attack', 'everdawn-minigame-attack', 'everdawnSetMinigameAttackKey', '<svg viewBox="0 0 24 28" width="20" height="23" role="img" aria-label="Left mouse click" style="display:block;margin:0 auto"><path d="M12 2.5A8.5 8.5 0 0 0 3.5 11v.5H12z" fill="currentColor"/><rect x="3" y="2" width="18" height="24" rx="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v10M3 12h18" stroke="currentColor" stroke-width="2"/></svg>'], ['Deselect Item', 'everdawn-decor-deselect-key', 'everdawnSetDecorDeselectKey', '<svg viewBox="0 0 24 28" width="20" height="23" role="img" aria-label="Left mouse click" style="display:block;margin:0 auto"><path d="M12 2.5A8.5 8.5 0 0 0 3.5 11v.5H12z" fill="currentColor"/><rect x="3" y="2" width="18" height="24" rx="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v10M3 12h18" stroke="currentColor" stroke-width="2"/></svg>'], ['Confirm', 'everdawn-confirm-key', 'everdawnSetConfirmKey', '<svg viewBox="0 0 24 28" width="20" height="23" role="img" aria-label="Left mouse click" style="display:block;margin:0 auto"><path d="M12 2.5A8.5 8.5 0 0 0 3.5 11v.5H12z" fill="currentColor"/><rect x="3" y="2" width="18" height="24" rx="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v10M3 12h18" stroke="currentColor" stroke-width="2"/></svg>'], ['Cancel', 'everdawn-cancel-key', 'everdawnSetCancelKey', '<svg viewBox="0 0 24 28" width="20" height="23" role="img" aria-label="Left mouse click" style="display:block;margin:0 auto"><path d="M12 2.5A8.5 8.5 0 0 0 3.5 11v.5H12z" fill="currentColor"/><rect x="3" y="2" width="18" height="24" rx="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v10M3 12h18" stroke="currentColor" stroke-width="2"/></svg>'], ['Switch Next Tab', 'everdawn-tab-key', 'everdawnSetTabKey', '<svg viewBox="0 0 24 28" width="20" height="23" role="img" aria-label="Left mouse click" style="display:block;margin:0 auto"><path d="M12 2.5A8.5 8.5 0 0 0 3.5 11v.5H12z" fill="currentColor"/><rect x="3" y="2" width="18" height="24" rx="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v10M3 12h18" stroke="currentColor" stroke-width="2"/></svg>'], ['Switch Previous Tab', 'everdawn-tab-prev-key', 'everdawnSetTabPrevKey', '<svg viewBox="0 0 24 28" width="20" height="23" role="img" aria-label="Left mouse click" style="display:block;margin:0 auto"><path d="M12 2.5A8.5 8.5 0 0 0 3.5 11v.5H12z" fill="currentColor"/><rect x="3" y="2" width="18" height="24" rx="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v10M3 12h18" stroke="currentColor" stroke-width="2"/></svg>']].forEach(function (row, n) {
      if (KEY_SECTIONS[row[0]]) body.insertAdjacentHTML('beforeend', '<div class="ev-ksec">' + KEY_SECTIONS[row[0]] + '</div>');
      body.insertAdjacentHTML('beforeend', '<div class="ev-srow ev-tog" style="flex-wrap:wrap;row-gap:8px"><span class="ev-lbl" id="evKeyL' + n + '" style="flex:1 0 auto">' + row[0] + '</span><div class="ev-seg" role="group" aria-labelledby="evKeyL' + n + '"><button type="button">' + row[3] + '</button><button type="button" aria-label="Your own key" style="min-width:96px"></button></div></div>');   // (on a narrow screen the buttons drop below the name)
      var btns = body.querySelectorAll('#evKeyL' + n + ' + .ev-seg button'), code = '', waiting = false;   // (the usual keys, or a key of your own: tap the second button, then press the key)
      try { code = localStorage.getItem(row[1]) || ''; } catch (err) {}
      function show() {
        var own = !!code || waiting; btns[0].classList.toggle('on', !own); btns[0].setAttribute('aria-pressed', own ? 'false' : 'true'); btns[1].classList.toggle('on', own); btns[1].setAttribute('aria-pressed', own ? 'true' : 'false');
        btns[1].textContent = waiting ? 'Press a key…' : code ? everdawnKeyName(code) : '';
      }
      function set(c) { code = c; try { if (code) localStorage.setItem(row[1], code); else localStorage.removeItem(row[1]); } catch (err) {} if (window[row[2]]) window[row[2]](code || null); show(); }
      function grab(e) {                                               // (the next key pressed is the one; Escape changes nothing)
        e.preventDefault(); e.stopImmediatePropagation(); stop();
        if (e.code && e.code !== 'Escape') set(e.code);
      }
      function stop() { if (!waiting) return; window.removeEventListener('keydown', grab, true); waiting = false; keyGrab = false; show(); }
      stops.push(stop);
      btns[0].addEventListener('click', function () { stop(); set(''); });
      btns[1].addEventListener('click', function () { if (waiting) return; keyGrabStop(); waiting = true; keyGrab = true; show(); window.addEventListener('keydown', grab, true); });
      show();
    });
    // Toggle HUD: On or Off, at the end of Gameplay (just above Menu)
    var hud = 'on'; try { if (localStorage.getItem('everdawn-hud') === 'off') hud = 'off'; } catch (err) {}
    var hudRow = document.createElement('div'); hudRow.className = 'ev-srow ev-tog';
    hudRow.innerHTML = '<span class="ev-lbl" id="evHudL">Toggle HUD</span><div class="ev-seg" role="group" aria-labelledby="evHudL"><button type="button" data-h="on">On</button><button type="button" data-h="off">Off</button></div>';
    var menuSec = Array.prototype.filter.call(body.querySelectorAll('.ev-ksec'), function (x) { return x.textContent === 'Menu'; })[0];
    body.insertBefore(hudRow, menuSec || null);
    var decorSec = document.createElement('div'); decorSec.className = 'ev-ksec'; decorSec.textContent = 'Decor Mode';   // (the Decor Mode section, under Toggle HUD: its settings are still to come)
    body.insertBefore(decorSec, menuSec || null);
    var decorRowLbl = Array.prototype.filter.call(body.querySelectorAll('.ev-lbl'), function (x) { return x.textContent === 'Enter Decor Mode'; })[0];   // (its key goes in the Decor Mode section)
    if (decorRowLbl) body.insertBefore(decorRowLbl.parentNode, menuSec || null);
    ['Exit Decor Mode', 'Pick Up', 'Put Down', 'Rotate', 'Select Item', 'Deselect Item', 'Toggle Grid', 'Open Storage', 'Open Inventory', 'Zoom In Decor Mode', 'Zoom Out Decor Mode', 'Reset Decor Mode Camera'].forEach(function (name) {   // (and the keys that leave it and move the furniture, right under)
      var lbl = Array.prototype.filter.call(body.querySelectorAll('.ev-lbl'), function (x) { return x.textContent === name; })[0];
      if (lbl) body.insertBefore(lbl.parentNode, menuSec || null);
    });
    // Toggle HUD In Decor Mode: On or Off, at the end of the Decor Mode section
    var dhud = 'on'; try { if (localStorage.getItem('everdawn-decor-hud') === 'off') dhud = 'off'; } catch (err) {}
    var dhudRow = document.createElement('div'); dhudRow.className = 'ev-srow ev-tog';
    dhudRow.innerHTML = '<span class="ev-lbl" id="evDecorHudL">Toggle HUD In Decor Mode</span><div class="ev-seg" role="group" aria-labelledby="evDecorHudL"><button type="button" data-h="on">On</button><button type="button" data-h="off">Off</button></div>';
    body.insertBefore(dhudRow, menuSec || null);
    var dhudBtns = dhudRow.querySelectorAll('button');
    function showDecorHud() { for (var b = 0; b < dhudBtns.length; b++) { var on = dhudBtns[b].getAttribute('data-h') === dhud; dhudBtns[b].classList.toggle('on', on); dhudBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var dh = 0; dh < dhudBtns.length; dh++) dhudBtns[dh].addEventListener('click', function () {
      dhud = this.getAttribute('data-h'); showDecorHud(); try { localStorage.setItem('everdawn-decor-hud', dhud); } catch (err) {} if (window.everdawnSetDecorHud) window.everdawnSetDecorHud(dhud === 'on'); });
    showDecorHud();
    var farmSec = document.createElement('div'); farmSec.className = 'ev-ksec'; farmSec.textContent = 'Farm View';   // (the Farm View section, after Decor Mode)
    body.insertBefore(farmSec, menuSec || null);
    ['Enter Farm View Mode', 'Exit Farm View Mode'].forEach(function (name) {   // (its keys, right under)
      var lbl = Array.prototype.filter.call(body.querySelectorAll('.ev-lbl'), function (x) { return x.textContent === name; })[0];
      if (lbl) body.insertBefore(lbl.parentNode, menuSec || null);
    });
    // Toggle HUD In Farm View Mode: On or Off, at the end of the Farm View section
    var fhud = 'on'; try { if (localStorage.getItem('everdawn-farm-hud') === 'off') fhud = 'off'; } catch (err) {}
    var fhudRow = document.createElement('div'); fhudRow.className = 'ev-srow ev-tog';
    fhudRow.innerHTML = '<span class="ev-lbl" id="evFarmHudL">Toggle HUD In Farm View Mode</span><div class="ev-seg" role="group" aria-labelledby="evFarmHudL"><button type="button" data-h="on">On</button><button type="button" data-h="off">Off</button></div>';
    body.insertBefore(fhudRow, menuSec || null);
    var fhudBtns = fhudRow.querySelectorAll('button');
    function showFarmHud() { for (var b = 0; b < fhudBtns.length; b++) { var on = fhudBtns[b].getAttribute('data-h') === fhud; fhudBtns[b].classList.toggle('on', on); fhudBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var fh = 0; fh < fhudBtns.length; fh++) fhudBtns[fh].addEventListener('click', function () {
      fhud = this.getAttribute('data-h'); showFarmHud(); try { localStorage.setItem('everdawn-farm-hud', fhud); } catch (err) {} if (window.everdawnSetFarmHud) window.everdawnSetFarmHud(fhud === 'on'); });
    showFarmHud();
    var eventsSec = document.createElement('div'); eventsSec.className = 'ev-ksec'; eventsSec.textContent = 'Events';   // (the Events section, after Farm View: for the events and festivals and their minigames)
    body.insertBefore(eventsSec, menuSec || null);
    ['Minigame Primary Action', 'Minigame Secondary Action', 'Minigame Attack'].forEach(function (name) {              // (its keys, right under)
      var lbl = Array.prototype.filter.call(body.querySelectorAll('.ev-lbl'), function (x) { return x.textContent === name; })[0];
      if (lbl) body.insertBefore(lbl.parentNode, menuSec || null);
    });
    var hudBtns = hudRow.querySelectorAll('button');
    function showHud() { for (var b = 0; b < hudBtns.length; b++) { var on = hudBtns[b].getAttribute('data-h') === hud; hudBtns[b].classList.toggle('on', on); hudBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var hb = 0; hb < hudBtns.length; hb++) hudBtns[hb].addEventListener('click', function () {
      hud = this.getAttribute('data-h'); showHud(); try { localStorage.setItem('everdawn-hud', hud); } catch (err) {} if (window.everdawnSetHud) window.everdawnSetHud(hud === 'on'); });
    showHud();
  } }, { name: 'Controller', build: function (body) {                  // (Controller: for playing with an Xbox, PlayStation or Switch controller; its settings are still to come)
    var gap = document.createElement('div'); gap.style.height = 'clamp(160px,32vh,280px)'; body.appendChild(gap);   // (empty for now, but the page keeps its usual size)
  } }, { name: 'Language', build: function (body) {                    // (Language: every word in the game in English, Español, Français, Italiano, Deutsch or Português; script5.js does the changing)
    var names = [['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['it', 'Italiano'], ['de', 'Deutsch'], ['pt', 'Português']];
    body.innerHTML = '<div class="ev-langs" role="group" aria-label="Language">' + names.map(function (l) { return '<button type="button" translate="no" lang="' + l[0] + '" data-l="' + l[0] + '">' + l[1] + '</button>'; }).join('') + '</div>';
    var lb = body.querySelectorAll('.ev-langs button');
    function showLang() { var now = window.everdawnLanguage ? window.everdawnLanguage() : 'en'; for (var b = 0; b < lb.length; b++) { var on = lb[b].getAttribute('data-l') === now; lb[b].classList.toggle('on', on); lb[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var l = 0; l < lb.length; l++) lb[l].addEventListener('click', function () { if (window.everdawnSetLanguage) window.everdawnSetLanguage(this.getAttribute('data-l')); showLang(); });
    showLang();
  } }, { name: 'Accessibility', build: function (body) {               // (Accessibility: its settings are still to come)
    var gap = document.createElement('div'); gap.style.height = 'clamp(160px,32vh,280px)'; body.appendChild(gap);   // (empty for now, but the page keeps its usual size)
  } }], setPage = 0, keyGrab = false, keyGrabStop = null;
  window.everdawnKeyGrabbing = function () { return keyGrab; };   // (while a new key is being chosen, Cancel's key doesn't cancel)
  var sett = document.createElement('div'); sett.className = 'ev-slots ev-sett'; sett.setAttribute('role', 'dialog'); sett.setAttribute('aria-modal', 'true'); sett.setAttribute('aria-label', 'Settings');
  sett.innerHTML = '<div class="ev-scard"><div class="ev-sethead"><button type="button" class="ev-pg prev" aria-label="Previous page">‹</button><h2></h2><button type="button" class="ev-pg next" aria-label="Next page">›</button></div>' +
    '<div class="ev-dots"></div><div class="ev-setbody"></div><button type="button" class="ev-back">Done</button></div>';
  root.appendChild(sett);
  var setTitle = sett.querySelector('h2'), setPrev = sett.querySelector('.prev'), setNext = sett.querySelector('.next'), setDots = sett.querySelector('.ev-dots'), setBody = sett.querySelector('.ev-setbody');
  function showSetPage(i) {
    if (keyGrabStop) keyGrabStop(); setPage = Math.max(0, Math.min(SET_PAGES.length - 1, i)); var pg = SET_PAGES[setPage];
    setTitle.textContent = '✦ ' + pg.name + ' ✦'; setBody.innerHTML = ''; if (pg.build) pg.build(setBody);
    setPrev.disabled = setPage === 0; setNext.disabled = setPage === SET_PAGES.length - 1;
    setDots.innerHTML = SET_PAGES.map(function (p, k) { return '<i' + (k === setPage ? ' class="on"' : '') + '></i>'; }).join('');
  }
  function openSettings() { if (!ready || root.classList.contains('gone')) return; showSetPage(setPage); sett.classList.add('open'); btnRow.style.visibility = 'hidden'; hint.style.visibility = 'hidden'; sett.querySelector('.ev-back').focus(); }
  function closeSettings() {
    if (keyGrabStop) keyGrabStop(); sett.classList.remove('open');
    if (root.classList.contains('ingame')) { root.classList.add('gone'); var back = settBack; settBack = null; if (back) back(); return; }   // (opened from the pause menu: back to it)
    btnRow.style.visibility = ''; hint.style.visibility = ''; optBtn.focus();
  }
  var settBack = null;                                                // Settings from the pause menu, once you're playing (back() is called when it closes)
  window.everdawnOpenSettings = function (back) {
    if (!root.classList.contains('ingame')) return false;
    settBack = back || null; root.classList.remove('gone'); showSetPage(setPage); sett.classList.add('open'); sett.querySelector('.ev-back').focus(); return true;
  };
  window.everdawnSettingsOpen = function () { return sett.classList.contains('open'); };
  window.everdawnSettingsNextPage = function () { showSetPage((setPage + 1) % SET_PAGES.length); };   // (Switch Next Tab: after the last page comes the first)
  window.everdawnSettingsPrevPage = function () { showSetPage((setPage + SET_PAGES.length - 1) % SET_PAGES.length); };   // (Switch Previous Tab: before the first comes the last)
  setPrev.addEventListener('click', function () { showSetPage(setPage - 1); });
  setNext.addEventListener('click', function () { showSetPage(setPage + 1); });
  sett.querySelector('.ev-back').addEventListener('click', closeSettings);
  sett.addEventListener('click', function (e) { if (e.target === sett) closeSettings(); });
  optBtn.addEventListener('click', openSettings);
  playBtn.addEventListener('click', openSlots);
  window.addEventListener('keydown', function (e) {
    if (keyGrab) return;                                               // (choosing a key for Interact: that key isn't for us)
    if (slots.classList.contains('open')) { if (e.target && e.target.tagName === 'INPUT') return; if (e.code === 'Escape') { e.preventDefault(); if (naming) naming(); else closeSlots(); } return; }
    if (sett.classList.contains('open') && e.target && e.target.type === 'range' && /^Arrow|^Home$|^End$|^Page/.test(e.key)) { e.stopPropagation(); return; }   // (arrow keys on a slider move the slider, and never reach the game behind)
    if (sett.classList.contains('open')) { if (e.code === 'Escape') { e.preventDefault(); closeSettings(); } else if ((e.code === 'ArrowLeft' || e.code === 'ArrowRight') && !(e.target && e.target.type === 'range')) { e.preventDefault(); showSetPage(setPage + (e.code === 'ArrowLeft' ? -1 : 1)); } return; }   // (in Settings: Esc closes it, and the arrow keys flip the pages)   // (in the slot list, Enter just presses whichever slot you're on)
    if (e.target === optBtn || root.classList.contains('ingame')) return; if (root.isConnected && ready && (e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter')) { e.preventDefault(); openSlots(); } }, true);
  return {
    progress: function (p, tip) { target = Math.max(target, p); if (tip) { setTip(tip); tipAt = performance.now(); } },
    ready: function () { ready = true; target = 100; setTip('All ready!'); },
    fail: function (msg) { setTip(msg); pctEl.textContent = ''; }
  };
})();

(function () {
  function build(THREE) {                                              // (let the title screen paint first, then build the island: that takes a moment)
    everdawnTitle.progress(55, 'Building the island…');
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      setTimeout(function () {
        try { startGame(THREE); } catch (err) { everdawnTitle.fail('Something went wrong loading the game'); throw err; }
        everdawnTitle.progress(85, 'Opening the gate…');
        setTimeout(everdawnTitle.ready, 600);
      }, 60);
    }); });
  }
  if (window.THREE) { build(window.THREE); return; }
  var creep = setInterval(function () { everdawnTitle.progress(Math.min(45, 4 + (Date.now() - creepAt) / 120)); }, 200), creepAt = Date.now();   // (fetching the 3D engine)
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  s.onload = function () { clearInterval(creep); build(window.THREE); };
  s.onerror = function () { clearInterval(creep); everdawnTitle.fail('Could not load the 3D engine. Check your internet connection.'); showToast('Could not load the 3D engine. Check your internet connection.', 60000); };
  document.head.appendChild(s);
})();
