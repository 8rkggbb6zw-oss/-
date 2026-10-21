// Everdawn, part 3 of 3 (see the note at the top of script.js). This file holds the rest of the game, then joins all
// three parts back together and starts it

EVERDAWN_PARTS.push(function (THREE) {
  // ===== Iridelle sounds =====
  // (New animals' sounds go here, at the top of script3.js, where there's room; the earlier ones, and petSound, which
  // plays the right voice for each kind, are near the end of script2.js.) An Iridelle chirps like a real hermit crab:
  // a quick, croaky little "krrrk", a run of tiny scrapes about 65 a second around 2,700 Hz, rising a little in the
  // middle, then a few happy "tik-tik-tik" taps of its crystal pincers. Two chirps and clicks when you pet it; a chirp,
  // then two more and clicks when you take its Tidelight Pearl; soft munching as it eats; two slow, low chirps that
  // slide down when it's hungry; a chirp and clicks once it's fed and petted; and now and then a chirp of its own while
  // you're in the barn. They're pet sounds, so they follow Pet Sound in Settings
  function crabSound(kind, loud) {
    if (!kind || !audioCtx || audioCtx.state !== 'running') return;
    var ac = audioCtx, now = ac.currentTime, out = ac.createGain(); out.gain.value = loud === undefined ? 1 : loud; out.evPet = true; out.connect(ac.destination);
    var nbuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), nd = nbuf.getChannelData(0); for (var ni = 0; ni < nd.length; ni++) nd[ni] = Math.random() * 2 - 1;
    function env() { var g = ac.createGain(); g.gain.value = 0; return g; }   // (silent until told otherwise, so nothing clicks as it starts)
    var nk = Math.sqrt(ac.sampleRate / 24000);                         // (so the taps are just as loud whatever rate the sound card runs at)
    function burst(t0, hz, Q, vol, len) {                              // (a tiny ringing tap of noise)
      var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = env(); s.buffer = nbuf; f.type = 'bandpass'; f.frequency.value = hz; f.Q.value = Q;
      g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol * nk, t0 + 0.0015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
      s.connect(f); f.connect(g); g.connect(out); s.start(t0, Math.random() * 0.5); s.stop(t0 + len + 0.005);
    }
    function rasp(at, n, rate, hz, sad) {                              // (one chirp, "krrrk": a quick run of tiny scrapes; sad ones are slower and slide down. Returns how long it takes)
      for (var i = 0; i < n; i++) burst(now + at + i / rate * (0.9 + Math.random() * 0.2), hz * (sad ? 1 - i / n * 0.2 : 1 + Math.sin(i / n * Math.PI) * 0.12), 6, (sad ? 0.4 : 0.28) * (0.25 + 0.75 * Math.sin((i + 0.5) / n * Math.PI)), 0.012);
      return n / rate;
    }
    function clicks(at) {                                              // (three quick taps of its crystal pincers, "tik-tik-tik")
      for (var i = 0; i < 3; i++) { var t0 = now + at + i * 0.075 + Math.random() * 0.02, hz = 3800 + Math.random() * 1400; burst(t0, hz, 9, 0.157, 0.03); burst(t0, hz * 1.62, 9, 0.094, 0.03); }
    }
    function munching(n, vol) {
      for (var k = 0; k < n; k++) { var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = env(), t0 = now + k * 0.16 + Math.random() * 0.03; s.buffer = nbuf; f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 1.5;
        g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08); s.connect(f); f.connect(g); g.connect(out); s.start(t0, Math.random() * 0.5); s.stop(t0 + 0.1); }
    }
    function V(at, m) {                                                // (a chirp: happy is two, sad is one slow, low one; then clicks unless it's sad)
      if (m < 0) { rasp(at, 7, 30, 1900, true); return; }
      if (m > 0) { var a = rasp(at, 9, 65, 2700); rasp(at + a + 0.12, 11, 70, 2900); } else rasp(at, 9, 65, 2700);
      clicks(at + 0.35);
    }
    if (kind === 'pet') V(0, 1);
    else if (kind === 'egg') { V(0, 0); V(0.6, 1); }
    else if (kind === 'content') V(0, 0);
    else if (kind === 'hungry') { V(0, -1); V(0.9, -1); }
    else if (kind === 'eat') munching(4, 0.05);
    else if (kind === 'chirp') V(0, Math.random() < 0.65 ? 0 : 1);
  }
  iridelleAction = (function (base) {                                  // (looking after an Iridelle: the sound to go with what happened)
    return function (g) {
      var egg = g.egg, fed = g.fed, petted = g.petted, r = base.apply(this, arguments);
      crabSound(egg ? (g.egg ? null : 'egg') : !fed && g.fed ? 'eat' : !petted && g.petted ? 'pet' : !fed ? 'hungry' : fed && petted ? 'content' : null);   // (no sound if the pearl couldn't be taken: a full bag)
      return r;
    };
  })(iridelleAction);

  // ===== Nyxalia sounds =====
  // A Nyxalia snuffles like a big, gentle beast
  // sniffing your hand: each snuffle built like a real snort, quick little flaps of the nose, about 50 a second and a
  // bit uneven, ringing through a snout measured from a real one, but slower and deeper, then a sprinkle of twinkling
  // stars. Two quick snuffles and stars when you pet it; a snuffle and two more when you milk it for Opaline Milk; soft
  // munching as it eats; two slow, low snuffles, twice, when it's hungry; a snuffle once it's fed and petted; and now
  // and then a snuffle of its own while you're in the barn. They're pet sounds, so they follow Pet Sound in Settings
  function bisonSound(kind, loud) {
    if (!kind || !audioCtx || audioCtx.state !== 'running') return;
    var ac = audioCtx, now = ac.currentTime, out = ac.createGain(); out.gain.value = loud === undefined ? 1 : loud; out.evPet = true; out.connect(ac.destination);
    var nbuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), nd = nbuf.getChannelData(0); for (var ni = 0; ni < nd.length; ni++) nd[ni] = Math.random() * 2 - 1;
    function env() { var g = ac.createGain(); g.gain.value = 0; return g; }   // (silent until told otherwise, so nothing clicks as it starts)
    var SNOUT = [-2.23142, 2.49093, -1.98929, 1.28008, -0.73534, 0.31941, -0.16405, 0.30127, -0.6302, 0.61933, -0.33353, 0.16593, -0.2846, 0.30495, -0.20078, 0.16008, -0.08104, 0.03997];   // (how a real snout rings, measured from a real snort)
    function snuffle(at, scale, rate) {                                // (one snuffle; scale below 1 is slower and deeper. Returns how long it takes)
      var SR = 24000, len = 0.12, n = Math.floor(SR * len), buf = ac.createBuffer(1, n, SR * scale), d = buf.getChannelData(0), y = new Float64Array(SNOUT.length), next = 0;
      for (var i = 0; i < n; i++) { var t = i / n, e = (Math.random() - 0.5) * 0.06;
        if (i >= next) { e += 0.5 + Math.random() * 0.5; next = i + SR / rate * (0.92 + Math.random() * 0.16); }   // (the next flap of the nose)
        var v = e; for (var k = 0; k < SNOUT.length; k++) v -= SNOUT[k] * y[k];
        for (var k2 = SNOUT.length - 1; k2 > 0; k2--) y[k2] = y[k2 - 1]; y[0] = v;
        d[i] = v * (t < 0.08 ? t / 0.08 : t < 0.55 ? 1 : Math.pow(1 - (t - 0.55) / 0.45, 1.5)) * 0.02; }
      var s = ac.createBufferSource(), hp = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = buf; hp.type = 'highpass'; hp.frequency.value = 90 * scale; g.gain.value = 1.8;
      s.connect(hp); hp.connect(g); g.connect(out); s.start(now + at);
      return len / scale;
    }
    var STARS = [1568, 1760, 2093, 2349, 2637, 3136, 3520];
    function twinkle(at, n, vol) {                                     // (a few tiny twinkles of starlight)
      for (var j = 0; j < n; j++) { var hz = STARS[Math.floor(Math.random() * STARS.length)], t0 = now + at + j * 0.08 + Math.random() * 0.03;
        [1, 2.76, 5.4].forEach(function (m, i) { var o = ac.createOscillator(), g = env(); o.type = 'sine'; o.frequency.value = hz * m;
          g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol * [1, 0.3, 0.12][i], t0 + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6 * [1, 0.5, 0.3][i]);
          o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + 0.62); }); }
    }
    function munching(n, vol) {
      for (var k = 0; k < n; k++) { var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = env(), t0 = now + k * 0.16 + Math.random() * 0.03; s.buffer = nbuf; f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 1.5;
        g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08); s.connect(f); f.connect(g); g.connect(out); s.start(t0, Math.random() * 0.5); s.stop(t0 + 0.1); }
    }
    function V(at, m) {                                                // (a snuffle: happy is two quick ones, sad is two slow, low ones)
      if (m < 0) { var a = snuffle(at, 0.8, 40); snuffle(at + a + 0.25, 0.76, 38); }
      else if (m > 0) { var b = snuffle(at, 0.9, 50); snuffle(at + b + 0.1, 0.95, 54); }
      else snuffle(at, 0.9, 50);
    }
    if (kind === 'pet') { V(0, 1); twinkle(0.5, 3, 0.018); }
    else if (kind === 'egg') { V(0, 0); V(0.75, 1); twinkle(1.0, 4, 0.016); }
    else if (kind === 'content') { V(0, 0); twinkle(0.3, 2, 0.016); }
    else if (kind === 'hungry') { V(0, -1); V(1.0, -1); }
    else if (kind === 'eat') munching(4, 0.04);
    else if (kind === 'chirp') { V(0, Math.random() < 0.65 ? 0 : 1); if (Math.random() < 0.5) twinkle(0.35, 2, 0.016); }
  }
  nocturraAction = (function (base) {                                  // (looking after a Nyxalia: the sound to go with what happened)
    return function (g) {
      var egg = g.egg, fed = g.fed, petted = g.petted, r = base.apply(this, arguments);
      bisonSound(egg ? (g.egg ? null : 'egg') : !fed && g.fed ? 'eat' : !petted && g.petted ? 'pet' : !fed ? 'hungry' : fed && petted ? 'content' : null);   // (no sound if it couldn't be milked: no pail, or a full bag)
      return r;
    };
  })(nocturraAction);

  // ===== Amarys sounds =====
  // An Amarys sneezes like a real little turtle,
  // built from a real turtle's sneeze: a faint, squeaky in-breath around 1,300 Hz, then a bright little "tchoo!", a
  // puff of breath about a tenth of a second long with a tiny squeak riding on it that rises and falls, then a sprinkle
  // of sparkles. A sneeze and sparkles when you pet it; a sneeze and a quick second one when you pick its Starbloom;
  // soft munching as it eats; two little sad squeaks when it's hungry; a quick sneeze once it's fed and petted; and
  // now and then a sneeze or a squeak of its own while you're in the barn. They're pet sounds, so they follow Pet
  // Sound in Settings
  function tortSound(kind, loud) {
    if (!kind || !audioCtx || audioCtx.state !== 'running') return;
    var ac = audioCtx, now = ac.currentTime, out = ac.createGain(); out.gain.value = loud === undefined ? 1 : loud; out.evPet = true; out.connect(ac.destination);
    var nbuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), nd = nbuf.getChannelData(0); for (var ni = 0; ni < nd.length; ni++) nd[ni] = Math.random() * 2 - 1;
    function env() { var g = ac.createGain(); g.gain.value = 0; return g; }   // (silent until told otherwise, so nothing clicks as it starts)
    function sneeze(at, size, noPre) {                                 // (one sneeze; size above 1 is a smaller turtle; noPre skips the in-breath. Returns how long it takes)
      var t0 = now + at, s = size * 1.08, vol = 0.021;
      if (!noPre) { var p = ac.createOscillator(), pg = env(); p.type = 'sine'; p.frequency.setValueAtTime(1320 * s, t0); p.frequency.linearRampToValueAtTime(1240 * s, t0 + 0.13);   // (the squeaky in-breath)
        pg.gain.setValueAtTime(0.0001, t0); pg.gain.linearRampToValueAtTime(vol * 0.12, t0 + 0.03); pg.gain.setValueAtTime(vol * 0.12, t0 + 0.1); pg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.15);
        p.connect(pg); pg.connect(out); p.start(t0); p.stop(t0 + 0.16); t0 += 0.15; }
      var n = ac.createBufferSource(), hp = ac.createBiquadFilter(), g = env(); n.buffer = nbuf; hp.type = 'highpass'; hp.frequency.value = 3900 * s; hp.Q.value = 1;   // (the "tchoo": a bright puff of breath)
      [[4200, 2.5, 0.9], [5200, 2.5, 0.6], [6600, 2, 0.8], [8400, 1.5, 1.4]].forEach(function (b) { var f = ac.createBiquadFilter(), fg = ac.createGain(); f.type = 'bandpass'; f.frequency.value = b[0] * s; f.Q.value = b[1]; fg.gain.value = b[2] * 2.2; n.connect(f); f.connect(fg); fg.connect(hp); });
      g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.008); g.gain.setValueAtTime(vol, t0 + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.11);
      hp.connect(g); g.connect(out); n.start(t0, Math.random() * 0.5); n.stop(t0 + 0.13);
      [[1, 1], [2, 0.2]].forEach(function (h) { var o = ac.createOscillator(), og = env(); o.type = 'sine';   // (the tiny squeak riding on it)
        o.frequency.setValueAtTime(900 * s * h[0], t0); o.frequency.exponentialRampToValueAtTime(1550 * s * h[0], t0 + 0.04); o.frequency.exponentialRampToValueAtTime(1000 * s * h[0], t0 + 0.12);
        og.gain.setValueAtTime(0.0001, t0); og.gain.linearRampToValueAtTime(vol * 0.16 * h[1], t0 + 0.01); og.gain.setValueAtTime(vol * 0.16 * h[1], t0 + 0.045); og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.13);
        o.connect(og); og.connect(out); o.start(t0); o.stop(t0 + 0.14); });
      return (noPre ? 0 : 0.15) + 0.13;
    }
    function squeak(at, size, down) {                                  // (just the little squeak on its own, sliding down when it's sad)
      var o = ac.createOscillator(), g = env(), t0 = now + at, s = size * 1.08; o.type = 'sine'; o.frequency.setValueAtTime(1320 * s, t0); o.frequency.exponentialRampToValueAtTime((down ? 1000 : 1240) * s, t0 + 0.2);
      g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.088, t0 + 0.03); g.gain.setValueAtTime(0.088, t0 + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.24);
      o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + 0.25);
    }
    function sparkles(at, len, vol) {                                  // (a tiny sprinkle of sparkles)
      var n = Math.floor(len * 26);
      for (var i = 0; i < n; i++) { var o = ac.createOscillator(), g = env(), t0 = now + at + i / 26 + Math.random() * 0.02; o.type = 'sine'; o.frequency.value = 3000 + Math.random() * 4500;
        var v = vol * 2 * (1 - i / n * 0.6); g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
        o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + 0.13); }
    }
    function munching(n, vol) {
      for (var k = 0; k < n; k++) { var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = env(), t0 = now + k * 0.16 + Math.random() * 0.03; s.buffer = nbuf; f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 1.5;
        g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08); s.connect(f); f.connect(g); g.connect(out); s.start(t0, Math.random() * 0.5); s.stop(t0 + 0.1); }
    }
    if (kind === 'pet') { sneeze(0, 1); sparkles(0.32, 0.35, 0.008); }
    else if (kind === 'egg') { var a = sneeze(0, 1); sneeze(a + 0.15, 1.08, true); sparkles(0.6, 0.45, 0.008); }
    else if (kind === 'content') { sneeze(0, 1.04, true); sparkles(0.15, 0.25, 0.007); }
    else if (kind === 'hungry') { squeak(0, 1, true); squeak(0.45, 0.95, true); }
    else if (kind === 'eat') munching(4, 0.06);
    else if (kind === 'chirp') { if (Math.random() < 0.6) sneeze(0, 0.97 + Math.random() * 0.06, Math.random() < 0.5); else squeak(0, 1); if (Math.random() < 0.5) sparkles(0.3, 0.25, 0.007); }
  }
  grovellaAction = (function (base) {                                  // (looking after an Amarys: the sound to go with what happened)
    return function (g) {
      var egg = g.egg, fed = g.fed, petted = g.petted, r = base.apply(this, arguments);
      tortSound(egg ? (g.egg ? null : 'egg') : !fed && g.fed ? 'eat' : !petted && g.petted ? 'pet' : !fed ? 'hungry' : fed && petted ? 'content' : null);   // (no sound if the Starbloom couldn't be picked: a full bag)
      return r;
    };
  })(grovellaAction);

  // ===== Lumora sounds =====
  // A Lumora chirps like a real crested gecko,
  // built from a real one's chirps: each a tiny "tsip" about 50 thousandths of a second long, holding high a moment
  // then dropping quickly from about 5,200 to 2,900 Hz and getting louder as it falls, with a fainter upper tone and a
  // breath of air, in soft little runs, each chirp a bit longer and louder than the last; then a tiny sprinkle of sunny
  // sparkles. A run of three and sparkles when you pet it; two runs and more sparkles when it gives you its Sunscale;
  // soft munching as it eats; two slow, lower chirps when it's hungry; two chirps once it's fed and petted; and now
  // and then a little run of its own while you're in the barn. They're pet sounds, so they follow Pet Sound in Settings
  function lizSound(kind, loud) {
    if (!kind || !audioCtx || audioCtx.state !== 'running') return;
    var ac = audioCtx, now = ac.currentTime, out = ac.createGain(); out.gain.value = loud === undefined ? 1 : loud; out.evPet = true; out.connect(ac.destination);
    var nbuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), nd = nbuf.getChannelData(0); for (var ni = 0; ni < nd.length; ni++) nd[ni] = Math.random() * 2 - 1;
    function chirp(at, len, vol, size) {                               // (one "tsip"; size above 1 is a smaller, higher gecko)
      var t0 = now + at, top = 5200 * size, bot = 2900 * size;
      [[1, 1], [1.3, 0.65]].forEach(function (p) {                     // (the chirp, and its fainter upper tone)
        var o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine';
        o.frequency.setValueAtTime(top * p[0], t0); o.frequency.linearRampToValueAtTime(top * 0.94 * p[0], t0 + len * 0.3); o.frequency.exponentialRampToValueAtTime(bot * p[0], t0 + len * 0.5);   // (holding high a moment, then dropping)
        g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol * p[1] * 0.55, t0 + 0.004); g.gain.linearRampToValueAtTime(vol * p[1], t0 + len * 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
        o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + len + 0.02);
      });
      var s = ac.createBufferSource(), f = ac.createBiquadFilter(), ng = ac.createGain(); s.buffer = nbuf; f.type = 'bandpass'; f.Q.value = 2;   // (a breath of air along with it)
      f.frequency.setValueAtTime(top, t0); f.frequency.exponentialRampToValueAtTime(bot * 0.8, t0 + len * 0.6);
      ng.gain.setValueAtTime(0.0001, t0); ng.gain.linearRampToValueAtTime(vol * 1.2, t0 + len * 0.5); ng.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
      s.connect(f); f.connect(ng); ng.connect(out); s.start(t0, Math.random() * 0.5); s.stop(t0 + len + 0.02);
    }
    function run(at, n, size, gap, first) {                            // (a run of chirps, each a little longer and louder than the last; returns how long it takes)
      for (var i = 0; i < n; i++) { var k = n > 1 ? i / (n - 1) : 1; chirp(at + i * gap, (first || 0.035) + 0.025 * k, 0.05 * (0.6 + 0.4 * k), size); }
      return n * gap;
    }
    function sparkles(at, len, vol) {                                  // (a tiny sprinkle of sunny sparkles)
      var n = Math.floor(len * 26);
      for (var i = 0; i < n; i++) { var o = ac.createOscillator(), g = ac.createGain(), t0 = now + at + i / 26 + Math.random() * 0.02; o.type = 'sine'; o.frequency.value = 3000 + Math.random() * 4500;
        var v = vol * 2 * (1 - i / n * 0.6); g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
        o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + 0.13); }
    }
    function munching(n, vol) {
      for (var k = 0; k < n; k++) { var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t0 = now + k * 0.16 + Math.random() * 0.03; s.buffer = nbuf; f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 1.5;
        g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08); s.connect(f); f.connect(g); g.connect(out); s.start(t0, Math.random() * 0.5); s.stop(t0 + 0.1); }
    }
    if (kind === 'pet') { run(0, 3, 1, 0.18); sparkles(0.6, 0.35, 0.008); }
    else if (kind === 'egg') { var a = run(0, 2, 1, 0.2); run(a + 0.15, 3, 1.04, 0.18); sparkles(1.1, 0.45, 0.008); }
    else if (kind === 'content') { run(0, 2, 1, 0.2); sparkles(0.4, 0.25, 0.007); }
    else if (kind === 'hungry') run(0, 2, 0.92, 0.38, 0.06);
    else if (kind === 'eat') munching(4, 0.06);
    else if (kind === 'chirp') { run(0, 1 + Math.floor(Math.random() * 3), 0.98 + Math.random() * 0.04, 0.2); if (Math.random() < 0.5) sparkles(0.45, 0.25, 0.007); }
  }
  solarithAction = (function (base) {                                  // (looking after a Lumora: the sound to go with what happened)
    return function (g) {
      var egg = g.egg, fed = g.fed, petted = g.petted, r = base.apply(this, arguments);
      lizSound(egg ? (g.egg ? null : 'egg') : !fed && g.fed ? 'eat' : !petted && g.petted ? 'pet' : !fed ? 'hungry' : fed && petted ? 'content' : null);   // (no sound if the Sunscale couldn't be taken: a full bag)
      return r;
    };
  })(solarithAction);

  // ===== Veilaris sounds =====
  // A Veilaris sings softly, like a spirit of
  // the spring: a low, gliding "oooo", gently wavering, in a dreamy echo, with bubbles rising. A happy song that swoops
  // up when you pet it; a little song and a happy one when you shear its Glimmerkelp; soft munching and a gulp of air
  // as it eats; two low songs sinking away when it's hungry; a little song once it's fed and petted; and now and then
  // a song of its own while you're in the barn. They're pet sounds, so they follow Pet Sound in Settings
  function veilSound(kind, loud) {
    if (!kind || !audioCtx || audioCtx.state !== 'running') return;
    var ac = audioCtx, now = ac.currentTime, out = ac.createGain(); out.gain.value = loud === undefined ? 1 : loud; out.evPet = true; out.connect(ac.destination);
    var c = ac.createConvolver(), n = Math.floor(ac.sampleRate * 1.6), ir = ac.createBuffer(2, n, ac.sampleRate), spring = ac.createGain(), wet = ac.createGain();   // (a soft, dreamy echo)
    for (var ch = 0; ch < 2; ch++) { var d = ir.getChannelData(ch); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); }
    c.buffer = ir; wet.gain.value = 0.4; spring.connect(out); spring.connect(c); c.connect(wet); wet.connect(out);
    function song(at, pts, len) {                                      // (a soft, gliding "oooo": pts are [time 0..1, hz] it glides through)
      var o = ac.createOscillator(), o2 = ac.createOscillator(), g2 = ac.createGain(), v = ac.createOscillator(), vg = ac.createGain(), g = ac.createGain(), t0 = now + at; o.type = 'sine'; o2.type = 'sine'; g2.gain.value = 0.25;
      pts.forEach(function (p, i) { if (i === 0) { o.frequency.setValueAtTime(p[1], t0); o2.frequency.setValueAtTime(p[1] * 2, t0); } else { o.frequency.exponentialRampToValueAtTime(p[1], t0 + len * p[0]); o2.frequency.exponentialRampToValueAtTime(p[1] * 2, t0 + len * p[0]); } });
      v.frequency.value = 5; vg.gain.value = pts[0][1] * 0.015; v.connect(vg); vg.connect(o.frequency);   // (a gentle waver)
      g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.0624, t0 + len * 0.3); g.gain.setValueAtTime(0.0624, t0 + len * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(spring); o.start(t0); o2.start(t0); v.start(t0); o.stop(t0 + len + 0.02); o2.stop(t0 + len + 0.02); v.stop(t0 + len + 0.02);
    }
    function sound(at, mood) {                                         // (mood: 1 happy, 0 just chatting, -1 sad)
      if (mood < 0) song(at, [[0, 300], [0.5, 270], [1, 210]], 0.8);
      else if (mood > 0) song(at, [[0, 240], [0.4, 330], [0.8, 300], [1, 360]], 0.8);
      else song(at, [[0, 260], [0.5, 310], [1, 280]], 0.6);
    }
    function bubble(at, vol) {                                         // (a little bubble rising and blipping)
      var o = ac.createOscillator(), g = ac.createGain(), t0 = now + at, f = 500 + Math.random() * 700; o.type = 'sine';
      o.frequency.setValueAtTime(f, t0); o.frequency.exponentialRampToValueAtTime(f * 2.6, t0 + 0.06);
      g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.07);
      o.connect(g); g.connect(spring); o.start(t0); o.stop(t0 + 0.08);
    }
    function bubbles(at, count, vol) { for (var i = 0; i < count; i++) bubble(at + i * 0.07 + Math.random() * 0.05, vol); }
    function eating() {                                                // (soft munching, then a gulp of air)
      var buf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), nd = buf.getChannelData(0); for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      for (var k = 0; k < 3; k++) { var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t0 = now + k * 0.16 + Math.random() * 0.03; s.buffer = buf; f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 1.5;
        g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.06, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08); s.connect(f); f.connect(g); g.connect(out); s.start(t0, Math.random() * 0.5); s.stop(t0 + 0.1); }
      var o = ac.createOscillator(), og = ac.createGain(), t1 = now + 0.55; o.type = 'sine'; o.frequency.setValueAtTime(420, t1); o.frequency.exponentialRampToValueAtTime(160, t1 + 0.09);
      og.gain.setValueAtTime(0.0001, t1); og.gain.linearRampToValueAtTime(0.047, t1 + 0.005); og.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.09); o.connect(og); og.connect(spring); o.start(t1); o.stop(t1 + 0.11);
      bubble(0.6, 0.028);
    }
    if (kind === 'pet') { sound(0, 1); bubbles(0.55, 4, 0.0312); }
    else if (kind === 'egg') { sound(0, 0); sound(0.55, 1); bubbles(0.9, 5, 0.0312); }
    else if (kind === 'content') sound(0, 0);
    else if (kind === 'hungry') { sound(0, -1); sound(0.75, -1); }
    else if (kind === 'eat') eating();
    else if (kind === 'chirp') { sound(0, Math.random() < 0.65 ? 0 : 1); if (Math.random() < 0.6) bubbles(0.35, 2 + Math.floor(Math.random() * 2), 0.0234); }
  }
  axoriaAction = (function (base) {                                    // (looking after a Veilaris: the sound to go with what happened)
    return function (g) {
      var egg = g.egg, fed = g.fed, petted = g.petted, r = base.apply(this, arguments);
      veilSound(egg ? (g.egg ? null : 'egg') : !fed && g.fed ? 'eat' : !petted && g.petted ? 'pet' : !fed ? 'hungry' : fed && petted ? 'content' : null);   // (no sound if it couldn't be sheared: no shears, or a full bag)
      return r;
    };
  })(axoriaAction);

  // ===== Nymphalia sounds =====
  // A Nymphalia burbles like a gentle water spirit: soft, bubbly rumbles, like a big friendly creature's voice heard
  // through pond water (a wavering, rumbly voice, muffled and wobbling as if through water, with bubbles rising), with
  // water droplets plinking into the pond, all in a dreamy echo. A happy burble and droplets when you pet it; two
  // burbles and more droplets when you milk it; soft munching as it eats; two lower, slower burbles when it's hungry; a
  // little burble and a couple of droplets once it's fed and petted; and now and then a burble of its own while you're
  // in the barn. They're pet sounds, so they follow Pet Sound in Settings
  function lotusSound(kind, loud) {
    if (!kind || !audioCtx || audioCtx.state !== 'running') return;
    var ac = audioCtx, now = ac.currentTime, out = ac.createGain(); out.gain.value = loud === undefined ? 1 : loud; out.evPet = true; out.connect(ac.destination);
    var nbuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), nd = nbuf.getChannelData(0); for (var ni = 0; ni < nd.length; ni++) nd[ni] = Math.random() * 2 - 1;
    var PLAN = [[0, 0.2, 0.95], [0.5, 0.5, 1.08], [1, 0.2, 0.9]];      // (how open its mouth is, and its pitch, through a burble: [time 0..1, open 0..1, x hz])
    function lerp(t, k) { for (var i = 1; i < PLAN.length; i++) if (t <= PLAN[i][0]) { var a = PLAN[i - 1], b = PLAN[i], u = (t - a[0]) / (b[0] - a[0]); return a[k] + (b[k] - a[k]) * u; } return PLAN[PLAN.length - 1][k]; }
    function echo() {                                                  // (a soft, dreamy echo)
      var c = ac.createConvolver(), n = Math.floor(ac.sampleRate * 1.6), ir = ac.createBuffer(2, n, ac.sampleRate);
      for (var ch = 0; ch < 2; ch++) { var d = ir.getChannelData(ch); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); }
      c.buffer = ir; var w = ac.createGain(), inp = ac.createGain(); w.gain.value = 0.45; inp.connect(out); inp.connect(c); c.connect(w); w.connect(out); return inp;
    }
    var pond = echo();
    function voice(at, hz, len, vol, dest) {                           // (a big, gentle creature's rumbly voice: a throat buzzing pulse by pulse, wavering 11 times a second, through its mouth and nose)
      var sr = ac.sampleRate, n = Math.floor(sr * len), buf = ac.createBuffer(1, n, sr), d = buf.getChannelData(0), ph = 0, amp = 1, jit = 1, odd = false, prev = 0, drift = 0;
      for (var i = 0; i < n; i++) { var t = i / n, qv = Math.sin(2 * Math.PI * 11 * i / sr); drift += (Math.random() - 0.5) * 0.002; drift *= 0.999;
        ph += hz * lerp(t, 2) * jit * (1 + drift + 0.05 * qv) / sr;
        if (ph >= 1) { ph -= 1; jit = 1 + (Math.random() - 0.5) * 0.03; odd = !odd; amp = (1 + (Math.random() - 0.5) * 0.15) * (odd ? 0.7 : 1); }
        var g = ph < 0.45 ? 0.5 * (1 - Math.cos(Math.PI * ph / 0.45)) : ph < 0.62 ? Math.cos(Math.PI / 2 * (ph - 0.45) / 0.17) : 0;
        var v = g * amp * (1 - 0.6 * (0.5 + 0.5 * qv)), dv = v - prev; prev = v; d[i] = dv * sr * 0.00075 + (Math.random() - 0.5) * 0.4 * g; }   // (the same strength at any sample rate)
      var t0 = now + at, s = ac.createBufferSource(), mouth = ac.createGain(), nose = ac.createBiquadFilter(), noseG = ac.createGain(), env = ac.createGain(), sp = 343;   // (a big throat, 25cm)
      s.buffer = buf;
      [0, 1, 2, 3, 4].forEach(function (k) {                           // (the throat's ringing notes, rising as the mouth opens)
        var open = sp * (2 * k + 1) * (k === 0 ? 1.7 : k === 1 ? 1.12 : 1), shut = sp * (2 * k + 1) * 0.8;
        var f = ac.createBiquadFilter(), fg = ac.createGain(); f.type = 'bandpass'; f.Q.value = Math.max(2.5, Math.min(14, open / 80)); fg.gain.value = [1, 0.75, 0.5, 0.32, 0.2][k] * 3;
        for (var j = 0; j <= 24; j++) { var tt = j / 24, fr = shut + (open - shut) * lerp(tt, 1); if (j === 0) f.frequency.setValueAtTime(fr, t0); else f.frequency.linearRampToValueAtTime(fr, t0 + len * tt); }
        s.connect(f); f.connect(fg); fg.connect(mouth);
      });
      nose.type = 'lowpass'; nose.frequency.value = 350; nose.Q.value = 2; s.connect(nose); nose.connect(noseG);
      for (var j = 0; j <= 24; j++) { var tt = j / 24, o = lerp(tt, 1), at2 = t0 + len * tt;
        if (j === 0) { mouth.gain.setValueAtTime(0.05 + o, at2); noseG.gain.setValueAtTime(2.2 * (1 - o * 0.75), at2); } else { mouth.gain.linearRampToValueAtTime(0.05 + o, at2); noseG.gain.linearRampToValueAtTime(2.2 * (1 - o * 0.75), at2); } }
      mouth.connect(env); noseG.connect(env);
      env.gain.setValueAtTime(0.0001, t0); env.gain.linearRampToValueAtTime(vol, t0 + Math.min(0.12, len * 0.15)); env.gain.setValueAtTime(vol, t0 + len * 0.75); env.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
      env.connect(dest); s.start(t0);
    }
    function bubbles(at, n, vol) {                                     // (little bubbles rising and blipping)
      for (var i = 0; i < n; i++) { var o = ac.createOscillator(), g = ac.createGain(), t0 = now + at + i * 0.07 + Math.random() * 0.05, f = 500 + Math.random() * 700; o.type = 'sine';
        o.frequency.setValueAtTime(f, t0); o.frequency.exponentialRampToValueAtTime(f * 2.6, t0 + 0.06);
        g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.07);
        o.connect(g); g.connect(pond); o.start(t0); o.stop(t0 + 0.08); }
    }
    function burble(at, hz, len) {                                     // (a bubbly, burbling rumble: the voice muffled and wobbling as if through water, and bubbles)
      var f = ac.createBiquadFilter(), w = ac.createOscillator(), wg = ac.createGain(), t0 = now + at; f.type = 'lowpass'; f.frequency.value = 900; f.Q.value = 6;
      w.frequency.value = 9; wg.gain.value = 500; w.connect(wg); wg.connect(f.frequency); w.start(t0); w.stop(t0 + len + 0.1); f.connect(pond);
      voice(at, hz, len, 0.0486, f); bubbles(at + len * 0.3, 3, 0.0284);
    }
    function drips(at, n, vol) {                                       // (water droplets plinking into the pond)
      for (var i = 0; i < n; i++) { var o = ac.createOscillator(), g = ac.createGain(), t0 = now + at + i * 0.14 + Math.random() * 0.06, f = 900 + Math.random() * 900; o.type = 'sine';
        o.frequency.setValueAtTime(f, t0); o.frequency.exponentialRampToValueAtTime(f * 2.2, t0 + 0.04);
        g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
        o.connect(g); g.connect(pond); o.start(t0); o.stop(t0 + 0.2); }
    }
    function munching(n, vol) {
      for (var k = 0; k < n; k++) { var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t0 = now + k * 0.16 + Math.random() * 0.03; s.buffer = nbuf; f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 1.5;
        g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08); s.connect(f); f.connect(g); g.connect(out); s.start(t0, Math.random() * 0.5); s.stop(t0 + 0.1); }
    }
    function sound(at, mood) {                                         // (mood: 1 happy, 0 just chatting, -1 sad)
      if (mood < 0) { burble(at, 150, 0.6); burble(at + 0.7, 135, 0.6); return; }
      burble(at, mood > 0 ? 175 : 160, mood > 0 ? 0.55 : 0.4);
    }
    if (kind === 'pet') { sound(0, 1); drips(0.6, 3, 0.0324); }
    else if (kind === 'egg') { sound(0, 0); sound(0.6, 1); drips(1.1, 3, 0.0324); }
    else if (kind === 'content') { sound(0, 0); drips(0.45, 2, 0.0284); }
    else if (kind === 'hungry') { sound(0, -1); sound(0.8, -1); }
    else if (kind === 'eat') munching(4, 0.06);
    else if (kind === 'chirp') { sound(0, Math.random() < 0.65 ? 0 : 1); if (Math.random() < 0.6) drips(0.45, 2, 0.0284); }
  }
  lotaraAction = (function (base) {                                    // (looking after a Nymphalia: the sound to go with what happened)
    return function (g) {
      var egg = g.egg, fed = g.fed, petted = g.petted, r = base.apply(this, arguments);
      lotusSound(egg ? (g.egg ? null : 'egg') : !fed && g.fed ? 'eat' : !petted && g.petted ? 'pet' : !fed ? 'hungry' : fed && petted ? 'content' : null);   // (no sound if it couldn't be milked: no pail, or a full bag)
      return r;
    };
  })(lotaraAction);

  // ===== Prismara sounds =====
  // A Prismara bleats like a real lamb,
  // built from a real lamb's bleat: a smooth, high voice around 375 Hz, rising a touch and falling at the end, whose
  // loudness flutters about 14 times a second (that gentle "eh-eh-eh"), ringing through a lamb's throat (its shape
  // measured from the real bleat). A happy bleat that lifts at the end when you pet it; a short bleat and a happy one
  // when you shear its Prismsilk; soft munching as it eats; two slow, falling bleats when it's hungry; a short bleat
  // once it's fed and petted; and now and then a bleat of its own while you're in the barn. They're pet sounds, so
  // they follow Pet Sound in Settings
  function prismSound(kind, loud) {
    if (!kind || !audioCtx || audioCtx.state !== 'running') return;
    var ac = audioCtx, now = ac.currentTime, out = ac.createGain(); out.gain.value = loud === undefined ? 1 : loud; out.evPet = true; out.connect(ac.destination);
    var THROAT = [-0.61336, 1.07034, -0.54169, 0.59115, -0.40563, 0.64813, -0.26226, 0.74609, -0.05792, 0.62427, -0.05902, 0.33439, -0.15369, 0.23972, -0.07307, 0.2198, 0.21648, 0.11512, 0.11492, 0.06558];   // (how a real lamb's throat rings, measured from a real bleat)
    function lerp(pts, t) { for (var i = 1; i < pts.length; i++) if (t <= pts[i][0]) { var a = pts[i - 1], b = pts[i]; return a[1] + (b[1] - a[1]) * (t - a[0]) / Math.max(1e-6, b[0] - a[0]); } return pts[pts.length - 1][1]; }
    function bleat(at, hz, len, pitch) {                               // (one bleat; pitch: [[time 0..1, x hz], ...]. Returns how long it lasts)
      var SR = 24000, n = Math.floor(SR * len), buf = ac.createBuffer(1, n, SR), d = buf.getChannelData(0), y = new Float64Array(THROAT.length), ph = 0, fph = 0;
      for (var i = 0; i < n; i++) { var t = i / n, f = hz * lerp(pitch, t) * (1 + 0.008 * Math.sin(2 * Math.PI * 12.5 * i / SR));
        ph += f * (1 + (Math.random() - 0.5) * 0.01) / SR; fph += 14 * (1 + (Math.random() - 0.5) * 0.1) / SR;
        var e = (Math.random() - 0.5) * 0.12; if (ph >= 1) { ph -= 1; e += 1; }   // (a sharp pulse each time the throat snaps shut, and a little breath)
        var v = e; for (var k = 0; k < THROAT.length; k++) v -= THROAT[k] * y[k];
        for (var k2 = THROAT.length - 1; k2 > 0; k2--) y[k2] = y[k2 - 1]; y[0] = v;
        d[i] = v * (t < 0.1 ? t / 0.1 : t < 0.82 ? 1 : Math.pow((1 - t) / 0.18, 1.5)) * (1 - 0.6 * (0.5 - 0.5 * Math.cos(2 * Math.PI * fph))) * 0.09; }   // (swelling, fluttering and fading)
      var s = ac.createBufferSource(), hp = ac.createBiquadFilter(); s.buffer = buf; hp.type = 'highpass'; hp.frequency.value = 500; hp.Q.value = 0.9;
      s.connect(hp); hp.connect(out); s.start(now + at);
      return len;
    }
    function munching(n, vol) {
      var buf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = buf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      for (var k = 0; k < n; k++) { var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t0 = now + k * 0.16 + Math.random() * 0.03; s.buffer = buf; f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 1.5;
        g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08); s.connect(f); f.connect(g); g.connect(out); s.start(t0, Math.random() * 0.5); s.stop(t0 + 0.1); }
    }
    var hz = 372;
    var PB = [[0, 0.97], [0.6, 1.0], [0.88, 1.02], [1, 0.96]], PH = [[0, 0.92], [0.3, 0.99], [0.8, 1.04], [1, 1.1]], PS = [[0, 0.98], [0.4, 0.96], [1, 0.8]], PQ = [[0, 0.93], [0.3, 1.0], [1, 0.97]];   // (an ordinary bleat, a happy one, a sad one, a short one)
    if (kind === 'pet') bleat(0, hz, 0.585, PH);
    else if (kind === 'egg') { var a = bleat(0, hz, 0.312, PQ); bleat(a + 0.1, hz * 1.06, 0.585, PH); }
    else if (kind === 'content') bleat(0, hz * 1.03, 0.351, PQ);
    else if (kind === 'hungry') { var b = bleat(0, hz, 0.663, PS); bleat(b + 0.18, hz * 0.95, 0.741, PS); }
    else if (kind === 'eat') munching(4, 0.06);
    else if (kind === 'chirp') { var long = Math.random() < 0.5; bleat(0, hz * (0.97 + Math.random() * 0.06), long ? 0.585 : 0.351, long ? PB : PQ); }
  }
  prismaraAction = (function (base) {                                  // (looking after a Prismara: the sound to go with what happened)
    return function (g) {
      var egg = g.egg, fed = g.fed, petted = g.petted, r = base.apply(this, arguments);
      prismSound(egg ? (g.egg ? null : 'egg') : !fed && g.fed ? 'eat' : !petted && g.petted ? 'pet' : !fed ? 'hungry' : fed && petted ? 'content' : null);   // (no sound if it couldn't be sheared: no shears, or a full bag)
      return r;
    };
  })(prismaraAction);

  // ---------- Fluff & Feather's counter: step up to it inside the barn to buy hay (and, one day, animals) ----------
  var HAY_COST = 12;                                                   // Star Coins a bundle (it sells back for less)
  ITEMS.hay.info = 'A bundle of sweet hay. Buy it at Fluff & Feather, or find it trimming bushes (they have a 50% chance of dropping some).';
  var barnShopOpen = false;
  var barnShopBtn = document.createElement('button');
  barnShopBtn.type = 'button';
  barnShopBtn.className = 'sleep-btn ship-btn';
  barnShopBtn.innerHTML = '🐾 Shop <kbd>E</kbd>';
  canvas.parentNode.appendChild(barnShopBtn);
  var barnShopBox = document.createElement('div');
  barnShopBox.className = 'inventory ship shop';
  barnShopBox.hidden = true;
  barnShopBox.innerHTML = '<div class="inv-head"><b>🐾 Fluff &amp; Feather</b><button type="button" class="inv-close" aria-label="Close the shop">✕</button></div>' +
    '<p class="ship-hint">Welcome to Fluff &amp; Feather! Feed, supplies and magical creatures for your farm.</p>' +
    '<div class="shop-item"><div class="slot shop-pic"></div><div class="shop-text"><b>Hay</b><span>A bundle of sweet, sun-dried hay, fresh from the loft.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + HAY_COST + ' each</span></div></div>' +
    '<div class="shop-buy"><button type="button" data-n="1">Buy 1</button><button type="button" data-n="5">Buy 5</button><button type="button" data-n="10">Buy 10</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic glim-pic"></div><div class="shop-text"><b>Glimmerwing</b><span>A gentle, glowing little creature with shimmering moth wings. Feed it hay and pet it every day, and it lays a Glimmer Egg each morning. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + GLIM_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="glim-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic duck-pic"></div><div class="shop-text"><b>Puddlewisp</b><span>A plump little pond creature with night-blue feathers that ripple like moonlight on water, big shining eyes, star-tipped plumes and glowing webbed feet. Feed it hay and pet it every day, and it lays a Dewdrop Egg each morning. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + DUCK_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="duck-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic gem-pic"></div><div class="shop-text"><b>Gemwren</b><span>A plump little ground bird with feathers speckled like the inside of a geode, glittering crystal feathers, a dark bib edged in white and a nodding plume tipped with a glowing gem. Feed it hay and pet it every day for four days in a row, and the next morning it lays a Geode Egg that sparkles with crystals inside. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + GEM_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="gem-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic ember-pic"></div><div class="shop-text"><b>Emberwing</b><span>A proud, fiery bird with sunset-coloured feathers, a crown of little flickering flames and a long train of flame-shaped feathers that it raises into a blazing fan. Feed it hay and pet it every day for four days in a row, and the next morning it leaves a warm Cinder Quill in its straw. Miss a day and the count starts over. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + EMBER_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="ember-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic luna-pic"></div><div class="shop-text"><b>Lunastra</b><span>A little plush spirit of the moonlit night, in soft moon-white fur that deepens into a starry sky over its back, with a night-sky mask full of glowing stars, huge galaxy eyes, tall ears tipped with starlight, a crescent moon on its brow, a big curling tail banded with stars and a tiny moon of its own orbiting round it. Feed it hay and pet it every day for two days in a row, and the next morning it leaves you a Moonpearl it found in the night. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + LUNA_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="luna-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic bubble-pic"></div><div class="shop-text"><b>Sirenna</b><span>A chubby little sea spirit in soft seafoam fur dappled with bubble spots, with a coral snout, huge ocean eyes, floppy ears of shimmering fin, a scallop shell tucked behind one ear, pearly hooves and a corkscrew tail tipped with coral. Bubbles always drift up off it. Feed it hay and pet it every day for three days in a row, and the next morning it blows you a Wishbubble. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + BUBBLE_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="bubble-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic aurora-pic"></div><div class="shop-text"><b>Auroraram</b><span>A graceful creature with a long, silky night-blue coat that ripples with the colours of the northern lights, spiralling horns of clear ice, a silky beard and glowing hooves. Feed it hay and pet it every day for two days in a row, and the next morning you can milk it for Aurora Milk (you\'ll need a Milk Pail). It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + AURORA_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="aurora-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic prism-pic"></div><div class="shop-text"><b>Prismara</b><span>A gentle creature of rainbow light, with a round body of curly fleece that shimmers through every colour of the rainbow, a soft pale face with big gentle eyes, floppy ears, a curly topknot, little spiralling horns of clear crystal and crystal hooves. Feed it hay and pet it every day for two days in a row, and the next morning you can shear it for Prismsilk (you\'ll need Shears). It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + PRISM_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="prism-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic zephyra-pic"></div><div class="shop-text"><b>Zephyra</b><span>A little spirit of the gentle west wind, made of soft, billowing cloud blushed with the pinks and golds of sunrise, with tall ears, huge sparkly eyes, a glowing sun-gem, little feathered wings and a silk scarf streaming in the breeze. It floats just above the ground on cloud-puff feet. Feed it hay and pet it every day for four days in a row, and the next morning you can shear its cloud for Cloud Wool (you\'ll need Shears). It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + ZEPHYRA_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="zephyra-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic lotus-pic"></div><div class="shop-text"><b>Nymphalia</b><span>A big, gentle creature of the lily pond, with a round body of soft lilac plush dappled with glowing pond-light spots, lotus flowers blooming on lily pads along its back, a wide soft muzzle, big sweet eyes and tiny wiggly ears. Feed it hay and pet it every day for two days in a row, and the next morning you can milk it for Moonlily Milk (you\'ll need a Milk Pail). It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + LOTUS_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="lotus-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic axo-pic"></div><div class="shop-text"><b>Veilaris</b><span>A little water spirit of the moonlit spring, with a soft round body of rosy plush held up on slender legs, glowing star-freckles and a constellation over its back, big shining eyes, a moonstone on its brow, long finned ears, branching antlers of glowing coral, a mane of flowing ribbons of light, two pairs of wings of light and a long tail trailing veils of light. Feed it hay and pet it every day for three days in a row, and the next morning you can shear the glowing Glimmerkelp that has grown on its back (you\'ll need Shears). It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + AXO_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="axo-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic liz-pic"></div><div class="shop-text"><b>Lumora</b><span>A little sun-drake that loves to bask, in soft, velvety scales banded with chevrons and glowing sun-spots, with big golden gecko eyes, swept-back horns of clear citrine, a sunrise frill of glowing petals round its neck, crystal spines down its back, gliding membranes of light along its sides and a long tail curled round a glowing sun-gem. Feed it hay and pet it every day for two days in a row, and the next morning it sheds a Sunscale for you. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + LIZ_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="liz-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic tort-pic"></div><div class="shop-text"><b>Amarys</b><span>A gentle, slow little wanderer in soft plush, carrying a whole tiny garden on its back: a high shell like polished opal rimmed in gold, topped with soft moss, glowing mushrooms, tiny flowers, a cluster of crystals and a little tree hung with glowing fruit, with fireflies drifting over it. It has big shining eyes and two leafy sprouts on its head. Feed it hay and pet it every day for three days in a row, and the next morning a Starbloom opens in its garden for you to pick. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + TORT_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="tort-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic bis-pic"></div><div class="shop-text"><b>Nyxalia</b><span>A big, gentle grazer made of the night sky, in deep soft plush. A shaggy starry mane drifts over its hump like a slow cloud, twinkling with tiny stars, and faint constellations shimmer along its flanks. It has a pair of moonstone horns banded in gold, feathered fetlocks and pearly cloven hooves. Feed it hay and pet it every day for three days in a row, and the next morning you can milk it for glittering Opaline Milk (bring a Milk Pail). It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + BIS_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="bis-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic ost-pic"></div><div class="shop-text"><b>Celestara</b><span>A graceful dawn-bird in soft plumage blushing with the colours of sunrise, traced with glowing golden filigree. It has a long, swan-like neck, big gentle eyes lined in gold, a slender pearly beak, a crest of glassy plumes tipped with little lights and a halo of turning runes floating behind its head. Its wings are layered with feathers edged in light, and its long, sweeping train shines with eye-spots and crystals and trails ribbons of aurora, while little crystals drift round it. Feed it hay and pet it every day for three days in a row, and the next morning it lays a Dawnshell Egg for you. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + OST_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="ost-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic crb-pic"></div><div class="shop-text"><b>Iridelle</b><span>A little tide-spirit from the moonlit shallows, with a wide, domed shell of living opal set with tiny pearls and traced with glowing runes, and a garden of crystals, coral and swaying anemones growing on its back. It has big shining eyes on slender stalks, delicate crystal pincers that each cradle a glowing orb, six slender legs of pearl on which it scuttles sideways, and veils of iridescent light trailing behind it. Bubbles drift up from it, a pearl circles over it, and tidepool ripples spread wherever it stands. Feed it hay and pet it every day for six days in a row, and the next morning it leaves you a shimmering Tidelight Pearl. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + CRB_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="crb-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic moon-pic"></div><div class="shop-text"><b>Mooncalf</b><span>A gentle creature with a pearly coat whose spots are patches of starry night sky, crescent-moon horns and star-bright hooves. Feed it hay and pet it every day, and the next morning you can milk it for Moonmilk. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + MOON_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="moon-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic pail-pic"></div><div class="shop-text"><b>Milk Pail</b><span>You need one to milk your Mooncalves, Auroraram and Nymphalias. It never wears out.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + PAIL_COST + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="pail-buy">Buy</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic shears-pic"></div><div class="shop-text"><b>Shears</b><span>You need them to shear your Zephyras and Prismaras when their wool is ready, and the Glimmerkelp off your Veilaris. They never wear out.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + SHEARS_COST + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="shears-buy">Buy</button></div>' +
    '<p class="ship-hint glim-stalls" style="margin:8px 2px 0"></p>' +
    '<p class="ship-total">You have <img class="coin-icon" alt=""> <b>0</b></p>';
  canvas.parentNode.appendChild(barnShopBox);
  barnShopBox.querySelector('.shop-pic').appendChild(itemPicture('hay'));
  var glimPic = document.createElement('img'); glimPic.src = glimShopIcon; glimPic.alt = ''; glimPic.style.width = '96%'; glimPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.glim-pic').appendChild(glimPic);
  var glimAdoptBtn = barnShopBox.querySelector('.glim-adopt'), glimStallsNote = barnShopBox.querySelector('.glim-stalls');
  glimAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('glim'); });
  var duckPic = document.createElement('img'); duckPic.src = duckShopIcon; duckPic.alt = ''; duckPic.style.width = '96%'; duckPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.duck-pic').appendChild(duckPic);
  var duckAdoptBtn = barnShopBox.querySelector('.duck-adopt');
  duckAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('duck'); });
  var emberPic = document.createElement('img'); emberPic.src = emberShopIcon; emberPic.alt = ''; emberPic.style.width = '96%'; emberPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.ember-pic').appendChild(emberPic);
  var emberAdoptBtn = barnShopBox.querySelector('.ember-adopt');
  var gemPic = document.createElement('img'); gemPic.src = gemShopIcon; gemPic.alt = ''; gemPic.style.width = '96%'; gemPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.gem-pic').appendChild(gemPic);
  var gemAdoptBtn = barnShopBox.querySelector('.gem-adopt');
  var auroraPic = document.createElement('img'); auroraPic.src = auroraShopIcon; auroraPic.alt = ''; auroraPic.style.width = '96%'; auroraPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.aurora-pic').appendChild(auroraPic);
  var auroraAdoptBtn = barnShopBox.querySelector('.aurora-adopt');
  auroraAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('aurora'); });
  var zephyraPic = document.createElement('img'); zephyraPic.src = zephyraShopIcon; zephyraPic.alt = ''; zephyraPic.style.width = '96%'; zephyraPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.zephyra-pic').appendChild(zephyraPic);
  var zephyraAdoptBtn = barnShopBox.querySelector('.zephyra-adopt');
  zephyraAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('zephyra'); });
  var lunaPic = document.createElement('img'); lunaPic.src = lunaShopIcon; lunaPic.alt = ''; lunaPic.style.width = '96%'; lunaPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.luna-pic').appendChild(lunaPic);
  var lunaAdoptBtn = barnShopBox.querySelector('.luna-adopt');
  lunaAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('luna'); });
  var bubblePic = document.createElement('img'); bubblePic.src = bubbleShopIcon; bubblePic.alt = ''; bubblePic.style.width = '96%'; bubblePic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.bubble-pic').appendChild(bubblePic);
  var bubbleAdoptBtn = barnShopBox.querySelector('.bubble-adopt');
  bubbleAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('bubble'); });
  var prismPic = document.createElement('img'); prismPic.src = prismShopIcon; prismPic.alt = ''; prismPic.style.width = '96%'; prismPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.prism-pic').appendChild(prismPic);
  var prismAdoptBtn = barnShopBox.querySelector('.prism-adopt');
  prismAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('prism'); });
  var lotusPic = document.createElement('img'); lotusPic.src = lotusShopIcon; lotusPic.alt = ''; lotusPic.style.width = '96%'; lotusPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.lotus-pic').appendChild(lotusPic);
  var lotusAdoptBtn = barnShopBox.querySelector('.lotus-adopt');
  lotusAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('lotus'); });
  var axoPic = document.createElement('img'); axoPic.src = axoShopIcon; axoPic.alt = ''; axoPic.style.width = '96%'; axoPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.axo-pic').appendChild(axoPic);
  var axoAdoptBtn = barnShopBox.querySelector('.axo-adopt');
  axoAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('axo'); });
  var lizPic = document.createElement('img'); lizPic.src = lizShopIcon; lizPic.alt = ''; lizPic.style.width = '96%'; lizPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.liz-pic').appendChild(lizPic);
  var lizAdoptBtn = barnShopBox.querySelector('.liz-adopt');
  lizAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('liz'); });
  var tortPic = document.createElement('img'); tortPic.src = tortShopIcon; tortPic.alt = ''; tortPic.style.width = '96%'; tortPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.tort-pic').appendChild(tortPic);
  var tortAdoptBtn = barnShopBox.querySelector('.tort-adopt');
  tortAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('tort'); });
  var bisPic = document.createElement('img'); bisPic.src = bisShopIcon; bisPic.alt = ''; bisPic.style.width = '96%'; bisPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.bis-pic').appendChild(bisPic);
  var bisAdoptBtn = barnShopBox.querySelector('.bis-adopt');
  bisAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('bison'); });
  var ostPic = document.createElement('img'); ostPic.src = ostShopIcon; ostPic.alt = ''; ostPic.style.width = '96%'; ostPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.ost-pic').appendChild(ostPic);
  var ostAdoptBtn = barnShopBox.querySelector('.ost-adopt');
  ostAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('ostrich'); });
  var crbPic = document.createElement('img'); crbPic.src = crbShopIcon; crbPic.alt = ''; crbPic.style.width = '96%'; crbPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.crb-pic').appendChild(crbPic);
  var crbAdoptBtn = barnShopBox.querySelector('.crb-adopt');
  crbAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('crab'); });
  gemAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('gem'); });
  emberAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('ember'); });
  var moonPic = document.createElement('img'); moonPic.src = moonShopIcon; moonPic.alt = ''; moonPic.style.width = '96%'; moonPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.moon-pic').appendChild(moonPic);
  barnShopBox.querySelector('.pail-pic').appendChild(itemPicture('milkPail'));
  var moonAdoptBtn = barnShopBox.querySelector('.moon-adopt'), pailBtn = barnShopBox.querySelector('.pail-buy');
  moonAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('moon'); });
  function hasPail() { return bag.some(function (b) { return b && b.id === 'milkPail'; }); }
  pailBtn.addEventListener('click', function () {
    if (hasPail()) { showToast('You already have a Milk Pail', 1800); return; }
    if (state.coins < PAIL_COST) { showToast('Not enough Star Coins', 1800); return; }
    if (!roomFor(['milkPail'])) { bagFull(); return; }
    addItem('milkPail', 1); state.coins -= PAIL_COST; showCoins(true); coinSound(3);
    showToast('Bought a Milk Pail 🪣', 1800); renderBarnShop();
  });
  barnShopBox.querySelector('.shears-pic').appendChild(itemPicture('shears'));
  var shearsBtn = barnShopBox.querySelector('.shears-buy');
  function hasShears() { return bag.some(function (b) { return b && b.id === 'shears'; }); }
  shearsBtn.addEventListener('click', function () {
    if (hasShears()) { showToast('You already have Shears', 1800); return; }
    if (state.coins < SHEARS_COST) { showToast('Not enough Star Coins', 1800); return; }
    if (!roomFor(['shears'])) { bagFull(); return; }
    addItem('shears', 1); state.coins -= SHEARS_COST; showCoins(true); coinSound(3);
    showToast('Bought a pair of Shears ✂️', 1800); renderBarnShop();
  });
  paintCoinIcons(barnShopBox);
  var barnShopCoins = barnShopBox.querySelector('.ship-total b'), barnBuyBtns = barnShopBox.querySelectorAll('.shop-buy button[data-n]');   // (just the hay buttons)
  function renderBarnShop() {
    barnShopCoins.textContent = state.coins;
    for (var i = 0; i < barnBuyBtns.length; i++) {
      var n = +barnBuyBtns[i].getAttribute('data-n');
      barnBuyBtns[i].innerHTML = 'Buy ' + n + ' · <img class="coin-icon" alt=""> ' + n * HAY_COST;
      barnBuyBtns[i].disabled = state.coins < n * HAY_COST;
    }
    var full = glimFreeStall() < 0;                                    // the Glimmerwing: one for each empty stall
    glimAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + GLIM_COST.toLocaleString('en-US');
    glimAdoptBtn.disabled = full || state.coins < GLIM_COST;
    duckAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + DUCK_COST.toLocaleString('en-US');
    duckAdoptBtn.disabled = full || state.coins < DUCK_COST;
    emberAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + EMBER_COST.toLocaleString('en-US');
    emberAdoptBtn.disabled = full || state.coins < EMBER_COST;
    gemAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + GEM_COST.toLocaleString('en-US');
    gemAdoptBtn.disabled = full || state.coins < GEM_COST;
    auroraAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + AURORA_COST.toLocaleString('en-US');
    auroraAdoptBtn.disabled = full || state.coins < AURORA_COST;
    zephyraAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + ZEPHYRA_COST.toLocaleString('en-US');
    zephyraAdoptBtn.disabled = full || state.coins < ZEPHYRA_COST;
    lunaAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + LUNA_COST.toLocaleString('en-US');
    lunaAdoptBtn.disabled = full || state.coins < LUNA_COST;
    bubbleAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + BUBBLE_COST.toLocaleString('en-US');
    bubbleAdoptBtn.disabled = full || state.coins < BUBBLE_COST;
    prismAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + PRISM_COST.toLocaleString('en-US');
    prismAdoptBtn.disabled = full || state.coins < PRISM_COST;
    lotusAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + LOTUS_COST.toLocaleString('en-US');
    lotusAdoptBtn.disabled = full || state.coins < LOTUS_COST;
    axoAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + AXO_COST.toLocaleString('en-US');
    axoAdoptBtn.disabled = full || state.coins < AXO_COST;
    lizAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + LIZ_COST.toLocaleString('en-US');
    lizAdoptBtn.disabled = full || state.coins < LIZ_COST;
    tortAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + TORT_COST.toLocaleString('en-US');
    tortAdoptBtn.disabled = full || state.coins < TORT_COST;
    bisAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + BIS_COST.toLocaleString('en-US');
    bisAdoptBtn.disabled = full || state.coins < BIS_COST;
    ostAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + OST_COST.toLocaleString('en-US');
    ostAdoptBtn.disabled = full || state.coins < OST_COST;
    crbAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + CRB_COST.toLocaleString('en-US');
    crbAdoptBtn.disabled = full || state.coins < CRB_COST;
    moonAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + MOON_COST.toLocaleString('en-US');
    moonAdoptBtn.disabled = full || state.coins < MOON_COST;
    var gotPail = hasPail();
    pailBtn.innerHTML = gotPail ? 'You have one ✓' : 'Buy · <img class="coin-icon" alt=""> ' + PAIL_COST;
    pailBtn.disabled = gotPail || state.coins < PAIL_COST;
    var gotShears = hasShears();
    shearsBtn.innerHTML = gotShears ? 'You have them ✓' : 'Buy · <img class="coin-icon" alt=""> ' + SHEARS_COST;
    shearsBtn.disabled = gotShears || state.coins < SHEARS_COST;
    glimStallsNote.textContent = glimmers.length ? 'Your animals: ' + glimmers.map(function (g) { return g.name + (g.kind === 'moon' ? ' (Mooncalf)' : g.kind === 'duck' ? ' (Puddlewisp)' : g.kind === 'ember' ? ' (Emberwing)' : g.kind === 'gem' ? ' (Gemwren)' : g.kind === 'aurora' ? ' (Auroraram)' : g.kind === 'zephyra' ? ' (Zephyra)' : g.kind === 'luna' ? ' (Lunastra)' : g.kind === 'bubble' ? ' (Sirenna)' : g.kind === 'prism' ? ' (Prismara)' : g.kind === 'lotus' ? ' (Nymphalia)' : g.kind === 'axo' ? ' (Veilaris)' : g.kind === 'liz' ? ' (Lumora)' : g.kind === 'tort' ? ' (Amarys)' : g.kind === 'bison' ? ' (Nyxalia)' : g.kind === 'ostrich' ? ' (Celestara)' : g.kind === 'crab' ? ' (Iridelle)' : ' (Glimmerwing)'); }).join(', ') + glimHomesNote() : glimHomesNote() ? 'No animals yet' + glimHomesNote() : 'Build a coop or a barn with Oak & Ember to give your animals a home.';
    paintCoinIcons(barnShopBox);
  }
  function glimHomesNote() {                                           // (how full each home is: your barn's stalls, your coop's nests, and anyone still in Fluff & Feather's stalls)
    var parts = [], old = glimmers.filter(function (g) { return g.stall < COOP_STALL0; }).length;
    if (siteReady(fbarn)) parts.push(fbarnAnimals().length + ' of ' + FBARN_CAP + ' stalls in your barn');
    if (siteReady(coop)) parts.push(coopAnimals().length + ' of ' + COOP_CAP + ' nests in your coop');
    if (old) parts.push(old + ' still in Fluff & Feather\'s stalls');
    return parts.length ? ' · ' + parts.join(' · ') : '';
  }
  function buyHay(n) {
    var cost = n * HAY_COST;
    if (state.coins < cost) { showToast('Not enough Star Coins', 1800); return; }
    if (!roomFor(['hay'])) { bagFull(); return; }
    addItem('hay', n);
    state.coins -= cost;
    showCoins(true);
    coinSound(n);
    showToast('Bought ' + n + ' Hay 🌾', 1800);
    renderBarnShop();
  }
  for (var bbi = 0; bbi < barnBuyBtns.length; bbi++) barnBuyBtns[bbi].addEventListener('click', function () { buyHay(+this.getAttribute('data-n')); });
  function openBarnShop() { if (barnShopOpen) return; toggleBag(false); barnShopOpen = true; menuOpenedAt = Date.now(); walkTarget = null; barnShopBox.hidden = false; renderBarnShop(); }
  function closeBarnShop() { barnShopOpen = false; barnShopBox.hidden = true; }
  barnShopBox.querySelector('.inv-close').addEventListener('click', function () { closeBarnShop(); focusGame(); });
  barnShopBtn.addEventListener('click', function () { openBarnShop(); focusGame(); });
  window.addEventListener('keydown', function (e) { if (e.code === 'Escape' && barnShopOpen) closeBarnShop(); });
  function updateBarnShop() {
    var near = atBarnCounter();
    if (barnShopOpen && !atBarnCounter(1.2)) closeBarnShop();          // it stays open until you really walk away from the counter
    if (barnShopOpen && barnShopCoins.textContent !== String(state.coins)) renderBarnShop();   // keep the prices up to date with your coins
    var show = near && !barnShopOpen && !glimNaming;
    if (barnShopBtn.classList.contains('show') !== show) barnShopBtn.classList.toggle('show', show);
    updateBarnInterior(state.time);
  }
  // One slot button, for the bag or the hotbar. Tap to select it; press and drag to move it to another slot
  function makeSlot(i, onPick) {
    var slot = document.createElement('button');
    slot.type = 'button';
    slot.className = 'slot' + (bag[i] ? '' : ' empty') + (i === selectedSlot ? ' selected' : '');
    slot.setAttribute('data-slot', i);
    if (bag[i]) {
      slot.appendChild(itemPicture(bag[i].id));
      var isTool = bag[i].id === 'axe' || bag[i].id === 'pickaxe' || bag[i].id === 'trimmers' || bag[i].id === 'hoe' || bag[i].id === 'milkPail' || bag[i].id === 'shears'; // tools don't show a count
      slot.setAttribute('aria-label', ITEMS[bag[i].id].name + (isTool ? '' : ', ' + bag[i].count));
      if (!isTool) {
        var count = document.createElement('span');
        count.className = 'count';
        count.textContent = bag[i].count;
        slot.appendChild(count);
      }
      slot.onclick = function () { selectedSlot = i; renderBag(); if (onPick) onPick(i); };
      slot.addEventListener('pointerdown', function (e) { startDrag(i, e); });
    } else {
      slot.setAttribute('aria-label', 'Empty slot');
    }
    return slot;
  }
  function itemPicture(id) {
    if (ITEMS[id].img) {
      var pic = document.createElement('img');
      pic.src = ITEMS[id].img;
      pic.alt = '';
      pic.style.width = (ITEMS[id].fill || 70) + '%'; // how much of the slot the picture fills
      pic.style.pointerEvents = 'none';
      return pic;
    }
    var span = document.createElement('span');
    span.textContent = ITEMS[id].icon;
    span.style.pointerEvents = 'none';
    return span;
  }

  // ---------- Dressing up the shop menus ----------
  // Every thing for sale goes on its own card (its picture, name, description and price, with its buttons beneath);
  // long descriptions fold to three lines with a "Read more" to open them; and at Fluff & Feather the supplies (hay,
  // the Milk Pail and the Shears) come first, under their own heading, then the animals under theirs
  function shopCards(box) {
    Array.prototype.slice.call(box.querySelectorAll('.shop-item')).forEach(function (it) {
      var card = document.createElement('div'); card.className = 'shop-card';
      it.parentNode.insertBefore(card, it); card.appendChild(it);
      var buy = card.nextElementSibling; if (buy && buy.classList.contains('shop-buy')) card.appendChild(buy);
      var desc = it.querySelector('.shop-text > span:not(.shop-price)');
      if (desc) {
        desc.classList.add('shop-desc');
        if (desc.textContent.length > 150) {
          card.classList.add('clamp');
          var more = document.createElement('button'); more.type = 'button'; more.className = 'shop-more'; more.textContent = 'Read more ▾';
          desc.parentNode.insertBefore(more, desc.nextSibling);
          more.addEventListener('click', function (e) { e.stopPropagation(); var open = card.classList.toggle('clamp'); more.textContent = open ? 'Read more ▾' : 'Show less ▴'; });
        }
      }
    });
  }
  function shopHeading(text) { var h = document.createElement('div'); h.className = 'shop-section'; h.textContent = text; return h; }
  shopCards(shopBox); shopCards(barnShopBox);
  (function () {
    var cards = barnShopBox.querySelectorAll('.shop-card'), hay = cards[0], after = hay;
    [barnShopBox.querySelector('.pail-buy'), barnShopBox.querySelector('.shears-buy')].forEach(function (b) { var c = b && b.closest('.shop-card'); if (c) { after.parentNode.insertBefore(c, after.nextSibling); after = c; } });
    hay.parentNode.insertBefore(shopHeading('Feed & supplies'), hay);
    after.parentNode.insertBefore(shopHeading('Magical creatures'), after.nextSibling);
  })();
  shopBox.querySelector('.shop-card').parentNode.insertBefore(shopHeading('Seeds'), shopBox.querySelector('.shop-card'));

  // ---------- The shops, laid out like the shipping bin ----------
  // Two panels side by side: on the left, everything for sale as a grid of little tiles (its picture, name and price,
  // greyed out when you can't buy it), grouped under headings; on the right, a warm crate-coloured panel showing the
  // tile you've picked, with its full description and its buy buttons. On a narrow screen the panels stack
  function shopCatalogue(box) {
    var cards = Array.prototype.slice.call(box.querySelectorAll('.shop-card')); if (!cards.length) return function () {};
    var first = box.querySelector('.shop-section') || cards[0];
    var cols = document.createElement('div'); cols.className = 'ship-cols shop-cols';
    var left = document.createElement('div'), right = document.createElement('div'); left.className = 'shop-list'; right.className = 'shop-detail';
    left.innerHTML = '<h4>For sale</h4>'; right.innerHTML = '<h4>Take a look</h4>';
    var grid = document.createElement('div'); grid.className = 'shop-tiles'; left.appendChild(grid);
    first.parentNode.insertBefore(cols, first); cols.appendChild(left); cols.appendChild(right);
    var tiles = [];
    function pick(k, scroll) {
      tiles.forEach(function (t, j) { t.el.classList.toggle('sel', j === k); t.card.classList.toggle('on', j === k); });
      right.scrollTop = 0;
      if (scroll && window.innerWidth <= 560) right.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    Array.prototype.slice.call(box.querySelectorAll('.shop-section, .shop-card')).forEach(function (el) {
      if (el.classList.contains('shop-section')) { grid.appendChild(el); return; }   // (the headings sit across the grid)
      right.appendChild(el);
      var t = document.createElement('button'); t.type = 'button'; t.className = 'shop-tile';
      var pic = el.querySelector('.shop-pic').firstElementChild, name = el.querySelector('.shop-text b'), price = el.querySelector('.shop-price');
      var tp = document.createElement('span'); tp.className = 'shop-tile-pic'; if (pic) tp.appendChild(pic.cloneNode(true)); t.appendChild(tp);
      var tn = document.createElement('span'); tn.className = 'shop-tile-name'; tn.textContent = name ? name.textContent : ''; t.appendChild(tn);
      var tc = document.createElement('span'); tc.className = 'shop-tile-price'; tc.innerHTML = price ? price.innerHTML : ''; t.appendChild(tc);
      var k = tiles.length; t.addEventListener('click', function (e) { e.stopPropagation(); pick(k, true); });
      grid.appendChild(t); tiles.push({ el: t, card: el });
    });
    pick(0);
    return function () {                                              // (after each re-render: grey out what you can't buy)
      tiles.forEach(function (t) { var bs = t.card.querySelectorAll('.shop-buy button'), can = false; for (var i = 0; i < bs.length; i++) if (!bs[i].disabled) can = true; t.el.classList.toggle('cant', !can); });
      paintCoinIcons(box);
    };
  }
  var shopTilesSync = shopCatalogue(shopBox), barnTilesSync = shopCatalogue(barnShopBox);
  var shopBaseRender = renderShop, barnBaseRender = renderBarnShop;
  renderShop = function () { shopBaseRender(); shopTilesSync(); };
  renderBarnShop = function () { barnBaseRender(); barnTilesSync(); };
  shopBox.classList.add('shop-wide'); barnShopBox.classList.add('shop-wide');

  // ---------- Dragging items between slots ----------
  var slotDrag = null; // { from, startX, startY, ghost }
  function startDrag(i, e) {
    slotDrag = { from: i, startX: e.clientX, startY: e.clientY, ghost: null };
  }
  window.addEventListener('pointermove', function (e) {
    if (!slotDrag) return;
    if (!slotDrag.ghost) {
      if (Math.abs(e.clientX - slotDrag.startX) + Math.abs(e.clientY - slotDrag.startY) < 8) return; // a tap, not a drag (yet)
      slotDrag.ghost = document.createElement('div'); // a copy of the item that follows your finger
      slotDrag.ghost.className = 'drag-ghost';
      slotDrag.ghost.appendChild(itemPicture(bag[slotDrag.from].id));
      document.body.appendChild(slotDrag.ghost);
      var src = document.querySelectorAll('[data-slot="' + slotDrag.from + '"]');
      for (var k = 0; k < src.length; k++) src[k].classList.add('dragging');
    }
    slotDrag.ghost.style.left = e.clientX + 'px';
    slotDrag.ghost.style.top = e.clientY + 'px';
    var over = document.querySelectorAll('.slot.drop-target');
    for (var j = 0; j < over.length; j++) over[j].classList.remove('drop-target');
    var target = slotUnder(e.clientX, e.clientY);
    if (target) target.classList.add('drop-target');
  });
  window.addEventListener('pointerup', function (e) {
    if (!slotDrag) return;
    var d = slotDrag;
    slotDrag = null;
    if (!d.ghost) return; // it was just a tap: the slot's click handles it
    document.body.removeChild(d.ghost);
    var target = slotUnder(e.clientX, e.clientY);
    if (target) moveItem(d.from, +target.getAttribute('data-slot'));
    renderBag();
  });
  window.addEventListener('pointercancel', function () {
    if (!slotDrag) return;
    if (slotDrag.ghost) document.body.removeChild(slotDrag.ghost);
    slotDrag = null;
    renderBag();
  });
  function slotUnder(x, y) {
    var el = document.elementFromPoint(x, y);
    while (el && !(el.getAttribute && el.getAttribute('data-slot') !== null)) el = el.parentNode;
    return el && el.getAttribute ? el : null;
  }
  // Moves an item to another slot, swapping with whatever is there (same items stack together)
  function moveItem(from, to) {
    if (from === to || !bag[from]) return;
    if (bag[to] && bag[to].id === bag[from].id) {
      bag[to].count += bag[from].count;
      bag[from] = null;
    } else {
      var held = bag[to];
      bag[to] = bag[from];
      bag[from] = held;
    }
    if (selectedSlot === from) selectedSlot = to;       // the selection follows the item you moved
    else if (selectedSlot === to) selectedSlot = from;
  }
  function renderHotbar() {
    if (!hotUi.slots) return;
    hotUi.slots.innerHTML = '';
    for (var k = 0; k < ROW_SIZE; k++) {
      hotUi.slots.appendChild(makeSlot(hotRow * ROW_SIZE + k));
    }
    if (hotUi.row) hotUi.row.textContent = (hotRow + 1) + '/' + (BAG_SLOTS / ROW_SIZE) + ' ⇅';
  }
  function nextRow() {
    hotRow = (hotRow + 1) % (BAG_SLOTS / ROW_SIZE);
    renderHotbar();
  }
  if (hotUi.row) hotUi.row.addEventListener('click', function () { nextRow(); focusGame(); });
  function stepSlot(dir) { // select the next slot that has something in it, flipping the hotbar to its row
    var at = selectedSlot >= 0 ? selectedSlot : (dir > 0 ? hotRow * ROW_SIZE - 1 : hotRow * ROW_SIZE + ROW_SIZE);
    for (var tries = 0; tries < BAG_SLOTS; tries++) {
      at = (at + dir + BAG_SLOTS) % BAG_SLOTS;
      if (bag[at]) break;
    }
    if (!bag[at]) return;                       // the bag is empty
    selectedSlot = at;
    hotRow = Math.floor(at / ROW_SIZE);
    renderBag();
  }

  function renderBag() {
    renderHotbar();
    if (!bagUi.grid) return;
    bagUi.grid.innerHTML = '';
    for (var i = 0; i < BAG_SLOTS; i++) {
      bagUi.grid.appendChild(makeSlot(i));
    }
    describeSlot();
  }
  function toggleBag(open, onMap) {                                  // onMap: open it on the world map page instead of the bag
    if (!bagUi.box) return;
    var show = open === undefined ? bagUi.box.hidden : !!open;
    if (show) {
      if (typeof binOpen !== 'undefined' && binOpen) closeBin();      // only one menu open at a time
      if (typeof shopOpen !== 'undefined' && shopOpen) closeShop();
      if (typeof barnShopOpen !== 'undefined' && barnShopOpen) closeBarnShop();
      walkTarget = null;
    }
    bagUi.box.hidden = !show;
    if (show) { renderBag(); showMapPage(!!onMap); }                  // the map (if shown) starts on where you are now
    else if (mapPage) showMapPage(false);                             // closing it always goes back to the bag page next time
  }
  // ---------- World map: a second page in the bag ----------
  // Press "Next ›" in the bag to see a map of both islands. Scroll it (or drag it) to look around. It shows your house,
  // the Dawn Tree, the lake and dock, your crops, the shipping bin, the bridge, Whimsy & Bloom, every standing tree,
  // bush and rock, and you, as a little witch's hat, which moves along with you while the map is open
  var MAP_X0 = -142, MAP_X1 = 47, MAP_Z0 = -42, MAP_Z1 = 168, MAP_S = 6;   // the area it covers, and how many pixels per step
  var MAP_W = Math.round((MAP_X1 - MAP_X0) * MAP_S), MAP_H = Math.round((MAP_Z1 - MAP_Z0) * MAP_S);
  var mapPage = false, mapBase = null, mapTimer = null, mapFollow = true;
  var mapHead = bagUi.box ? bagUi.box.querySelector('.inv-head b') : null;
  var mapBtn = document.createElement('button');
  mapBtn.type = 'button'; mapBtn.className = 'inv-close map-btn'; mapBtn.textContent = 'Next ›';
  mapBtn.style.cssText = 'margin-left:auto;margin-right:8px;';
  if (bagUi.close) bagUi.close.parentNode.insertBefore(mapBtn, bagUi.close);
  var mapBox = document.createElement('div');
  mapBox.style.cssText = 'height:min(46vh,320px);overflow:auto;border-radius:12px;box-shadow:inset 0 0 0 2px #fff;background:#cfe8ff;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y;cursor:grab;position:relative;';
  var mapCanvas = document.createElement('canvas');
  mapCanvas.width = MAP_W * 2; mapCanvas.height = MAP_H * 2;           // drawn at double size so it stays sharp
  mapCanvas.style.cssText = 'display:block;width:' + MAP_W + 'px;height:' + MAP_H + 'px;max-width:none;';
  mapBox.appendChild(mapCanvas);
  var mapFind = document.createElement('button');                      // jump back to where you are
  mapFind.type = 'button'; mapFind.className = 'inv-close'; mapFind.textContent = '📍 Find me';
  mapFind.style.cssText = 'font-size:.8rem;padding:3px 10px;';
  var mapKey = document.createElement('div');
  mapKey.className = 'inv-info';
  mapKey.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;font-size:.78rem;';
  mapKey.innerHTML = '<span style="flex-basis:100%;color:#7b4fd6;font-weight:600">📍 Tap a pin to teleport there (' + 20 + ' mana)</span><span><b style="color:#7b4fd6">🧙</b> You</span><span><span style="color:#8a5a3c">■</span> Farm soil</span><span><span style="color:#e98ab6">●</span> Ready to pick</span><span><span style="color:#3f8a3a">●</span> Trees</span><span><span style="color:#8c8c96">●</span> Rocks</span>';
  mapKey.insertBefore(mapFind, mapKey.firstChild);
  mapBox.style.display = mapKey.style.display = 'none';
  if (bagUi.grid) { bagUi.grid.parentNode.insertBefore(mapBox, bagUi.grid.nextSibling); bagUi.grid.parentNode.insertBefore(mapKey, mapBox.nextSibling); }
  (function () {                                                       // drag the map with the mouse (fingers already scroll it)
    var dragAt = null;
    var dragged = false;
    mapBox.addEventListener('mousedown', function (e) { dragAt = { x: e.clientX, y: e.clientY, l: mapBox.scrollLeft, t: mapBox.scrollTop }; dragged = false; mapBox.style.cursor = 'grabbing'; e.preventDefault(); });
    window.addEventListener('mousemove', function (e) { if (dragAt && Math.abs(e.clientX - dragAt.x) + Math.abs(e.clientY - dragAt.y) > 6) dragged = true; });
    mapCanvas.addEventListener('click', function (e) {                // tap a pin to teleport there
      if (dragged) { dragged = false; return; }
      var r = mapCanvas.getBoundingClientRect(), cx = (e.clientX - r.left) * (mapCanvas.width / r.width), cy = (e.clientY - r.top) * (mapCanvas.height / r.height);
      for (var i = 0; i < TELEPORTS.length; i++) {
        var sp3 = TELEPORTS[i].spot(), pp = mapXY(sp3.x, sp3.z);
        if (Math.abs(cx - pp[0]) < 40 && cy > pp[1] - 90 && cy < pp[1] + 26) { teleportTo(i); return; }
      }
    });
    window.addEventListener('mousemove', function (e) { if (!dragAt) return; mapBox.scrollLeft = dragAt.l - (e.clientX - dragAt.x); mapBox.scrollTop = dragAt.t - (e.clientY - dragAt.y); mapFollow = false; });
    window.addEventListener('mouseup', function () { if (dragAt) { dragAt = null; mapBox.style.cursor = 'grab'; } });
    mapBox.addEventListener('touchstart', function () { mapFollow = false; }, { passive: true });
    mapBox.addEventListener('wheel', function () { mapFollow = false; }, { passive: true });
  })();
  function mapXY(x, z) { return [(x - MAP_X0) * MAP_S * 2, (z - MAP_Z0) * MAP_S * 2]; }
  function drawMapBase() {                                            // the land, water, cliffs, paths and bridge, worked out pixel by pixel once
    var BS = 3, bw = Math.round((MAP_X1 - MAP_X0) * BS), bh = Math.round((MAP_Z1 - MAP_Z0) * BS);
    var cv = document.createElement('canvas'); cv.width = bw; cv.height = bh;
    var g = cv.getContext('2d'), img = g.createImageData(bw, bh), d = img.data;
    function land(x, z) { return islandR(x, z) < ISLAND || onIsle2(x, z, 0) || onIsle3(x, z, 0); }
    for (var py = 0; py < bh; py++) for (var px = 0; px < bw; px++) {
      var x = MAP_X0 + (px + 0.5) / BS, z = MAP_Z0 + (py + 0.5) / BS, c, i = (py * bw + px) * 4;
      var main = islandR(x, z) < ISLAND, isle3 = onIsle3(x, z, 0), isle = onIsle2(x, z, 0) || isle3, br = Math.abs(x - BRIDGE_X) < BRIDGE_W / 2 + 0.3 && z > BRIDGE_Z0 - 1.5 && z < BRIDGE_Z1 + 1.5;
      var br2 = Math.abs(z - BRIDGE2_Z) < BRIDGE_W / 2 + 0.3 && x < -(BRIDGE_Z0 - 1.5) && x > -(BRIDGE_Z1 + 1.5);   // the west bridge
      var n = (isle2Hash(px * 7.1 + py * 3.3) - 0.5) * 10, n2 = Math.sin(x * 0.9 + Math.sin(z * 0.7) * 2) * 6 + Math.sin(z * 1.3 + x * 0.4) * 5;   // speckle and soft patches of lighter and darker grass
      if (main && inLake(x, z)) {
        if (onDock(x, z)) c = [170, 122, 80];
        else { var depth = Math.min(1, (WATER_Y - groundHeight(x, z)) / 0.9); c = [150 - depth * 70, 210 - depth * 50, 240 - depth * 10]; n = n * 0.3; n2 = Math.sin(x * 3 + z * 2) * 4; }
      } else if (main || isle) {
        var edge = main ? ISLAND - islandR(x, z) : 4;
        if (main && pathDist(x, z) < PATH_W + 0.25) c = pathDist(x, z) < PATH_W - 0.1 ? [222, 192, 140] : [190, 160, 112];   // the path, with darker worn edges
        else if (main && nearLake(x, z)) c = [196, 206, 150];                                  // a sandy shore round the lake
        else c = isle ? [128, 194, 108] : [122, 188, 100];
        if (edge < 1.4) c = [c[0] - 30, c[1] - 30, c[2] - 26];                                  // the grassy rim at the edge
        if (isle && !onIsle2(x, z, 1.2) && !onIsle3(x, z, 1.2)) c = [96, 156, 82];
        if (isle && stonePathDist(x, z) < SP_W) c = (Math.floor(x * 1.6) + Math.floor(z * 1.6)) % 2 ? [222, 214, 198] : [206, 198, 184];   // the stone path to the shop
      } else if (br || br2) {
        var across = br ? Math.abs(x - BRIDGE_X) : Math.abs(z - BRIDGE2_Z), along = br ? z : x;
        c = across > BRIDGE_W / 2 - 0.15 ? [170, 160, 150] : [210, 200, 186];  // railings and paving
        if (across <= BRIDGE_W / 2 - 0.15 && (Math.floor(along * 1.5) % 2 === 0)) c = [200, 190, 176];
        n = n * 0.4; n2 = 0;
      } else {
        var shadow = land(x - 1.2, z - 1.6) ? 22 : 0;                                          // the islands cast a soft shadow on the clouds below
        var sky = 1 - py / bh * 0.2; c = [Math.round(186 * sky + 40) - shadow, Math.round(222 * sky + 22) - shadow, 255 - shadow * 0.5];
        n2 = Math.sin(x * 0.25 + z * 0.15) * 6;
      }
      d[i] = Math.max(0, Math.min(255, c[0] + n + n2)); d[i + 1] = Math.max(0, Math.min(255, c[1] + n + n2)); d[i + 2] = Math.max(0, Math.min(255, c[2] + n * 0.6 + n2 * 0.5)); d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    var out = document.createElement('canvas'); out.width = MAP_W * 2; out.height = MAP_H * 2;
    var o = out.getContext('2d');
    o.imageSmoothingEnabled = true;
    o.drawImage(cv, 0, 0, out.width, out.height);
    // soft clouds drifting below the islands
    for (var cl = 0; cl < 26; cl++) {
      var cx = isle2Hash(cl * 3.1) * out.width, cy = isle2Hash(cl * 5.3) * out.height, cr = 30 + isle2Hash(cl) * 60;
      var p1 = mapXY(MAP_X0 + cx / (MAP_S * 2), MAP_Z0 + cy / (MAP_S * 2));
      if (land(MAP_X0 + cx / (MAP_S * 2), MAP_Z0 + cy / (MAP_S * 2))) continue;
      for (var pf = 0; pf < 5; pf++) { o.beginPath(); o.arc(p1[0] + (pf - 2) * cr * 0.5, p1[1] + Math.sin(pf * 2) * cr * 0.2, cr * (0.5 + 0.2 * Math.sin(pf + cl)), 0, Math.PI * 2); o.fillStyle = 'rgba(255,255,255,0.35)'; o.fill(); }
    }
    // a compass in the corner
    var cp = mapXY(MAP_X1 - 5, MAP_Z0 + 5);
    o.save(); o.translate(cp[0], cp[1]);
    o.beginPath(); o.arc(0, 0, 34, 0, Math.PI * 2); o.fillStyle = 'rgba(255,255,255,0.85)'; o.fill(); o.strokeStyle = '#b89a5a'; o.lineWidth = 3; o.stroke();
    [0, 1, 2, 3].forEach(function (k) { o.save(); o.rotate(k * Math.PI / 2); o.beginPath(); o.moveTo(0, -28); o.lineTo(7, 0); o.lineTo(-7, 0); o.closePath(); o.fillStyle = k ? '#8a7aa8' : '#7b4fd6'; o.fill(); o.restore(); });
    o.font = 'bold 16px Fredoka, sans-serif'; o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillStyle = '#4a2f7a';
    [['N', 0, -45], ['E', 45, 0], ['S', 0, 45], ['W', -45, 0]].forEach(function (d) { o.fillText(d[0], d[1], d[2]); });   // (the four points of the compass)
    o.restore();
    return out;
  }
  function drawMap() {
    if (!mapBase) mapBase = drawMapBase();
    var g = mapCanvas.getContext('2d'), K = MAP_S * 2;
    g.drawImage(mapBase, 0, 0);
    function dot(x, z, r, col, ring) { var p = mapXY(x, z); g.beginPath(); g.arc(p[0], p[1], r, 0, Math.PI * 2); g.fillStyle = col; g.fill(); if (ring) { g.strokeStyle = ring; g.lineWidth = 1.5; g.stroke(); } }
    function label(text, x, z, dy, size) {
      var p = mapXY(x, z);
      g.font = 'bold ' + (size || 20) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 6; g.strokeStyle = 'rgba(255,255,255,0.92)'; g.lineJoin = 'round'; g.strokeText(text, p[0], p[1] + (dy || 0));
      g.fillStyle = '#4a2f7a'; g.fillText(text, p[0], p[1] + (dy || 0));
    }
    // your farm soil and crops
    tiles.forEach(function (t) {
      if (!t.soil) return;
      var p = mapXY(t.x, t.z), sz = TILE * K * 0.92;
      g.fillStyle = t.wet ? '#5a3a24' : '#8a5a3c'; g.fillRect(p[0] - sz / 2, p[1] - sz / 2, sz, sz);
      g.strokeStyle = 'rgba(60,35,20,0.5)'; g.lineWidth = 1; for (var f = -1; f <= 1; f++) { g.beginPath(); g.moveTo(p[0] - sz / 2 + 2, p[1] + f * sz / 4); g.lineTo(p[0] + sz / 2 - 2, p[1] + f * sz / 4); g.stroke(); }
      if (t.crop) {
        if (t.stage === 3) { for (var pt = 0; pt < 5; pt++) dot(t.x + Math.cos(pt * 1.26) * 0.18, t.z + Math.sin(pt * 1.26) * 0.18, 3.5, '#f2a6c8'); dot(t.x, t.z, 2.5, '#ffe08a'); }
        else dot(t.x, t.z, 2.5 + t.stage * 1.2, '#6cc062', 'rgba(30,70,30,0.6)');
      }
    });
    // rocks, bushes and trees that are standing right now, with soft shadows
    mineable.forEach(function (r) { if (r.gone || r.state !== 'whole') return; var rr = 2.5 + r.size * 2.2; dot(r.x + 0.15, r.z + 0.2, rr, 'rgba(0,0,0,0.18)'); dot(r.x, r.z, rr, '#9a9aa4', 'rgba(60,60,70,0.6)'); dot(r.x - 0.1, r.z - 0.12, rr * 0.4, 'rgba(255,255,255,0.45)'); });
    trimmable.forEach(function (b) { var u = b.userData; if (u.gone || u.state !== 'standing') return; dot(u.base.x + 0.2, u.base.z + 0.25, 5, 'rgba(0,0,0,0.15)'); dot(u.base.x, u.base.z, 5, '#6fb85e'); dot(u.base.x - 0.12, u.base.z - 0.12, 2.5, '#9ad884'); });
    choppable.forEach(function (t) {
      var u = t.userData; if (u.gone || u.state !== 'standing') return;
      var p = mapXY(u.base.x, u.base.z), sz = (u.size || 1);
      g.beginPath(); g.ellipse(p[0] + 6 * sz, p[1] + 8 * sz, 11 * sz, 8 * sz, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fill();
      if (u.leafy) {                                                    // a round leafy crown made of a few blobs, lit from the top left
        [[0, 0, 9], [-5, -3, 6], [5, -2, 6], [0, 5, 6]].forEach(function (bb) { g.beginPath(); g.arc(p[0] + bb[0] * sz, p[1] + bb[1] * sz, bb[2] * sz, 0, Math.PI * 2); g.fillStyle = '#3f8a3a'; g.fill(); });
        g.beginPath(); g.arc(p[0] - 3 * sz, p[1] - 3 * sz, 4 * sz, 0, Math.PI * 2); g.fillStyle = '#6ab45a'; g.fill();
      } else {                                                          // a pine, seen from above: a dark star of needles
        g.beginPath(); for (var k = 0; k < 16; k++) { var a = k / 16 * Math.PI * 2, rr2 = (k % 2 ? 5 : 10) * sz; g.lineTo(p[0] + Math.cos(a) * rr2, p[1] + Math.sin(a) * rr2); } g.closePath();
        g.fillStyle = '#285a2c'; g.fill(); g.beginPath(); g.arc(p[0] - 1.5, p[1] - 1.5, 3 * sz, 0, Math.PI * 2); g.fillStyle = '#3f7a3a'; g.fill();
      }
    });
    // the house's yard fence, the house, its tower and the cauldron
    g.fillStyle = '#7a5a40';
    fencePosts.forEach(function (fp) { var w = houseToWorld(fp[0], fp[1]), p = mapXY(w.x, w.z); g.fillRect(p[0] - 2.5, p[1] - 2.5, 5, 5); });
    var hp = mapXY(HOUSE_X, HOUSE_Z), hw2 = HW / 2 * K, hd2 = HD / 2 * K;
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(hp[0] - hw2 + 8, hp[1] - hd2 + 10, hw2 * 2, hd2 * 2);
    g.fillStyle = '#6a4aa8'; g.fillRect(hp[0] - hw2 - 4, hp[1] - hd2 - 4, hw2 * 2 + 8, hd2 * 2 + 8);      // the purple roof
    g.fillStyle = '#7d5cc0'; g.fillRect(hp[0] - hw2 - 4, hp[1] - hd2 - 4, hw2 * 2 + 8, hd2 + 4);
    g.strokeStyle = 'rgba(40,20,70,0.35)'; g.lineWidth = 1; for (var rl = 0; rl < 10; rl++) { var ry2 = hp[1] - hd2 - 4 + rl * (hd2 * 2 + 8) / 10; g.beginPath(); g.moveTo(hp[0] - hw2 - 4, ry2); g.lineTo(hp[0] + hw2 + 4, ry2); g.stroke(); }
    g.strokeStyle = '#4a2f7a'; g.lineWidth = 3; g.beginPath(); g.moveTo(hp[0] - hw2 - 4, hp[1]); g.lineTo(hp[0] + hw2 + 4, hp[1]); g.stroke();   // the ridge
    var tw = houseToWorld(TX, TZ), tp = mapXY(tw.x, tw.z);                                              // the round tower
    g.beginPath(); g.arc(tp[0], tp[1], TR * K + 4, 0, Math.PI * 2); g.fillStyle = '#5a3a98'; g.fill(); g.strokeStyle = '#e8b84a'; g.lineWidth = 3; g.stroke();
    g.beginPath(); g.arc(tp[0], tp[1], 4, 0, Math.PI * 2); g.fillStyle = '#e8b84a'; g.fill();
    var cw2 = houseToWorld(CX, CZ); dot(cw2.x, cw2.z, 7, '#1e1e24'); dot(cw2.x, cw2.z, 4.5, '#4ae07e');  // the cauldron
    label('Your House', HOUSE_X, HOUSE_Z, -hd2 - 22);
    // the Dawn Tree, glowing pink
    var dp = mapXY(TREE_X, TREE_Z), dg = g.createRadialGradient(dp[0], dp[1], 4, dp[0], dp[1], TREE_ZONE * K + 10);
    dg.addColorStop(0, 'rgba(255,170,230,0.9)'); dg.addColorStop(1, 'rgba(255,170,230,0)');
    g.fillStyle = dg; g.beginPath(); g.arc(dp[0], dp[1], TREE_ZONE * K + 10, 0, Math.PI * 2); g.fill();
    [[0, 0, 16], [-10, -6, 11], [10, -5, 11], [0, 10, 11], [-9, 7, 9], [9, 7, 9]].forEach(function (bb) { g.beginPath(); g.arc(dp[0] + bb[0], dp[1] + bb[1], bb[2], 0, Math.PI * 2); g.fillStyle = '#ff9be0'; g.fill(); });
    g.beginPath(); g.arc(dp[0] - 5, dp[1] - 5, 7, 0, Math.PI * 2); g.fillStyle = '#ffd6f2'; g.fill();
    label('Dawn Tree', TREE_X, TREE_Z, 36);
    label('Lake', LAKE_X, LAKE_Z, 0);
    var bp = mapXY(binWorld.x, binWorld.z); g.fillStyle = '#1e1e22'; g.fillRect(bp[0] - 8, bp[1] - 6, 16, 12); g.fillStyle = '#555'; g.fillRect(bp[0] - 8, bp[1] - 6, 16, 3);
    label('Shipping Bin', binWorld.x, binWorld.z, 20, 15);
    // the bridge's gateways and its floating lanterns
    [BRIDGE_Z0, BRIDGE_Z1].forEach(function (gz) { var a2 = mapXY(BRIDGE_X - BRIDGE_W / 2 - 0.3, gz), b2 = mapXY(BRIDGE_X + BRIDGE_W / 2 + 0.3, gz); g.fillStyle = '#d8ccbc'; g.fillRect(a2[0] - 6, a2[1] - 6, 12, 12); g.fillRect(b2[0] - 6, b2[1] - 6, 12, 12); });
    [BRIDGE_Z0, BRIDGE_Z1].forEach(function (gz) { var a3 = mapXY(-gz, BRIDGE2_Z - BRIDGE_W / 2 - 0.3), b3 = mapXY(-gz, BRIDGE2_Z + BRIDGE_W / 2 + 0.3); g.fillStyle = '#d8ccbc'; g.fillRect(a3[0] - 6, a3[1] - 6, 12, 12); g.fillRect(b3[0] - 6, b3[1] - 6, 12, 12); });   // and the west bridge's
    for (var bl2 = BRIDGE_Z0 + 6; bl2 < BRIDGE_Z1 - 3; bl2 += 9) { [-1, 1].forEach(function (sd) { var lp = mapXY(-bl2, BRIDGE2_Z + sd * (BRIDGE_W / 2 + 0.9)); var lg = g.createRadialGradient(lp[0], lp[1], 1, lp[0], lp[1], 12); lg.addColorStop(0, 'rgba(200,150,255,0.95)'); lg.addColorStop(1, 'rgba(200,150,255,0)'); g.fillStyle = lg; g.fillRect(lp[0] - 12, lp[1] - 12, 24, 24); }); }
    for (var bl = BRIDGE_Z0 + 6; bl < BRIDGE_Z1 - 3; bl += 9) { [-1, 1].forEach(function (sd) { var lp = mapXY(BRIDGE_X + sd * (BRIDGE_W / 2 + 0.9), bl); var lg = g.createRadialGradient(lp[0], lp[1], 1, lp[0], lp[1], 12); lg.addColorStop(0, 'rgba(200,150,255,0.95)'); lg.addColorStop(1, 'rgba(200,150,255,0)'); g.fillStyle = lg; g.fillRect(lp[0] - 12, lp[1] - 12, 24, 24); }); }
    label('Bridge', BRIDGE_X + 7, (BRIDGE_Z0 + BRIDGE_Z1) / 2, 0);
    label('West Bridge', -(BRIDGE_Z0 + BRIDGE_Z1) / 2, BRIDGE2_Z - 6, 0);
    label('Western Isle', ISLE3_X + 6, ISLE3_Z + 16, 0, 26);
    // Oak & Ember: its stepping-stone path, and its brown shingled roof with the ridge across it and the stone chimney
    g.fillStyle = '#c8bfae'; for (var cq = 4; cq < crpLine.length; cq += 6) { var cpp = mapXY(crpLine[cq][0], crpLine[cq][1]); g.beginPath(); g.arc(cpp[0], cpp[1], 4, 0, Math.PI * 2); g.fill(); }
    var cpm = mapXY(CARP_X, CARP_Z);
    g.save(); g.translate(cpm[0], cpm[1]); g.rotate(-CARP_TURN);
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(-CARP_HW * K + 8, -CARP_HD * K + 10, CARP_HW * K * 2 + 10, CARP_HD * K * 2 + 8);
    g.fillStyle = '#6e5038'; g.fillRect(-CARP_HW * K - 6, -CARP_HD * K - 6, CARP_HW * K * 2 + 12, CARP_HD * K + 6);
    g.fillStyle = '#8a6646'; g.fillRect(-CARP_HW * K - 6, 0, CARP_HW * K * 2 + 12, CARP_HD * K + 6);
    g.fillStyle = '#5a3c26'; g.fillRect(-CARP_HW * K - 6, -2, CARP_HW * K * 2 + 12, 4);
    g.fillStyle = '#8a847a'; g.fillRect(CARP_HW * K, -1.6 * K, 0.8 * K, 1.2 * K);
    g.fillStyle = '#a0784e'; g.fillRect(-1.2 * K, CARP_HD * K + 6, 2.4 * K, 1.6 * K);
    g.restore();
    label('Oak & Ember', CARP_X, CARP_Z, 30);
    if (coop.built) coopDrawOnMap(g, K, label);                         // your coop, if you've built one
    if (fbarn.built) fbarnDrawOnMap(g, K, label);                       // and your barn
    if (mill.built) millDrawOnMap(g, K, label);                         // and your mill
    if (silo.built) siloDrawOnMap(g, K, label);                         // and your silo
    // Fluff & Feather: its grey gambrel roof with the ridge along it, and the cupola
    var apm = mapXY(ANIMAL_X, ANIMAL_Z);
    g.save(); g.translate(apm[0], apm[1]); g.rotate(-ANIMAL_TURN);
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(-ANIMAL_HW * K + 8, -ANIMAL_HD * K + 10, ANIMAL_HW * K * 2, ANIMAL_HD * K * 2);
    g.fillStyle = '#5a625e'; g.fillRect(-ANIMAL_HW * K - 4, -ANIMAL_HD * K - 4, ANIMAL_HW * K, ANIMAL_HD * K * 2 + 8);
    g.fillStyle = '#727a76'; g.fillRect(0, -ANIMAL_HD * K - 4, ANIMAL_HW * K + 4, ANIMAL_HD * K * 2 + 8);
    g.fillStyle = '#f4f0e6'; g.fillRect(-2, -ANIMAL_HD * K - 4, 4, ANIMAL_HD * K * 2 + 8);
    g.fillStyle = '#5fa890'; g.fillRect(-7, -7, 14, 14);
    g.fillStyle = '#b8343a'; g.fillRect(-1.4 * K, ANIMAL_HD * K, 2.8 * K, 5);                 // the red barn doors
    g.restore();
    label('Fluff & Feather', ANIMAL_X, ANIMAL_Z, ANIMAL_HD * K + 34);
    // Whimsy & Bloom: its slate roof, turned the way it faces, with the front steps
    var sp = mapXY(SHOP_X, SHOP_Z);
    g.save(); g.translate(sp[0], sp[1]); g.rotate(-SHOP_TURN);
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(-SHOP_HW * K + 8, -SHOP_HD * K + 10, SHOP_HW * K * 2, SHOP_HD * K * 2);
    g.fillStyle = '#4a4e5a'; g.fillRect(-SHOP_HW * K - 3, -SHOP_HD * K - 3, SHOP_HW * K * 2 + 6, SHOP_HD * K * 2 + 6);
    g.fillStyle = '#5c6070'; g.fillRect(-SHOP_HW * K * 0.8, -SHOP_HD * K * 0.8, SHOP_HW * K * 1.6, SHOP_HD * K * 1.6);
    g.strokeStyle = '#e8b84a'; g.lineWidth = 2; g.strokeRect(-SHOP_HW * K * 0.8, -SHOP_HD * K * 0.8, SHOP_HW * K * 1.6, SHOP_HD * K * 1.6);
    g.fillStyle = '#d6cfc4'; g.fillRect(-1 * K, SHOP_HD * K + 3, 2 * K, 0.6 * K);                         // the steps
    g.fillStyle = '#b79ce6'; g.fillRect(-4 * K, SHOP_HD * K - 2, 3 * K, 6); g.fillRect(1 * K, SHOP_HD * K - 2, 3 * K, 6);   // the awnings
    g.beginPath(); g.arc(0, 0, 6, 0, Math.PI * 2); g.fillStyle = '#c89aff'; g.fill();                       // the crystal spire
    g.restore();
    label('Whimsy & Bloom', SHOP_X, SHOP_Z, SHOP_HD * K + 30);              // below the shop, clear of its teleport pin
    // Everdawn Clinic: its coral tiled roof with the ridge along it, the white porch and a heart on the ridge
    var cpm = mapXY(CLINIC_X, CLINIC_Z);
    g.save(); g.translate(cpm[0], cpm[1]); g.rotate(-CLINIC_TURN);
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(-CLINIC_HW * K + 8, -CLINIC_HD * K + 10, CLINIC_HW * K * 2, CLINIC_HD * K * 2);
    g.fillStyle = '#b8583e'; g.fillRect(-CLINIC_HW * K - 3, -(CLINIC_HD + 0.45) * K, CLINIC_HW * K * 2 + 6, (CLINIC_HD + 0.45) * K);
    g.fillStyle = '#d87a5a'; g.fillRect(-CLINIC_HW * K - 3, 0, CLINIC_HW * K * 2 + 6, (CLINIC_HD + 0.45) * K);
    g.fillStyle = 'rgba(255,255,255,0.12)'; for (var tr = -CLINIC_HD; tr < CLINIC_HD; tr += 0.6) g.fillRect(-CLINIC_HW * K - 3, tr * K, CLINIC_HW * K * 2 + 6, 1.5);
    g.fillStyle = '#c0704a'; g.fillRect(-CLINIC_HW * K - 3, -2, CLINIC_HW * K * 2 + 6, 4);                                      // the ridge
    g.fillStyle = '#f4f1ea'; g.fillRect(-1.7 * K, (CLINIC_HD + 0.45) * K, 3.4 * K, 1.3 * K);                                    // the porch
    g.fillStyle = '#d6cfc4'; g.fillRect(-1.5 * K, (CLINIC_HD + 1.75) * K, 3 * K, 0.35 * K);                                     // its step
    g.fillStyle = '#e0607a'; g.beginPath(); g.moveTo(0, 7); g.bezierCurveTo(-11, 0, -7, -8, 0, -3); g.bezierCurveTo(7, -8, 11, 0, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.fillRect(-1.2, -4, 2.4, 7); g.fillRect(-3.5, -1.6, 7, 2.4);
    g.restore();
    label('Everdawn Clinic', CLINIC_X, CLINIC_Z, CLINIC_HD * K + 36);
    label('Town Square', ISLE2_X - 4, ISLE2_Z + 18, 0, 26);
    // teleport pins: a glowing purple marker on each place you can teleport to
    var pinPulse = 1 + Math.sin(Date.now() / 300) * 0.08;
    TELEPORTS.forEach(function (d) {
      var sp2 = d.spot(), pp = mapXY(sp2.x, sp2.z), R = 24 * pinPulse;
      var pg = g.createRadialGradient(pp[0], pp[1] - 40, 4, pp[0], pp[1] - 40, 54); pg.addColorStop(0, 'rgba(200,150,255,0.6)'); pg.addColorStop(1, 'rgba(200,150,255,0)');
      g.fillStyle = pg; g.beginPath(); g.arc(pp[0], pp[1] - 30, 54, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pp[0], pp[1], 9, 4, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(40,20,70,0.35)'; g.fill();   // its shadow
      g.beginPath(); g.moveTo(pp[0], pp[1]);                                                                          // a teardrop pin
      g.bezierCurveTo(pp[0] - R * 0.5, pp[1] - R * 0.9, pp[0] - R, pp[1] - R * 1.3, pp[0] - R, pp[1] - R * 1.9);
      g.arc(pp[0], pp[1] - R * 1.9, R, Math.PI, 0);
      g.bezierCurveTo(pp[0] + R, pp[1] - R * 1.3, pp[0] + R * 0.5, pp[1] - R * 0.9, pp[0], pp[1]);
      g.closePath(); g.fillStyle = '#7b4fd6'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke();
      g.beginPath(); g.arc(pp[0], pp[1] - R * 1.9, R * 0.72, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
      g.font = Math.round(R * 1.05) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(d.icon, pp[0], pp[1] - R * 1.88);
      g.font = 'bold 13px Fredoka, sans-serif'; g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,0.95)'; g.strokeText('✨ Teleport', pp[0], pp[1] + 14); g.fillStyle = '#7b4fd6'; g.fillText('✨ Teleport', pp[0], pp[1] + 14);
    });
    // you: a little witch's hat with a pointer showing the way you face (inside, you're shown at the door)
    var you = { x: player.position.x, z: player.position.z };
    if (indoors) you = inFbarn ? fbarnFront(1.5) : inCoop ? coopFront(1.5) : inCarp ? carpFront(1.5) : inBarn ? animalFront(1.5) : inClinic ? clinicFront(1.5) : inShop ? shopFront(1.5) : { x: OUT_DOOR_X, z: OUT_DOOR_Z + 1 };
    var yp = mapXY(you.x, you.z), fa = indoors ? (inFbarn || inCoop ? 0 : inCarp ? CARP_TURN : inBarn ? ANIMAL_TURN : inClinic ? CLINIC_TURN : inShop ? SHOP_TURN : 0) : facing, pulse = 1 + Math.sin(Date.now() / 250) * 0.15;
    var yg = g.createRadialGradient(yp[0], yp[1], 2, yp[0], yp[1], 34 * pulse); yg.addColorStop(0, 'rgba(255,255,255,0.9)'); yg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = yg; g.beginPath(); g.arc(yp[0], yp[1], 34 * pulse, 0, Math.PI * 2); g.fill();
    g.save(); g.translate(yp[0], yp[1]); g.rotate(-fa + Math.PI);
    g.beginPath(); g.moveTo(0, -30); g.lineTo(8, -18); g.lineTo(-8, -18); g.closePath(); g.fillStyle = '#7b4fd6'; g.fill();   // which way you're facing
    g.restore();
    g.beginPath(); g.ellipse(yp[0], yp[1] + 6, 16, 6, 0, 0, Math.PI * 2); g.fillStyle = '#5b3fb0'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#fff'; g.stroke();   // the hat's brim
    g.beginPath(); g.moveTo(yp[0] - 9, yp[1] + 5); g.quadraticCurveTo(yp[0] - 2, yp[1] - 6, yp[0] + 4, yp[1] - 20); g.lineTo(yp[0] + 9, yp[1] + 5); g.closePath(); g.fillStyle = '#7b4fd6'; g.fill(); g.stroke();
    g.beginPath(); g.arc(yp[0] + 4, yp[1] - 20, 3, 0, Math.PI * 2); g.fillStyle = '#ffe08a'; g.fill();
    label('You', you.x, you.z, 24, 16);
    return yp;
  }
  var mapAutoScroll = false;
  function centreMapOnYou(yp) {
    var l = Math.max(0, Math.round(yp[0] / 2 - mapBox.clientWidth / 2)), t = Math.max(0, Math.round(yp[1] / 2 - mapBox.clientHeight / 2));
    if (Math.abs(mapBox.scrollLeft - l) < 1 && Math.abs(mapBox.scrollTop - t) < 1) return;
    mapAutoScroll = true; mapBox.scrollLeft = l; mapBox.scrollTop = t;
    setTimeout(function () { mapAutoScroll = false; }, 50);
  }
  mapBox.addEventListener('scroll', function () { if (!mapAutoScroll) mapFollow = false; });   // you scrolled to look around: stop following you
  function showMapPage(on) {
    mapPage = on;
    if (bagUi.grid) bagUi.grid.style.display = on ? 'none' : '';
    if (bagUi.info) bagUi.info.style.display = on ? 'none' : '';
    var extras = bagUi.box ? bagUi.box.querySelectorAll('.trash-row') : [];
    for (var i = 0; i < extras.length; i++) extras[i].style.display = on ? 'none' : '';
    mapBox.style.display = on ? 'block' : 'none'; mapKey.style.display = on ? 'flex' : 'none';
    mapBtn.textContent = on ? '‹ Bag' : 'Next ›';
    if (mapHead) mapHead.textContent = on ? '🗺️ World Map' : '🎒 Bag';
    if (mapTimer) { clearInterval(mapTimer); mapTimer = null; }
    if (on) {
      mapFollow = true;
      centreMapOnYou(drawMap());
      mapTimer = setInterval(function () {                              // keep you moving on the map while it's open
        if (!mapPage || !bagUi.box || bagUi.box.hidden) { clearInterval(mapTimer); mapTimer = null; return; }
        var yp = drawMap(); if (mapFollow) centreMapOnYou(yp);
      }, 300);
    }
  }
  mapBtn.addEventListener('click', function () { showMapPage(!mapPage); focusGame(); });
  mapFind.addEventListener('click', function () { mapFollow = true; centreMapOnYou(drawMap()); focusGame(); });
  if (bagUi.open) bagUi.open.addEventListener('click', function () { toggleBag(); focusGame(); });   // (focus back on the game, so Space doesn't press the button again)
  if (bagUi.close) bagUi.close.addEventListener('click', function () { toggleBag(false); focusGame(); });
  renderBag();

  // ---------- Teleport spell ----------
  // Press T (or the Teleport button) to open the world map with glowing pins on your house, the Dawn Tree and every
  // shop. Tap a pin and you vanish in a swirl of sparkles and reappear there. It costs some mana, and works from
  // anywhere, even indoors
  var TELEPORT_COST = 20;
  var TELEPORTS = [
    { name: 'Your House', icon: '🏡', spot: function () { return { x: OUT_DOOR_X, z: OUT_DOOR_Z + 1.3, face: 0, view: 0 }; } },
    { name: 'The Dawn Tree', icon: '🌸', spot: function () { return { x: TREE_X + 2.4, z: TREE_Z + 2.4, face: Math.atan2(-1, -1), view: Math.atan2(1, 1) }; } },
    { name: 'Whimsy & Bloom', icon: '🌱', spot: function () { var f = shopFront(1.8); return { x: f.x, z: f.z, face: SHOP_TURN + Math.PI, view: SHOP_TURN }; } },
    { name: 'Everdawn Clinic', icon: '🩺', spot: function () { var f = clinicFront(2.6); return { x: f.x, z: f.z, face: CLINIC_TURN + Math.PI, view: CLINIC_TURN }; } },
    { name: 'Fluff & Feather', icon: '🐾', spot: function () { var f = animalFront(2.4); return { x: f.x, z: f.z, face: ANIMAL_TURN + Math.PI, view: ANIMAL_TURN }; } }
  ];
  var teleporting = false;
  var tpBtn = document.createElement('button');
  tpBtn.type = 'button'; tpBtn.id = 'btnTeleport'; tpBtn.innerHTML = 'Teleport <kbd>T</kbd>';
  if (ui.btnSpell && ui.btnSpell.parentNode) ui.btnSpell.parentNode.insertBefore(tpBtn, ui.btnSpell.nextSibling);
  function openTeleport() {                                           // the world map, with its teleport pins
    if (teleporting || sleeping || doorBusy) return;
    if (binOpen) closeBin(); if (shopOpen) closeShop(); if (barnShopOpen) closeBarnShop();
    if (bagUi.box && !bagUi.box.hidden && mapPage) { toggleBag(false); return; }   // pressing it again closes the map
    if (bagUi.box && !bagUi.box.hidden) showMapPage(true);            // the bag's already open: flip to its map page
    else toggleBag(true, true);
    if (state.mana < TELEPORT_COST) showToast('Teleporting needs ' + TELEPORT_COST + ' mana. Visit the Dawn Tree to refill it.', 2400);
  }
  function teleportSwirl(x, z) {                                       // a rising spiral of purple and gold sparkles
    burst(x, 0.3, z, 0xc89aff, 26, 2.2, 3.2, -1.5);
    burst(x, 1.0, z, 0xffe08a, 16, 1.6, 2.4, -1);
  }
  function teleportTo(n) {
    if (teleporting || sleeping) return;
    if (state.mana < TELEPORT_COST) { showToast('Not enough mana to teleport (you need ' + TELEPORT_COST + ')', 2000); return; }
    var d = TELEPORTS[n], to = d.spot();
    toggleBag(false);
    teleporting = true; walkTarget = null; keys = {};
    state.mana -= TELEPORT_COST;
    spellSound();
    if (!indoors) teleportSwirl(player.position.x, player.position.z);
    fadeBox.style.background = '#2a1a4a';
    fadeBox.style.transition = 'opacity 0.5s';
    fadeBox.style.opacity = 1;
    setTimeout(function () {
      if (indoors) {                                                  // stepping out of the house or the shop
        indoors = false; inShop = false; inClinic = false; inBarn = false;
        scene.add(player);
        if (outsideCam) { cam.dist = outsideCam.dist; cam.pitch = outsideCam.pitch; }
      }
      player.position.set(to.x, 0, to.z);
      facing = to.face;
      cam.target.set(to.x, 0.8, to.z);
      cam.yaw = to.view;                                              // turn the camera to show where you've arrived
      doorArmed = false;                                               // don't walk straight through a door you land beside
      teleportSwirl(to.x, to.z);
      setTimeout(function () {
        fadeBox.style.opacity = 0;
        showToast('✨ ' + d.name, 1600);
        setTimeout(function () { fadeBox.style.transition = 'opacity 0.35s'; fadeBox.style.background = '#120a1c'; teleporting = false; }, 550);
      }, 250);
    }, 550);
  }
  tpBtn.addEventListener('click', function () { openTeleport(); focusGame(); });
  window.addEventListener('keydown', function (e) { if (e.code === 'KeyT' && !e.repeat) openTeleport(); });

  // ---------- Keyboard ----------
  var keys = {};
  var GAME_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyE', 'Space', 'KeyQ'];
  // Interact, and Use Tool/Place Item, are both E or Space to start, and then one press does whichever fits: going
  // through a door, opening a shop, petting, or using what you're holding. On the Mouse & Keyboard settings page
  // either can have a key of your own instead, and then they're separate: Interact does everything but use what's in
  // your hand (doors, shops, animals, the bin, picking and watering), and Use Tool/Place Item only uses what you're
  // holding (chopping, mining, trimming, tilling, planting, placing or eating it), and holding it keeps the axe,
  // pickaxe or trimmers going. E does nothing once neither is E, and Space then only flies you up on your broom. The
  // Interact button shows the Interact key, and tapping it still does everything
  var interactKey = null, useKey = null, upKey = null, downKey = null, rightKey = null, leftKey = null, spellKey = null;
  try { interactKey = localStorage.getItem('everdawn-interact') || null; useKey = localStorage.getItem('everdawn-use-key') || null; upKey = localStorage.getItem('everdawn-move-up') || null; downKey = localStorage.getItem('everdawn-move-down') || null; rightKey = localStorage.getItem('everdawn-move-right') || null; leftKey = localStorage.getItem('everdawn-move-left') || null; spellKey = localStorage.getItem('everdawn-spell-key') || null; } catch (err) {}
  function isInteractKey(code) { return interactKey ? code === interactKey : code === 'KeyE' || code === 'Space'; }
  function isUseKey(code) { return useKey ? code === useKey : code === 'KeyE' || code === 'Space'; }
  function showInteractKey() { var k = ui.btnAct.querySelector('kbd'); if (k) k.textContent = interactKey ? everdawnKeyName(interactKey) : 'E'; }
  window.everdawnSetInteract = function (code) { interactKey = code || null; keys = {}; showInteractKey(); };
  window.everdawnSetUseKey = function (code) { useKey = code || null; keys = {}; };
  // Move Up is W or the Up Arrow to start, Move Down is S or the Down Arrow, Move Right is D or the Right Arrow, and
  // Move Left is A or the Left Arrow; on the Mouse & Keyboard page each can be a key of your own instead (then its
  // usual keys don't move you that way)
  window.everdawnSetMoveUp = function (code) { upKey = code || null; keys = {}; };
  window.everdawnSetMoveDown = function (code) { downKey = code || null; keys = {}; };
  window.everdawnSetMoveRight = function (code) { rightKey = code || null; keys = {}; };
  window.everdawnSetMoveLeft = function (code) { leftKey = code || null; keys = {}; };
  function upHeld() { return upKey ? !!keys[upKey] : !!(keys.KeyW || keys.ArrowUp); }
  function downHeld() { return downKey ? !!keys[downKey] : !!(keys.KeyS || keys.ArrowDown); }
  function rightHeld() { return rightKey ? !!keys[rightKey] : !!(keys.KeyD || keys.ArrowRight); }
  function leftHeld() { return leftKey ? !!keys[leftKey] : !!(keys.KeyA || keys.ArrowLeft); }
  // Spell Casting is Q to start; on the Mouse & Keyboard page it can be a key of your own instead (then Q does nothing).
  // The Dawn Bloom button shows whichever key it is
  function showSpellKey() { var k = ui.btnSpell.querySelector('kbd'); if (k) k.textContent = spellKey ? everdawnKeyName(spellKey) : 'Q'; }
  window.everdawnSetSpellKey = function (code) { spellKey = code || null; keys = {}; showSpellKey(); };
  showSpellKey();
  showInteractKey();
  var handsFree = false;                                               // (true while Interact runs on its own: nothing in your hand gets used)
  heldItem = (function (base) { return function () { return handsFree ? null : base.apply(this, arguments); }; })(heldItem);
  window.addEventListener('keydown', function (e) {
    var isI = isInteractKey(e.code), isU = isUseKey(e.code);
    if (GAME_KEYS.indexOf(e.code) === -1 && !isI && !isU && e.code !== upKey && e.code !== downKey && e.code !== rightKey && e.code !== leftKey && e.code !== spellKey) return;
    e.preventDefault();
    keys[e.code] = true;
    walkTarget = null;
    if (e.repeat) return;
    if (isI && isU) interact();                                        // (the same key: one press does whichever fits, as always)
    else if (isI) { handsFree = true; try { interact(); } finally { handsFree = false; } }
    else if (isU && heldItem()) interact();                            // (Use Tool/Place Item: only when you're holding something)
    if (spellKey ? e.code === spellKey : e.code === 'KeyQ') castSpell();
  });
  updateTrees = (function (base) {                                     // (holding a key keeps a tool going only if it's the Use Tool/Place Item key)
    return function (dt) {
      if (!useKey && !interactKey) return base.apply(this, arguments);
      var ke = keys.KeyE, ks = keys.Space, ah = actionHeld;
      actionHeld = ah || (useKey ? !!keys[useKey] : !!(ke || ks)); keys.KeyE = keys.Space = false;
      try { return base.apply(this, arguments); } finally { keys.KeyE = ke; keys.Space = ks; actionHeld = ah; }
    };
  })(updateTrees);
  window.addEventListener('keydown', function (e) { // I opens and closes the bag, Escape closes it
    if (e.repeat) return;
    if (e.code === 'KeyI') toggleBag();
    if (e.code === 'KeyR') nextRow();
    if (e.code === 'Tab') { e.preventDefault(); stepSlot(e.shiftKey ? -1 : 1); } // Tab steps to your next item, Shift+Tab goes back
    // number keys 1-4 pick that slot in the hotbar's current row (pressing it again unselects it)
    var num = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(e.code);
    if (num >= 0) {
      var pick = hotRow * ROW_SIZE + num;
      selectedSlot = selectedSlot === pick ? -1 : pick;
      renderBag();
    }
    if (e.code === 'Escape') toggleBag(false);
  });
  window.addEventListener('keyup', function (e) { keys[e.code] = false; });
  window.addEventListener('blur', function () { keys = {}; });

  function focusGame() { canvas.focus({ preventScroll: true }); }
  ui.btnAct.addEventListener('click', function () { interact(); focusGame(); });
  var actionHeld = false; // true while the Interact button is held down
  ui.btnAct.addEventListener('pointerdown', function () { actionHeld = true; });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
    ui.btnAct.addEventListener(ev, function () { actionHeld = false; });
  });
  ui.btnAct.addEventListener('contextmenu', function (e) { e.preventDefault(); }); // no long-press menu on phones
  ui.btnSpell.addEventListener('click', function () { castSpell(); focusGame(); });

  // ---------- Mouse / touch: drag to turn, tap to walk (no zooming) ----------
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
      pinch = d;                                                     // (two fingers don't zoom: the camera stays at its own distance from you)
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
    if (glimNaming) return;
    var bagUp = bagUi.box && !bagUi.box.hidden;
    if (document.body.classList.contains('full') && (bagUp || binOpen || shopOpen || barnShopOpen)) {   // in full screen, a tap outside a menu closes it
      if (!menuJustOpened()) { toggleBag(false); if (binOpen) closeBin(); if (shopOpen) closeShop(); if (barnShopOpen) closeBarnShop(); }
      return;
    }
    if (binOpen || shopOpen || barnShopOpen) return;                  // a tap while a menu is open doesn't walk you away from it
    var rect = canvas.getBoundingClientRect();
    var ndc = new THREE.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    var hit = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(ground, hit)) return;
    if (indoors ? !inRoom(hit.x, hit.z) : !walkable(hit.x, hit.z)) return;
    walkTarget = hit;
    if (!indoors) ripple(hit.x, hit.z, 0xffffff, 0.6, 0.45);
  }

  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();                                              // (scrolling doesn't zoom either; it just doesn't scroll the page)
  }, { passive: false });

  // ---------- You: a little chibi witch ----------
  // A cute 3D witch, in an anime style with soft cel shading and dark outlines: a big round head with large glossy
  // green eyes, rosy cheeks and a little cat smile; long brown hair with soft pointed bangs; a huge, floppy witch's hat
  // with a thick rolled brim lined in purple, a striped band, a buckle and orange roses, its crumpled crown bending over
  // and curling at the tip; a plain charcoal coat-dress with two rows of buttons, purple-lined
  // bell sleeves, a black ruffled petticoat and long tattered tails behind; torn dark stockings and boots;
  // and a broom in her left hand (your tools are held in her right). She walks, swings her arms, sways her hair and
  // blinks
  var wl = (function () {
    for (var i = 0; i < 7; i++) body.children[i].visible = false;     // (the old simple robe, head, hat and eyes)
    var chibi = new THREE.Group(); body.add(chibi);
    // (cel shading: three bands of light, as in a cartoon)
    var GRAD = new THREE.DataTexture(new Uint8Array([110, 110, 110, 255, 190, 190, 190, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
    GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter; GRAD.needsUpdate = true;
    function toon(color, o) { var p = { color: color, gradientMap: GRAD }; for (var k in o) p[k] = o[k]; return new THREE.MeshToonMaterial(p); }
    var OUT = new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: { w: { value: 0.0065 } },   // (dark outlines round every part)
      vertexShader: 'uniform float w; void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * w, 1.0); }',
      fragmentShader: 'void main() { gl_FragColor = vec4(0.13, 0.08, 0.13, 1.0); }' });
    function mesh(geo, mat, parent, noOutline) { var m = new THREE.Mesh(geo, mat); m.castShadow = true; (parent || chibi).add(m); if (!noOutline) { var o = new THREE.Mesh(geo, OUT); m.add(o); } return m; }
    function canvas(w, h, paint) { var c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h); var t = new THREE.CanvasTexture(c); t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; }
    function ell(rx, ry, rz, ws, hs) { var g = new THREE.SphereGeometry(1, ws || 24, hs || 18); g.scale(rx, ry, rz); return g; }
    // (a round shape turned from a profile of [radius, height] points, bottom to top; mod can reshape each point)
    function lathe(pts, segs, mod, phiStart, phiLength) {
      var g = new THREE.LatheGeometry(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), segs, phiStart || 0, phiLength || Math.PI * 2), p = g.attributes.position, v = new THREE.Vector3();
      if (mod) for (var i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); mod(v, Math.atan2(v.x, v.z), i % pts.length); p.setXYZ(i, v.x, v.y, v.z); }
      g.computeVertexNormals(); return g;
    }
    // (a flat, tapering lock of hair or ribbon along a curve)
    function ribbon(pts, w0, w1, th, side) {
      var curve = new THREE.CatmullRomCurve3(pts), N = 28, R = 8, pos = [], idx = [], c = new THREE.Vector3(), T = new THREE.Vector3(), S = new THREE.Vector3(), B = new THREE.Vector3();
      for (var i = 0; i <= N; i++) {
        var t = i / N, w = (w0 + (w1 - w0) * t) * (t > 0.75 ? 1 - (t - 0.75) / 0.25 * 0.92 : 1);
        curve.getPointAt(t, c); curve.getTangentAt(t, T); S.copy(side).addScaledVector(T, -side.dot(T)).normalize(); B.crossVectors(T, S).normalize();
        for (var k = 0; k < R; k++) { var a = k / R * Math.PI * 2; pos.push(c.x + S.x * Math.cos(a) * w + B.x * Math.sin(a) * th, c.y + S.y * Math.cos(a) * w + B.y * Math.sin(a) * th, c.z + S.z * Math.cos(a) * w + B.z * Math.sin(a) * th); }
      }
      for (i = 0; i < N; i++) for (var k2 = 0; k2 < R; k2++) { var a0 = i * R + k2, a1 = i * R + (k2 + 1) % R, b0 = a0 + R, b1 = a1 + R; idx.push(a0, b0, a1, a1, b0, b1); }
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
    }
    function V(x, y, z) { return new THREE.Vector3(x, y, z); }
    var SKIN = 0xf2d1b0, DRESS = 0x35302e, DARK = 0x2a2430, HAIR = 0x3e2820, ORANGE = 0xe8963e, CREAM = 0xf0e2c4;
    var mSkin = toon(SKIN), mHair = toon(HAIR), mDark = toon(DARK, { side: THREE.DoubleSide }), mOrange = toon(ORANGE), mBoot = toon(0x2e2522), mPurple = toon(0x4a3466, { side: THREE.BackSide });   // (the purple lining of her sleeves, tails and hat brim)

    // ---- her boots and torn stockings ----
    var stock = canvas(128, 128, function (g, w, h) {
      g.fillStyle = '#5e4640'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(30,20,22,0.8)'; g.lineWidth = 2;
      for (var x = -h; x < w; x += 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h, h); g.moveTo(x + h, 0); g.lineTo(x, h); g.stroke(); }   // (fishnet)
      g.fillStyle = '#f2d2c0'; [[30, 40, 12, 8], [90, 86, 9, 13], [70, 20, 6, 5], [20, 100, 7, 9]].forEach(function (r) { g.beginPath(); g.ellipse(r[0], r[1], r[2], r[3], 0.4, 0, Math.PI * 2); g.fill(); });   // (a couple of little tears)
    });
    var legs = [];
    [-1, 1].forEach(function (s) {
      var leg = new THREE.Group(); leg.position.set(s * 0.075, 0.36, 0); chibi.add(leg); legs.push(leg);
      var lg = new THREE.CylinderGeometry(0.046, 0.044, 0.16, 14); lg.translate(0, -0.08, 0); mesh(lg, toon(0xffffff, { map: stock }), leg);
      // (her boots: soft dark leather, shaped to her calf, with a folded cuff, criss-cross laces up the front, a little
      // buckle, and a smooth foot sweeping forward into a long, pointed toe that curls up at its tip, on a sole and a small heel)
      var mLeather = toon(0x3a2c26), mSole = toon(0x1c1614), mLace = toon(0x8a5a3a), mMetal = toon(0xc8a050);
      var sh = lathe([[0.05, -0.31], [0.054, -0.27], [0.06, -0.22], [0.064, -0.17], [0.062, -0.12], [0.066, -0.08]], 28);
      mesh(sh, mLeather, leg);                                           // (the shaft, narrowing at her ankle)
      var cuff = lathe([[0.066, -0.1], [0.078, -0.085], [0.082, -0.06], [0.074, -0.045]], 28, function (v, a, j) { if (j === 3) v.y += 0.008 * Math.sin(a * 6); });
      mesh(cuff, toon(0x4a3a32, { side: THREE.DoubleSide }), leg);   // (its soft folded cuff)
      var toeCurve = new THREE.CatmullRomCurve3([V(0, -0.3, -0.045), V(0, -0.31, 0.0), V(0, -0.315, 0.05), V(0, -0.31, 0.1), V(0, -0.292, 0.145), V(0, -0.262, 0.172), V(0, -0.24, 0.168)]);
      var foot = new THREE.TubeGeometry(toeCurve, 40, 1, 20, false), fp = foot.attributes.position, fc = new THREE.Vector3(), ft = new THREE.Vector3();
      for (var fi = 0; fi < fp.count; fi++) {                          // (the foot: full and rounded at the heel and ball, tapering to the curled tip)
        var t = Math.floor(fi / 21) / 40, rw = 0.052 * (t < 0.15 ? 0.75 + t / 0.15 * 0.25 : t < 0.45 ? 1 : Math.pow(1 - (t - 0.45) / 0.55, 0.9)) + 0.003, rh = rw * 0.72;
        toeCurve.getPointAt(t, fc); var dx = fp.getX(fi) - fc.x, dy = fp.getY(fi) - fc.y, dz = fp.getZ(fi) - fc.z, l = Math.hypot(dx, dy, dz) || 1;
        fp.setXYZ(fi, fc.x + dx / l * rw, fc.y + dy / l * rh + (dy < 0 && t < 0.6 ? dy / l * rh * -0.4 : 0), fc.z + dz / l * rw); }
      foot.computeVertexNormals(); mesh(foot, mLeather, leg);
      var sole = ell(0.052, 0.008, 0.11, 20, 8); sole.translate(0, -0.338, 0.04); mesh(sole, mSole, leg);   // (the sole)
      var heel = new THREE.CylinderGeometry(0.03, 0.026, 0.03, 14); heel.translate(0, -0.345, -0.03); mesh(heel, mSole, leg);   // (a small heel)
      for (var lc = 0; lc < 5; lc++) {                                   // (criss-cross laces up the front)
        var y0 = -0.27 + lc * 0.04, y1 = y0 + 0.04, r0 = 0.058 + lc * 0.0015;
        [[-1, 1], [1, -1]].forEach(function (d) { var lace = new THREE.CatmullRomCurve3([V(d[0] * 0.022, y0, r0), V(0, (y0 + y1) / 2, r0 + 0.006), V(d[1] * 0.022, y1, r0 + 0.002)]); mesh(new THREE.TubeGeometry(lace, 8, 0.0035, 5, false), mLace, leg, true); });
        [-1, 1].forEach(function (d) { var ey = new THREE.TorusGeometry(0.004, 0.0015, 4, 8); ey.translate(d * 0.022, y0, r0 + 0.001); mesh(ey, mMetal, leg, true); });   // (little brass eyelets)
      }
      var bow = new THREE.TorusGeometry(0.009, 0.003, 5, 10); bow.scale(1.4, 0.8, 1); [-1, 1].forEach(function (d) { var bb = bow.clone(); bb.translate(d * 0.011, -0.075, 0.07); mesh(bb, mLace, leg, true); });   // (tied in a bow at the top)
      var strap = new THREE.TorusGeometry(0.056, 0.006, 6, 24); strap.rotateX(Math.PI / 2); strap.translate(0, -0.285, 0.004); mesh(strap, toon(0x3a2a22), leg, true);   // (a strap round her ankle...)
      var bk = new THREE.BoxGeometry(0.018, 0.016, 0.006); bk.translate(s * 0.054, -0.285, 0.018); bk.rotateY(s * 0.3); mesh(bk, mMetal, leg, true);   // (...with a little brass buckle)
    });

    // ---- her outfit ----
    var LIGHT = new THREE.Vector3(-0.6, 0.8, 0.45).normalize();
    function tri(a, n) { return Math.abs(((a / (Math.PI * 2) * n) % 1 + 1) % 1 - 0.5) * 2; }   // (0 at each point of a jagged edge, 1 between)
    function jag(a) { return 0.6 + 0.4 * Math.abs(Math.sin(a * 37.1) * Math.cos(a * 11.3)); }   // (so the points aren't all the same length)
    // (a black petticoat, with frilly ruffles)
    [[0.3, 0.255, 0.27, 0x1c181c]].forEach(function (l) {
      var g = lathe([[l[0], l[2]], [l[0] - 0.008, l[2] + 0.028], [l[1], l[2] + 0.1]], 96, function (v, a, j) { var f = 1 + 0.055 * Math.sin(a * 38) * (j < 2 ? 1 : 0.25); v.x *= f; v.z *= f; if (j === 0) v.y += 0.012 * Math.abs(Math.sin(a * 19)); });
      mesh(paint(g, l[3], 0x3a3440), toon(0xffffff, { vertexColors: true, side: THREE.DoubleSide }));
    });
    // (her coat-dress: plain charcoal, falling in soft, uneven folds, with a jagged tattered hem
    // and a purple lining)
    var plain = canvas(1024, 256, function (g, w, h) {
      g.fillStyle = '#35302e'; g.fillRect(0, 0, w, h);
      for (var x = 0; x < w; x += 37) { var gr = g.createLinearGradient(x - 18, 0, x + 18, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - 18, 0, 36, h); }   // (shade in its folds)
    });
    var skirt = lathe([[0.29, 0.32], [0.28, 0.35], [0.235, 0.44], [0.178, 0.53], [0.138, 0.6], [0.122, 0.63]], 96, function (v, a, j) {
      var up = 1 - j / 5, f = 1 + (0.045 * Math.sin(a * 7 + 0.4) + 0.025 * Math.sin(a * 13 + 1.1)) * up; v.x *= f; v.z *= f;   // (soft, uneven folds)
      if (j === 0) v.y -= 0.065 * (1 - tri(a, 11)) * jag(a);                // (a jagged, tattered hem)
          });
    paint(skirt, 0xc4c4c4, 0xffffff);
    mesh(skirt, toon(0xffffff, { map: plain, vertexColors: true })).add(new THREE.Mesh(skirt, mPurple));
    // (long tattered tails behind, reaching nearly to the ground)
    var tails = lathe([[0.4, 0.03], [0.35, 0.2], [0.27, 0.42], [0.18, 0.56], [0.135, 0.63]], 64, function (v, a, j) { if (j === 0) v.y += 0.13 * tri(a, 12) * jag(a + 1); }, Math.PI - 1.45, 2.9);
    mesh(paint(tails, 0x2a2430, 0x3c3a4a), toon(0xffffff, { vertexColors: true })).add(new THREE.Mesh(tails, toon(0x1c181e, { side: THREE.BackSide })));
    // (her bodice: fitted, with two rows of buttons)
    var bod = lathe([[0.122, 0.6, 0.8], [0.108, 0.64, 0.78], [0.112, 0.7, 0.8], [0.118, 0.75, 0.82], [0.098, 0.8, 0.8], [0.05, 0.84, 0.9]], 48);
    mesh(paint(bod, 0x302b29, 0x4c4642), toon(0xffffff, { vertexColors: true }));
    for (var b = 0; b < 8; b++) { var bx = (b % 2 ? 1 : -1) * 0.018, by = 0.66 + Math.floor(b / 2) * 0.03, bt = new THREE.SphereGeometry(0.0085, 8, 6); bt.translate(bx, by, 0.1 + (by > 0.74 ? -0.004 : 0)); mesh(bt, toon(0x1a1414), chibi, true); }
    // ---- her arms: bell sleeves, little hands; a broom in her left ----
    function sleeveGeo() { return paint(lathe([[0.118, -0.285], [0.088, -0.215], [0.056, -0.11], [0.045, 0]], 32, function (v, a, j) { if (j === 0) v.y -= 0.055 * (1 - tri(a, 6)) * jag(a); var f = 1 + 0.06 * Math.sin(a * 5) * (j < 2 ? 1 : 0); v.x *= f; v.z *= f; }), 0x302b29, 0x4c4642); }   // (full bell sleeves with tattered points)
    var mSleeve = toon(0xffffff, { vertexColors: true });
    function arm(s) { var g = new THREE.Group(); g.position.set(s * 0.14, 0.77, 0); chibi.add(g); var sg = sleeveGeo(); mesh(sg, mSleeve, g); g.add(new THREE.Mesh(sg, mPurple)); var h = new THREE.SphereGeometry(0.04, 14, 10); h.translate(0, -0.29, 0.005); mesh(h, mSkin, g); g.rotation.z = s * 0.18; return g; }
    var armL = arm(1), armR = arm(-1);
    var broom = new THREE.Group(); broom.position.set(0, -0.29, 0.01); broom.rotation.set(0.55, 0, -0.3); armL.add(broom);
    var stick = new THREE.CylinderGeometry(0.011, 0.013, 0.6, 8); stick.translate(0, -0.28, 0); mesh(stick, toon(0x8a5a34), broom);   // (ending in her hand)
    var bristle = lathe([[0.075, -0.78], [0.06, -0.68], [0.03, -0.6], [0.02, -0.56]], 18, function (v, a, j) { if (j === 0) v.y += 0.02 * Math.abs(Math.sin(a * 11)); }); mesh(bristle, toon(0xc28a4c, { side: THREE.DoubleSide }), broom);
    [-0.6, -0.64].forEach(function (y) { var t = new THREE.TorusGeometry(0.03 + (y + 0.6) * -0.6, 0.006, 6, 14); t.rotateX(Math.PI / 2); t.translate(0, y, 0); mesh(t, toon(0x6a4024), broom, true); });
    // (the broom she rides: lying level beneath her as she sits astride it, handle forward, bristles streaming out behind)
    var rideBroom = new THREE.Group(); rideBroom.position.set(0, 0.37, 0); rideBroom.visible = false; chibi.add(rideBroom);
    var rStick = new THREE.CylinderGeometry(0.014, 0.016, 1.05, 10); rStick.rotateX(Math.PI / 2); rStick.translate(0, 0, 0.12); mesh(rStick, toon(0x8a5a34), rideBroom);
    var rBristle = lathe([[0.11, -0.42], [0.09, -0.3], [0.045, -0.16], [0.028, -0.1]], 20, function (v, a, j) { if (j === 0) v.y += 0.03 * Math.abs(Math.sin(a * 11)); }); rBristle.rotateX(-Math.PI / 2); rBristle.translate(0, 0, -0.32);
    mesh(rBristle, toon(0xc28a4c, { side: THREE.DoubleSide }), rideBroom);
    [-0.42, -0.47].forEach(function (z, k) { var t = new THREE.TorusGeometry(0.03 + k * 0.008, 0.007, 6, 14); t.translate(0, 0, z); mesh(t, toon(0x6a4024), rideBroom, true); });
    // (her right arm, the one that holds your tools, is the game's tool arm, dressed to match)
    axeArm.position.set(-0.14, 0.77, 0.02);
    axeArm.children[0].geometry = sleeveGeo(); axeArm.children[0].material = mSleeve; axeArm.children[0].position.set(0, 0, 0); axeArm.children[0].add(new THREE.Mesh(axeArm.children[0].geometry, OUT)); axeArm.children[0].add(new THREE.Mesh(axeArm.children[0].geometry, mPurple));
    axeArm.children[1].material = mSkin; axeArm.children[1].position.set(0, -0.3, 0.005); axeArm.children[1].scale.setScalar(0.55);

    // ---- her head: a big round face, painted like an anime character ----
    var head = new THREE.Group(); head.position.set(0, 1.06, 0); chibi.add(head);   // (held a little higher, so a short neck shows beneath her chin)
    mesh(new THREE.CylinderGeometry(0.028, 0.033, 0.11, 16).translate(0, -0.2, -0.01), mSkin, head, true);   // (her neck: small and slender)
    function face(closed, beam) {                                       // (beam: eyes closed and a big open-mouthed smile, for the title screen)
      return canvas(2048, 1024, function (g) {
        g.fillStyle = '#f2d1b0'; g.fillRect(0, 0, 2048, 1024);            // (warm, peachy skin)
        function X(l) { return 512 + l * 2048 / 360; } function Y(p) { return 512 - p * 1024 / 180; }
        var sh = g.createLinearGradient(0, Y(6), 0, Y(-6)); sh.addColorStop(0, 'rgba(150,90,70,0.35)'); sh.addColorStop(1, 'rgba(150,90,70,0)'); g.fillStyle = sh; g.fillRect(0, Y(6), 2048, Y(-6) - Y(6));   // (soft shade beneath her bangs)
        [-1, 1].forEach(function (s) {
          var bx = X(s * 33), by = Y(-33), bl = g.createRadialGradient(bx, by, 4, bx, by, 84);   // (big, soft salmon blush low on her cheeks)
          bl.addColorStop(0, 'rgba(246,124,124,0.65)'); bl.addColorStop(0.55, 'rgba(246,136,136,0.32)'); bl.addColorStop(1, 'rgba(246,136,136,0)');
          g.fillStyle = bl; g.beginPath(); g.ellipse(bx, by, 88, 58, 0, 0, Math.PI * 2); g.fill();
          g.strokeStyle = 'rgba(226,96,100,0.55)'; g.lineWidth = 3; g.lineCap = 'round'; for (var bk = 0; bk < 3; bk++) { var lx = bx - 22 + bk * 20; g.beginPath(); g.moveTo(lx + 8, by - 10); g.lineTo(lx - 2, by + 10); g.stroke(); }   // (with little blush lines)
          var cx = X(s * 21.5), cy = Y(-17), rx = 74, ry = 84, tilt = 0;   // (big, round eyes, a little taller than wide)
          var br = g.createLinearGradient(cx - 40, 0, cx + 40, 0); br.addColorStop(0, 'rgba(120,72,50,0)'); br.addColorStop(0.5, 'rgba(120,72,50,0.85)'); br.addColorStop(1, 'rgba(120,72,50,0)');   // (small, soft, gently raised brows)
          g.strokeStyle = br; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - 38, cy - ry - 30 + s * 4); g.quadraticCurveTo(cx + s * 4, cy - ry - 44, cx + 38, cy - ry - 30 - s * 4); g.stroke();
          if (closed) {                                                    // (happily closed, with a little flick of lashes)
            g.strokeStyle = '#2e1814'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - 62, cy + 6); g.quadraticCurveTo(cx, cy - 34, cx + 62, cy + 6); g.stroke();
            g.lineWidth = 4; [0, 1].forEach(function (k) { g.beginPath(); g.moveTo(cx + s * (56 - k * 12), cy - 2 - k * 8); g.lineTo(cx + s * (72 - k * 8), cy - 14 - k * 10); g.stroke(); });
            return;
          }
          g.save(); g.translate(cx, cy); g.rotate(tilt);
          function eyeShape() { g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); }
          g.save(); eyeShape(); g.clip();
          function rr(n) { var v = Math.sin(n * 91.7 + s * 13.1) * 43758.5453; return v - Math.floor(v); }
          function blob(g, x, y, r, col, a) { var bg = g.createRadialGradient(x, y, 0, x, y, r); bg.addColorStop(0, 'rgba(' + col + ',' + a + ')'); bg.addColorStop(0.5, 'rgba(' + col + ',' + (a * 0.55) + ')'); bg.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = bg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
          function layer(paint) { var W = Math.ceil(Math.max(rx, ry) * 2 + 40), c = document.createElement('canvas'); c.width = c.height = W; var cg = c.getContext('2d'); cg.translate(W / 2, W / 2); paint(cg); return c; }
          function soften(c, f) {                                          // (laid down softly, like blended paint: shrunk down and smoothly grown back)
            var W = c.width, cur = c; while (cur.width > W / f) { var nx = document.createElement('canvas'); nx.width = nx.height = Math.max(2, Math.round(cur.width / 2)); var nc = nx.getContext('2d'); nc.imageSmoothingQuality = 'high'; nc.drawImage(cur, 0, 0, nx.width, nx.height); cur = nx; }
            g.imageSmoothingQuality = 'high'; g.drawImage(cur, -W / 2, -W / 2, W, W);
          }
          var IR = rx, IY = ry;                                            // (the iris: big, filling her whole eye)
          g.save(); g.beginPath(); g.ellipse(0, 0, IR, IY, 0, 0, Math.PI * 2); g.clip();
          soften(layer(function (g) {
            // (luminous yellow-green, deepening upward, palest and brightest low down, gently mottled...)
            var gl = g.createLinearGradient(0, -ry, 0, ry); gl.addColorStop(0, '#5e8a2c'); gl.addColorStop(0.45, '#9ccc46'); gl.addColorStop(0.75, '#cdec78'); gl.addColorStop(1, '#ecfab8'); g.fillStyle = gl; g.fillRect(-rx * 1.3, -ry * 1.3, rx * 2.6, ry * 2.6);
            blob(g, 0, ry * 0.55, rx * 0.7, '244,252,210', 0.6);
            for (var m = 0; m < 30; m++) { var mx = (rr(m) - 0.5) * 1.6 * rx, my = (rr(m + 50) * 0.9) * ry, lt = rr(m + 7) > 0.5; blob(g, mx, my, rx * (0.07 + rr(m + 99) * 0.1), lt ? '248,254,214' : '120,166,56', lt ? 0.35 : 0.25); }
            // (...under a deep charcoal shadow that fills the top and dips down in the middle like a bowl, melting through
            // olive and green into the glow, which rises higher on the right)
            var dx = -rx * 0.2, dy = -ry * 0.5, dr = ry * 1.0, dk = g.createRadialGradient(dx, dy, 0, dx, dy, dr);
            dk.addColorStop(0, 'rgba(24,24,22,1)'); dk.addColorStop(0.45, 'rgba(32,34,28,1)'); dk.addColorStop(0.62, 'rgba(42,56,32,0.92)'); dk.addColorStop(0.78, 'rgba(66,98,38,0.6)'); dk.addColorStop(0.9, 'rgba(96,140,50,0.25)'); dk.addColorStop(1, 'rgba(120,160,60,0)');
            g.fillStyle = dk; g.fillRect(-rx * 1.3, -ry * 1.3, rx * 2.6, ry * 2.6);
            g.save(); g.translate(0, -ry * 0.02); g.scale(0.62, 1); var pu = g.createRadialGradient(0, 0, 0, 0, 0, ry * 0.42); pu.addColorStop(0, 'rgba(10,14,8,0.95)'); pu.addColorStop(0.6, 'rgba(14,20,10,0.8)'); pu.addColorStop(1, 'rgba(20,30,14,0)'); g.fillStyle = pu; g.beginPath(); g.arc(0, 0, ry * 0.42, 0, Math.PI * 2); g.fill(); g.restore();   // (a soft, dark pupil)
            var vg = g.createRadialGradient(0, 0, IR * 0.7, 0, 0, IY * 1.02); vg.addColorStop(0, 'rgba(24,36,18,0)'); vg.addColorStop(1, 'rgba(24,36,18,0.75)'); g.fillStyle = vg; g.fillRect(-rx * 1.3, -ry * 1.3, rx * 2.6, ry * 2.6);   // (a deeper ring round its edge)
          }), 4);
          // (fine, glinting fibres fanning out through the glow, and tiny flecks of light)
          g.lineCap = 'round'; for (var f = 0; f < 22; f++) { var fa = Math.PI * (0.12 + f / 21 * 0.76) + (rr(f + 400) - 0.5) * 0.06, f0 = IR * 0.42, f1 = IR * (0.78 + rr(f + 420) * 0.15); g.strokeStyle = 'rgba(246,255,210,' + (0.1 + rr(f + 440) * 0.12) + ')'; g.lineWidth = 1.2 + rr(f + 460) * 1.2; g.beginPath(); g.moveTo(Math.cos(fa) * f0, Math.sin(fa) * f0 * 1.1); g.lineTo(Math.cos(fa) * f1, Math.sin(fa) * f1 * 1.1); g.stroke(); }
          for (var fk = 0; fk < 10; fk++) { var ka = Math.PI * (0.15 + rr(fk + 500) * 0.7), kd = IR * (0.45 + rr(fk + 520) * 0.4); g.fillStyle = 'rgba(255,255,236,' + (0.35 + rr(fk + 540) * 0.4) + ')'; g.beginPath(); g.arc(Math.cos(ka) * kd, Math.sin(ka) * kd, 1.2 + rr(fk + 560) * 1.6, 0, Math.PI * 2); g.fill(); }
          g.restore();
          var lid = g.createLinearGradient(0, -ry, 0, -ry * 0.35); lid.addColorStop(0, 'rgba(40,22,18,0.55)'); lid.addColorStop(1, 'rgba(40,22,18,0)'); g.fillStyle = lid; g.fillRect(-rx, -ry, rx * 2, ry * 0.65);   // (a soft shadow cast by her upper lid)
          // (big, shining highlights: a large soft one up high, a little round one low on the other side, and a tiny twinkle)
          function shine(x, y, w, h, rot, a) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(1, h / w); var sg = g.createRadialGradient(0, 0, 0, 0, 0, w); sg.addColorStop(0, 'rgba(255,255,255,' + a + ')'); sg.addColorStop(0.72, 'rgba(255,255,255,' + a + ')'); sg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sg; g.beginPath(); g.arc(0, 0, w, 0, Math.PI * 2); g.fill(); g.restore(); }
          shine(rx * 0.3, -ry * 0.36, rx * 0.25, ry * 0.19, -0.5, 0.95);
          shine(-rx * 0.34, ry * 0.4, rx * 0.1, rx * 0.1, 0, 0.85);
          shine(-rx * 0.06, -ry * 0.5, 4, 4, 0, 0.8);
          g.restore();
          // (her lashes: a tapered upper lash line, thin at the inner corner and thick towards the outer, sweeping out into a
          // little wing with three curling lashes; a fine, soft line beneath; and a thin crease above)
          g.fillStyle = '#2a1612'; g.beginPath(); var LN = 40, A0 = 1.04 * Math.PI, A1 = 1.98 * Math.PI, P = [];
          for (var li = 0; li <= LN; li++) { var la = A0 + (A1 - A0) * li / LN, fo = s > 0 ? li / LN : 1 - li / LN, t = 2 + 10 * Math.pow(fo, 0.9); P.push([Math.cos(la) * (rx + t), Math.sin(la) * (ry + t)]); g[li ? 'lineTo' : 'moveTo'](Math.cos(la) * (rx - 1.5), Math.sin(la) * (ry - 1.5)); }
          for (var lj = LN; lj >= 0; lj--) { if ((s > 0 && lj === LN) || (s < 0 && lj === 0)) g.lineTo(s * (rx + 20), -ry * 0.02); g.lineTo(P[lj][0], P[lj][1]); }
          g.closePath(); g.fill();
          g.strokeStyle = '#2a1612'; g.lineCap = 'round'; [[1.9, 22, 4], [1.78, 20, 3.5], [1.66, 15, 3]].forEach(function (L) { var la = s > 0 ? L[0] * Math.PI : (3 - L[0]) * Math.PI, px = Math.cos(la) * (rx + 6), py = Math.sin(la) * (ry + 6), dx = Math.cos(la - s * 0.35), dy = Math.sin(la - s * 0.35); g.lineWidth = L[2]; g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + dx * L[1] * 0.6, py + dy * L[1] * 0.6, px + dx * L[1] + s * 4, py + dy * L[1] - 2); g.stroke(); });
          g.strokeStyle = 'rgba(70,36,28,0.55)'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0.12 * Math.PI, 0.88 * Math.PI); g.stroke();
          g.strokeStyle = 'rgba(70,36,28,0.7)'; g.lineWidth = 2.5; [0, 1].forEach(function (k) { var la = s > 0 ? (0.08 + k * 0.08) * Math.PI : (0.92 - k * 0.08) * Math.PI, px = Math.cos(la) * rx, py = Math.sin(la) * ry; g.beginPath(); g.moveTo(px, py); g.lineTo(px + s * 6, py + 9); g.stroke(); });
          g.strokeStyle = 'rgba(120,70,54,0.55)'; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 6, rx * 1.1, ry * 1.16, 0, 1.28 * Math.PI, 1.72 * Math.PI); g.stroke();
          g.restore();
          [[-14, -8, 5], [10, -14, 3.5], [22, 2, 2.5]].forEach(function (d) { g.fillStyle = 'rgba(255,250,246,0.85)'; g.beginPath(); g.arc(bx + d[0], by + d[1], d[2], 0, Math.PI * 2); g.fill(); });   // (a few little sparkles of shine on her blush)
        });
        var nz = g.createRadialGradient(X(0.6), Y(-26), 1, X(0.6), Y(-26), 11); nz.addColorStop(0, 'rgba(200,128,104,0.7)'); nz.addColorStop(1, 'rgba(200,128,104,0)'); g.fillStyle = nz; g.beginPath(); g.ellipse(X(0.6), Y(-26), 12, 9, 0, 0, Math.PI * 2); g.fill();   // (a small, soft nose...)
        g.fillStyle = 'rgba(255,238,224,0.7)'; g.beginPath(); g.ellipse(X(-0.4), Y(-25.2), 4, 3, 0, 0, Math.PI * 2); g.fill();   // (...catching the light)
        g.strokeStyle = '#6a3a2a'; g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round';   // (a tiny, sweet cat smile)
        if (beam) {                                                      // (a big, happy open-mouthed smile, with a little pink tongue)
          g.beginPath(); g.moveTo(X(-6.4), Y(-31.6)); g.quadraticCurveTo(X(0), Y(-33.2), X(6.4), Y(-31.6)); g.bezierCurveTo(X(6), Y(-38.5), X(-6), Y(-38.5), X(-6.4), Y(-31.6)); g.closePath();
          g.fillStyle = '#7a2e34'; g.fill();
          g.save(); g.clip(); g.fillStyle = '#f08a96'; g.beginPath(); g.ellipse(X(0.4), Y(-37.4), X(3.6) - X(0), Y(0) - Y(2.2), 0, 0, Math.PI * 2); g.fill(); g.restore();
          g.lineWidth = 4; g.stroke();
          g.lineWidth = 3; [-1, 1].forEach(function (sd) { g.beginPath(); g.moveTo(X(sd * 6.4), Y(-31.6)); g.quadraticCurveTo(X(sd * 7.4), Y(-31.2), X(sd * 7.8), Y(-30.4)); g.stroke(); });   // (little dimples at the corners)
        } else { g.beginPath(); g.moveTo(X(-4.2), Y(-33)); g.quadraticCurveTo(X(-2.1), Y(-36), X(0), Y(-33.6)); g.quadraticCurveTo(X(2.1), Y(-36), X(4.2), Y(-33)); g.stroke(); }
      });
    }
    var faceOpen = face(false), faceShut = face(true), faceBeam = face(true, true), mFace = toon(0xffffff, { map: faceOpen, emissive: 0xffffff, emissiveMap: faceOpen, emissiveIntensity: 0.16 });   // (softly, evenly lit, like a drawing)
    mFace.gradientMap = new THREE.DataTexture(new Uint8Array([178, 178, 178, 255, 218, 218, 218, 255, 245, 245, 245, 255]), 3, 1, THREE.RGBAFormat); mFace.gradientMap.needsUpdate = true;
    function squarish(geo, amt) {                                      // (very slightly square: flatter sides, top and front, with soft, rounded corners)
      var ps = geo.attributes.position;
      for (var i = 0; i < ps.count; i++) { var x = ps.getX(i), y = ps.getY(i), z = ps.getZ(i), r = Math.hypot(x, y, z); if (r < 1e-6) continue;
        var ax = Math.abs(x / r), ay = Math.abs(y / r), az = Math.abs(z / r), p = 4, k = Math.pow(Math.pow(ax, p) + Math.pow(ay, p) + Math.pow(az, p), -1 / p), f = 1 + (k - 1) * amt;
        ps.setXYZ(i, x * f, y * f, z * f); }
      return geo;
    }
    var hg = squarish(new THREE.SphereGeometry(0.22, 48, 36), 0.9); hg.scale(1, 0.94, 0.95);
    var hp = hg.attributes.position; for (var q = 0; q < hp.count; q++) {   // (her face: round, full cheeks, narrowing gently below them to a small, soft, rounded chin)
      var x = hp.getX(q), y = hp.getY(q), z = hp.getZ(q), sy = Math.max(0, -y / 0.207), front = Math.max(0, z / 0.209);
      var cheek = 1 + 0.07 * Math.sin(Math.min(1, sy / 0.55) * Math.PI) * Math.pow(front, 3);   // (only at the front, so her face stays inside her hair at the sides)   // (fullest across her cheeks)
      var jaw = 1 - 0.2 * Math.pow(Math.max(0, (sy - 0.45) / 0.55), 1.8);   // (a broader jaw, squaring off her face)               // (her jaw tapering in towards her chin)
      x *= cheek * jaw; z *= 1 - 0.14 * Math.pow(Math.max(0, (sy - 0.4) / 0.6), 1.5) * (1 - front * 0.6);
      if (sy > 0.6) y -= 0.012 * (sy - 0.6) / 0.4 * front;                            // (her chin just a touch lower and rounder at the front)
      hp.setXYZ(q, x, y, z); }
    hg.computeVertexNormals(); mesh(hg, mFace, head);
    // (her ears are always hidden under her hair, so none are drawn)
    // (her hair: warm brown with a soft shine, soft pointed bangs sweeping over her forehead, long smooth locks flowing
    // down her back and flaring at their tips, and two long locks framing her face)
    // (every part of her hair is painted the same way, with strands of the same size and the same warm browns, so where
    // one part meets another there is no change in texture to show as a seam; pxPerM is how many pixels of the picture
    // cover a metre of her hair, so the strands come out the same size whatever they're painted on)
    var LT = ['#4a2e1e', '#5a3a26', '#6a4430', '#7a5038', '#8a5e42', '#9c6e4e', '#b0825e'];
    function hairStrands(g, w, h, pxPerM) {
      var k = pxPerM / 5120; g.fillStyle = '#6a4430'; g.fillRect(0, 0, w, h);
      for (var n = 0, N = Math.round(w * 1.76); n < N; n++) { var x = Math.random() * w, sw = 3 * k; g.strokeStyle = LT[Math.floor(Math.random() * LT.length)]; g.globalAlpha = 0.25 + Math.random() * 0.5; g.lineWidth = Math.max(0.5, (0.6 + Math.random() * 1.4) * k);
        [-w, 0, w].forEach(function (o) { g.beginPath(); g.moveTo(x + o, 0); g.bezierCurveTo(x + o + sw, h * 0.35, x + o - sw, h * 0.65, x + o, h); g.stroke(); }); }
      g.globalAlpha = 1;
    }
    // (keeping her hair clear of her dress: any part that would pass inside her skirt, its tails, her petticoat or her
    // body is moved out just past it, and any part that would pass through a sleeve is moved behind it, far enough
    // that her arms can swing as she walks without going through her hair; all in her head's own space, which sits
    // HY above her feet)
    var HY = 1.06;
    function profileR(P, y) { if (y <= P[0][1]) return P[0][0]; for (var i = 1; i < P.length; i++) if (y <= P[i][1]) { var a = P[i - 1], b = P[i], t = (y - a[1]) / (b[1] - a[1]); return a[0] + (b[0] - a[0]) * t; } return P[P.length - 1][0]; }
    var DRESS = [[0.33, 0.27], [0.325, 0.37], [0.3, 0.4], [0.25, 0.44], [0.19, 0.53], [0.15, 0.6], [0.14, 0.7], [0.14, 0.8], [0.09, 0.86]];   // (her skirt, petticoat and body, with a little room to spare)
    var TAILS = [[0.43, 0.03], [0.38, 0.2], [0.3, 0.42], [0.21, 0.56], [0.16, 0.63]];   // (the long tails behind)
    function softMax(a, b, k) { var m = Math.max(a, b); return m + k * Math.log(Math.exp((a - m) / k) + Math.exp((b - m) / k)) - k * Math.LN2 * 0.5; }
    var SLEEVE = [[0.15, 0.485], [0.12, 0.555], [0.09, 0.66], [0.075, 0.77], [0.04, 0.82]];   // (each sleeve's radius down its length, with a little room to spare)
    function clearDress(geo) {                                          // (done smoothly, so her hair lies naturally over her shoulders and down her back)
      var ps = geo.attributes.position;
      for (var i = 0; i < ps.count; i++) {
        var x = ps.getX(i), y = ps.getY(i), z = ps.getZ(i), Y = y + HY;
        if (Y > 0.9) continue;
        var t = Math.min(1, Math.max(0, (0.9 - Y) / 0.2)); t = t * t * (3 - 2 * t);
        var r = Math.hypot(x, z), ph = Math.atan2(x, -z);               // (ph: 0 straight down her back, growing round to her sides)
        ph *= 1 - 0.08 * t;                                              // (below her shoulders, spreading out over them and round her back...)
        var rT = Math.max(0.24, 0.24 + (r - 0.26) * 0.8) + 0.03 * Math.min(1, Math.abs(Math.sin(ph))) * t;   // (...full and rounded, a little wider over her shoulders, the outer locks lying over the inner ones...)
        r += (rT - r) * t * 0.85;
        var need = profileR(DRESS, Y); if (Y < 0.63) need = Math.max(need, profileR(TAILS, Y) * Math.max(0, Math.cos(ph)));
        r = softMax(r, need, 0.02);                                      // (...then following her skirt and its tails as they flare out)
        x = Math.sin(ph) * r; z = -Math.cos(ph) * r;
        if (Y < 0.88) {                                                  // (keeping just clear of her sleeves)
          var Ys = Math.max(Y, 0.485), sx = x > 0 ? 1 : -1, cx = sx * (0.14 + (0.77 - Ys) * 0.18), rs = profileR(SLEEVE, Ys), dx = x - cx, dd = Math.hypot(dx, z);
          var rsw = rs + 0.035 * Math.max(0, 0.8 - Y) / 0.34;              // (with room for her arm to swing as she walks)
          var wy = Math.min(1, Math.max(0, (0.88 - Y) / 0.14)); wy = wy * wy * (3 - 2 * wy);   // (easing out once below her shoulder and then staying out, so the hair falls straight past her arm with no dent)
          if (dd < rsw + 0.08 && dd > 1e-6) { var k = 1 + (softMax(dd, rsw, 0.035) / dd - 1) * wy; x = cx + dx * k; z = z * k; }
        }
        ps.setXYZ(i, x, y, z);
      }
      ps.needsUpdate = true; return geo;
    }
    var hairTex = canvas(4096, 2048, function (g) {
      hairStrands(g, 4096, 2048, 4096 / (2 * Math.PI * 0.233));       // (the same strands as the rest of her hair...)
      g.scale(4, 4);                                                   // (...then her fringe cut out of it, drawn in finer detail so its edge stays smooth)
      function X(l) { return 256 + l * 1024 / 360; } function Y(p) { return 256 - p * 512 / 180; }
      // (the edge of her fringe isn't cut straight: it falls in small soft points of slightly different lengths)
      var TIPS = [[-35, 1.3], [-30.5, 0.7], [-26, 1.9], [-21, 1.0], [-16.5, 1.6], [-11.5, 0.8], [-6.5, 2.0], [-1.5, 1.1], [3.5, 1.7], [8.5, 0.8], [13, 1.4]];
      function tipDrop(x) { var d = 0; TIPS.forEach(function (t) { var k = 1 - Math.abs(x - t[0]) / 3.4; if (k > 0) d = Math.max(d, t[1] * Math.pow(k, 1.7)); }); return d; }
      function fringeCurve(x0, y0, s) { for (var k = 1; k <= 60; k++) { var t = k / 60, u = 1 - t, x = u * u * u * x0 + 3 * u * u * t * s[0] + 3 * u * t * t * s[2] + t * t * t * s[4], y = u * u * u * y0 + 3 * u * u * t * s[1] + 3 * u * t * t * s[3] + t * t * t * s[5]; g.lineTo(X(x), Y(y - tipDrop(x) * Math.min(1, Math.max(0, (17 - x) / 3)))); } }
      function fringe() {
        g.moveTo(X(-35), 512); g.lineTo(X(-35), Y(-90)); g.quadraticCurveTo(X(-35), Y(-40), X(-38), Y(-12));   // (the end of her fringe on this side carries straight on down into the hair at her side, like the other side)   // (open down the sides of her face, so the hair there falls free of her cheeks...)
        fringeCurve(-38, -12, [-30, -7, -14, -3.5, 2, -1.5]);              // (her fringe: one gentle curve, just covering the top of one eye, its edge in small soft points...)
        fringeCurve(2, -1.5, [11, -0.5, 16.5, 1, 18, 6]);                  // (...rounding up at its end...)
        g.bezierCurveTo(X(18.6), Y(10), X(19.5), Y(14), X(21.5), Y(15));   // (...into the gap)
        g.bezierCurveTo(X(24), Y(14), X(26), Y(10), X(28), Y(2));          // (the separate lock, starting at the gap...)
        g.bezierCurveTo(X(30), Y(-7), X(32), Y(-13), X(33), Y(-19));    // (...falling just past the corner of her eye...)
        g.quadraticCurveTo(X(34), Y(-40), X(34), Y(-90)); g.lineTo(X(34), 512); g.closePath();   // (...and on down, the same piece of hair as the hair at her side, so there is no end to show as a seam)
      }
      g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000';   // (its ends: soft, uneven points)
      for (var tx = 0; tx < 1024; tx += 9) { var tl = 0.8; g.beginPath(); g.moveTo(tx - 1, 513); g.quadraticCurveTo(tx + 3.5, Y(-90 + tl * 0.5), tx + 4.5, Y(-90 + tl)); g.quadraticCurveTo(tx + 5.5, Y(-90 + tl * 0.5), tx + 10, 513); g.closePath(); g.fill(); }
      g.beginPath(); fringe(); g.fill();   // (her face, open below her bangs)
    });
    var cap = squarish(new THREE.SphereGeometry(0.233, 48, 36), 0.9);   // (the same shape as her head, so her hair sits snugly over it)
    var cpos = cap.attributes.position;   // (her fringe standing out from her forehead, full and rounded, rather than lying flat)
    for (var cq = 0; cq < cpos.count; cq++) { var vx = cpos.getX(cq), vy = cpos.getY(cq), vz = cpos.getZ(cq), lat = Math.asin(Math.max(-1, Math.min(1, vy / 0.233))) * 180 / Math.PI, lon = Math.atan2(vx, vz) * 180 / Math.PI;
      var bf = Math.exp(-Math.pow((lat - 8) / 18, 2)) * Math.max(0, Math.cos(Math.min(1, Math.abs(lon) / 62) * Math.PI / 2)); if (lat < -6) bf *= Math.max(0, 1 - (-6 - lat) / 40) * 0.8 + 0.2 * (Math.abs(lon) > 36 ? 1 : 0);
      var kk = 1 + 0.07 * bf, nx = vx * kk, ny = vy * (1 + 0.02 * bf), nz = vz * kk;
      if (lat < -5) {                                                  // (below her temples, beside and behind her face, the same piece of hair falls on down past her cheeks to her shoulders, so it is all one, with no seams)
        var sf = lon > 0 ? Math.min(1, Math.max(0, (lon - 34) / 12)) : Math.min(1, Math.max(0, (-lon - 35) / 12));   // (on the side of her long lock, from just beyond it, so the lock falls straight on into it) sf = sf * sf * (3 - 2 * sf);
        var tt = Math.min(1, (-5 - lat) / 85), RR = Math.max(0.232, Math.hypot(nx, nz) + 0.004) * (1 + 0.2 * tt - 0.06 * tt * tt), lr = lon * Math.PI / 180;   // (keeping the same squared shape as her head where it starts, so her face never shows through)
        nx += (Math.sin(lr) * RR - nx) * sf; ny += (-0.0203 - tt * 0.8 - ny) * sf;   // (down to the same height as the rest of her hair) nz += (Math.cos(lr) * RR - nz) * sf;
      }
      cpos.setXYZ(cq, nx, ny, nz); }
    cap.scale(1, 0.95, 0.97); cap.translate(0, 0.004, -0.004); clearDress(cap); cap.computeVertexNormals(); var capM = mesh(paint(cap, 0xe4dcd6, 0xffffff), toon(0xffffff, { map: hairTex, alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true }), head, true);
    var SOFT = new THREE.DataTexture(new Uint8Array([150, 150, 150, 255, 185, 185, 185, 255, 215, 215, 215, 255, 240, 240, 240, 255, 255, 255, 255, 255]), 5, 1, THREE.RGBAFormat); SOFT.needsUpdate = true;   // (softer, more natural shading for her hair)
    function hairMat(o) { var m = toon(0xffffff, o); m.gradientMap = SOFT; if (o.map) { m.emissive = new THREE.Color(0xffffff); m.emissiveMap = o.map; m.emissiveIntensity = 0.42; } return m; }   // (a soft glow of its own, so its shaded side stays a rich brown)
    capM.material.gradientMap = SOFT; capM.material.emissive = new THREE.Color(0xffffff); capM.material.emissiveMap = hairTex; capM.material.emissiveIntensity = 0.34;
    var TONES = ['#3a2216', '#4a2c1c', '#5a3826', '#6a4430', '#7e5438', '#966646', '#b07c58'];
    var strandTex = canvas(512, 256, function (g, w, h) {                // (fine natural strands, in slightly varied browns)
      g.fillStyle = '#5a3a28'; g.fillRect(0, 0, w, h);
      for (var k = 0; k < 520; k++) { var x = Math.random() * w; g.strokeStyle = TONES[Math.floor(Math.random() * TONES.length)]; g.globalAlpha = 0.35 + Math.random() * 0.45; g.lineWidth = 0.8 + Math.random() * 1.8; [-w, 0, w].forEach(function (o) { g.beginPath(); g.moveTo(x + o, 0); g.bezierCurveTo(x + o + 5, h * 0.3, x + o - 5, h * 0.7, x + o + 2, h); g.stroke(); }); }   // (drawn wrapping round, so it repeats without a seam)
      g.globalAlpha = 1;
    });
    strandTex.wrapS = THREE.RepeatWrapping; strandTex.repeat.set(2, 1);
    // (a lock of hair as a soft strip of many fine strands, thinning into wispy, uneven ends)
    var lockTex = canvas(256, 1024, function (g, w, h) {
      g.clearRect(0, 0, w, h);
      var body = g.createLinearGradient(0, 0, 0, h); body.addColorStop(0, 'rgba(88,58,40,1)'); body.addColorStop(0.62, 'rgba(88,58,40,1)'); body.addColorStop(0.72, 'rgba(88,58,40,0)');
      g.fillStyle = body; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h * 0.5); g.quadraticCurveTo(w - 20, h * 0.66, w / 2, h * 0.78); g.quadraticCurveTo(20, h * 0.66, 0, h * 0.5); g.closePath(); g.fill();
      for (var k = 0; k < 260; k++) {
        var x0 = Math.random() * w, edge = 1 - Math.abs(x0 - w / 2) / (w / 2), end = h * (0.55 + Math.random() * 0.25 + edge * 0.18), xe = w / 2 + (x0 - w / 2) * (0.25 + Math.random() * 0.3);
        var gr = g.createLinearGradient(0, end * 0.7, 0, end); gr.addColorStop(0, TONES[k % TONES.length]); gr.addColorStop(1, 'rgba(60,36,22,0)');
        g.strokeStyle = gr; g.lineWidth = 1.2 + Math.random() * 2.2; g.beginPath(); g.moveTo(x0, 0); g.bezierCurveTo(x0 + (Math.random() - 0.5) * 16, end * 0.4, xe + (Math.random() - 0.5) * 20, end * 0.8, xe + (Math.random() - 0.5) * 10, end); g.stroke();
      }
    });
    var mStrands = hairMat({ map: lockTex, alphaTest: 0.35, side: THREE.FrontSide, vertexColors: true });
    function card(pts, w0, w1, side) {                                  // (a flat strip along a curve, for a lock of strands)
      var curve = new THREE.CatmullRomCurve3(pts), N = 24, pos = [], uv = [], idx = [], c = new THREE.Vector3(), T = new THREE.Vector3(), S = new THREE.Vector3();
      for (var i = 0; i <= N; i++) { var t = i / N, w = w0 + (w1 - w0) * t; curve.getPointAt(t, c); curve.getTangentAt(t, T); S.copy(side).addScaledVector(T, -side.dot(T)).normalize();
        pos.push(c.x - S.x * w, c.y - S.y * w, c.z - S.z * w, c.x + S.x * w, c.y + S.y * w, c.z + S.z * w); uv.push(0, 1 - t, 1, 1 - t); }
      for (i = 0; i < N; i++) { var a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
      var nr = g.attributes.normal, ps = g.attributes.position, rn = new THREE.Vector3();   // (shaded by the rounded shape of her hair, so neighbouring locks match each other)
      for (i = 0; i < nr.count; i++) { rn.set(ps.getX(i), 0.35, ps.getZ(i)).normalize(); nr.setXYZ(i, rn.x, rn.y, rn.z); }
      var both = idx.slice(); for (i = 0; i < idx.length; i += 3) both.push(idx[i], idx[i + 2], idx[i + 1]); g.setIndex(both);   // (faces on both sides, lit the same way, so it never turns dark seen from behind)
      return paint(g, 0xc8c8c8, 0xffffff);
    }
    var hairBack = new THREE.Group(); head.add(hairBack);
    // (a mass of hair beneath the locks, falling from her crown and filling the gaps between them; it ends well above
    // the locks do, so its ends stay hidden beneath them)
    var SP = [[0.255, -0.28], [0.25, -0.22], [0.238, -0.08], [0.225, 0.04], [0.195, 0.12], [0.14, 0.17]], SPF = [];   // (finely divided, so it bends smoothly as it drapes over her)
    for (var sq = 0; sq < SP.length - 1; sq++) for (var sf2 = 0; sf2 < 4; sf2++) { var f = sf2 / 4; SPF.push([SP[sq][0] + (SP[sq + 1][0] - SP[sq][0]) * f, SP[sq][1] + (SP[sq + 1][1] - SP[sq][1]) * f]); } SPF.push(SP[SP.length - 1]);
    var shell = lathe(SPF, 72, function (v, a, j) {
      if (Math.cos(a) < 0) { var b = 1 + 0.18 * -Math.cos(a) * Math.sin(Math.min(1, (0.2 - v.y) / 0.6) * Math.PI * 0.9); v.z *= b; }   // (fuller at the back, so she has volume from the side)
    }, Math.PI - 1.8, 3.6);
    clearDress(shell); shell.computeVertexNormals();
    var shn = shell.attributes.normal; for (var q0 = 0; q0 < shn.count; q0++) shn.setXYZ(q0, -shn.getX(q0), -shn.getY(q0), -shn.getZ(q0));   // (its surface faces outward)
    paint(shell, 0xe4dcd6, 0xffffff);                                     // (shaded just like the rest of her hair)
    // (all one piece, so there are no seams: fine strands drawn right round it, thinning into soft, uneven, wispy ends)
    var sh2 = canvas(1024, 1024, function (g, w, h) {
      hairStrands(g, w, h, w * 3 / (3.6 * 0.27));                      // (the same strands as the rest of her hair...)
      g.globalCompositeOperation = 'destination-out';                   // (...thinning into soft, uneven, wispy ends)
      for (var x = 0; x < w; ) { var tw = 3 + Math.random() * 9, clump = 0.5 + 0.5 * Math.sin(x / w * Math.PI * 2 * 9 + Math.sin(x / w * Math.PI * 2 * 4) * 1.5), end = h * (0.7 + clump * 0.2 + Math.random() * 0.08), dep = 30 + Math.random() * 60;   // (each little clump of ends a different width and length, tapering to a point)
        g.beginPath(); g.moveTo(x - 0.5, h + 1); g.lineTo(x - 0.5, end + dep); g.quadraticCurveTo(x + tw * 0.5, end - dep * 0.2, x + tw + 0.5, end + dep); g.lineTo(x + tw + 0.5, h + 1); g.closePath(); g.fill(); x += tw; }
      g.globalCompositeOperation = 'source-over';
    });
    sh2.wrapS = THREE.RepeatWrapping; sh2.repeat.set(3, 1);
    var si0 = Array.from(shell.index.array), si1 = si0.slice(); for (var q = 0; q < si0.length; q += 3) si1.push(si0[q], si0[q + 2], si0[q + 1]); shell.setIndex(si1);   // (its inside lit just like its outside, so it never shows dark beside her face)
    var mShell = hairMat({ map: sh2, alphaTest: 0.4, vertexColors: true, side: THREE.FrontSide }); mShell.emissiveIntensity = 0.34; mesh(shell, mShell, hairBack, true);   // (no outline: on thin hair it would show through as a dark band)
    // (her hair in soft, rounded locks rather than flat strips: each one a full clump of strands, a little flattened,
    // swelling gently, waving as it falls and tapering to a soft point, so her hair has real volume and an uneven,
    // flowing outline instead of a smooth bowl)
    var lockStrands = canvas(512, 512, function (g, w, h) {
      hairStrands(g, w, h, 512 / 0.2);                                  // (the same strands as the rest of her hair...)
      g.globalCompositeOperation = 'destination-out';                   // (...ending softly in fine, uneven wisps of strands rather than one blunt point)
      for (var x = 0; x < w; ) { var tw = 2 + Math.random() * 6, len = h * 0.025, y0 = h - len;
        var gr = g.createLinearGradient(0, y0, 0, h); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.35, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = gr;
        g.beginPath(); g.moveTo(x, h + 1); g.quadraticCurveTo(x + tw * 0.5, y0 - 4, x + tw, h + 1); g.closePath(); g.fill(); x += tw * (0.6 + Math.random() * 0.5); }
      g.globalCompositeOperation = 'source-over';
    });   // (the same strands as the rest of her hair: 512 pixels round a lock about 0.2 m round)
    var mLock = hairMat({ map: lockStrands, vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide }); mLock.emissiveIntensity = 0.34;
    function lock(pts, w, parent) {
      var curve = new THREE.CatmullRomCurve3(pts), N = 36, M = 12, pos = [], uv = [], idx = [], c = new THREE.Vector3(), T = new THREE.Vector3(), O = new THREE.Vector3(), S = new THREE.Vector3();
      for (var i = 0; i <= N; i++) {
        var t = i / N, k = (t < 0.12 ? 0.7 + t / 0.12 * 0.3 : 1) * (1 + 0.15 * Math.sin(Math.min(1, t / 0.6) * Math.PI)) * (t > 0.6 ? 1 - 0.55 * Math.pow((t - 0.6) / 0.4, 1.6) : 1);   // (swelling, then tapering to a point)
        var ww = Math.max(0.0015, w * k), th = Math.max(0.001, w * 0.45 * k);
        curve.getPointAt(t, c); curve.getTangentAt(t, T); O.set(c.x, 0, c.z); if (O.lengthSq() < 1e-6) O.set(0, 0, -1); O.normalize().addScaledVector(T, -O.dot(T)).normalize(); S.crossVectors(T, O).normalize();
        for (var j = 0; j <= M; j++) { var a = j / M * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a); pos.push(c.x + S.x * ca * ww + O.x * sa * th, c.y + S.y * ca * ww + O.y * sa * th, c.z + S.z * ca * ww + O.z * sa * th); uv.push(j / M, 1 - t); }
      }
      for (i = 0; i < N; i++) for (var j2 = 0; j2 < M; j2++) { var a0 = i * (M + 1) + j2, b0 = a0 + M + 1; idx.push(a0, b0, a0 + 1, a0 + 1, b0, b0 + 1); }
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); clearDress(g); g.computeVertexNormals();
      return mesh(paint(g, 0xe4dcd6, 0xffffff), mLock, parent || head, true);   // (no outline, so it stays soft)
    }
    function wave(n, k) { var v = Math.sin(n * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); }
    // (a full fall of locks round the back and sides of her head, from under her hat to the middle of her back,
    // each a little different in length and wave, some curling out at the tip and some in)
    for (var bl = 0; bl < 15; bl++) {
      var ph = -1.75 + bl / 14 * 3.5,   // (round the back, from behind one ear to behind the other, clear of her bangs)
           sx = Math.sin(ph), sz = -Math.cos(ph), back = Math.max(0, -sz), ln = 0.62,   // (all ending at exactly the same height)
           wv = (wave(bl, 2) - 0.5) * 0.06, a1 = (wave(bl, 3) - 0.5) * 0.045, cu = 0;
      function at(r, y, d) { return V(Math.sin(ph + d) * r, y, -Math.cos(ph + d) * r); }
      lock([at(0.08, 0.19, 0), at(0.17, 0.1, 0), at(0.238, -0.04, wv * 0.3),   // (rising from beneath the hair on her head, not sitting on top of it)
         at(0.27 + back * 0.02 + a1, -0.2, wv), at(0.285 + back * 0.03 - a1, -0.2 - ln * 0.42, -wv * 0.6), at(0.3 + back * 0.04 + a1 + cu, -0.2 - ln * 0.78, wv * 1.1), at(0.3 + back * 0.05 + cu * 2, -0.2 - ln, wv * 1.5 + cu)], 0.062 + back * 0.012, hairBack);   // (wide enough that neighbouring locks overlap, with no gaps between them)
    }

    // ---- her hat: huge, soft and floppy, with a thick rolled brim lined in purple, a crumpled crown that bends over
    // and curls at its tip, a raised striped band with a buckle, and a cluster of orange roses ----
    var hat = new THREE.Group(); hat.position.set(0, 0.125, -0.01); hat.rotation.set(-0.16, 0, 0.08); head.add(hat);
    function paint(g, base, lit, k) {                                    // (colour it, with a soft painted sheen where the light falls)
      var n = g.attributes.normal, col = [], c0 = new THREE.Color(base), c1 = new THREE.Color(lit), c = new THREE.Color(), v = new THREE.Vector3();
      for (var i = 0; i < n.count; i++) { v.fromBufferAttribute(n, i); var f = Math.pow(Math.max(0, v.dot(LIGHT)), 2) * (k ? k(i) : 1); c.copy(c0).lerp(c1, f); col.push(c.r, c.g, c.b); }
      g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); return g;
    }
    // (the brim: a thick, rounded ring, drooping and waving unevenly like soft felt)
    var BR = [[0.2, 0.012], [0.3, -0.004], [0.42, -0.04], [0.52, -0.09], [0.575, -0.118], [0.592, -0.132], [0.588, -0.148], [0.565, -0.15], [0.5, -0.118], [0.4, -0.07], [0.3, -0.035], [0.2, -0.016]];
    var brim = lathe(BR.slice().reverse(), 96, function (v, a) {
      var r = Math.hypot(v.x, v.z), k = Math.max(0, (r - 0.2) / 0.39);
      v.y += k * k * (0.07 * Math.sin(a * 3 + 0.5) - 0.06 * Math.cos(a) + 0.035 * Math.sin(a * 5 + 1.3)) + k * k * k * 0.05 * Math.max(0, Math.sin(a + 2.4));
    });
    var bcol = [], bn = brim.attributes.normal, bc = new THREE.Color(), bv = new THREE.Vector3();
    for (var bi = 0; bi < bn.count; bi++) { bv.fromBufferAttribute(bn, bi); var under = bv.y < -0.2, f = Math.pow(Math.max(0, bv.dot(LIGHT)), 2); bc.set(under ? 0x40305a : 0x26222c).lerp(new THREE.Color(under ? 0x5a4478 : 0x3a4a4c), f); bcol.push(bc.r, bc.g, bc.b); }   // (dark on top, purple beneath)
    brim.setAttribute('color', new THREE.Float32BufferAttribute(bcol, 3));
    mesh(brim, toon(0xffffff, { vertexColors: true }), hat);
    // (the crown: a soft cone that bends over to one side and curls down at its tip, crumpled into creases)
    var tip = new THREE.Group(); hat.add(tip);
    var spine = new THREE.CatmullRomCurve3([V(0, -0.01, 0), V(0, 0.16, -0.01), V(0.02, 0.31, -0.02), V(0.09, 0.43, -0.01), V(0.2, 0.49, 0.01), V(0.31, 0.46, 0.03), V(0.37, 0.39, 0.04), V(0.375, 0.33, 0.035)]);
    var RS = 40, TS = 70, crown = new THREE.TubeGeometry(spine, TS, 1, RS, false), cp = crown.attributes.position, cc = new THREE.Vector3();
    var RAD = [0.215, 0.19, 0.155, 0.118, 0.085, 0.06, 0.04, 0.024, 0.012, 0.003];
    for (var ci = 0; ci < cp.count; ci++) {
      var t = Math.floor(ci / (RS + 1)) / TS, ang = (ci % (RS + 1)) / RS * Math.PI * 2, f2 = t * (RAD.length - 1), j2 = Math.min(RAD.length - 2, Math.floor(f2)), r = RAD[j2] + (RAD[j2 + 1] - RAD[j2]) * (f2 - j2);
      r *= 1 + (0.07 * Math.sin(ang * 5 + t * 14) + 0.04 * Math.sin(ang * 3 - t * 9)) * Math.min(1, t * 2.5) * (1 - t * 0.6);   // (its creases)
      spine.getPointAt(t, cc); cp.setXYZ(ci, cc.x + (cp.getX(ci) - cc.x) * r, cc.y + (cp.getY(ci) - cc.y) * r, cc.z + (cp.getZ(ci) - cc.z) * r);
    }
    crown.computeVertexNormals(); paint(crown, 0x2a2530, 0x3c5a56);
    mesh(crown, toon(0xffffff, { vertexColors: true }), tip);
    // (a raised band of orange and dark stripes round its base)
    var bandTex = canvas(64, 256, function (g) { g.fillStyle = '#e09040'; g.fillRect(0, 0, 64, 256); g.fillStyle = '#3e2618'; g.fillRect(0, 0, 64, 18); g.fillRect(0, 108, 64, 40); g.fillRect(0, 238, 64, 18); g.fillStyle = 'rgba(255,220,160,0.35)'; g.fillRect(0, 40, 64, 10); g.fillRect(0, 170, 64, 10); });
    mesh(lathe([[0.222, 0.0], [0.226, 0.02], [0.22, 0.06], [0.208, 0.1], [0.198, 0.118]], 64), toon(0xffffff, { map: bandTex }), tip);
    // (a buckle on its side)
    var buckle = new THREE.Group(); buckle.position.set(0.17, 0.06, 0.15); buckle.rotation.y = 0.85; buckle.rotation.x = -0.06; tip.add(buckle);
    var mBuckle = toon(0x6a4a2a);
    [[0, 0.04, 0.07, 0.012], [0, -0.04, 0.07, 0.012], [0.03, 0, 0.012, 0.09], [-0.03, 0, 0.012, 0.09]].forEach(function (p) { var bx = new THREE.BoxGeometry(p[2], p[3], 0.012); bx.translate(p[0], p[1], 0.006); mesh(bx, mBuckle, buckle); });
    var prong = new THREE.BoxGeometry(0.008, 0.07, 0.008); prong.translate(0, 0, 0.012); mesh(prong, toon(0x8a6a40), buckle);
    // (a cluster of orange roses with dark leaves)
    var mPetal = toon(0xe8963e, { side: THREE.DoubleSide }), mPetal2 = toon(0xf4b264, { side: THREE.DoubleSide }), mLeaf = toon(0x2a2a24, { side: THREE.DoubleSide });
    function rose(px, py, pz, size, rot) {
      var g = new THREE.Group(); g.position.set(px, py, pz); g.lookAt(V(px * 3, py + 0.05, pz * 3)); g.rotateZ(rot); g.scale.setScalar(size); tip.add(g);
      for (var p = 0; p < 11; p++) {                                     // (petals, curling round in a spiral)
        var a = p * 2.4, rr = 0.004 + p * 0.0032, pg = new THREE.SphereGeometry(1, 10, 6, 0, Math.PI, 0, Math.PI); pg.scale(0.012 + p * 0.0012, 0.011 + p * 0.0009, 0.006);
        pg.rotateX(-0.5 - p * 0.05); pg.rotateZ(a); pg.translate(Math.cos(a) * rr, Math.sin(a) * rr, 0.012 - p * 0.0011); mesh(pg, p < 4 ? mPetal2 : mPetal, g, true);
      }
      [0.8, 2.9].forEach(function (a) { var lf = new THREE.SphereGeometry(1, 10, 6); lf.scale(0.026, 0.011, 0.003); lf.translate(0.032, 0, -0.004); lf.rotateZ(a); mesh(lf, mLeaf, g, true); });
    }
    rose(0.218, 0.055, 0.08, 1.7, 0.2); rose(0.232, 0.095, 0.0, 1.35, 1.2); rose(0.196, 0.02, 0.14, 1.2, 2.4);

    return { broom: broom, rideBroom: rideBroom, chibi: chibi, legs: legs, armL: armL, armR: armR, head: head, hairBack: hairBack, tip: tip, mFace: mFace, faces: [faceOpen, faceShut, faceBeam], phase: 0, blink: false };
  })();
  // (knees: each leg is split at the knee, the boot and everything on it hanging from a joint just above its cuff, so
  // the walk can bend it)
  wl.legs.forEach(function (leg) {
    var shin = new THREE.Group(); shin.position.y = -0.1; leg.userData.shin = shin;
    leg.children.slice(1).forEach(function (c) { shin.add(c); c.position.y += 0.1; });   // (all but the stocking, which stays with the thigh)
    leg.add(shin);
  });
  // ===== footsteps =====
  // A soft footstep each time a foot comes down as she walks, made on the fly like the game's other sounds and played
  // as a sound effect (so it follows SFX Volume, with Footsteps Volume on top). Each is built like a real footstep: a
  // soft thump of the heel, then the toe rolling down a moment later, and it sounds like what she's walking on: a
  // rustle of grass, a gritty scuff on the dirt path, a hollow knock that rings a little on wood (floors indoors, the
  // dock, the porch, the bridges), a crisp click with a tiny echo on the town's stone paths, and a crunch in Winter's
  // snow. The two feet sound a touch different
  var stepNoise = null, footVol = 1;                                  // (footVol: "Footsteps Volume" in Settings, 0 to 10 with 5 the usual, as 0 to 2)
  try { var fvSaved = parseInt(localStorage.getItem('everdawn-footsteps-volume'), 10); if (fvSaved >= 0 && fvSaved <= 10) footVol = fvSaved / 5; } catch (err) {}
  window.everdawnSetFootsteps = function (v) { footVol = v / 5; };
  function footSurface() {
    var x = player.position.x, z = player.position.z;
    if (indoors || onDock(x, z) || porchHeight(x, z) > 0 || onBridge(x, z) || onBridge2(x, z)) return 'wood';
    if (stonePathDist(x, z) < SP_W) return 'stone';
    if (winterNow()) return 'snow';
    return pathDist(x, z) < PATH_W ? 'dirt' : 'grass';
  }
  function footstep(foot) {
    if (!audioCtx || audioCtx.state !== 'running' || footVol <= 0) return;
    var ac = audioCtx;
    if (!stepNoise) {                                                  // (a second of noise to shape every step from, made once)
      stepNoise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      var d = stepNoise.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    var kind = footSurface(), t = ac.currentTime, tune = foot ? 1.04 : 0.96, G = 0.06, nk = Math.sqrt(ac.sampleRate / 44100);
    var out = ac.createGain(); out.gain.value = 0.32 * footVol; out.connect(ac.destination);
    function env(at, vol, atk, dec) { var g = ac.createGain(); g.gain.value = 0; g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(vol, at + atk); g.gain.exponentialRampToValueAtTime(0.0001, at + atk + dec); return g; }
    function hiss(at, type, hz, Q, vol, atk, dec) {                    // (a little burst of shaped noise)
      var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = env(at, vol * nk, atk, dec); s.buffer = stepNoise; f.type = type; f.frequency.value = hz; f.Q.value = Q;
      s.connect(f); f.connect(g); g.connect(out); s.start(at, Math.random() * 0.6); s.stop(at + atk + dec + 0.02);
    }
    function thump(at, hz, vol, dec) {                                 // (the soft, low thud of the foot landing)
      var o = ac.createOscillator(), g = env(at, vol, 0.003, dec); o.frequency.setValueAtTime(hz, at); o.frequency.exponentialRampToValueAtTime(hz * 0.6, at + dec);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + dec + 0.02);
    }
    function grains(at, len, n, hz, Q, vol) {                          // (lots of tiny ticks: blades of grass, grit, snow crystals)
      for (var i = 0; i < n; i++) { var u = Math.random(); hiss(at + Math.pow(u, 1.6) * len, 'bandpass', hz * (0.7 + Math.random() * 0.6), Q, vol * (0.4 + Math.random() * 0.6) * (1 - u * 0.6), 0.0008, 0.002 + Math.random() * 0.005); }
    }
    function ring(at, fs, vol, dec) {                                  // (the boards ringing a little)
      fs.forEach(function (f, k) { var o = ac.createOscillator(), g = env(at, vol / (k + 1), 0.002, dec / (1 + k * 0.5)); o.frequency.value = f; o.connect(g); g.connect(out); o.start(at); o.stop(at + dec + 0.02); });
    }
    if (kind === 'grass') { thump(t, 85 * tune, 0.22, 0.05); grains(t, 0.12, 16, 3600 * tune, 1.5, 0.05); hiss(t, 'bandpass', 2600 * tune, 0.8, 0.045, 0.01, 0.09); grains(t + G, 0.08, 9, 4200 * tune, 1.5, 0.035); }
    else if (kind === 'dirt') { thump(t, 80 * tune, 0.32, 0.06); hiss(t, 'lowpass', 900 * tune, 0.7, 0.12, 0.004, 0.06); grains(t + 0.005, 0.06, 9, 2300 * tune, 2, 0.045); hiss(t + G, 'lowpass', 1200 * tune, 0.7, 0.06, 0.004, 0.04); grains(t + G, 0.04, 4, 2600 * tune, 2, 0.03); }
    else if (kind === 'wood') { thump(t, 115 * tune, 0.36, 0.07); ring(t, [185 * tune, 420 * tune, 770 * tune], 0.06, 0.1); hiss(t, 'bandpass', 1300 * tune, 1.2, 0.08, 0.002, 0.035); ring(t + G, [205 * tune, 460 * tune], 0.03, 0.07); hiss(t + G, 'bandpass', 1600 * tune, 1.2, 0.04, 0.002, 0.025); }
    else if (kind === 'stone') [[0, 1], [0.028, 0.22]].forEach(function (e) {   // (the click, then its tiny echo)
      hiss(t + e[0], 'bandpass', 3200 * tune, 1.5, 0.15 * e[1], 0.001, 0.03); thump(t + e[0], 125 * tune, 0.18 * e[1], 0.03); hiss(t + G * 0.8 + e[0], 'bandpass', 4000 * tune, 1.5, 0.07 * e[1], 0.001, 0.02); });
    else { thump(t, 70 * tune, 0.18, 0.08); grains(t, 0.16, 42, 1900 * tune, 1.2, 0.07); hiss(t, 'lowpass', 2400 * tune, 0.7, 0.045, 0.01, 0.14); grains(t + G, 0.1, 18, 2300 * tune, 1.2, 0.05); }   // (snow)
  }
  // every frame: she walks with real steps and swinging arms, her hair and hat swaying, and blinks now and then
  function witchLook(dt, moving) {
    var t = state.time, w = wl;
    w.phase += dt * (moving ? 10 * SPEED / 4.4 : 0);                     // (quicker steps when you jog)
    var stepN = Math.floor((w.phase + Math.PI / 2) / Math.PI);         // (each time a foot reaches out in front and comes down: a footstep)
    if (moving && !flying && !inBoat && stepN !== w.lastStep) footstep(stepN % 2);
    w.lastStep = stepN;
    // (a real walk: each leg swings forward from the hip with its knee bending to lift the boot clear, reaches out and
    // plants, then straightens and pushes back under her as the other one swings through; her arms swing the opposite
    // way to her legs, and she rises a little as each leg passes beneath her, with a small twist and sway of her hips)
    var ease = 1 - Math.exp(-dt * 12), fwd = [0, 0];
    for (var k = 0; k < 2; k++) {
      var ph = w.phase + k * Math.PI, leg = w.legs[k], shin = leg.userData.shin;
      fwd[k] = moving ? Math.sin(ph) : 0;                              // (how far forward this leg is, -1 to 1)
      var hip = -fwd[k] * 0.55, knee = moving ? 0.08 + Math.max(0, Math.cos(ph)) * 0.9 : 0;   // (the knee bends as the leg swings forward)
      leg.rotation.x += (hip - leg.rotation.x) * (moving ? 1 : ease); shin.rotation.x += (knee - shin.rotation.x) * (moving ? 1 : ease);
    }
    w.armL.rotation.x = fwd[1] * 0.5; w.armR.rotation.x = fwd[0] * 0.5; w.armR.visible = !axeArm.visible;   // (her own right arm, unless she's holding a tool in it)
    w.chibi.position.y = moving ? Math.abs(Math.cos(w.phase)) * 0.022 : Math.sin(t * 2) * 0.004;
    w.chibi.rotation.set(moving ? 0.05 : w.chibi.rotation.x * (1 - ease), moving ? Math.sin(w.phase) * 0.07 : w.chibi.rotation.y * (1 - ease), moving ? Math.sin(w.phase) * 0.025 : w.chibi.rotation.z * (1 - ease));
    w.head.rotation.z = moving ? Math.sin(w.phase) * 0.04 : Math.sin(t * 0.8) * 0.03;
    w.hairBack.rotation.x = moving ? 0.12 + Math.sin(w.phase * 2) * 0.03 : Math.sin(t * 1.3) * 0.03;
    w.tip.rotation.z = Math.sin(t * 1.7) * 0.04 + (moving ? Math.sin(w.phase) * 0.05 : 0);
    w.broom.visible = false; w.rideBroom.visible = flying;              // (her broom only appears when she's flying on it, not carried at her side)
    if (flying) {                                                      // (on her broom: sitting astride it, knees bent, both hands on the handle in front of her, hair streaming back)
      w.legs[0].rotation.set(-1.1, 0, 0.18); w.legs[1].rotation.set(-1.1, 0, -0.18); w.legs[0].userData.shin.rotation.x = w.legs[1].userData.shin.rotation.x = 0;
      w.chibi.rotation.set(0, 0, 0);
      w.armL.rotation.x = -1.05; w.armR.rotation.x = -1.05; w.armR.visible = !axeArm.visible;
      w.chibi.position.y = Math.sin(t * 2.2) * 0.012;
      w.hairBack.rotation.x = 0.1 + Math.min(1, flySpeed) * 0.22 + Math.sin(t * 6) * 0.025;
      w.tip.rotation.z = Math.sin(t * 1.7) * 0.04 - Math.min(1, flySpeed) * 0.1;
    } else { w.legs[0].rotation.z = w.legs[1].rotation.z = 0; }
    var shut = (t * 0.23) % 1 < 0.025; if (shut !== w.blink) { w.blink = shut; w.mFace.map = w.mFace.emissiveMap = w.faces[shut ? 1 : 0]; w.mFace.needsUpdate = true; }
  }

  // ---------- Every frame ----------
  // ---------- Oak & Ember: the carpenter's workshop ----------
  // A cozy log workshop at the back of the town square, its door facing the bridge, with its own stone path. Round
  // its porch: a workbench, sawhorses, a log pile, a stack of planks, a chopping block, sawdust and a hanging sign; a
  // stone chimney puffs smoke from the stove inside. Go in with Interact; inside, a warm workshop full of tools.
  var CARP_X = -1.5, CARP_Z = 127, CARP_TURN = Math.PI + 0.05, CARP_HW = 4.5, CARP_HD = 3.5, CARP_WALL = 2.6;
  function carpFront(d) { return { x: CARP_X + Math.sin(CARP_TURN) * (CARP_HD + d), z: CARP_Z + Math.cos(CARP_TURN) * (CARP_HD + d) }; }
  function carpLocal(x, z) { var dx = x - CARP_X, dz = z - CARP_Z, c = Math.cos(CARP_TURN), si = Math.sin(CARP_TURN); return [dx * c - dz * si, dx * si + dz * c]; }
  function onCarpLot(x, z, m) { var l = carpLocal(x, z); return Math.abs(l[0]) < CARP_HW + 2.6 + m && l[1] > -CARP_HD - 1.2 - m && l[1] < CARP_HD + 3.2 + m; }
  var carpDoor = carpFront(0.12);
  var CRP_PTS = [[-0.15, 86.2], [-0.45, 94], [-0.75, 103], [-1.1, 112], [carpFront(2.05).x, carpFront(2.05).z]], crpLine = stoneCurve(CRP_PTS, 150), crpBox = lineBox(crpLine);
  function carpPathDist(x, z) { return lineDist(crpLine, crpBox, x, z); }

  // (painted textures: bark, the rings on cut log ends, planks, wooden shingles, and the sign)
  function cpTex(w, h, paint, rep) { var c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h); var t = new THREE.CanvasTexture(c); if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
  function cpWrap(w, h, f) { for (var ox = -w; ox <= w; ox += w) for (var oy = -h; oy <= h; oy += h) f(ox, oy); }
  var cpBarkTex = cpTex(256, 128, function (g, w, h) {
    g.fillStyle = '#7a5434'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 260; i++) { var x = Math.random() * w, y = Math.random() * h, l = 20 + Math.random() * 70, c = Math.random();
      g.strokeStyle = c < 0.45 ? 'rgba(52,32,18,' + (0.3 + Math.random() * 0.4) + ')' : c < 0.8 ? 'rgba(150,110,72,' + (0.25 + Math.random() * 0.3) + ')' : 'rgba(190,150,105,0.3)';
      g.lineWidth = 1 + Math.random() * 2.5; cpWrap(w, h, function (ox, oy) { g.beginPath(); g.moveTo(x + ox, y + oy); g.lineTo(x + ox + l, y + oy + (Math.random() - 0.5) * 3); g.stroke(); }); }
    for (var k = 0; k < 14; k++) { var kx = Math.random() * w, ky = Math.random() * h; g.fillStyle = 'rgba(60,36,20,0.6)'; g.beginPath(); g.ellipse(kx, ky, 5 + Math.random() * 5, 3, 0, 0, Math.PI * 2); g.fill(); }   // (knots)
  }, [2, 1]);
  var cpEndTex = cpTex(128, 128, function (g, w, h) {
    var gr = g.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, '#e6c48e'); gr.addColorStop(0.8, '#d2a46a'); gr.addColorStop(0.92, '#8a5a34'); gr.addColorStop(1, '#5a3a22');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (var r = 6; r < 56; r += 4 + Math.random() * 3) { g.strokeStyle = 'rgba(150,100,55,' + (0.35 + Math.random() * 0.3) + ')'; g.lineWidth = 1 + Math.random(); g.beginPath(); g.ellipse(64, 64, r, r * (0.95 + Math.random() * 0.08), 0, 0, Math.PI * 2); g.stroke(); }
    g.strokeStyle = 'rgba(90,55,30,0.5)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + 40, 64 + 18); g.stroke();   // (a little check crack)
  });
  var cpPlankTex = cpTex(256, 256, function (g, w, h) {
    var n = 6, ph = h / n;
    for (var i = 0; i < n; i++) { var base = 150 + Math.random() * 40; g.fillStyle = 'rgb(' + Math.round(base) + ',' + Math.round(base * 0.72) + ',' + Math.round(base * 0.45) + ')'; g.fillRect(0, i * ph, w, ph);
      for (var s = 0; s < 40; s++) { var y = i * ph + Math.random() * ph; g.strokeStyle = 'rgba(90,55,30,' + (0.1 + Math.random() * 0.2) + ')'; g.lineWidth = 0.8 + Math.random(); g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + (Math.random() - 0.5) * 6, w * 0.7, y + (Math.random() - 0.5) * 6, w, y); g.stroke(); }
      g.fillStyle = 'rgba(50,30,15,0.7)'; g.fillRect(0, i * ph, w, 2);   // (the gap between planks)
      var j = Math.random() * w; g.fillRect(j, i * ph, 2, ph);
      g.fillStyle = 'rgba(40,25,15,0.6)'; [j - 6, j + 6].forEach(function (nx) { g.beginPath(); g.arc(nx, i * ph + ph * 0.3, 1.6, 0, Math.PI * 2); g.arc(nx, i * ph + ph * 0.7, 1.6, 0, Math.PI * 2); g.fill(); });   // (nail heads)
    }
  }, [1, 1]);
  var cpShingleTex = cpTex(256, 256, function (g, w, h) {
    g.fillStyle = '#5e4632'; g.fillRect(0, 0, w, h);
    var rows = 8, rh = h / rows;
    for (var r = 0; r < rows; r++) { var off = (r % 2) * 16, x = -off;
      while (x < w) { var sw = 26 + Math.random() * 14, b = 95 + Math.random() * 45; g.fillStyle = 'rgb(' + Math.round(b) + ',' + Math.round(b * 0.72) + ',' + Math.round(b * 0.5) + ')';
        g.fillRect(x + 1, r * rh + 1, sw - 2, rh - 1); g.fillStyle = 'rgba(30,18,10,0.45)'; g.fillRect(x + 1, r * rh + rh - 4, sw - 2, 4);
        g.strokeStyle = 'rgba(60,40,25,0.3)'; g.lineWidth = 1; for (var q = 0; q < 3; q++) { var gx = x + 4 + Math.random() * (sw - 8); g.beginPath(); g.moveTo(gx, r * rh + 2); g.lineTo(gx + (Math.random() - 0.5) * 2, r * rh + rh - 4); g.stroke(); }
        x += sw; }
      if (Math.random() < 0.6) { g.fillStyle = 'rgba(95,120,60,0.35)'; g.beginPath(); g.ellipse(Math.random() * w, r * rh + rh * 0.7, 14, 4, 0, 0, Math.PI * 2); g.fill(); }   // (a little moss)
    }
  }, [3, 2]);
  var carpSignTex = cpTex(512, 192, function (g, w, h) {
    var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9a6a3e'); gr.addColorStop(1, '#7a4f2c'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 70; i++) { var y = Math.random() * h; g.strokeStyle = 'rgba(70,40,20,' + (0.1 + Math.random() * 0.2) + ')'; g.lineWidth = 1 + Math.random(); g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 4, w * 0.6, y - 4, w, y); g.stroke(); }
    g.strokeStyle = '#4a2c16'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); g.strokeStyle = 'rgba(240,200,140,0.5)'; g.lineWidth = 2; g.strokeRect(14, 14, w - 28, h - 28);
    g.font = '600 64px Fredoka, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(40,22,10,0.6)'; g.fillText('Oak & Ember', w / 2 + 3, 78 + 3); g.fillStyle = '#f6dcae'; g.fillText('Oak & Ember', w / 2, 78);
    g.font = '500 26px Fredoka, Georgia, serif'; g.fillStyle = '#ecc98e'; g.fillText('✦ Carpenter & Woodworks ✦', w / 2, 140);
    g.save(); g.translate(56, 96); g.rotate(-0.5); g.fillStyle = '#c9ced6'; g.beginPath(); g.moveTo(-26, -6); g.lineTo(18, -6); g.lineTo(18, 6); g.lineTo(-26, 4); g.closePath(); g.fill();   // (a little saw...)
    g.fillStyle = '#8a5a34'; g.fillRect(18, -9, 14, 18); g.restore();
    g.save(); g.translate(w - 56, 98); g.fillStyle = '#ffb04a'; g.beginPath(); g.moveTo(0, -30); g.quadraticCurveTo(18, -8, 12, 12); g.quadraticCurveTo(0, 24, -12, 12); g.quadraticCurveTo(-18, -8, 0, -30); g.fill();   // (...and a flame)
    g.fillStyle = '#ffe28a'; g.beginPath(); g.moveTo(0, -10); g.quadraticCurveTo(8, 2, 5, 10); g.quadraticCurveTo(0, 16, -5, 10); g.quadraticCurveTo(-8, 2, 0, -10); g.fill(); g.restore();
  });
  carpSignTex.anisotropy = 4;
  var cpmBark = new THREE.MeshStandardMaterial({ map: cpBarkTex, bumpMap: cpBarkTex, bumpScale: 0.02, roughness: 0.9 });
  var cpmEnd = new THREE.MeshStandardMaterial({ map: cpEndTex, roughness: 0.85 });
  var cpmPlank = new THREE.MeshStandardMaterial({ map: cpPlankTex, roughness: 0.85 });
  var cpmPlankDark = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0x9a7a62, roughness: 0.85 });
  var cpmShingle = new THREE.MeshStandardMaterial({ map: cpShingleTex, bumpMap: cpShingleTex, bumpScale: 0.03, roughness: 0.9 });
  var cpmStone = new THREE.MeshStandardMaterial({ color: 0x9a948a, roughness: 0.95 });
  var cpmIron = new THREE.MeshStandardMaterial({ color: 0x3a3634, metalness: 0.5, roughness: 0.5 });
  var cpmSteel = new THREE.MeshStandardMaterial({ color: 0xc9ced6, metalness: 0.6, roughness: 0.3 });
  var cpmBrass = new THREE.MeshStandardMaterial({ color: 0xc8a050, metalness: 0.6, roughness: 0.35 });
  var cpmSawdust = new THREE.MeshStandardMaterial({ color: 0xe0c48e, roughness: 1 });
  var cpmGlowWin = new THREE.MeshStandardMaterial({ color: 0xffd99a, emissive: 0xffb860, emissiveIntensity: 0.6, roughness: 0.4 });
  function cpPart(geo, m, x, y, z, rx, ry, rz, parent) { var o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx || 0, ry || 0, rz || 0); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; }
  function cpLogGeo(r, len) { var g = new THREE.CylinderGeometry(r, r * 1.03, len, 14, 1); g.rotateZ(Math.PI / 2); return g; }   // (a log lying along x)
  function cpLog(parent, r, len, x, y, z, ry) { var o = new THREE.Mesh(cpLogGeo(r, len), [cpmBark, cpmEnd, cpmEnd]); o.position.set(x, y, z); o.rotation.y = ry || 0; o.castShadow = o.receiveShadow = true; parent.add(o); return o; }

  // (one log wall: logs stacked along x from -L/2 to L/2, with gaps cut for the door and windows; [from, to, bottom, top] each)
  function cpLogWall(parent, len, x, z, ry, holes, startHalf) {
    var R = 0.165, step = R * 1.9, w = new THREE.Group(); w.position.set(x, 0, z); w.rotation.y = ry; parent.add(w);
    var span = (holes || []).map(function () { return [1e9, -1e9]; });
    for (var y = R + (startHalf ? step / 2 : 0), n = 0; y < CARP_WALL; y += step, n++) {
      var cuts = [-len / 2 - 0.35, len / 2 + 0.35];                   // (the ends run past the corners, as log cabins do)
      (holes || []).forEach(function (h, k) { if (y + R > h[2] && y - R < h[3]) { cuts.splice(cuts.length - 1, 0, h[0], h[1]); span[k][0] = Math.min(span[k][0], y - R); span[k][1] = Math.max(span[k][1], y + R); } });
      cuts.sort(function (a, b) { return a - b; });
      for (var i = 0; i < cuts.length; i += 2) { var a = cuts[i], b = cuts[i + 1]; if (b - a > 0.15) cpLog(w, R * (0.94 + ((n * 7 + i) % 5) * 0.025), b - a, (a + b) / 2, y, 0); }
    }
    (holes || []).forEach(function (h, k) {                            // (whole rows are cut away round an opening, so a squarer-trimmed log fills the gap above it, and below it)
      [[span[k][0], h[2]], [h[3], span[k][1]]].forEach(function (gp) {
        var gap = gp[1] - gp[0]; if (gap < 0.02) return;
        cpLog(w, R, h[1] - h[0] + 0.02, (h[0] + h[1]) / 2, (gp[0] + gp[1]) / 2, 0).scale.y = gap / (2 * R);
      });
    });
    return w;
  }
  // (a window box: a little planked trough with nailed corners, dark soil, and a cottage-garden tumble growing in it:
  // leafy mounds, five-petalled flowers with golden hearts in pink, cream, lilac and coral, tall spikes of lavender,
  // round little buds on fine stems, and trailing ivy spilling over the front edge)
  var FB = (function () {
    var petal = new THREE.SphereGeometry(1, 10, 6); petal.scale(0.026, 0.006, 0.016); petal.translate(0.024, 0, 0);
    var heart = new THREE.SphereGeometry(0.013, 10, 6); heart.scale(1, 0.6, 1);
    var leaf = new THREE.SphereGeometry(1, 10, 6); leaf.scale(0.034, 0.006, 0.016); leaf.translate(0.03, 0, 0);
    var ivy = new THREE.SphereGeometry(1, 8, 5); ivy.scale(0.02, 0.004, 0.018);
    var stem = new THREE.CylinderGeometry(0.004, 0.005, 1, 5); stem.translate(0, 0.5, 0);
    var bud = new THREE.SphereGeometry(0.012, 8, 6); bud.scale(1, 1.4, 1);
    var lav = new THREE.SphereGeometry(0.009, 6, 4); lav.scale(1, 1.5, 1);
    var mat = function (c, e) { return new THREE.MeshStandardMaterial({ color: c, roughness: 0.65, emissive: c, emissiveIntensity: e || 0 }); };
    return { petal: petal, heart: heart, leaf: leaf, ivy: ivy, stem: stem, bud: bud, lav: lav,
      petals: [0xffb3d6, 0xfff4dc, 0xc9a0ff, 0xff9a7a, 0xff7fb0].map(function (c) { return mat(c, 0.08); }), heartM: mat(0xf2c040, 0.15),
      leaves: [0x5f9a44, 0x6aa84f, 0x7ab85a, 0x4f8a3c].map(function (c) { return mat(c); }), stemM: mat(0x4a7a36), soil: mat(0x3a2818), lavM: mat(0x9a78dc, 0.1), ivyM: mat(0x3f7a34) };
  })();
  function cpFlowerBox(parent, w, y, z) {
    var g = new THREE.Group(); g.position.set(0, y, z); parent.add(g);
    var bw = w + 0.1, H2 = 0.18, D = 0.24, seed = Math.round(w * 97 + y * 31);
    function R(k) { var v = Math.sin((k + seed) * 91.37) * 43758.5453; return v - Math.floor(v); }
    function put(geo, m, x, yy, zz, rx, ry, rz, sc) { var o = new THREE.Mesh(geo, m); o.position.set(x, yy, zz); o.rotation.set(rx || 0, ry || 0, rz || 0); if (sc) o.scale.setScalar(sc); g.add(o); return o; }
    // (the trough: four planks, a plank along the bottom, little corner battens with nail heads)
    [[0, 0, D / 2 - 0.015, bw, H2, 0.03], [0, 0, -D / 2 + 0.015, bw, H2, 0.03], [bw / 2 - 0.015, 0, 0, 0.03, H2, D], [-bw / 2 + 0.015, 0, 0, 0.03, H2, D], [0, -H2 / 2 + 0.015, 0, bw, 0.03, D]].forEach(function (p) { put(new THREE.BoxGeometry(p[3], p[4], p[5]), cpmPlankDark, p[0], p[1], p[2]); });
    put(new THREE.BoxGeometry(bw - 0.02, 0.012, 0.03), cpmPlank, 0, 0.002, D / 2 + 0.001);   // (a lighter plank seam along the front)
    [-1, 1].forEach(function (s) { put(new THREE.BoxGeometry(0.035, H2 + 0.01, 0.035), cpmPlank, s * (bw / 2 - 0.01), 0, D / 2 - 0.005); [0.05, -0.05].forEach(function (ny) { put(new THREE.SphereGeometry(0.006, 6, 4), cpmIron, s * (bw / 2 - 0.01), ny, D / 2 + 0.013); }); });
    put(new THREE.BoxGeometry(bw - 0.06, 0.02, D - 0.06), FB.soil, 0, H2 / 2 - 0.03, 0);   // (the soil)
    var top = H2 / 2 - 0.02, n = Math.round(bw / 0.11);
    for (var i = 0; i < n; i++) {                                     // (leafy mounds all along it)
      var x = -bw / 2 + 0.06 + (i + R(i) * 0.5) * (bw - 0.12) / n;
      for (var l = 0; l < 10; l++) { var a = R(i * 7 + l) * Math.PI * 2; put(FB.leaf, FB.leaves[(i + l) % 4], x + Math.cos(a) * 0.015, top + 0.02 + R(i * 3 + l) * 0.03, (R(i * 5 + l) - 0.5) * 0.12, (R(l + i * 11) - 0.5) * 0.5, a, 0.25 + R(i + l * 13) * 0.35, 0.9 + R(l * 3 + i) * 0.5); }
    }
    for (var f = 0; f < n + 4; f++) {                                 // (flowers on short stems, facing up and out)
      var fx = -bw / 2 + 0.07 + R(f * 17 + 1) * (bw - 0.14), fz = (R(f * 19 + 2) - 0.35) * 0.1, fh = 0.06 + R(f * 23 + 3) * 0.07, pm = FB.petals[Math.floor(R(f * 29 + 4) * 5)];
      put(FB.stem, FB.stemM, fx, top, fz, 0, 0, 0).scale.set(1, fh, 1);
      var fl = new THREE.Group(); fl.position.set(fx, top + fh, fz); fl.rotation.set(0.5 + R(f) * 0.3, R(f * 3) * 6, 0); g.add(fl);
      for (var p = 0; p < 5; p++) { var o = new THREE.Mesh(FB.petal, pm); o.rotation.y = p / 5 * Math.PI * 2 + R(f + p) * 0.2; o.rotation.z = 0.25; fl.add(o); }
      var hm = new THREE.Mesh(FB.heart, FB.heartM); hm.position.y = 0.006; fl.add(hm);
    }
    for (var b = 0; b < Math.ceil(n / 2); b++) {                       // (round buds on fine stems, and spikes of lavender)
      var bx = -bw / 2 + 0.08 + R(b * 37 + 5) * (bw - 0.16), bh = 0.1 + R(b * 41) * 0.08, bz = (R(b * 43) - 0.6) * 0.08;
      put(FB.stem, FB.stemM, bx, top, bz, (R(b) - 0.5) * 0.2, 0, (R(b * 2) - 0.5) * 0.3).scale.set(0.7, bh, 0.7);
      if (b % 2) put(FB.bud, FB.petals[b % 5], bx + (R(b * 2) - 0.5) * 0.3 * bh, top + bh, bz);
      else for (var q = 0; q < 6; q++) put(FB.lav, FB.lavM, bx + (R(b * 2) - 0.5) * 0.3 * bh, top + bh - q * 0.016, bz + (q % 2 ? 0.006 : -0.006));
    }
    for (var t = 0; t < Math.ceil(n / 2.5); t++) {                     // (ivy trailing over the front edge and down)
      var tx = -bw / 2 + 0.08 + R(t * 53 + 6) * (bw - 0.16), len = 4 + Math.floor(R(t * 59) * 4);
      for (var k = 0; k < len; k++) { var ty = top - k * 0.03, tz = D / 2 + 0.008 + Math.min(k, 2) * 0.006, sway = Math.sin(k * 1.3 + t) * 0.012;
        put(FB.ivy, FB.ivyM, tx + sway + (k % 2 ? 0.012 : -0.012), ty, tz, Math.PI / 2 - 0.3, 0, (k % 2 ? 0.6 : -0.6)); }
    }
    return g;
  }
  // (a window: a plank frame with a cross of muntins, warm glowing panes and a flower box)
  function carpWindow(parent, x, y, z, ry, w, h, inside) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
    cpPart(new THREE.PlaneGeometry(w, h), inside ? siWindowMask : cpmGlowWin, 0, 0, 0, 0, 0, 0, g).castShadow = !inside;   // (inside, the real island seen through the glass, like the other shops)
    [[0, h / 2 + 0.04, w + 0.22, 0.09], [0, -h / 2 - 0.04, w + 0.3, 0.1], [w / 2 + 0.04, 0, 0.11, h + 0.04], [-w / 2 - 0.04, 0, 0.11, h + 0.04], [0, 0, w, 0.04], [0, 0, 0.04, h]].forEach(function (f) { cpPart(new THREE.BoxGeometry(f[2], f[3], 0.08), cpmPlankDark, f[0], f[1], 0.04, 0, 0, 0, g); });
    if (!inside) cpFlowerBox(g, w, -h / 2 - 0.2, 0.14);
    return g;
  }
  function cpLantern(parent, x, y, z, glows) {                           // (a little iron lantern with a warm flame)
    var g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
    cpPart(new THREE.BoxGeometry(0.16, 0.02, 0.16), cpmIron, 0, 0.13, 0, 0, 0, 0, g); cpPart(new THREE.BoxGeometry(0.18, 0.03, 0.18), cpmIron, 0, -0.12, 0, 0, 0, 0, g);
    cpPart(new THREE.ConeGeometry(0.12, 0.1, 4), cpmIron, 0, 0.19, 0, 0, Math.PI / 4, 0, g);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { cpPart(new THREE.BoxGeometry(0.015, 0.25, 0.015), cpmIron, c[0] * 0.075, 0, c[1] * 0.075, 0, 0, 0, g); });
    var fl = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd27a })); fl.scale.set(1, 1.5, 1); g.add(fl);
    var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffb860, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.set(0.9, 0.9, 1); g.add(halo);
    if (glows) glows.push({ f: fl, h: halo, p: Math.random() * 9 });
    return g;
  }

  // ===== outside =====
  var carpGroup = new THREE.Group(); carpGroup.position.set(CARP_X, 0, CARP_Z); carpGroup.rotation.y = CARP_TURN; scene.add(carpGroup);
  var carpGlows = [];
  (function (G) {
    var W2 = CARP_HW, D2 = CARP_HD;
    cpPart(new THREE.BoxGeometry(W2 * 2 + 0.5, 0.3, D2 * 2 + 0.5), cpmStone, 0, 0.0, 0, 0, 0, 0, G);   // (a low stone footing)
    cpPart(new THREE.BoxGeometry(W2 * 2, 0.04, D2 * 2), cpmPlank, 0, 0.16, 0, 0, 0, 0, G);
    var DOOR = [-0.6, 0.6, 0, 2.1],                                  // (the logs cut a little narrower than the door, so their ends overlap its edges and leave no gap)
    WINL = [-3.2, -1.8, 0.95, 1.95], WINR = [1.8, 3.2, 0.95, 1.95];
    cpLogWall(G, W2 * 2, 0, D2, 0, [DOOR, WINL, WINR]);                   // (the front, with its door and two windows)
    cpLogWall(G, W2 * 2, 0, -D2, 0, [[-1.2, 1.2, 1.0, 1.9]]);              // (the back, with a window)
    cpLogWall(G, D2 * 2, W2, 0, Math.PI / 2, [[-0.7, 0.7, 1.0, 1.9]], true);   // (the sides, their logs interlocking at the corners)
    cpLogWall(G, D2 * 2, -W2, 0, Math.PI / 2, [[-0.7, 0.7, 1.0, 1.9]], true);
    carpWindow(G, -2.5, 1.45, D2 + 0.02, 0, 1.3, 0.95); carpWindow(G, 2.5, 1.45, D2 + 0.02, 0, 1.3, 0.95);
    carpWindow(G, 0, 1.45, -D2 - 0.02, Math.PI, 2.3, 0.85); carpWindow(G, W2 + 0.02, 1.45, 0, Math.PI / 2, 1.3, 0.85); carpWindow(G, -W2 - 0.02, 1.45, 0, -Math.PI / 2, 1.3, 0.85);
    // (the door: thick planks with iron straps and a ring handle, in a frame of squared timber)
    var door = new THREE.Group(); door.position.set(0, 0.18, D2 + 0.02); G.add(door);
    for (var p = 0; p < 5; p++) cpPart(new THREE.BoxGeometry(0.25, 1.95, 0.08), new THREE.MeshStandardMaterial({ map: cpPlankTex, color: [0xb08060, 0xa07454, 0xb88a66][p % 3], roughness: 0.85 }), -0.52 + p * 0.26, 0.98, 0, 0, 0, 0, door);
    [0.4, 1.55].forEach(function (y) { cpPart(new THREE.BoxGeometry(1.2, 0.08, 0.03), cpmIron, 0, y, 0.055, 0, 0, 0, door); });
    cpPart(new THREE.TorusGeometry(0.07, 0.014, 6, 14), cpmBrass, 0.38, 1.0, 0.075, 0, 0, 0, door);
    [[-0.69, 1.08, 0.18, 2.25], [0.69, 1.08, 0.18, 2.25], [0, 2.24, 1.6, 0.16]].forEach(function (f) { cpPart(new THREE.BoxGeometry(f[2], f[3], 0.22), cpmPlankDark, f[0], f[1] + 0.18, D2 + 0.08, 0, 0, 0, G); });   // (out in front of the log ends, so it frames the doorway neatly)
    // (the roof: two slopes of wooden shingles over the logs, with the gables filled with upright planks)
    var RISE = 1.75, OVER = 0.6, slope = Math.hypot(D2 + OVER, RISE), ang = Math.atan2(RISE, D2 + OVER);
    [-1, 1].forEach(function (s) { var r = cpPart(new THREE.BoxGeometry(W2 * 2 + 1.3, 0.14, slope), cpmShingle, 0, CARP_WALL + RISE / 2 + 0.05, s * (D2 + OVER) / 2, s * ang, 0, 0, G); r.material = cpmShingle; });
    cpPart(new THREE.CylinderGeometry(0.12, 0.12, W2 * 2 + 1.4, 10).rotateZ(Math.PI / 2), cpmBark, 0, CARP_WALL + RISE + 0.12, 0, 0, 0, 0, G);   // (a log along the ridge)
    [-1, 1].forEach(function (s) { cpLog(G, 0.165, W2 * 2 + 0.7, 0, 2.69, s * D2, 0); });   // (one more log along the top of the front and back walls, right up under the eaves)
    [-1, 1].forEach(function (s) {
      var eave = 0.07 + RISE * (OVER - 0.05) / (D2 + OVER) - 0.07 / Math.cos(ang);   // (the gable reaches right up under the roof at its corners, so there's no gap)
      var sh = new THREE.Shape(); sh.moveTo(-D2 - 0.05, 0); sh.lineTo(D2 + 0.05, 0); sh.lineTo(D2 + 0.05, eave); sh.lineTo(0, RISE + 0.04); sh.lineTo(-D2 - 0.05, eave); sh.closePath();
      var gg = new THREE.ShapeGeometry(sh); var gm = cpPart(gg, new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0xc49a72, side: THREE.DoubleSide, roughness: 0.85 }), s * (W2 + 0.05), CARP_WALL, 0, 0, s * Math.PI / 2, 0, G);
      var uv = gg.attributes.uv, ps = gg.attributes.position; for (var i = 0; i < uv.count; i++) uv.setXY(i, ps.getY(i) * 0.6, ps.getX(i) * 0.6);   // (upright planks)
      var rnd = new THREE.Mesh(new THREE.CircleGeometry(0.28, 20), cpmGlowWin); rnd.position.set(s * (W2 + 0.08), CARP_WALL + 0.7, 0); rnd.rotation.y = s * Math.PI / 2; G.add(rnd);   // (a little round attic window)
      cpPart(new THREE.TorusGeometry(0.3, 0.05, 6, 20), cpmPlankDark, s * (W2 + 0.09), CARP_WALL + 0.7, 0, 0, s * Math.PI / 2, 0, G);
    });
    // (a stone chimney up the right side, puffing smoke)
    var CH = new THREE.Group(); CH.position.set(W2 + 0.5, 0, -1.2); G.add(CH);
    (function () {                                                     // (one solid stack of fieldstone: a broad base, sloping shoulders, then a narrower flue up past the roof, capped with a slab and a clay pot)
      var stoneMats = [0, 1, 2, 3, 4].map(function (k) { return new THREE.MeshStandardMaterial({ color: new THREE.Color([0x9a948a, 0x8a8478, 0xa69e90, 0x7e786e, 0x948c80][k]), roughness: 0.95 }); });
      var mortar = new THREE.MeshStandardMaterial({ color: 0x6e6860, roughness: 1 });
      function section(y0, y1, d, w) {                                 // (a solid core, then courses of stones laid over its three outer faces in a broken bond)
        cpPart(new THREE.BoxGeometry(d, y1 - y0, w), mortar, 0, (y0 + y1) / 2, 0, 0, 0, 0, CH);
        for (var y = y0, row = 0; y < y1 - 0.05; y += 0.24, row++) {
          var hgt = Math.min(0.22, y1 - y - 0.02), cy2 = y + hgt / 2 + 0.01;
          for (var z = -w / 2 + (row % 2 ? 0.17 : 0); z < w / 2 - 0.02;) {   // (the outer face)
            var len = Math.min(0.26 + springHash(row * 7 + z * 13) * 0.16, w / 2 - z); if (len < 0.06) break;
            cpPart(new THREE.BoxGeometry(0.06, hgt, len - 0.025), stoneMats[Math.floor(springHash(row * 3.1 + z * 5.7) * 5)], d / 2 + 0.02, cy2, z + len / 2, 0, 0, 0, CH); z += len;
          }
          if (row % 2) cpPart(new THREE.BoxGeometry(0.06, hgt, 0.15), stoneMats[row % 5], d / 2 + 0.02, cy2, -w / 2 + 0.085, 0, 0, 0, CH);
          [-1, 1].forEach(function (sd) {                                // (the two sides)
            for (var x = -d / 2 + (row % 2 ? 0 : 0.14); x < d / 2 - 0.02;) {
              var l2 = Math.min(0.24 + springHash(row * 5 + x * 11 + sd) * 0.14, d / 2 - x); if (l2 < 0.06) break;
              cpPart(new THREE.BoxGeometry(l2 - 0.025, hgt, 0.06), stoneMats[Math.floor(springHash(row * 2.3 + x * 9 + sd * 4) * 5)], x + l2 / 2, cy2, sd * (w / 2 + 0.02), 0, 0, 0, CH); x += l2;
            }
            if (!(row % 2)) cpPart(new THREE.BoxGeometry(0.12, hgt, 0.06), stoneMats[(row + 2) % 5], -d / 2 + 0.06, cy2, sd * (w / 2 + 0.02), 0, 0, 0, CH);
          });
        }
      }
      section(0, 2.3, 0.72, 1.15);                                     // (the broad base, up the side wall)
      section(2.3, 2.56, 0.68, 0.98); section(2.56, 2.84, 0.64, 0.84);   // (the shoulders, stepping in a course at a time)
      cpPart(new THREE.BoxGeometry(0.8, 0.05, 1.21), cpmStone, -0.02, 2.31, 0, 0, 0, 0, CH); cpPart(new THREE.BoxGeometry(0.76, 0.05, 1.04), cpmStone, -0.02, 2.57, 0, 0, 0, 0, CH);   // (flat ledge stones on each step)
      section(2.84, 5.15, 0.6, 0.72);                                  // (the flue, up past the roof)
      cpPart(new THREE.BoxGeometry(0.78, 0.12, 0.9), cpmStone, 0, 5.21, 0, 0, 0, 0, CH);   // (the capstone)
      cpPart(new THREE.CylinderGeometry(0.11, 0.14, 0.26, 12), new THREE.MeshStandardMaterial({ color: 0xb06a46, roughness: 0.85 }), 0, 5.4, 0, 0, 0, 0, CH);   // (a clay chimney pot)
      cpPart(new THREE.CylinderGeometry(0.125, 0.125, 0.04, 12), new THREE.MeshStandardMaterial({ color: 0x9a5a3a, roughness: 0.85 }), 0, 5.53, 0, 0, 0, 0, CH);
    })();
    var smokes = []; for (var sm = 0; sm < 7; sm++) { var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xd8d2cc, transparent: true, opacity: 0.0, depthWrite: false })); CH.add(sp); smokes.push({ s: sp, t: sm / 7 }); }
    carpGroup.userData.smokes = smokes;
    // (the porch: a plank deck, a little shingled awning on two posts over the door, and lanterns)
    cpPart(new THREE.BoxGeometry(4.2, 0.1, 1.7), cpmPlank, 0, 0.05, D2 + 0.95, 0, 0, 0, G);
    [-1.9, 1.9].forEach(function (x) { cpPart(new THREE.CylinderGeometry(0.09, 0.1, 2.5, 10), cpmBark, x, 1.3, D2 + 1.6, 0, 0, 0, G); });
    cpPart(new THREE.BoxGeometry(4.5, 0.1, 1.9), cpmShingle, 0, 2.62, D2 + 0.9, -0.22, 0, 0, G);
    cpLantern(G, -0.95, 2.0, D2 + 0.25, carpGlows); cpLantern(G, 0.95, 2.0, D2 + 0.25, carpGlows);
    // (its shop sign, in the town's style: a painted board, here a deep oak brown with the grain showing through,
    // gilded letters with a dark bevel and a shadow, a double gold pinstripe, a gilded oak leaf and flame either side
    // and little gold rules and diamonds round the small letters; in a moulded frame with a gold bead, with two brass
    // gooseneck lamps that make the gold shine at night. It stands on the front edge of the porch roof, above the door
    // and clear of it)
    function oakSignPaint(g, w, h, metalOnly) {
      if (metalOnly) { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); }
      else {
        var base = g.createLinearGradient(0, 0, 0, h); base.addColorStop(0, '#5a3420'); base.addColorStop(0.5, '#4a2a18'); base.addColorStop(1, '#3a2012');
        g.fillStyle = base; g.fillRect(0, 0, w, h);
        for (var i = 0; i < 300; i++) {
          var gy = isle2Hash(i * 1.7 + 170) * h, lite = isle2Hash(i * 3.1 + 170) > 0.5;
          g.strokeStyle = lite ? 'rgba(210,150,100,' + (0.04 + isle2Hash(i + 3) * 0.06) + ')' : 'rgba(20,8,2,' + (0.08 + isle2Hash(i + 5) * 0.1) + ')';
          g.lineWidth = 0.6 + isle2Hash(i * 5 + 1) * 1.6;
          g.beginPath(); var x0 = isle2Hash(i * 2.3 + 170) * w * 0.7; g.moveTo(x0, gy);
          g.bezierCurveTo(x0 + 200, gy + (isle2Hash(i * 7 + 1) - 0.5) * 8, x0 + 420, gy - (isle2Hash(i * 9 + 1) - 0.5) * 8, x0 + 300 + isle2Hash(i * 11 + 1) * 600, gy + (isle2Hash(i * 13 + 1) - 0.5) * 5);
          g.stroke();
        }
        g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, h * 0.5 - 1, w, 2);
        var vig = g.createLinearGradient(0, 0, 0, h); vig.addColorStop(0, 'rgba(0,0,0,0.3)'); vig.addColorStop(0.18, 'rgba(0,0,0,0)'); vig.addColorStop(0.82, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.38)');
        g.fillStyle = vig; g.fillRect(0, 0, w, h);
      }
      function gold(y0, y1) {
        if (metalOnly) return '#fff';
        var gg = g.createLinearGradient(0, y0, 0, y1);
        gg.addColorStop(0, '#fff5c8'); gg.addColorStop(0.3, '#ecc054'); gg.addColorStop(0.55, '#a87824'); gg.addColorStop(0.78, '#f2d06c'); gg.addColorStop(1, '#7e5814');
        return gg;
      }
      function gild(text, x, y, size, italic, spacing) {
        g.font = (italic ? 'italic ' : '') + 'bold ' + size + 'px Georgia, serif'; g.textBaseline = 'middle';
        var chars = text.split(''), widths = chars.map(function (c) { return g.measureText(c).width + (spacing || 0); });
        var total = widths.reduce(function (a2, b2) { return a2 + b2; }, 0) - (spacing || 0), cx = x - total / 2;
        chars.forEach(function (c, k) {
          if (!metalOnly) { g.save(); g.shadowColor = 'rgba(0,0,0,0.65)'; g.shadowOffsetX = size * 0.04; g.shadowOffsetY = size * 0.06; g.shadowBlur = size * 0.08; g.fillStyle = '#4a3008'; g.fillText(c, cx + 1.5, y + 2); g.restore(); }
          g.fillStyle = gold(y - size * 0.5, y + size * 0.5); g.fillText(c, cx, y);
          if (!metalOnly) { g.strokeStyle = 'rgba(255,248,215,0.5)'; g.lineWidth = 1; g.strokeText(c, cx - 0.6, y - 1); }
          cx += widths[k];
        });
      }
      function rrect(m, r) { g.beginPath(); g.moveTo(m + r, m); g.lineTo(w - m - r, m); g.quadraticCurveTo(w - m, m, w - m, m + r); g.lineTo(w - m, h - m - r); g.quadraticCurveTo(w - m, h - m, w - m - r, h - m); g.lineTo(m + r, h - m); g.quadraticCurveTo(m, h - m, m, h - m - r); g.lineTo(m, m + r); g.quadraticCurveTo(m, m, m + r, m); g.stroke(); }
      g.strokeStyle = metalOnly ? '#fff' : gold(0, h); g.lineWidth = 6; rrect(18, 26);
      g.lineWidth = 2; rrect(32, 18);
      function leaf(cx, cy, s, rot) {                                  // a gilded oak leaf, with its wavy lobes, veins and an acorn at its stem
        g.save(); g.translate(cx, cy); g.rotate(rot);
        g.fillStyle = metalOnly ? '#fff' : gold(-s, s);
        g.beginPath(); g.moveTo(0, -s);
        for (var k = 0; k <= 8; k++) { var t = k / 8, y = -s + t * s * 1.7, r = Math.sin(t * Math.PI) * s * 0.42 * (1 + 0.32 * Math.cos(t * Math.PI * 8)); g.lineTo(r, y); }
        for (var k2 = 8; k2 >= 0; k2--) { var t2 = k2 / 8, y2 = -s + t2 * s * 1.7, r2 = Math.sin(t2 * Math.PI) * s * 0.42 * (1 + 0.32 * Math.cos(t2 * Math.PI * 8)); g.lineTo(-r2, y2); }
        g.closePath(); g.fill();
        if (!metalOnly) { g.strokeStyle = '#6a4a10'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -s * 0.9); g.lineTo(0, s * 0.85); g.stroke(); g.lineWidth = 1.6; for (var v = -0.6; v < 0.6; v += 0.22) { g.beginPath(); g.moveTo(0, v * s); g.lineTo(s * 0.28, v * s - s * 0.12); g.moveTo(0, v * s); g.lineTo(-s * 0.28, v * s - s * 0.12); g.stroke(); } }
        g.fillStyle = metalOnly ? '#fff' : gold(s * 0.7, s * 1.2); g.beginPath(); g.ellipse(s * 0.2, s * 0.95, s * 0.16, s * 0.2, 0, 0, Math.PI * 2); g.fill();   // (the acorn...)
        g.fillStyle = metalOnly ? '#fff' : '#8a6418'; g.beginPath(); g.ellipse(s * 0.2, s * 0.8, s * 0.19, s * 0.09, 0, 0, Math.PI * 2); g.fill();   // (...and its cup)
        g.restore();
      }
      function flame(cx, cy, s) {                                       // a gilded ember flame
        g.save(); g.translate(cx, cy); g.fillStyle = metalOnly ? '#fff' : gold(-s, s);
        g.beginPath(); g.moveTo(0, -s); g.bezierCurveTo(s * 0.55, -s * 0.35, s * 0.6, s * 0.35, s * 0.3, s * 0.72); g.quadraticCurveTo(0, s * 0.95, -s * 0.3, s * 0.72); g.bezierCurveTo(-s * 0.6, s * 0.35, -s * 0.2, -s * 0.2, -s * 0.12, -s * 0.55); g.quadraticCurveTo(-s * 0.05, -s * 0.2, 0, -s); g.fill();
        if (!metalOnly) { g.fillStyle = 'rgba(90,40,8,0.55)'; g.beginPath(); g.moveTo(0, -s * 0.2); g.bezierCurveTo(s * 0.28, s * 0.1, s * 0.25, s * 0.5, 0, s * 0.62); g.bezierCurveTo(-s * 0.25, s * 0.5, -s * 0.2, s * 0.15, 0, -s * 0.2); g.fill(); }
        g.restore();
      }
      leaf(160, h / 2 + 2, 92, -0.45); flame(w - 160, h / 2 + 4, 92);
      gild('Oak & Ember', w / 2, h / 2 - 34, 168, true, 2);
      gild('CARPENTER · WOODWORKS', w / 2, h / 2 + 108, 42, false, 10);
      g.strokeStyle = metalOnly ? '#fff' : '#c99a3a'; g.lineWidth = 3;
      [-1, 1].forEach(function (d) {
        var ex = w / 2 + d * 400;
        g.beginPath(); g.moveTo(ex, h / 2 + 108); g.lineTo(ex + d * 100, h / 2 + 108); g.stroke();
        g.fillStyle = metalOnly ? '#fff' : '#e3b54c'; g.beginPath(); g.moveTo(ex + d * 116, h / 2 + 98); g.lineTo(ex + d * 126, h / 2 + 108); g.lineTo(ex + d * 116, h / 2 + 118); g.lineTo(ex + d * 106, h / 2 + 108); g.closePath(); g.fill();
      });
    }
    var oakSignTex = paintTexture(2048, 360, function (g, w, h) { oakSignPaint(g, w, h, false); });
    var oakSignMetal = paintTexture(2048, 360, function (g, w, h) { oakSignPaint(g, w, h, true); });
    oakSignTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var oakSignMat = new THREE.MeshStandardMaterial({ map: oakSignTex, metalnessMap: oakSignMetal, metalness: 0.35, roughness: 0.4, emissive: 0xe8b54a, emissiveMap: oakSignMetal, emissiveIntensity: 0.25 });
    var OS_Y = 3.12, OS_Z = D2 + 1.72, mOakTrim = new THREE.MeshStandardMaterial({ color: 0x3a2012, roughness: 0.55 });
    cpPart(new THREE.BoxGeometry(3.35, 0.56, 0.05), new THREE.MeshStandardMaterial({ color: 0x4a2a18, roughness: 0.5 }), 0, OS_Y, OS_Z, 0, 0, 0, G);
    var osFace = new THREE.Mesh(new THREE.PlaneGeometry(3.24, 0.5), oakSignMat); osFace.position.set(0, OS_Y, OS_Z + 0.027); G.add(osFace);
    [[0, 0.28, 3.46, 0.06], [0, -0.28, 3.46, 0.06], [-1.7, 0, 0.06, 0.62], [1.7, 0, 0.06, 0.62]].forEach(function (f) {   // (the moulded frame with a gold bead)
      cpPart(new THREE.BoxGeometry(f[2], f[3], 0.07), mOakTrim, f[0], OS_Y + f[1], OS_Z + 0.035, 0, 0, 0, G);
      cpPart(new THREE.BoxGeometry(f[2] > 1 ? 3.34 : 0.018, f[3] > 0.1 ? 0.5 : 0.018, 0.02), houseMats.gold, f[0] * 0.985, OS_Y + f[1] * 0.9, OS_Z + 0.065, 0, 0, 0, G);
    });
    [-1.2, 1.2].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.08, 0.32, 0.08), mOakTrim, x, OS_Y - 0.42, OS_Z - 0.04, 0, 0, 0, G); });   // (two little posts holding it up on the porch roof)
    var oakSignGlows = [], oakLampInner = new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: 0xffd9a0, emissiveIntensity: 0.2, side: THREE.BackSide });
    [-1.15, 1.15].forEach(function (lx) {                              // (brass gooseneck lamps lighting the sign)
      var y0 = OS_Y + 0.31, z0 = OS_Z + 0.05;
      cpPart(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12), houseMats.gold, lx, y0 + 0.01, z0, 0, 0, 0, G);
      var neck = new THREE.CatmullRomCurve3([new THREE.Vector3(lx, y0, z0), new THREE.Vector3(lx, y0 + 0.16, z0 + 0.04), new THREE.Vector3(lx, y0 + 0.22, z0 + 0.2), new THREE.Vector3(lx, y0 + 0.15, z0 + 0.36)]);
      cpPart(new THREE.TubeGeometry(neck, 14, 0.012, 6), houseMats.gold, 0, 0, 0, 0, 0, 0, G);
      cpPart(new THREE.ConeGeometry(0.07, 0.08, 14, 1, true), houseMats.gold, lx, y0 + 0.11, z0 + 0.36, 0.5, 0, 0, G);
      cpPart(new THREE.ConeGeometry(0.066, 0.076, 14, 1, true), oakLampInner, lx, y0 + 0.11, z0 + 0.36, 0.5, 0, 0, G);
      var lg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffd08a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      lg.position.set(lx, y0 + 0.06, z0 + 0.34); lg.scale.set(0.6, 0.6, 1); G.add(lg); oakSignGlows.push(lg);
    });
    carpGroup.userData.oakSign = { mat: oakSignMat, glows: oakSignGlows, inner: oakLampInner };
    // (the hanging sign, on an iron bracket out from the front corner)
    var sg = new THREE.Group(); sg.position.set(W2 + 0.5, 2.15, D2 + 0.5); G.add(sg);
    cpPart(new THREE.BoxGeometry(0.06, 0.06, 1.3), cpmIron, 0, 0.55, -0.4, 0, 0, 0, sg);
    cpPart(new THREE.CylinderGeometry(0.11, 0.12, 2.75, 10), cpmBark, 0, -0.8, -0.95, 0, 0, 0, sg);
    var board = new THREE.Group(); board.position.set(0, 0.52, 0.05); sg.add(board); carpGroup.userData.sign = board;
    [-0.42, 0.42].forEach(function (z) { cpPart(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 4), cpmIron, 0, -0.15, z * 0.9, 0, 0, 0, board); });
    var bm = [cpmPlankDark, cpmPlankDark, cpmPlankDark, cpmPlankDark, new THREE.MeshStandardMaterial({ map: carpSignTex, roughness: 0.8 }), new THREE.MeshStandardMaterial({ map: carpSignTex, roughness: 0.8 })];
    var bo = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.5, 0.06), bm); bo.position.set(0, -0.55, 0); bo.rotation.y = Math.PI / 2; bo.castShadow = true; board.add(bo);
    var bo2 = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.5, 0.06), bm); bo2.position.set(0, -0.55, 0); bo2.rotation.y = -Math.PI / 2; board.add(bo2);   // (readable from both sides)
    // ===== the yard: a workbench, sawhorses, a log pile, planks, a chopping block, a barrel and sawdust =====
    var Y = new THREE.Group(); Y.position.set(-W2 - 1.4, 0, 1.0); G.add(Y);   // (the workbench, out to the left of the porch)
    cpPart(new THREE.BoxGeometry(2.0, 0.12, 0.8), cpmPlank, 0, 0.9, 0, 0, Math.PI / 2, 0, Y);
    [[-0.32, -0.88], [0.32, -0.88], [-0.32, 0.88], [0.32, 0.88]].forEach(function (l) { cpPart(new THREE.BoxGeometry(0.1, 0.9, 0.1), cpmPlankDark, l[0], 0.45, l[1], 0, 0, 0, Y); });
    cpPart(new THREE.BoxGeometry(0.66, 0.06, 1.8), cpmPlankDark, 0, 0.25, 0, 0, 0, 0, Y);
    cpPart(new THREE.BoxGeometry(0.2, 0.06, 0.9), cpmPlank, 0.1, 0.99, 0.2, 0, 0.3, 0, Y);   // (a plank being planed...)
    var plane = new THREE.Group(); plane.position.set(0.12, 1.06, 0.1); plane.rotation.y = 0.3; Y.add(plane); cpPart(new THREE.BoxGeometry(0.08, 0.06, 0.24), new THREE.MeshStandardMaterial({ color: 0xa06a3c }), 0, 0, 0, 0, 0, 0, plane); cpPart(new THREE.BoxGeometry(0.05, 0.06, 0.06), cpmPlankDark, 0, 0.05, -0.03, 0, 0, 0, plane);
    var saw = new THREE.Group(); saw.position.set(-0.2, 0.97, -0.55); saw.rotation.y = 1.2; Y.add(saw);   // (...a handsaw...)
    var bl = new THREE.Shape(); bl.moveTo(0, 0); bl.lineTo(0.45, 0.02); bl.lineTo(0.45, 0.06); bl.lineTo(0, 0.12); bl.closePath(); var blg = cpPart(new THREE.ShapeGeometry(bl), new THREE.MeshStandardMaterial({ color: 0xc9ced6, metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide }), 0, 0, 0, -Math.PI / 2, 0, 0, saw);
    cpPart(new THREE.BoxGeometry(0.12, 0.03, 0.12), new THREE.MeshStandardMaterial({ color: 0x8a4a2a }), -0.05, 0.01, -0.06, 0, 0, 0, saw);
    cpPart(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8).rotateZ(Math.PI / 2), cpmPlankDark, -0.05, 1.0, 0.65, 0, 0.4, 0, Y);   // (...and a mallet)
    cpPart(new THREE.BoxGeometry(0.08, 0.08, 0.14), cpmPlankDark, 0.05, 1.0, 0.7, 0, 0.4, 0, Y);
    cpPart(new THREE.BoxGeometry(0.16, 0.14, 0.12), cpmIron, -0.36, 0.93, -0.3, 0, 0, 0, Y);   // (a vise on its edge)
    // (sawhorses with a log across them, and curls of shavings)
    var SH = new THREE.Group(); SH.position.set(-W2 - 1.0, 0, D2 + 2.1); SH.rotation.y = 0.25; G.add(SH);
    [-0.7, 0.7].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.1, 0.1, 0.8), cpmPlank, x, 0.7, 0, 0, 0, 0, SH); [-1, 1].forEach(function (s) { cpPart(new THREE.BoxGeometry(0.07, 0.75, 0.07), cpmPlankDark, x, 0.36, s * 0.22, s * 0.3, 0, 0, SH); }); });
    cpLog(SH, 0.17, 2.0, 0, 0.92, 0, 0);
    // (a pile of logs against the left wall)
    var LP = new THREE.Group(); LP.position.set(-W2 - 0.7, 0, -1.6); LP.rotation.y = Math.PI / 2; G.add(LP);
    for (var row = 0; row < 4; row++) for (var c = 0; c < 5 - row; c++) cpLog(LP, 0.16, 1.6 + Math.random() * 0.2, 0, 0.16 + row * 0.28, (c - (4 - row) / 2) * 0.34, 0);
    // (a stack of sawn planks by the right of the porch, with a lean-to of offcuts)
    var PS = new THREE.Group(); PS.position.set(W2 + 1.2, 0, D2 + 1.0); PS.rotation.y = 0.15; G.add(PS);
    for (var pl = 0; pl < 8; pl++) cpPart(new THREE.BoxGeometry(0.28, 0.06, 2.0), new THREE.MeshStandardMaterial({ map: cpPlankTex, color: [0xe0b888, 0xd4a878, 0xc89c6c][pl % 3], roughness: 0.85 }), (pl % 2) * 0.3 - 0.15, 0.1 + Math.floor(pl / 2) * 0.065, 0, 0, (Math.random() - 0.5) * 0.06, 0, PS);
    [[-0.1, 0.1], [0.3, -0.2]].forEach(function (b) { cpPart(new THREE.BoxGeometry(0.5, 0.08, 0.08), cpmPlankDark, 0, 0.04, b[0] * 3, 0, 0, 0, PS); });
    // (a chopping block with an axe in it)
    var CB = new THREE.Group(); CB.position.set(W2 + 1.6, 0, D2 + 2.6); G.add(CB);
    var blk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.55, 16), [cpmBark, cpmEnd, cpmEnd]); blk.position.y = 0.275; blk.castShadow = true; CB.add(blk);
    var ax = new THREE.Group(); ax.position.set(0.05, 0.56, 0); ax.rotation.set(0, 0.6, -0.5); CB.add(ax);
    cpPart(new THREE.CylinderGeometry(0.025, 0.03, 0.75, 8), cpmPlank, 0, 0.36, 0, 0, 0, 0, ax); cpPart(new THREE.BoxGeometry(0.06, 0.16, 0.22), cpmSteel, 0, 0.02, 0.06, 0, 0, 0, ax);
    // (a barrel, a bucket of nails, and sawdust and wood shavings scattered on the ground)
    var br = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.8, 16, 4), new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0xb88a5c, roughness: 0.8 })); var bp = br.geometry.attributes.position;
    for (var bi = 0; bi < bp.count; bi++) { var by = bp.getY(bi), k = 1 + 0.1 * Math.cos(by / 0.4 * Math.PI / 2); bp.setX(bi, bp.getX(bi) * k); bp.setZ(bi, bp.getZ(bi) * k); } br.geometry.computeVertexNormals();
    br.position.set(-1.7, 0.4, D2 + 1.95); br.castShadow = true; G.add(br);
    [0.2, -0.2].forEach(function (y) { cpPart(new THREE.TorusGeometry(0.365, 0.02, 6, 20).rotateX(Math.PI / 2), cpmIron, -1.7, 0.4 + y, D2 + 1.95, 0, 0, 0, G); });
    for (var sd = 0; sd < 9; sd++) { var dsk = new THREE.Mesh(new THREE.CircleGeometry(0.4 + Math.random() * 0.5, 16), cpmSawdust); dsk.rotation.x = -Math.PI / 2; var spot = [[-W2 - 1.3, 1.0], [-W2 - 1.0, D2 + 2.1], [W2 + 1.6, D2 + 2.6], [-W2 - 0.4, 2.6]][sd % 4]; dsk.position.set(spot[0] + (Math.random() - 0.5) * 1.2, 0.012 + sd * 0.0005, spot[1] + (Math.random() - 0.5) * 1.2); dsk.scale.set(1, 0.7, 1); dsk.receiveShadow = true; G.add(dsk); }
    for (var cu = 0; cu < 30; cu++) { var curl = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 4, 10, 4.5), cpmSawdust); var cs = [[-W2 - 1.3, 1.0], [-W2 - 1.0, D2 + 2.1]][cu % 2]; curl.position.set(cs[0] + (Math.random() - 0.5) * 1.4, 0.02, cs[1] + (Math.random() - 0.5) * 1.4); curl.rotation.set(Math.random() * 3, Math.random() * 3, 0); G.add(curl); }
  })(carpGroup);
  // (no grass, flowers or pebbles growing up through the workshop, its yard or its path)
  (function () {
    var m4 = new THREE.Matrix4(), v = new THREE.Vector3(), zero = new THREE.Matrix4().makeScale(0, 0, 0);
    scene.traverse(function (o) {
      if (!o.isInstancedMesh || o.parent === carpGroup) return; o.updateWorldMatrix(true, false); var changed = false;
      for (var i = 0; i < o.count; i++) { o.getMatrixAt(i, m4); v.setFromMatrixPosition(m4).applyMatrix4(o.matrixWorld);
        if (Math.abs(v.x - CARP_X) < 14 && v.z > 80 && v.z < 142 && (onCarpLot(v.x, v.z, 0) || carpPathDist(v.x, v.z) < SP_W + 0.6)) { o.setMatrixAt(i, zero); changed = true; } }
      if (changed) o.instanceMatrix.needsUpdate = true;
    });
    for (var s = solids.length - 1; s >= 0; s--) if (onCarpLot(solids[s].x, solids[s].z, 0.3)) solids.splice(s, 1);
    var wl = function (lx, lz) { var c = Math.cos(CARP_TURN), si = Math.sin(CARP_TURN); return { x: CARP_X + lx * c + lz * si, z: CARP_Z - lx * si + lz * c }; };   // (a spot in the workshop's own directions, out in the world)
    for (var x = -CARP_HW; x <= CARP_HW + 0.01; x += 0.55) { if (Math.abs(x) > 0.9) { var f = wl(x, CARP_HD); solids.push({ x: f.x, z: f.z, r: 0.35 }); } var bk = wl(x, -CARP_HD); solids.push({ x: bk.x, z: bk.z, r: 0.35 }); }   // (its walls, with the doorway left open)
    for (var z = -CARP_HD; z <= CARP_HD + 0.01; z += 0.55) [-CARP_HW, CARP_HW].forEach(function (x2) { var sd = wl(x2, z); solids.push({ x: sd.x, z: sd.z, r: 0.35 }); });
    var inner = wl(0, 0); solids.push({ x: inner.x, z: inner.z, r: 2.9 });
    [[-CARP_HW - 1.4, 1.0, 0.75], [-CARP_HW - 1.4, 0.2, 0.6], [-CARP_HW - 1.4, 1.8, 0.6], [-CARP_HW - 1.0, CARP_HD + 2.1, 0.75], [-CARP_HW - 0.7, -1.6, 0.9], [CARP_HW + 1.2, CARP_HD + 1.0, 0.7], [CARP_HW + 1.2, CARP_HD + 0.2, 0.6], [CARP_HW + 1.6, CARP_HD + 2.6, 0.45], [-1.7, CARP_HD + 1.95, 0.42], [CARP_HW + 0.45, -1.2, 0.6], [-1.9, CARP_HD + 1.6, 0.15], [1.9, CARP_HD + 1.6, 0.15]].forEach(function (o) { var w2 = wl(o[0], o[1]); solids.push({ x: w2.x, z: w2.z, r: o[2] }); });
  })();
  // (its own flagstone path, branching off the one from the bridge and laid just like the town's others: paving,
  // dressed stone kerbs, lavender, flowers and leafy plants along the edges, little glowing mushrooms, and lamp posts)
  (function () {
    var paveMat = null; scene.traverse(function (o) { if (!paveMat && o.isMesh && o.material && o.material.polygonOffset && o.material.map && o.material.map.isDataTexture && o.material.bumpMap) paveMat = o.material; });
    if (!paveMat) return;
    var paveTex = paveMat.map, dummy = new THREE.Object3D(), col = new THREE.Color();
    function H(k) { return isle2Hash(k * 1.37 + 4812); }
    var line = crpLine, pos = [], uv = [], idx = [], run = 0, W = SP_W * 2;
    for (var k = 0; k < line.length; k++) {
      var a = line[Math.max(0, k - 1)], b = line[Math.min(line.length - 1, k + 1)], tx = b[0] - a[0], tz = b[1] - a[1], tl = Math.sqrt(tx * tx + tz * tz) || 1, nx = -tz / tl, nz = tx / tl;
      if (k) run += Math.sqrt(Math.pow(line[k][0] - line[k - 1][0], 2) + Math.pow(line[k][1] - line[k - 1][1], 2));
      pos.push(line[k][0] - nx * SP_W, 0.021, line[k][1] - nz * SP_W, line[k][0] + nx * SP_W, 0.021, line[k][1] + nz * SP_W); uv.push(0, run / (W * 2), 1, run / (W * 2));
      if (k) { var q = k * 2; idx.push(q - 2, q, q - 1, q - 1, q, q + 1); }
    }
    var pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); pg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); pg.setIndex(idx); pg.computeVertexNormals();
    var pm = new THREE.Mesh(pg, paveMat); pm.receiveShadow = true; scene.add(pm);
    function onOther(x, z) { return stonePathDist(x, z) < SP_W + 0.35; }
    var kerbs = [], blooms = [], lav = [], leaves = [], shrooms = [], lamps = [], gap = 0, row = 0, lampRun = 0, lampSide = 1, walked = 0, end = line[line.length - 1];
    for (var j = 1; j < line.length; j++) {
      var p0 = line[j - 1], p1 = line[j], sx = p1[0] - p0[0], sz = p1[1] - p0[1], sl = Math.sqrt(sx * sx + sz * sz);
      gap += sl; lampRun += sl; walked += sl;
      var ux = sx / sl, uz = sz / sl, nx2 = -uz, nz2 = ux, turn = Math.atan2(ux, uz), nearEnd = dist(p1[0], p1[1], end[0], end[1]) < 1.1;
      if (lampRun > 4.6 && walked > 4 && !nearEnd && !onOther(p1[0] + nx2 * lampSide * (SP_W + 0.55), p1[1] + nz2 * lampSide * (SP_W + 0.55))) { lampRun = 0; lamps.push([p1[0] + nx2 * lampSide * (SP_W + 0.55), p1[1] + nz2 * lampSide * (SP_W + 0.55)]); lampSide = -lampSide; }
      if (gap < 0.46) continue;
      gap = 0; row++;
      for (var e = -1; e <= 1; e += 2) {
        var kx = p1[0] + nx2 * e * (SP_W + 0.07), kz = p1[1] + nz2 * e * (SP_W + 0.07);
        if (!nearEnd && !onOther(kx, kz)) kerbs.push([kx, kz, turn, H(row * 19 + e)]);
        var gx2 = p1[0] + nx2 * e * (SP_W + 0.42), gz2 = p1[1] + nz2 * e * (SP_W + 0.42), kind = H(row * 29 + e);
        if (nearEnd || walked < 3.5 || onOther(gx2, gz2)) continue;
        for (var lf = 0; lf < 6; lf++) leaves.push([gx2 + (H(row * 31 + lf + e) - 0.5) * 0.42, gz2 + (H(row * 37 + lf - e) - 0.5) * 0.42, 0.07 + H(row + lf) * 0.05, H(row * 41 + lf)]);
        if (kind < 0.45) for (var lv = 0; lv < 6; lv++) lav.push([gx2 + (H(row * 43 + lv + e) - 0.5) * 0.32, gz2 + (H(row * 47 + lv - e) - 0.5) * 0.32, 0.34 + H(row * 53 + lv) * 0.14, (H(row * 59 + lv) - 0.5) * 0.4]);
        else for (var bl2 = 0; bl2 < 5; bl2++) blooms.push([gx2 + (H(row * 61 + bl2 + e) - 0.5) * 0.42, gz2 + (H(row * 67 + bl2 - e) - 0.5) * 0.42, 0.13 + H(row * 71 + bl2) * 0.09, kind < 0.72 ? 0 : (bl2 % 2 ? 1 : 2)]);
        if (H(row * 73 + e) > 0.88) shrooms.push([gx2 + nx2 * e * 0.22, gz2 + nz2 * e * 0.22]);
      }
    }
    function batch(geo, mat, list, put) {
      if (!list.length) return null; var im = new THREE.InstancedMesh(geo, mat, list.length);
      list.forEach(function (q, i) { var cc = put(q); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); if (cc !== undefined) im.setColorAt(i, col.set(cc)); });
      dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1); im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; scene.add(im); return im;
    }
    var kerbGeo = new THREE.BoxGeometry(0.12, 0.1, 0.42, 1, 1, 1); (function () { var kp = kerbGeo.attributes.position; for (var v = 0; v < kp.count; v++) if (kp.getY(v) > 0) { kp.setX(v, kp.getX(v) * 0.82); kp.setZ(v, kp.getZ(v) * 0.94); } kerbGeo.computeVertexNormals(); })();
    batch(kerbGeo, new THREE.MeshStandardMaterial({ map: paveTex, roughness: 0.85, color: 0xe8e2d8 }), kerbs, function (q) { dummy.position.set(q[0], 0.045, q[1]); dummy.rotation.set(0, q[2] + (q[3] - 0.5) * 0.06, (q[3] - 0.5) * 0.04); return new THREE.Color().setHSL(0.09, 0.08, 0.7 + q[3] * 0.14).getHex(); });
    batch(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, flatShading: true }), leaves, function (q) { dummy.position.set(q[0], q[2] * 0.6, q[1]); dummy.rotation.set(q[3] * 3, q[3] * 6, 0); dummy.scale.set(q[2], q[2] * 0.7, q[2]); return new THREE.Color().setHSL(0.26 + q[3] * 0.06, 0.45, 0.28 + q[3] * 0.12).getHex(); });
    batch(new THREE.CylinderGeometry(0.006, 0.008, 1, 4), new THREE.MeshStandardMaterial({ color: 0x5a7a48 }), lav, function (q) { dummy.position.set(q[0], q[2] / 2, q[1]); dummy.rotation.set(q[3], 0, -q[3] * 0.7); dummy.scale.set(1, q[2], 1); });
    batch(new THREE.CylinderGeometry(0.018, 0.012, 0.14, 6), new THREE.MeshStandardMaterial({ color: 0x9a78dc, roughness: 0.7 }), lav, function (q) { dummy.position.set(q[0] + Math.sin(-q[3] * 0.7) * -q[2] * 0.4, q[2] - 0.04, q[1] + Math.sin(q[3]) * q[2] * 0.4); dummy.rotation.set(q[3], 0, -q[3] * 0.7); });
    var petalCols = [0xf6a6c8, 0xfaf6ee, 0xffe08a];
    batch(new THREE.CylinderGeometry(0.055, 0.03, 0.02, 7), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }), blooms, function (q) { dummy.position.set(q[0], q[2], q[1]); dummy.rotation.set((q[2] - 0.17) * 3, q[0] * 5, 0); return petalCols[q[3]]; });
    batch(new THREE.SphereGeometry(0.018, 6, 4), new THREE.MeshStandardMaterial({ color: 0xe8b84a }), blooms, function (q) { dummy.position.set(q[0], q[2] + 0.012, q[1]); });
    batch(new THREE.CylinderGeometry(0.005, 0.006, 1, 4), new THREE.MeshStandardMaterial({ color: 0x4f7a3e }), blooms, function (q) { dummy.position.set(q[0], q[2] / 2, q[1]); dummy.scale.set(1, q[2], 1); });
    var shroomCap = new THREE.MeshStandardMaterial({ color: 0xd9b8ff, emissive: 0x9a5cff, emissiveIntensity: 0.7, roughness: 0.6 }), shroomStem = new THREE.MeshStandardMaterial({ color: 0xf2ece0 }), iron = new THREE.MeshStandardMaterial({ color: 0x24222a, roughness: 0.45, metalness: 0.6 });
    shrooms.forEach(function (m) { for (var t = 0; t < 3; t++) { var mx = m[0] + Math.cos(t * 2.1) * 0.08, mz = m[1] + Math.sin(t * 2.1) * 0.08, mh = 0.07 + t * 0.025;
      var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, mh, 6), shroomStem); stem.position.set(mx, mh / 2, mz); scene.add(stem);
      var cap = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), shroomCap); cap.position.set(mx, mh, mz); cap.scale.y = 0.7; scene.add(cap); } });
    lamps.forEach(function (lp) {                                      // (wrought-iron lantern posts that glow warm at night, like the others)
      var g = new THREE.Group(); g.position.set(lp[0], 0, lp[1]); scene.add(g);
      function part(geo, mat, x, y, z) { var m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; }
      part(new THREE.CylinderGeometry(0.11, 0.14, 0.12, 8), iron, 0, 0.06, 0); part(new THREE.CylinderGeometry(0.025, 0.035, 1.5, 8), iron, 0, 0.84, 0);
      part(new THREE.TorusGeometry(0.04, 0.008, 6, 12), iron, 0, 0.5, 0).rotation.x = Math.PI / 2; part(new THREE.CylinderGeometry(0.1, 0.08, 0.03, 8), iron, 0, 1.6, 0);
      part(new THREE.CylinderGeometry(0.075, 0.06, 0.2, 6), pathLampMat, 0, 1.72, 0);
      [0, 1, 2, 3, 4, 5].forEach(function (s2) { var ba = s2 / 6 * Math.PI * 2; part(new THREE.BoxGeometry(0.008, 0.2, 0.008), iron, Math.cos(ba) * 0.075, 1.72, Math.sin(ba) * 0.075); });
      part(new THREE.ConeGeometry(0.12, 0.12, 6), iron, 0, 1.88, 0); part(new THREE.SphereGeometry(0.02, 8, 6), iron, 0, 1.96, 0);
      var glowS = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffc870, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      glowS.position.set(0, 1.72, 0); glowS.scale.set(1.4, 1.4, 1); g.add(glowS); pathLanternGlows.push(glowS);
      solids.push({ x: lp[0], z: lp[1], r: 0.18 });
    });
  })();
  function updateCarpOutside(t, night) {                               // smoke drifting up from the chimney, lanterns flickering, the sign swaying in the breeze
    carpGroup.userData.smokes.forEach(function (s) { s.t = (s.t + 0.0035) % 1; var k = s.t; s.s.position.set(Math.sin(k * 5 + t * 0.3) * 0.25 * k, 5.6 + k * 2.6, k * 0.6); var sc = 0.4 + k * 1.4; s.s.scale.set(sc, sc, 1); s.s.material.opacity = Math.sin(k * Math.PI) * 0.4; });
    carpGlows.forEach(function (L) { var fl = 1 + Math.sin(t * 11 + L.p) * 0.1 + Math.sin(t * 6.7 + L.p * 2) * 0.07; L.f.scale.set(fl, 1.5 * fl, fl); L.h.material.opacity = (0.25 + night * 0.5) * fl; });
    carpGroup.userData.sign.rotation.x = Math.sin(t * 1.3) * 0.05;
    cpmGlowWin.emissiveIntensity = 0.35 + night * 0.9;
    var os = carpGroup.userData.oakSign; os.mat.emissiveIntensity = 0.25 + night * 0.45; os.inner.emissiveIntensity = 0.2 + night * 1.6; os.glows.forEach(function (gl) { gl.material.opacity = night * 0.75; });   // (the little lamps make the gold letters shine at night)
  }

  // ===== inside =====
  var carpScene = new THREE.Scene(); carpScene.background = new THREE.Color(0x1c1410);
  var CPI_X = 600, CPI_Z = 1000, CPI_W = CARP_HW * 2, CPI_D = CARP_HD * 2, CPI_EXIT_Z = CPI_D / 2 - 0.6, inCarp = false;
  var carpRoom = new THREE.Group(); carpRoom.position.set(CPI_X, 0, CPI_Z); carpScene.add(carpRoom);
  carpScene.add(new THREE.HemisphereLight(0xffe8cc, 0x5a4434, 0.55));
  var cpSun = new THREE.DirectionalLight(0xffe2b8, 0.45); cpSun.position.set(CPI_X - 5, 8, CPI_Z + 6); cpSun.target.position.set(CPI_X, 0, CPI_Z); cpSun.castShadow = true; cpSun.shadow.mapSize.set(1024, 1024);
  cpSun.shadow.camera.left = -7; cpSun.shadow.camera.right = 7; cpSun.shadow.camera.top = 6; cpSun.shadow.camera.bottom = -6; cpSun.shadow.bias = -0.0006; carpScene.add(cpSun); carpScene.add(cpSun.target);
  var cpLamps = [[-2.4, 0.4], [2.4, -0.4]].map(function (p) { var l = new THREE.PointLight(0xffc888, 0.5, 11); l.position.set(CPI_X + p[0], 2.5, CPI_Z + p[1]); carpScene.add(l); return l; });
  var carpSolids = [], cpGlows = [], cpWalls = [];
  (function (R) {
    var W2 = CARP_HW, D2 = CARP_HD;
    // (a floor of worn grey stone tiles)
    var tileTex = cpTex(512, 512, function (g, w, h) {
      g.fillStyle = '#4a4642'; g.fillRect(0, 0, w, h);
      var n = 8, s = w / n;
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
        var b = 92 + Math.random() * 34, x = c * s, y = r * s;
        g.fillStyle = 'rgb(' + Math.round(b) + ',' + Math.round(b * 0.97) + ',' + Math.round(b * 0.92) + ')'; g.fillRect(x + 2, y + 2, s - 4, s - 4);
        for (var k = 0; k < 40; k++) { g.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '40,36,32' : '170,165,155') + ',' + (0.08 + Math.random() * 0.12) + ')'; g.fillRect(x + 2 + Math.random() * (s - 6), y + 2 + Math.random() * (s - 6), 1 + Math.random() * 3, 1 + Math.random() * 3); }
        var wg = g.createRadialGradient(x + s / 2, y + s / 2, 4, x + s / 2, y + s / 2, s * 0.75); wg.addColorStop(0, 'rgba(255,240,220,0.06)'); wg.addColorStop(1, 'rgba(0,0,0,0.18)'); g.fillStyle = wg; g.fillRect(x + 2, y + 2, s - 4, s - 4);
      }
    }, [5, 4]);
    cpPart(new THREE.PlaneGeometry(W2 * 2, D2 * 2), new THREE.MeshStandardMaterial({ map: tileTex, bumpMap: tileTex, bumpScale: 0.01, roughness: 0.92 }), 0, 0.001, 0, -Math.PI / 2, 0, 0, R).castShadow = false;
    // (the four log walls, each hidden when it's between you and the camera; the back one has a big bank of windows)
    [[0, -D2, 0, [[-2.55, 2.55, 0.95, 2.35]], false, [0, 0, -1]], [0, D2, 0, [[-0.65, 0.65, 0, 2.15], [-3.2, -1.8, 0.95, 1.95], [1.8, 3.2, 0.95, 1.95]], false, [0, 0, 1]], [W2, 0, Math.PI / 2, [[-0.7, 0.7, 1.0, 1.9]], true, [1, 0, 0]], [-W2, 0, Math.PI / 2, [[-0.7, 0.7, 1.0, 1.9]], true, [-1, 0, 0]]].forEach(function (w) {
      var g = cpLogWall(R, w[2] ? D2 * 2 : W2 * 2, w[0], w[1], w[2], w[3], w[4]); cpWalls.push({ g: g, n: new THREE.Vector3(w[5][0], 0, w[5][2]), d: w[2] ? W2 : D2, extra: [] });
    });
    cpWalls[2].extra.push(carpWindow(R, W2 - 0.12, 1.45, 0, -Math.PI / 2, 1.3, 0.85, true)); cpWalls[3].extra.push(carpWindow(R, -W2 + 0.12, 1.45, 0, Math.PI / 2, 1.3, 0.85, true));
    cpWalls[1].extra.push(carpWindow(R, -2.5, 1.45, D2 - 0.12, Math.PI, 1.3, 0.95, true), carpWindow(R, 2.5, 1.45, D2 - 0.12, Math.PI, 1.3, 0.95, true));
    var mWood = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0xb08a62, roughness: 0.8 }), mWoodTop = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0xd8b48a, roughness: 0.75 });
    var mOld = new THREE.MeshStandardMaterial({ color: 0x7a5a3c, roughness: 0.85 }), mMetal = new THREE.MeshStandardMaterial({ color: 0x5a6266, metalness: 0.55, roughness: 0.45 });
    var mRust = new THREE.MeshStandardMaterial({ color: 0x8a5a3a, metalness: 0.3, roughness: 0.7 }), mRed = new THREE.MeshStandardMaterial({ color: 0xa83a2a, roughness: 0.5 }), mHandle = new THREE.MeshStandardMaterial({ color: 0xa0683a, roughness: 0.6 });
    function put(geo, m, x, y, z, rx, ry, rz, p) { return cpPart(geo, m, x, y, z, rx, ry, rz, p); }
    // ===== the bank of windows on the back wall: three big frames of small panes, looking out on the island behind =====
    var WB = new THREE.Group(); WB.position.set(0, 0, -D2 + 0.14); R.add(WB); cpWalls[0].extra.push(WB);
    put(new THREE.PlaneGeometry(5.1, 1.4), siWindowMask, 0, 1.65, -0.02, 0, 0, 0, WB).castShadow = false;
    var mFrame = new THREE.MeshStandardMaterial({ color: 0x4a3420, roughness: 0.7 });
    [[0, 2.36, 5.25, 0.12], [0, 0.94, 5.25, 0.12], [-2.6, 1.65, 0.12, 1.5], [2.6, 1.65, 0.12, 1.5], [-0.86, 1.65, 0.1, 1.42], [0.86, 1.65, 0.1, 1.42]].forEach(function (f) { put(new THREE.BoxGeometry(f[2], f[3], 0.1), mFrame, f[0], f[1], 0.02, 0, 0, 0, WB); });
    [-1.73, 0, 1.73].forEach(function (cx) {                           // (each frame divided into small panes by thin muntins)
      for (var c = 1; c < 4; c++) put(new THREE.BoxGeometry(0.03, 1.38, 0.04), mFrame, cx - 0.84 + c * 0.42, 1.65, 0.03, 0, 0, 0, WB);
      for (var r = 1; r < 4; r++) put(new THREE.BoxGeometry(1.68, 0.03, 0.04), mFrame, cx, 0.96 + r * 0.345, 0.03, 0, 0, 0, WB);
    });
    put(new THREE.BoxGeometry(5.0, 0.04, 0.16), mOld, 0, 1.37, 0.1, 0, 0, 0, WB);   // (a little shelf across the windows, lined with small tools and pots)
    for (var sh = 0; sh < 16; sh++) { var sx = -2.35 + sh * 0.31 + Math.random() * 0.08, kind = sh % 4;
      if (kind === 0) put(new THREE.CylinderGeometry(0.035, 0.03, 0.09, 10), new THREE.MeshStandardMaterial({ color: [0x6a7a8a, 0x8a6a4a, 0x5a6a5a][sh % 3], roughness: 0.5 }), sx, 1.435, 0.1, 0, 0, 0, WB);
      else if (kind === 1) put(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 6), mHandle, sx, 1.47, 0.1, 0, 0, 0.1, WB);
      else if (kind === 2) put(new THREE.BoxGeometry(0.1, 0.06, 0.08), mWood, sx, 1.42, 0.1, 0, 0.3, 0, WB);
      else put(new THREE.CylinderGeometry(0.008, 0.008, 0.18, 6), mMetal, sx, 1.48, 0.1, 0, 0, -0.2, WB); }
    // (two big round wall clocks above the windows)
    [-0.8, 0.8].forEach(function (cx, k) {
      var face = cpTex(128, 128, function (g, w, h) { g.fillStyle = '#efe4c8'; g.beginPath(); g.arc(64, 64, 62, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#3a2a18'; g.lineWidth = 2; for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; g.beginPath(); g.moveTo(64 + Math.cos(a) * 50, 64 + Math.sin(a) * 50); g.lineTo(64 + Math.cos(a) * 58, 64 + Math.sin(a) * 58); g.stroke(); } g.lineWidth = 4; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + 26, 64 - 18 - k * 12); g.stroke(); g.lineWidth = 2.5; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 - 10 + k * 30, 64 - 44); g.stroke(); });
      put(new THREE.CylinderGeometry(0.21, 0.21, 0.06, 28), cpmBrass, cx, 2.56, 0.02, Math.PI / 2, 0, 0, WB);
      put(new THREE.CircleGeometry(0.18, 28), new THREE.MeshStandardMaterial({ map: face, roughness: 0.4 }), cx, 2.56, 0.055, 0, 0, 0, WB);
    });
    // ===== tools hanging all over the walls: wrenches, pliers, hammers, saws, screwdrivers, chisels, clamps, squares =====
    var TG = {
      handle: new THREE.CylinderGeometry(0.018, 0.02, 0.16, 8), handleS: new THREE.CylinderGeometry(0.014, 0.016, 0.1, 8), shaft: new THREE.CylinderGeometry(0.006, 0.006, 0.14, 6),
      wrench: new THREE.BoxGeometry(0.028, 0.24, 0.012), ring: new THREE.TorusGeometry(0.03, 0.01, 6, 14), jaw: new THREE.BoxGeometry(0.05, 0.05, 0.012),
      plierArm: new THREE.BoxGeometry(0.02, 0.2, 0.012), head: new THREE.BoxGeometry(0.12, 0.045, 0.04), sawBlade: new THREE.BoxGeometry(0.16, 0.42, 0.004),
      chisel: new THREE.BoxGeometry(0.022, 0.12, 0.006), clampBar: new THREE.BoxGeometry(0.024, 0.32, 0.016), clampJaw: new THREE.BoxGeometry(0.11, 0.03, 0.03),
      sqA: new THREE.BoxGeometry(0.03, 0.3, 0.008), sqB: new THREE.BoxGeometry(0.18, 0.03, 0.008), peg: new THREE.CylinderGeometry(0.006, 0.006, 0.05, 5)
    };
    function tool(p, x, y, kind, k) {                                  // (one tool, hung on a peg at x, y on a wall group)
      var g = new THREE.Group(); g.position.set(x, y, 0.03); g.rotation.z = (Math.sin(k * 7.3) * 0.08); p.add(g);
      var hm = [mHandle, mRed, new THREE.MeshStandardMaterial({ color: 0x3a5a7a, roughness: 0.5 }), mHandle][k % 4];
      put(TG.peg, mMetal, 0, 0.02, 0, Math.PI / 2, 0, 0, g);
      if (kind === 0) { put(TG.wrench, mMetal, 0, -0.12, 0, 0, 0, 0, g); put(TG.ring, mMetal, 0, -0.27, 0, 0, 0, 0, g); put(TG.jaw, mMetal, 0, 0.0, 0, 0, 0, 0, g); }
      else if (kind === 1) { [-1, 1].forEach(function (s) { put(TG.plierArm, hm, s * 0.02, -0.1, 0, 0, 0, s * 0.12, g); }); put(TG.jaw, mMetal, 0, 0.02, 0, 0, 0, 0, g); }
      else if (kind === 2) { put(TG.handle, mHandle, 0, -0.1, 0, 0, 0, 0, g).scale.set(0.8, 1.7, 0.8); put(TG.head, mMetal, 0, 0.02, 0.01, 0, 0, 0, g); }
      else if (kind === 3) { put(TG.sawBlade, mMetal, 0, -0.27, 0, 0, 0, 0, g); put(new THREE.BoxGeometry(0.13, 0.12, 0.03), hm, 0, -0.02, 0, 0, 0, 0, g); }
      else if (kind === 4) { put(TG.handleS, hm, 0, -0.05, 0, 0, 0, 0, g); put(TG.shaft, mMetal, 0, -0.17, 0, 0, 0, 0, g); }
      else if (kind === 5) { put(TG.handleS, mHandle, 0, -0.05, 0, 0, 0, 0, g); put(TG.chisel, mMetal, 0, -0.16, 0, 0, 0, 0, g); }
      else if (kind === 6) { put(TG.clampBar, mMetal, 0, -0.16, 0, 0, 0, 0, g); [0.0, -0.22].forEach(function (cy) { put(TG.clampJaw, k % 2 ? mRed : mRust, 0.05, cy, 0, 0, 0, 0, g); }); }
      else { put(TG.sqA, mMetal, -0.07, -0.15, 0, 0, 0, 0, g); put(TG.sqB, mMetal, 0.01, -0.29, 0, 0, 0, 0, g); }
      return g;
    }
    function toolWall(x, z, ry, w, rows, wallIdx, seed) {              // (a planked board fixed to a wall, crowded with hanging tools)
      var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; R.add(g); cpWalls[wallIdx].extra.push(g);
      put(new THREE.BoxGeometry(w, rows.length * 0.42 + 0.1, 0.03), mOld, 0, rows[0] - rows.length * 0.21 + 0.21 + 0.02, -0.02, 0, 0, 0, g);
      rows.forEach(function (ry2, r) { var n = Math.floor(w / 0.17); for (var i = 0; i < n; i++) { var kk = seed + r * 31 + i; if (Math.sin(kk * 12.9) > 0.85) continue; tool(g, -w / 2 + 0.1 + i * (w - 0.2) / (n - 1), ry2, Math.abs(Math.floor(Math.sin(kk * 4.7) * 1000)) % 8, kk); } });
      return g;
    }
    toolWall(-3.55, -D2 + 0.2, 0, 1.75, [2.35, 1.9, 1.45], 0, 3);       // (both sides of the windows on the back wall...)
    toolWall(3.55, -D2 + 0.2, 0, 1.75, [2.35, 1.9, 1.45], 0, 41);
    toolWall(-W2 + 0.2, -2.0, Math.PI / 2, 2.3, [2.35, 1.9], 3, 77);    // (...the left wall either side of its window...)
    toolWall(-W2 + 0.2, 2.15, Math.PI / 2, 1.9, [2.35, 1.9], 3, 99);
    toolWall(W2 - 0.2, -2.0, -Math.PI / 2, 2.3, [2.35], 2, 133);        // (...and above the shelves on the right)
    // ===== the long workbench under the windows: a thick, scarred top, a vise, drawers of metal and wood underneath =====
    var BB = new THREE.Group(); BB.position.set(0, 0, -D2 + 0.6); R.add(BB);
    put(new THREE.BoxGeometry(6.4, 0.09, 0.8), mWoodTop, 0, 0.9, 0, 0, 0, 0, BB); put(new THREE.BoxGeometry(6.4, 0.12, 0.05), mWood, 0, 0.83, 0.38, 0, 0, 0, BB);
    [-3.1, -1.05, 1.05, 3.1].forEach(function (x) { [-0.33, 0.33].forEach(function (z) { put(new THREE.BoxGeometry(0.09, 0.86, 0.09), mWood, x, 0.43, z, 0, 0, 0, BB); }); });
    put(new THREE.BoxGeometry(6.2, 0.04, 0.7), mOld, 0, 0.12, 0, 0, 0, 0, BB);
    function drawers(p, x, y, z, w, n, metal) {                         // (a stack of drawers, each with a handle)
      var dh = 0.6 / n; put(new THREE.BoxGeometry(w, 0.62, 0.66), metal ? mMetal : mWood, x, y, z - 0.02, 0, 0, 0, p);
      for (var i = 0; i < n; i++) { put(new THREE.BoxGeometry(w - 0.06, dh - 0.04, 0.03), metal ? new THREE.MeshStandardMaterial({ color: 0x6a7478, metalness: 0.5, roughness: 0.4 }) : mWoodTop, x, y - 0.3 + dh * (i + 0.5), z + 0.32, 0, 0, 0, p); put(new THREE.BoxGeometry(w * 0.3, 0.02, 0.03), metal ? mMetal : cpmBrass, x, y - 0.3 + dh * (i + 0.5), z + 0.35, 0, 0, 0, p); }
    }
    drawers(BB, 0, 0.5, 0, 1.9, 3, true); drawers(BB, 2.05, 0.5, 0, 1.85, 2, false);
    var vise = new THREE.Group(); vise.position.set(-2.6, 0.95, 0.3); BB.add(vise);
    put(new THREE.BoxGeometry(0.22, 0.12, 0.2), mMetal, 0, 0.06, 0, 0, 0, 0, vise); put(new THREE.BoxGeometry(0.22, 0.12, 0.05), mMetal, 0, 0.06, 0.18, 0, 0, 0, vise); put(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), mMetal, 0, 0.06, 0.26, 0, 0, Math.PI / 2, vise);
    [[-1.9, 0.0, 'box'], [-1.4, -0.15, 'plane'], [-0.6, 0.1, 'mallet'], [0.3, -0.2, 'box2'], [0.9, 0.05, 'clamp'], [1.6, -0.1, 'motor'], [2.5, 0.1, 'plane'], [-2.95, -0.2, 'jar']].forEach(function (it, k) {
      var x = it[0], z = it[1], t = it[2];
      if (t === 'box') { put(new THREE.BoxGeometry(0.4, 0.14, 0.26), mWood, x, 1.01, z, 0, 0.1, 0, BB); put(new THREE.BoxGeometry(0.42, 0.03, 0.06), mHandle, x, 1.1, z, 0, 0.1, 0, BB); }
      else if (t === 'box2') { for (var b = 0; b < 3; b++) put(new THREE.BoxGeometry(0.3, 0.08, 0.22), b % 2 ? mWoodTop : mWood, x, 0.98 + b * 0.085, z, 0, b * 0.15, 0, BB); }
      else if (t === 'plane') { put(new THREE.BoxGeometry(0.08, 0.07, 0.26), mHandle, x, 0.98, z, 0, 0.4, 0, BB); put(new THREE.BoxGeometry(0.06, 0.07, 0.06), mHandle, x, 1.04, z - 0.05, 0, 0.4, 0, BB); }
      else if (t === 'mallet') { put(new THREE.CylinderGeometry(0.016, 0.016, 0.3, 8), mHandle, x, 0.97, z, 0, 0.5, Math.PI / 2, BB); put(new THREE.BoxGeometry(0.08, 0.08, 0.13), mWood, x + 0.14, 0.99, z + 0.07, 0, 0.5, 0, BB); }
      else if (t === 'clamp') { put(TG.clampBar, mMetal, x, 0.96, z, Math.PI / 2, 0, 0.4, BB); put(TG.clampJaw, mRed, x, 0.98, z, 0, 0.4, 0, BB); }
      else if (t === 'motor') { put(new THREE.CylinderGeometry(0.11, 0.11, 0.24, 16), new THREE.MeshStandardMaterial({ color: 0x8a8a7a, metalness: 0.4, roughness: 0.5 }), x, 1.06, z, 0, 0, Math.PI / 2, BB); put(new THREE.BoxGeometry(0.3, 0.06, 0.22), mMetal, x, 0.95, z, 0, 0, 0, BB); }
      else { put(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 12), new THREE.MeshStandardMaterial({ color: 0xa8b8b0, transparent: true, opacity: 0.7, roughness: 0.1 }), x, 1.02, z, 0, 0, 0, BB); }
    });
    for (var cu = 0; cu < 18; cu++) { var crl = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 4, 10, 4.5), cpmSawdust); crl.position.set(-2 + Math.random() * 4, 0.96, (Math.random() - 0.5) * 0.5); crl.rotation.set(Math.random() * 3, Math.random() * 3, 0); BB.add(crl); }
    carpSolids.push([-2.6, -D2 + 0.6, 0.75], [-1.3, -D2 + 0.6, 0.75], [0, -D2 + 0.6, 0.75], [1.3, -D2 + 0.6, 0.75], [2.6, -D2 + 0.6, 0.75]);
    // (a strip light hanging over it, glowing pale)
    put(new THREE.BoxGeometry(2.2, 0.06, 0.12), mMetal, 0, 2.48, -D2 + 0.9, 0, 0, 0, R); put(new THREE.BoxGeometry(2.1, 0.02, 0.08), new THREE.MeshBasicMaterial({ color: 0xfff8e8 }), 0, 2.44, -D2 + 0.9, 0, 0, 0, R);
    [-0.9, 0.9].forEach(function (x) { put(new THREE.CylinderGeometry(0.005, 0.005, 0.12, 4), cpmIron, x, 2.56, -D2 + 0.9, 0, 0, 0, R); });
    var stripPt = new THREE.PointLight(0xfff4e0, 0.5, 6); stripPt.position.set(CPI_X, 2.3, CPI_Z - D2 + 1.0); carpScene.add(stripPt);
    // ===== drawer cabinets with worktops down the sides, crowded with tools and boxes =====
    function sideBench(x, z0, z1, face, wallIdx) {
      var g = new THREE.Group(); g.position.set(x, 0, (z0 + z1) / 2); g.rotation.y = face; R.add(g); var L = z1 - z0;
      put(new THREE.BoxGeometry(L, 0.08, 0.75), mWoodTop, 0, 0.92, 0, 0, 0, 0, g);
      var n = Math.max(1, Math.round(L / 0.7));
      for (var i = 0; i < n; i++) { var cx = -L / 2 + (i + 0.5) * L / n; drawers(g, cx, 0.45, 0, L / n - 0.04, i % 2 ? 4 : 3, false); }
      for (var k = 0; k < Math.round(L * 2); k++) { var tx = -L / 2 + 0.2 + k * 0.5, kind = k % 4;
        if (kind === 0) put(new THREE.BoxGeometry(0.28, 0.12, 0.2), mWood, tx, 1.02, -0.1, 0, 0.2, 0, g);
        else if (kind === 1) put(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 10), mMetal, tx, 1.02, 0.1, 0, 0, 0, g);
        else if (kind === 2) { put(TG.handle, mHandle, tx, 0.98, 0.05, 0, 0, Math.PI / 2, g); put(TG.head, mMetal, tx + 0.09, 0.98, 0.05, 0, 0, Math.PI / 2, g); }
        else put(new THREE.BoxGeometry(0.22, 0.05, 0.3), mWoodTop, tx, 0.98, 0, 0, 0.3, 0, g); }
      return g;
    }
    sideBench(-W2 + 0.55, -3.0, 2.8, Math.PI / 2, 3);
    for (var sb = -2.6; sb <= 2.6; sb += 0.65) carpSolids.push([-W2 + 0.55, sb, 0.45]);
    sideBench(W2 - 0.55, -0.6, 2.8, -Math.PI / 2, 2);
    for (var sb2 = -0.3; sb2 <= 2.6; sb2 += 0.65) carpSolids.push([W2 - 0.55, sb2, 0.45]);
    // (shelves high on the right wall, full of jars, boxes, coils, little carved birdhouses and pots)
    var SV = new THREE.Group(); SV.position.set(W2 - 0.25, 0, 1.1); SV.rotation.y = -Math.PI / 2; R.add(SV); cpWalls[2].extra.push(SV);
    [1.55, 1.95, 2.35].forEach(function (y, r) {
      put(new THREE.BoxGeometry(3.2, 0.04, 0.32), mOld, 0, y, 0, 0, 0, 0, SV);
      for (var i = 0; i < 9; i++) { var x = -1.45 + i * 0.36 + Math.sin(i * 3 + r) * 0.05, k = (i + r * 3) % 5;
        if (k === 0) put(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 12), new THREE.MeshStandardMaterial({ color: [0x9ab0a8, 0xb89a6a, 0x8aa0b8][i % 3], roughness: 0.3, transparent: true, opacity: 0.85 }), x, y + 0.11, 0, 0, 0, 0, SV);
        else if (k === 1) put(new THREE.BoxGeometry(0.26, 0.16, 0.22), [mWood, mWoodTop, mRust][i % 3], x, y + 0.1, 0, 0, 0.1, 0, SV);
        else if (k === 2) { put(new THREE.BoxGeometry(0.16, 0.16, 0.16), mWoodTop, x, y + 0.1, 0, 0, 0, 0, SV); put(new THREE.ConeGeometry(0.15, 0.1, 4), mOld, x, y + 0.23, 0, 0, Math.PI / 4, 0, SV); }
        else if (k === 3) put(new THREE.TorusGeometry(0.07, 0.025, 6, 14), mRust, x, y + 0.08, 0, Math.PI / 2, 0, 0, SV);
        else put(new THREE.CylinderGeometry(0.07, 0.05, 0.12, 12), new THREE.MeshStandardMaterial({ color: 0xa0603a, roughness: 0.8 }), x, y + 0.08, 0, 0, 0, 0, SV); }
    });
    [-1.55, 1.55].forEach(function (x) { put(new THREE.BoxGeometry(0.05, 1.0, 0.32), mOld, x, 1.95, 0, 0, 0, 0, SV); });
    // (a lumber stack leaning in the back right corner, and a stool with a few tools on it)
    for (var lb = 0; lb < 6; lb++) put(new THREE.BoxGeometry(0.12, 2.2, 0.05), new THREE.MeshStandardMaterial({ map: cpPlankTex, color: [0xe0b888, 0xc89c6c, 0xa0704a][lb % 3] }), W2 - 0.35 - lb * 0.07, 1.08, -D2 + 1.3 + lb * 0.05, 0.18, 0, -0.06, R);
    carpSolids.push([W2 - 0.55, -D2 + 1.4, 0.45]);
    // ===== your counter, in the middle of the shop, facing the door: a heavy old workbench of a counter with drawers =====
    var CT = new THREE.Group(); CT.position.set(0, 0, 0.35); R.add(CT);
    put(new THREE.BoxGeometry(2.4, 0.1, 0.85), mWoodTop, 0, 1.0, 0, 0, 0, 0, CT); put(new THREE.BoxGeometry(2.42, 0.1, 0.06), mWood, 0, 0.92, 0.42, 0, 0, 0, CT);
    put(new THREE.BoxGeometry(2.3, 0.86, 0.7), mWood, 0, 0.45, -0.02, 0, 0, 0, CT);
    [-0.8, 0, 0.8].forEach(function (x) { for (var r = 0; r < 3; r++) { put(new THREE.BoxGeometry(0.7, 0.24, 0.03), mWoodTop, x, 0.18 + r * 0.27, 0.34, 0, 0, 0, CT); put(new THREE.BoxGeometry(0.2, 0.025, 0.03), cpmBrass, x, 0.18 + r * 0.27, 0.365, 0, 0, 0, CT); } });
    put(new THREE.BoxGeometry(0.42, 0.04, 0.3), new THREE.MeshStandardMaterial({ color: 0x6a2a2a }), -0.6, 1.07, 0, 0, 0.2, 0, CT); put(new THREE.BoxGeometry(0.4, 0.012, 0.28), new THREE.MeshStandardMaterial({ color: 0xf0e6d0 }), -0.6, 1.094, 0, 0, 0.2, 0, CT);   // (the ledger...)
    put(new THREE.SphereGeometry(0.06, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), cpmBrass, 0.55, 1.05, 0.12, 0, 0, 0, CT);                                                // (...the little bell...)
    cpLantern(CT, 0.95, 1.2, -0.15, cpGlows);                                                                                                                   // (...a lantern...)
    put(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8), mHandle, 0.15, 1.08, -0.1, 0, 0.6, Math.PI / 2, CT); put(new THREE.BoxGeometry(0.06, 0.07, 0.1), mMetal, 0.27, 1.08, -0.02, 0, 0.6, 0, CT);   // (...and a hammer left on it)
    carpSolids.push([-0.75, 0.35, 0.6], [0, 0.35, 0.6], [0.75, 0.35, 0.6]);
    // (lanterns hanging from the rafters)
    [[-2.2, 1.6], [2.2, 1.6]].forEach(function (lp) { cpLantern(R, lp[0], 2.25, lp[1], cpGlows); put(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 4), cpmIron, lp[0], 2.65, lp[1], 0, 0, 0, R); });
    carpScene.userData = {};
  })(carpRoom);
  var cpLook = new THREE.Vector3();
  function updateCarpInside(t) {
    cpLook.set(camera.position.x - CPI_X, 0, camera.position.z - CPI_Z);
    cpWalls.forEach(function (W) { W.g.visible = cpLook.dot(W.n) < W.d - 0.6; (W.extra || []).forEach(function (e) { e.visible = W.g.visible; }); });   // (the wall between you and the camera steps aside)
    var hr = state.minutes / 60, nt = hr < 5.5 ? 1 : hr < 7 ? (7 - hr) / 1.5 : hr < 18.5 ? 0 : hr < 20 ? (hr - 18.5) / 1.5 : 1;
    cpSun.intensity = 0.45 * (1 - nt);
    var fk = 1 + Math.sin(t * 9) * 0.08 + Math.sin(t * 13.3) * 0.06;
    cpLamps.forEach(function (l, i) { l.intensity = (0.45 + nt * 0.25) * (1 + Math.sin(t * 10 + i) * 0.04); });
    cpGlows.forEach(function (L) { var f = 1 + Math.sin(t * 11 + L.p) * 0.1; L.f.scale.set(f, 1.5 * f, f); L.h.material.opacity = 0.5 * f; });
  }
  function drawCarpView() {                                            // (the windows look out on the real island, just like the other shops')
    renderer.getDrawingBufferSize(shopViewSize);
    if (shopViewTarget.width !== shopViewSize.x || shopViewTarget.height !== shopViewSize.y) shopViewTarget.setSize(shopViewSize.x, shopViewSize.y);
    siWindowMask.uniforms.uSize.value.copy(shopViewSize);
    shopViewMap.makeTranslation(CARP_X, 0.16, CARP_Z).multiply(shopViewTmp.makeRotationY(CARP_TURN)).multiply(shopViewTmp.makeTranslation(-CPI_X, 0, -CPI_Z));   // (its floor sits up on its stone footing)
    shopViewCam.projectionMatrix.copy(camera.projectionMatrix); shopViewCam.projectionMatrixInverse.copy(camera.projectionMatrixInverse);
    shopViewCam.matrix.multiplyMatrices(shopViewMap, camera.matrixWorld);
    shopViewCam.updateMatrixWorld(true);
    carpGroup.visible = false;                                         // (you're inside it, so its own outside walls stay out of the way)
    renderer.setRenderTarget(shopViewTarget);
    renderer.render(scene, shopViewCam);
    renderer.setRenderTarget(null);
    carpGroup.visible = true;
  }
  function carpDoorUse(goIn) {                                         // through Oak & Ember's door, in or out
    if (doorBusy) return;
    doorBusy = true; doorArmed = false; walkTarget = null; doorSound(); fadeBox.style.opacity = 1;
    setTimeout(function () {
      if (goIn) {
        indoors = true; inShop = inClinic = inBarn = false; inCarp = true;
        carpScene.add(player); player.position.set(CPI_X, 0, CPI_Z + CPI_EXIT_Z - 1.0); facing = Math.PI;
        outsideCam = { dist: cam.dist, pitch: cam.pitch, yaw: cam.yaw }; cam.dist = 8.5; cam.pitch = 0.85; cam.yaw = 0;
      } else {
        indoors = false; inCarp = false; scene.add(player);
        var o = carpFront(1.8); player.position.set(o.x, 0, o.z); facing = CARP_TURN;
        if (outsideCam) { cam.dist = outsideCam.dist; cam.pitch = outsideCam.pitch; cam.yaw = outsideCam.yaw; }
      }
      cam.target.set(player.position.x, 0.8, player.position.z);
      fadeBox.style.opacity = 0;
      setTimeout(function () { doorBusy = false; }, 380);
    }, 380);
  }
  function updateCarpenter(t, night) {
    if (inCarp && player.parent !== carpScene) inCarp = false;         // (carried home or teleported away from inside: no longer in the workshop)
    if (inCarp) updateCarpInside(t); else updateCarpOutside(t, night);
  }
  TELEPORTS.push({ name: 'Oak & Ember', icon: '🪚', spot: function () { var f = carpFront(2.4); return { x: f.x, z: f.z, face: CARP_TURN + Math.PI, view: CARP_TURN }; } });

  // ---------- Oak & Ember's menu, and your coop ----------
  // Step up to the counter inside Oak & Ember and press E for the carpenter's menu. For now it has one thing: a coop,
  // for 2,000 Star Coins. Buy it and a grid of your farm opens: tap where it should go (it takes 5 × 4 tiles, its
  // door facing south), then build it there. Anywhere open will do, even where a tree, bush or rock was cleared, and
  // nothing grows back under it. Up to four Glimmerwings, Puddlewisps, Emberwings, Gemwrens and Celestaras can live
  // in it. Go in with Interact; inside, a feeding bench has eight spots for hay: fill them up, and every hungry
  // animal goes over and eats a bundle by itself (pet them and collect their eggs just like at Fluff & Feather)
  var FBARN_COST = 3000, MILL_COST = 2000, SILO_COST = 2500;          // (the barn's, the mill's and the silo's prices, for Oak & Ember's menu: see "Your barn", "Your mill" and "Your silo" below)
  var COOP_COST = 2000, COOP_STALL0 = 3, COOP_CAP = 4, COOP_KINDS = ['glim', 'duck', 'ember', 'gem', 'ostrich'];
  var COOP_NAMES = { glim: 'Glimmerwing', duck: 'Puddlewisp', ember: 'Emberwing', gem: 'Gemwren', ostrich: 'Celestara' };
  var COOP_FC = 5, COOP_FR = 4, COOP_BW = 5.6, COOP_BD = 4.0, COOP_WALL = 2.4, COOP_PEAK = 1.35;   // tiles it takes; its walls' width, depth and height; how high the roof rises
  var COOP_SLOT_Z = [], COOP_NESTS = [];
  for (var cps = 0; cps < 8; cps++) COOP_SLOT_Z.push(-1.435 + cps * 0.41);                       // (the eight spots on the feeding bench)
  for (var cpn = 0; cpn < COOP_CAP; cpn++) COOP_NESTS.push({ x: -1.2 + cpn * 0.8, z: -1.6 });      // (and a nesting box for each animal)
  var coop = { built: false, c: 0, r: 0, fx: 0, fz: 0, x: 0, z: 0, fy: 0, hay: [false, false, false, false, false, false, false, false], res: [], grass: [], solids: [], tp: null, start: 0, stage: -1 };
  var coopDoor = { x: 1e6, z: 1e6 }, coopGroup = null, coopGlows = [], inCoop = false;
  // (a building you've placed can be turned a quarter at a time: o.rot 0 has its door facing south, 1 east, 2 north,
  // 3 west. These turn its own front/back/sides into directions on the farm)
  function bRot(o) { return (o.rot || 0) * Math.PI / 2; }
  function bOff(o, lx, lz) { var a = bRot(o), c = Math.cos(a), sn = Math.sin(a); return { x: lx * c + lz * sn, z: -lx * sn + lz * c }; }
  function bGround(o, lx, lz) { var w = bOff(o, lx, lz); return groundHeight(o.x + w.x, o.z + w.z); }
  function bFC(o, fc, fr) { return (o.rot || 0) % 2 ? fr : fc; }       // (how many tiles across and down it takes, once it's turned)
  function bFR(o, fc, fr) { return (o.rot || 0) % 2 ? fc : fr; }
  function coopFront(d) { var f = bOff(coop, 0, COOP_BD / 2 + d); return { x: coop.x + f.x, z: coop.z + f.z }; }
  function coopCovers(x, z, r) { return coop.built && Math.abs(x - coop.fx) < bFC(coop, COOP_FC, COOP_FR) * TILE / 2 + r && Math.abs(z - coop.fz) < bFR(coop, COOP_FC, COOP_FR) * TILE / 2 + r; }
  var coopBaseSoilNear = soilNear;                                     // nothing grows back under the coop, just as nothing grows back through your soil
  soilNear = function (x, z, r) { return coopBaseSoilNear(x, z, r) || coopCovers(x, z, r); };
  function coopFreeStall() { for (var s = COOP_STALL0; s < COOP_STALL0 + COOP_CAP; s++) if (!glimmers.some(function (g) { return g.stall === s; })) return s; return -1; }
  function coopAnimals() { return glimmers.filter(function (g) { return g.stall >= COOP_STALL0 && g.stall < FBARN_STALL0; }); }
  function coopKindCost(kind) { return kind === 'duck' ? DUCK_COST : kind === 'ember' ? EMBER_COST : kind === 'gem' ? GEM_COST : kind === 'ostrich' ? OST_COST : GLIM_COST; }

  // ===== what it's made of =====
  var coopBoardTex = cpTex(256, 256, function (g, w, h) {             // whitewashed boards, five to a metre, standing upright
    g.fillStyle = '#e8dcc8'; g.fillRect(0, 0, w, h);
    for (var b = 0; b < 5; b++) {
      var x0 = b * w / 5, l = 226 + Math.random() * 18;
      g.fillStyle = 'rgb(' + Math.round(l) + ',' + Math.round(l * 0.965) + ',' + Math.round(l * 0.91) + ')'; g.fillRect(x0 + 2, 0, w / 5 - 4, h);
      for (var s = 0; s < 16; s++) { var gx = x0 + 4 + Math.random() * (w / 5 - 8); g.strokeStyle = 'rgba(150,120,90,' + (0.05 + Math.random() * 0.08) + ')'; g.lineWidth = 0.8 + Math.random(); g.beginPath(); g.moveTo(gx, 0); g.lineTo(gx + (Math.random() - 0.5) * 6, h); g.stroke(); }
      g.fillStyle = 'rgba(110,85,60,0.45)'; g.fillRect(x0, 0, 2, h); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x0 + 2, 0, 1, h);   // (the gap, and a lit edge)
    }
    for (var k = 0; k < 6; k++) { g.fillStyle = 'rgba(130,100,70,0.3)'; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 3, 5, 0, 0, Math.PI * 2); g.fill(); }   // (knots showing through the whitewash)
  }, [1, 1]);
  var coopStrawTex = cpTex(512, 512, function (g, w, h) {             // the floor: planks under a thick scatter of straw
    g.fillStyle = '#8a6440'; g.fillRect(0, 0, w, h);
    for (var p = 0; p < 8; p++) { g.fillStyle = 'rgba(' + (p % 2 ? '70,48,28' : '110,80,50') + ',0.35)'; g.fillRect(0, p * h / 8, w, h / 8 - 2); }
    for (var i = 0; i < 4200; i++) {
      var x = Math.random() * w, y = Math.random() * h, a = Math.random() * Math.PI, l = 8 + Math.random() * 22, lt = 50 + Math.random() * 28;
      g.strokeStyle = 'hsl(' + (38 + Math.random() * 12) + ',' + (50 + Math.random() * 25) + '%,' + lt + '%)'; g.lineWidth = 1 + Math.random() * 1.6;
      cpWrap(w, h, function (ox, oy) { g.beginPath(); g.moveTo(x + ox, y + oy); g.lineTo(x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l); g.stroke(); });
    }
    for (var d = 0; d < 400; d++) { g.fillStyle = 'rgba(60,40,15,' + Math.random() * 0.25 + ')'; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 5, 1); }
  }, [2, 1.5]);
  var coopSignTex = cpTex(512, 176, function (g, w, h) {              // the little painted sign over the door
    var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9dbf9e'); gr.addColorStop(1, '#86aa88'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#f6efe2'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
    g.font = '600 76px Fredoka, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(40,60,40,0.35)'; g.fillText('The Coop', w / 2 + 3, h / 2 + 5); g.fillStyle = '#fffaf0'; g.fillText('The Coop', w / 2, h / 2 + 2);
    [[60, 1], [w - 60, -1]].forEach(function (e) {                   // (an egg either side)
      g.save(); g.translate(e[0], h / 2 + 2); g.rotate(e[1] * 0.25); g.fillStyle = '#fff6e6'; g.beginPath(); g.ellipse(0, 0, 18, 24, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(240,170,200,0.9)'; g.beginPath(); g.ellipse(-5, -6, 4, 3, 0, 0, Math.PI * 2); g.fill(); g.restore();
    });
  });
  var coopBenchTex = cpTex(256, 96, function (g, w, h) {              // the board over the feeding bench
    g.fillStyle = '#5a3c24'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8d2a8'; g.fillRect(6, 6, w - 12, h - 12);
    g.font = '600 30px Fredoka, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#5a3c24'; g.fillText('🌾 Feeding bench 🌾', w / 2, h / 2 + 2);
  });
  var cpmBoard = new THREE.MeshStandardMaterial({ map: coopBoardTex, roughness: 0.85 });
  var cpmBoardIn = new THREE.MeshStandardMaterial({ map: coopBoardTex, color: 0xf2e2c4, roughness: 0.85 });
  var cpmSage = new THREE.MeshStandardMaterial({ color: 0x92b596, roughness: 0.7 });
  var cpmSageDoor = new THREE.MeshStandardMaterial({ map: coopBoardTex, color: 0x9cc29f, roughness: 0.7 });
  var cpmCream = new THREE.MeshStandardMaterial({ color: 0xf6efe2, roughness: 0.7 });
  var cpmDark = new THREE.MeshBasicMaterial({ color: 0x1a120c });
  // (one wall: boards w wide and h tall, rising to a gable peak if it has one, with holes for windows and a notch for a door)
  function coopWall(parent, w, h, peak, holes, door, mat, x, z, ry) {
    var s = new THREE.Shape(); s.moveTo(-w / 2, 0);
    if (door) { s.lineTo(door[0], 0); s.lineTo(door[0], door[2]); s.lineTo(door[1], door[2]); s.lineTo(door[1], 0); }
    s.lineTo(w / 2, 0); s.lineTo(w / 2, h); if (peak) s.lineTo(0, h + peak); s.lineTo(-w / 2, h); s.closePath();
    holes.forEach(function (o) { var p = new THREE.Path(); p.moveTo(o[0], o[2]); p.lineTo(o[1], o[2]); p.lineTo(o[1], o[3]); p.lineTo(o[0], o[3]); p.closePath(); s.holes.push(p); });
    var geo = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false }); geo.translate(0, 0, -0.06);
    var m = new THREE.Mesh(geo, mat); m.position.set(x, 0, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; parent.add(m); return m;
  }
  function coopRoofGeo(G, len, under) {                                // (the two slopes of the roof, the ridge cap, and the boards along its gable edges)
    var run = COOP_BD / 2 + 0.06 + 0.4, a = Math.atan(COOP_PEAK / (COOP_BD / 2 + 0.06)), L = run / Math.cos(a) + 0.04;
    [-1, 1].forEach(function (s) {
      var zc = s * run / 2, yc = COOP_WALL + COOP_PEAK - Math.tan(a) * run / 2;
      cpPart(new THREE.BoxGeometry(len, 0.1, L), cpmShingle, 0, yc + Math.cos(a) * 0.06, zc + s * Math.sin(a) * 0.06, s * a, 0, 0, G);
      if (under) [-1, 1].forEach(function (e) { cpPart(new THREE.BoxGeometry(0.06, 0.18, L), cpmSage, e * (len / 2 + 0.01), yc - Math.cos(a) * 0.02, zc - s * Math.sin(a) * 0.02, s * a, 0, 0, G); });
    });
    cpPart(new THREE.BoxGeometry(len + 0.06, 0.12, 0.3), cpmShingle, 0, COOP_WALL + COOP_PEAK + 0.1, 0, 0, 0, 0, G);
  }

  // ===== the finer details: battens, cedar shakes, stones, flowers =====
  var coopShakeTex = cpTex(64, 128, function (g, w, h) {              // one cedar shake: fine grain running down it, a darker butt end
    g.fillStyle = '#d8c4a8'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 26; i++) { var x = Math.random() * w; g.strokeStyle = 'rgba(90,60,35,' + (0.08 + Math.random() * 0.18) + ')'; g.lineWidth = 0.6 + Math.random() * 1.2; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 2, h * 0.3, x - 2, h * 0.6, x + (Math.random() - 0.5) * 4, h); g.stroke(); }
    var bt = g.createLinearGradient(0, h * 0.75, 0, h); bt.addColorStop(0, 'rgba(60,35,20,0)'); bt.addColorStop(1, 'rgba(60,35,20,0.45)'); g.fillStyle = bt; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(40,25,15,0.5)'; g.fillRect(0, 0, 1.5, h); g.fillRect(w - 1.5, 0, 1.5, h);
  });
  var coopGrimeTex = cpTex(16, 64, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  var coopHeartTex = cpTex(64, 64, function (g, w, h) { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(32, 54); g.bezierCurveTo(4, 34, 8, 8, 32, 22); g.bezierCurveTo(56, 8, 60, 34, 32, 54); g.fill(); });
  var cpmShake = new THREE.MeshStandardMaterial({ map: coopShakeTex, roughness: 0.9 });
  var cpmBatten = new THREE.MeshStandardMaterial({ color: 0xf4ecde, roughness: 0.8 });
  var cpmGrime = new THREE.MeshBasicMaterial({ color: 0x4a3a24, alphaMap: coopGrimeTex, transparent: true, opacity: 0.32, depthWrite: false });
  var cpmCopper = new THREE.MeshStandardMaterial({ color: 0xc08050, metalness: 0.55, roughness: 0.38, side: THREE.DoubleSide });
  var cpmFootStone = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
  var cpmBarrel = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0xb88a5a, roughness: 0.85 });
  var COOP_BOX = new THREE.BoxGeometry(1, 1, 1);
  function coopInst(parent, geo, mat, list, color) {                   // (many small pieces in one batch: each item [x, y, z, rx, ry, rz, sx, sy, sz, colour])
    var im = new THREE.InstancedMesh(geo, mat, list.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3(), c = new THREE.Color();
    list.forEach(function (it, i) { e.set(it[3], it[4], it[5]); q.setFromEuler(e); m4.compose(p.set(it[0], it[1], it[2]), q, s.set(it[6], it[7], it[8])); im.setMatrixAt(i, m4); if (color) im.setColorAt(i, c.set(it[9] === undefined ? 0xffffff : it[9])); });
    im.castShadow = im.receiveShadow = true; parent.add(im); return im;
  }
  // (upright strips along a wall, every so far apart, stopping short of its windows and door: battens outside, studs inside)
  function coopStrips(parent, w, peak, holes, door, x, z, ry, gap, sw, sd, off, mat, bottom, topY) {
    var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g); var list = [];
    var cuts = holes.map(function (o) { return [o[0] - 0.1, o[1] + 0.1, o[2] - 0.1, o[3] + 0.1]; }); if (door) cuts.push([door[0] - 0.1, door[1] + 0.1, -1, door[2] + 0.12]);
    for (var bx = -w / 2 + gap / 2; bx < w / 2 - 0.05; bx += gap) {
      var top = typeof topY === 'function' ? topY(bx) - 0.06 : topY || COOP_WALL + (peak ? peak * (1 - Math.abs(bx) / (w / 2)) : 0) - 0.06, segs = [[bottom, top]];
      cuts.forEach(function (o) { if (bx < o[0] || bx > o[1]) return; var ns = []; segs.forEach(function (sg) { if (o[3] <= sg[0] || o[2] >= sg[1]) ns.push(sg); else { if (o[2] > sg[0]) ns.push([sg[0], o[2]]); if (o[3] < sg[1]) ns.push([o[3], sg[1]]); } }); segs = ns; });
      segs.forEach(function (sg) { if (sg[1] - sg[0] > 0.08) list.push([bx, (sg[0] + sg[1]) / 2, off, 0, 0, 0, sw, sg[1] - sg[0], sd]); });
    }
    coopInst(g, COOP_BOX, mat, list); return g;
  }
  function coopShutter(parent, x, w, h) {                               // (a board shutter with a Z brace and a little heart cut through it)
    var g = new THREE.Group(); g.position.set(x, 0, 0); parent.add(g);
    for (var b = 0; b < 3; b++) cpPart(new THREE.BoxGeometry(w / 3 - 0.008, h, 0.035), cpmSageDoor, -w / 3 + b * w / 3, 0, 0, 0, 0, 0, g);
    [h / 2 - 0.1, -h / 2 + 0.1].forEach(function (y) { cpPart(new THREE.BoxGeometry(w - 0.02, 0.07, 0.02), cpmSage, 0, y, 0.025, 0, 0, 0, g); });
    cpPart(new THREE.BoxGeometry(0.05, Math.hypot(w, h - 0.2) * 0.92, 0.02), cpmSage, 0, 0, 0.025, 0, 0, Math.atan2(w, h - 0.2) * (x < 0 ? 1 : -1), g);
    cpPart(new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0x2a1c12, alphaMap: coopHeartTex, transparent: true, depthWrite: false }), 0, h / 2 - 0.22, 0.04, 0, 0, 0, g).castShadow = false;
    [h / 2 - 0.1, -h / 2 + 0.1].forEach(function (y) { cpPart(new THREE.BoxGeometry(0.1, 0.025, 0.012), cpmIron, (x < 0 ? 1 : -1) * (w / 2 - 0.05), y, 0.04, 0, 0, 0, g); });   // (hinges)
    return g;
  }
  function coopFlowers(parent, pts, seed) {                            // (little clumps of cottage flowers: leafy mounds, stems, and five-petalled blooms with golden hearts)
    var leaves = [], stems = [], petals = [], hearts = [], cols = [0xf4a6c8, 0xfff2e0, 0xc8a8f0, 0xffb08a, 0xf8d860, 0xe87aa8];
    pts.forEach(function (pt, k) {
      for (var l = 0; l < 7; l++) { var a = isle2Hash(seed + k * 13 + l) * 6.28, r = 0.04 + isle2Hash(seed + k * 7 + l * 3) * 0.12; leaves.push([pt[0] + Math.cos(a) * r, pt[1] + 0.05, pt[2] + Math.sin(a) * r, 0.3, a, 0.2, 0.09, 0.06, 0.05, 0x5f9a48 + (l % 3) * 0x060a04]); }
      for (var f = 0; f < 5; f++) {
        var fa = isle2Hash(seed + k * 31 + f) * 6.28, fr = isle2Hash(seed + k * 17 + f * 5) * 0.12, fx = pt[0] + Math.cos(fa) * fr, fz = pt[2] + Math.sin(fa) * fr, fh = 0.16 + isle2Hash(seed + k + f * 9) * 0.18, col = cols[Math.floor(isle2Hash(seed * 3 + k * 5 + f) * cols.length)];
        stems.push([fx, pt[1] + fh / 2, fz, 0, 0, (isle2Hash(seed + f) - 0.5) * 0.3, 0.008, fh, 0.008, 0x4a7a38]);
        for (var p = 0; p < 5; p++) { var pa = p / 5 * 6.28; petals.push([fx + Math.cos(pa) * 0.022, pt[1] + fh, fz + Math.sin(pa) * 0.022, 0.15, -pa, 0, 0.024, 0.008, 0.016, col]); }
        hearts.push([fx, pt[1] + fh + 0.006, fz, 0, 0, 0, 0.013, 0.01, 0.013, 0xf0b830]);
      }
    });
    var sph = new THREE.SphereGeometry(1, 8, 6), mat = new THREE.MeshStandardMaterial({ roughness: 0.75 });
    coopInst(parent, sph, mat, leaves, true); coopInst(parent, COOP_BOX, mat, stems, true); coopInst(parent, sph, mat, petals, true); coopInst(parent, sph, mat, hearts, true);
  }
  function coopBarrel(parent, x, y, z, r, h, open) {                    // (a stave barrel with iron hoops)
    var g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
    var pts = []; for (var i = 0; i <= 8; i++) { var t = i / 8; pts.push(new THREE.Vector2(r * (0.88 + Math.sin(t * Math.PI) * 0.12), t * h)); }
    cpPart(new THREE.LatheGeometry(pts, 24), cpmBarrel, 0, 0, 0, 0, 0, 0, g);
    for (var s = 0; s < 12; s++) { var a = s / 12 * Math.PI * 2; cpPart(new THREE.BoxGeometry(0.006, h * 0.98, 0.01), cpmPlankDark, Math.cos(a) * r * 0.99, h / 2, Math.sin(a) * r * 0.99, 0, -a, 0, g); }
    [0.12, 0.5, 0.88].forEach(function (f) { var rr = r * (0.88 + Math.sin(f * Math.PI) * 0.12) + 0.008; cpPart(new THREE.TorusGeometry(rr, 0.012, 6, 28), cpmIron, 0, f * h, 0, Math.PI / 2, 0, 0, g); });
    cpPart(new THREE.CircleGeometry(r * 0.86, 24), open ? new THREE.MeshStandardMaterial({ color: 0x5a7a8a, roughness: 0.1, metalness: 0.2 }) : cpmBarrel, 0, h * (open ? 0.92 : 0.99), 0, -Math.PI / 2, 0, 0, g);
    return g;
  }

  // ===== outside: built where you choose =====
  function coopBuildOutside() {
    var G = new THREE.Group(), W2 = COOP_BW / 2, D2 = COOP_BD / 2, H = COOP_WALL; coopGlows = [];
    G.position.set(coop.x, coop.fy, coop.z); G.rotation.y = bRot(coop);
    function gy(lx, lz) { return bGround(coop, lx, lz) - coop.fy; }   // (the ground, measured from the coop's floor)
    var minG = 99; for (var gx = -1; gx <= 1; gx++) for (var gz = -1; gz <= 1; gz++) minG = Math.min(minG, gy(gx * (W2 + 0.3), gz * (D2 + 0.3)));
    var fh = -minG + 0.3;
    // (a footing of rough fieldstones, mortared, under the sill)
    cpPart(new THREE.BoxGeometry(COOP_BW + 0.16, fh, COOP_BD + 0.16), new THREE.MeshStandardMaterial({ color: 0x6e6a62, roughness: 1 }), 0, -fh / 2 - 0.02, 0, 0, 0, 0, G);
    var stones = [], n = 0;
    [[0, D2 + 0.1, COOP_BW + 0.3, 0], [0, -D2 - 0.1, COOP_BW + 0.3, 0], [W2 + 0.1, 0, COOP_BD + 0.3, Math.PI / 2], [-W2 - 0.1, 0, COOP_BD + 0.3, Math.PI / 2]].forEach(function (sd) {
      for (var row = 0, y = -0.11; y > -fh - 0.05; y -= 0.19, row++) for (var u = -sd[2] / 2 + (row % 2) * 0.17; u < sd[2] / 2; n++) {
        var sw = 0.24 + isle2Hash(n * 1.7 + 3) * 0.2, k = 0.4 + isle2Hash(n * 2.3) * 0.22, c = new THREE.Color().setRGB(k * 1.02, k * 0.97, k * 0.88);
        var along = Math.min(u + sw / 2, sd[2] / 2 - 0.05);
        stones.push([sd[0] + (sd[3] ? 0 : along), y + (isle2Hash(n) - 0.5) * 0.02, sd[1] + (sd[3] ? along : 0), (isle2Hash(n * 3) - 0.5) * 0.08, sd[3] + (isle2Hash(n * 5) - 0.5) * 0.06, (isle2Hash(n * 7) - 0.5) * 0.08, sw - 0.025, 0.16 + isle2Hash(n * 9) * 0.04, 0.1 + isle2Hash(n * 11) * 0.06, c.getHex()]);
        u += sw;
      }
    });
    coopInst(G, new THREE.DodecahedronGeometry(0.5, 1), cpmFootStone, stones, true);
    // (the four walls: the front with its door and two windows, the back with two little ones, a gable each side)
    var FH = [[-2.15, -1.15, 1.02, 1.78], [1.15, 2.15, 1.02, 1.78]], BH = [[-1.8, -1.0, 1.2, 1.8], [1.0, 1.8, 1.2, 1.8]], LH = [[-0.5, 0.5, 1.02, 1.78]], DOOR = [-0.52, 0.52, 1.92];
    coopWall(G, COOP_BW, H, 0, FH, DOOR, cpmBoard, 0, D2, 0);
    coopWall(G, COOP_BW, H, 0, BH, null, cpmBoard, 0, -D2, Math.PI);
    coopWall(G, COOP_BD + 0.12, H, COOP_PEAK, LH, null, cpmBoard, -W2, 0, -Math.PI / 2);
    coopWall(G, COOP_BD + 0.12, H, COOP_PEAK, [], null, cpmBoard, W2, 0, Math.PI / 2);
    // (battens over the joins between the boards)
    coopStrips(G, COOP_BW, 0, FH, DOOR, 0, D2, 0, 0.4, 0.06, 0.025, 0.07, cpmBatten, 0.14);
    coopStrips(G, COOP_BW, 0, BH, null, 0, -D2, Math.PI, 0.4, 0.06, 0.025, 0.07, cpmBatten, 0.14);
    coopStrips(G, COOP_BD, COOP_PEAK, LH.concat([[-0.36, 0.36, 2.85, 3.4]]), null, -W2, 0, -Math.PI / 2, 0.4, 0.06, 0.025, 0.07, cpmBatten, 0.14);
    coopStrips(G, COOP_BD, COOP_PEAK, [[-0.95, 0.95, 0.5, 1.25], [-0.36, 0.36, 2.85, 3.4]], null, W2, 0, Math.PI / 2, 0.4, 0.06, 0.025, 0.07, cpmBatten, 0.14);
    // (a little grime splashed up along the bottom of the walls)
    [[0, D2 + 0.064, COOP_BW, 0], [0, -D2 - 0.064, COOP_BW, Math.PI], [-W2 - 0.064, 0, COOP_BD + 0.1, -Math.PI / 2], [W2 + 0.064, 0, COOP_BD + 0.1, Math.PI / 2]].forEach(function (b) { var gm = cpPart(new THREE.PlaneGeometry(b[2], 0.45), cpmGrime, b[0], 0.225, b[1], 0, b[3], 0, G); gm.castShadow = false; gm.receiveShadow = false; gm.renderOrder = 1; });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { cpPart(new THREE.BoxGeometry(0.16, H, 0.16), cpmSage, c[0] * (W2 + 0.04), H / 2, c[1] * (D2 + 0.04), 0, 0, 0, G); });   // (corner boards)
    [[0, D2 + 0.07, COOP_BW, 0], [0, -D2 - 0.07, COOP_BW, 0], [W2 + 0.07, 0, COOP_BD, Math.PI / 2], [-W2 - 0.07, 0, COOP_BD, Math.PI / 2]].forEach(function (b) { cpPart(new THREE.BoxGeometry(b[2], 0.14, 0.03), cpmSage, b[0], 0.07, b[1], 0, b[3], 0, G); });   // (a skirting board)
    [[0, D2 + 0.08, COOP_BW, 0], [0, -D2 - 0.08, COOP_BW, 0]].forEach(function (b) { cpPart(new THREE.BoxGeometry(b[2] + 0.2, 0.14, 0.05), cpmSage, b[0], H - 0.07, b[1], 0, b[3], 0, G); });   // (and a board under the eaves)
    // (the roof: rows of cedar shakes over boards, a ridge cap, rafter tails under the eaves, and copper gutters)
    var run = D2 + 0.06 + 0.4, a = Math.atan(COOP_PEAK / (D2 + 0.06)), L = run / Math.cos(a) + 0.04, len = COOP_BW + 0.72, ridgeY = H + COOP_PEAK;
    var shakes = [];
    [-1, 1].forEach(function (s) {
      var zc = s * run / 2, yc = ridgeY - Math.tan(a) * run / 2;
      cpPart(new THREE.BoxGeometry(len, 0.08, L), new THREE.MeshStandardMaterial({ color: 0x5a3e28, roughness: 0.9 }), 0, yc + Math.cos(a) * 0.05, zc + s * Math.sin(a) * 0.05, s * a, 0, 0, G);
      [-1, 1].forEach(function (e) { cpPart(new THREE.BoxGeometry(0.06, 0.2, L), cpmSage, e * (len / 2 + 0.01), yc - Math.cos(a) * 0.03, zc - s * Math.sin(a) * 0.03, s * a, 0, 0, G); });
      for (var r = 0, d = L - 0.02; d > 0.12; d -= 0.19, r++) {          // (rows from the eave up to the ridge, each overlapping the one below)
        var off = 0.105 + (r % 2) * 0.004, cz = s * (d - 0.15) * Math.cos(a), cy = ridgeY - (d - 0.15) * Math.sin(a);
        for (var x = -len / 2 + (r % 2 ? 0.12 : 0), k = 0; x < len / 2 - 0.02; k++) {
          var sw = 0.17 + isle2Hash(r * 37 + k * 3.1 + s) * 0.16, xw = Math.min(sw, len / 2 - x), tone = 0.62 + isle2Hash(r * 11 + k * 5.7 + s * 3) * 0.38, grey = isle2Hash(r * 7 + k * 13) < 0.12;
          var c = grey ? new THREE.Color(0.56, 0.52, 0.48).multiplyScalar(tone + 0.1) : new THREE.Color(0.6, 0.4, 0.27).multiplyScalar(tone);
          shakes.push([x + xw / 2, cy + Math.cos(a) * off, cz + s * Math.sin(a) * off, s * (a - 0.05), 0, (isle2Hash(r + k * 2.2) - 0.5) * 0.03, xw - 0.014, 0.022, 0.32, c.getHex()]);
          x += xw;
        }
      }
      for (var rt = -W2; rt <= W2 + 0.01; rt += 0.56) cpPart(new THREE.BoxGeometry(0.06, 0.1, 0.42), new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.8 }), rt, H - 0.02 - Math.tan(a) * 0.2 + 0.02, s * (D2 + 0.24), s * a, 0, 0, G);   // (rafter tails)
      cpPart(new THREE.CylinderGeometry(0.065, 0.065, len - 0.1, 14, 1, true, 0, Math.PI), cpmCopper, 0, ridgeY - Math.tan(a) * run + 0.02, s * (run + 0.05), 0, 0, -Math.PI / 2, G);
      [-1, 1].forEach(function (e) { cpPart(new THREE.CircleGeometry(0.065, 12, Math.PI, Math.PI), cpmCopper, e * (len / 2 - 0.05), ridgeY - Math.tan(a) * run + 0.02, s * (run + 0.05), 0, Math.PI / 2, 0, G); });
    });
    coopInst(G, COOP_BOX, cpmShake, shakes, true);
    [-1, 1].forEach(function (s) { cpPart(new THREE.BoxGeometry(len + 0.04, 0.035, 0.2), new THREE.MeshStandardMaterial({ color: 0x6a4630, roughness: 0.85 }), 0, ridgeY + 0.14 - 0.035, s * 0.08, s * a, 0, 0, G); });   // (the ridge cap: two boards meeting over the top)
    // (a copper downpipe at the front corner, into a rain barrel)
    var gutY = ridgeY - Math.tan(a) * run + 0.02, bY = gy(-2.85, 2.5);
    cpPart(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 10), cpmCopper, -2.85, gutY - 0.12, run + 0.02, -0.5, 0, 0, G);
    cpPart(new THREE.CylinderGeometry(0.035, 0.035, gutY - 0.2 - (bY + 0.82), 10), cpmCopper, -2.85, (gutY - 0.24 + bY + 0.82) / 2, 2.52, 0, 0, 0, G);
    coopBarrel(G, -2.85, bY, 2.5, 0.27, 0.78, true);
    // (a little cupola on the ridge with louvred sides and a pointed roof, and the weathervane on top of it)
    var CU = new THREE.Group(); CU.position.set(-1.25, ridgeY - 0.12, 0); G.add(CU);
    cpPart(new THREE.BoxGeometry(0.66, 0.55, 0.66), cpmBoard, 0, 0.27, 0, 0, 0, 0, CU);
    [[0, 0.335], [0, -0.335], [0.335, 0], [-0.335, 0]].forEach(function (f) {
      var ry = Math.atan2(f[0], f[1]), FG = new THREE.Group(); FG.position.set(f[0], 0.62, f[1]); FG.rotation.y = ry; CU.add(FG);
      cpPart(new THREE.PlaneGeometry(0.46, 0.34), cpmDark, 0, 0, 0.0, 0, 0, 0, FG).castShadow = false;
      for (var l = 0; l < 5; l++) cpPart(new THREE.BoxGeometry(0.46, 0.05, 0.012), cpmCream, 0, -0.13 + l * 0.065, 0.02, -0.6, 0, 0, FG);
    });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { cpPart(new THREE.BoxGeometry(0.07, 0.42, 0.07), cpmSage, c[0] * 0.31, 0.62, c[1] * 0.31, 0, 0, 0, CU); });
    cpPart(new THREE.BoxGeometry(0.74, 0.05, 0.74), cpmSage, 0, 0.84, 0, 0, 0, 0, CU);
    cpPart(new THREE.ConeGeometry(0.58, 0.45, 4, 1), cpmShingle, 0, 1.09, 0, 0, Math.PI / 4, 0, CU);
    cpPart(new THREE.SphereGeometry(0.04, 10, 8), cpmCopper, 0, 1.33, 0, 0, 0, 0, CU);
    var WV = new THREE.Group(); WV.position.set(0, 1.35, 0); CU.add(WV);
    cpPart(new THREE.CylinderGeometry(0.014, 0.018, 0.55, 8), cpmIron, 0, 0.27, 0, 0, 0, 0, WV);
    cpPart(new THREE.BoxGeometry(0.34, 0.012, 0.012), cpmIron, 0, 0.2, 0, 0, 0, 0, WV); cpPart(new THREE.BoxGeometry(0.012, 0.012, 0.34), cpmIron, 0, 0.2, 0, 0, 0, 0, WV);
    var spin = new THREE.Group(); spin.position.y = 0.52; WV.add(spin); G.userData.vane = spin;
    cpPart(new THREE.BoxGeometry(0.6, 0.02, 0.02), cpmIron, 0, 0, 0, 0, 0, 0, spin); cpPart(new THREE.ConeGeometry(0.04, 0.1, 6), cpmIron, 0.32, 0, 0, 0, 0, -Math.PI / 2, spin);
    var fin = new THREE.Shape(); fin.moveTo(-0.3, 0); fin.lineTo(-0.2, 0.07); fin.lineTo(-0.2, -0.07); fin.closePath(); cpPart(new THREE.ShapeGeometry(fin), cpmIron, 0, 0, 0, 0, 0, 0, spin).material.side = THREE.DoubleSide;
    var hen = new THREE.Shape(); hen.moveTo(-0.2, 0.02); hen.quadraticCurveTo(-0.05, -0.04, 0.12, 0.04); hen.quadraticCurveTo(0.2, 0.1, 0.19, 0.2); hen.lineTo(0.25, 0.23); hen.lineTo(0.19, 0.26);
    hen.quadraticCurveTo(0.2, 0.33, 0.15, 0.34); hen.quadraticCurveTo(0.1, 0.32, 0.11, 0.24); hen.quadraticCurveTo(0.06, 0.15, -0.06, 0.15); hen.quadraticCurveTo(-0.16, 0.35, -0.27, 0.3); hen.quadraticCurveTo(-0.22, 0.18, -0.2, 0.02);
    var henGeo = new THREE.ExtrudeGeometry(hen, { depth: 0.015, bevelEnabled: false }); henGeo.translate(0, 0, -0.0075);
    cpPart(henGeo, cpmIron, 0, 0.04, 0, 0, 0, 0, spin); cpPart(new THREE.BoxGeometry(0.01, 0.06, 0.01), cpmIron, 0, 0.02, 0, 0, 0, 0, spin);
    // (louvred vents high in each gable)
    [-1, 1].forEach(function (s) {
      var V = new THREE.Group(); V.position.set(s * (W2 + 0.085), H + 0.72, 0); V.rotation.y = s * Math.PI / 2; G.add(V);
      var tri = new THREE.Shape(); tri.moveTo(-0.32, -0.2); tri.lineTo(0.32, -0.2); tri.lineTo(0, 0.22); tri.closePath();
      cpPart(new THREE.ShapeGeometry(tri), cpmDark, 0, 0, 0, 0, 0, 0, V).castShadow = false;
      for (var l = 0; l < 4; l++) { var lw = 0.56 * (1 - l / 4.2); cpPart(new THREE.BoxGeometry(lw, 0.05, 0.012), cpmCream, 0, -0.16 + l * 0.095, 0.02, -0.6, 0, 0, V); }
      [[-0.17, 0.0, 0.07, 0.5, -0.83], [0.17, 0.0, 0.07, 0.5, 0.83]].forEach(function (b) { cpPart(new THREE.BoxGeometry(b[2], b[3], 0.03), cpmCream, b[0], b[1], 0.02, 0, 0, b[4], V); });
      cpPart(new THREE.BoxGeometry(0.72, 0.06, 0.03), cpmCream, 0, -0.22, 0.02, 0, 0, 0, V);
    });
    // (windows with flower boxes, as at Oak & Ember, and board shutters beside them)
    [[-1.65, 1.4, D2 + 0.07, 0, 1.0, 0.76], [1.65, 1.4, D2 + 0.07, 0, 1.0, 0.76], [-1.4, 1.5, -D2 - 0.07, Math.PI, 0.8, 0.6], [1.4, 1.5, -D2 - 0.07, Math.PI, 0.8, 0.6], [-W2 - 0.07, 1.4, 0, -Math.PI / 2, 1.0, 0.76]].forEach(function (wd) {
      var wg = carpWindow(G, wd[0], wd[1], wd[2], wd[3], wd[4], wd[5], false), sw = wd[4] * 0.38;
      [-1, 1].forEach(function (e) { var sh = coopShutter(wg, e * (wd[4] / 2 + 0.07 + sw / 2), sw, wd[5] + 0.18); sh.position.z = 0.03; sh.rotation.y = e * 0.1; });
    });
    // (the door: sage-green boards with a Z brace, a little heart cut in it, long strap hinges, a ring pull, white trim round it, and a horseshoe over it for luck)
    var DR = new THREE.Group(); DR.position.set(0, 0, D2 + 0.02); G.add(DR);
    for (var db = 0; db < 5; db++) cpPart(new THREE.BoxGeometry(0.2, 1.9, 0.06), cpmSageDoor, -0.408 + db * 0.204, 0.95, 0, 0, 0, 0, DR);
    [[0, 1.62, 0], [0, 0.3, 0]].forEach(function (b) { cpPart(new THREE.BoxGeometry(0.92, 0.12, 0.04), cpmSage, b[0], b[1], 0.045, 0, 0, b[2], DR); });
    cpPart(new THREE.BoxGeometry(0.1, 1.48, 0.04), cpmSage, 0, 0.96, 0.045, 0, 0, -0.62, DR);
    var heart = new THREE.Shape(); heart.moveTo(0, -0.07); heart.bezierCurveTo(-0.12, 0.0, -0.08, 0.1, 0, 0.05); heart.bezierCurveTo(0.08, 0.1, 0.12, 0.0, 0, -0.07);
    cpPart(new THREE.ShapeGeometry(heart), cpmDark, 0, 1.36, 0.068, 0, 0, 0, DR).castShadow = false;
    [0.3, 1.62].forEach(function (y) {
      cpPart(new THREE.BoxGeometry(0.62, 0.05, 0.012), cpmIron, -0.2, y, 0.075, 0, 0, 0, DR); cpPart(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 14), cpmIron, 0.11, y, 0.075, Math.PI / 2, 0, 0, DR);
      for (var bt = 0; bt < 4; bt++) cpPart(new THREE.SphereGeometry(0.011, 6, 4), cpmIron, -0.46 + bt * 0.16, y, 0.083, 0, 0, 0, DR);
      cpPart(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 8), cpmIron, -0.53, y, 0.03, 0, 0, 0, DR);
    });
    cpPart(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12), cpmIron, 0.36, 1.0, 0.075, Math.PI / 2, 0, 0, DR); cpPart(new THREE.TorusGeometry(0.055, 0.009, 6, 18), cpmIron, 0.36, 0.95, 0.09, 0, 0, 0, DR);
    [[-0.58, 0.97, 0.1, 1.94], [0.58, 0.97, 0.1, 1.94], [0, 1.97, 1.26, 0.1]].forEach(function (t) { cpPart(new THREE.BoxGeometry(t[2], t[3], 0.05), cpmCream, t[0], t[1], 0.03, 0, 0, 0, DR); });
    cpPart(new THREE.TorusGeometry(0.075, 0.016, 6, 20, Math.PI * 1.3), cpmIron, 0, 2.18, 0.07, 0, 0, -Math.PI * 0.15 - Math.PI, DR);
    // (a plank ramp with little cleats and a handrail of sorts, down to the ground)
    var gyR = gy(0, D2 + 0.95), rl = Math.hypot(0.95, gyR), ra = Math.atan2(-gyR, 0.95);
    var RP = new THREE.Group(); RP.position.set(0, gyR / 2 - 0.02, D2 + 0.08 + 0.475); RP.rotation.x = ra; G.add(RP);
    for (var rb = 0; rb < 5; rb++) cpPart(new THREE.BoxGeometry(0.215, 0.06, rl), cpmPlank, -0.44 + rb * 0.22, 0, 0, 0, 0, 0, RP);
    for (var cl = -rl / 2 + 0.15; cl < rl / 2; cl += 0.2) cpPart(new THREE.BoxGeometry(1.0, 0.025, 0.035), cpmPlankDark, 0, 0.04, cl, 0, 0, 0, RP);
    [-0.6, 0.6].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.05, 0.1, rl), cpmPlankDark, x, 0.02, 0, 0, 0, 0, RP); });
    // (a little pop hole for the birds, with a sliding door held up on a cord, and its own tiny ramp)
    cpPart(new THREE.PlaneGeometry(0.36, 0.4), cpmDark, 1.65, 0.24, D2 + 0.065, 0, 0, 0, G).castShadow = false;
    [[1.45, 0.24, 0.05, 0.48], [1.85, 0.24, 0.05, 0.48], [1.65, 0.47, 0.46, 0.06]].forEach(function (t) { cpPart(new THREE.BoxGeometry(t[2], t[3], 0.04), cpmCream, t[0], t[1], D2 + 0.08, 0, 0, 0, G); });
    cpPart(new THREE.BoxGeometry(0.4, 0.38, 0.025), cpmSageDoor, 1.65, 0.69, D2 + 0.1, 0, 0, 0, G);
    cpPart(new THREE.CylinderGeometry(0.004, 0.004, 0.75, 4), new THREE.MeshStandardMaterial({ color: 0xc8a878 }), 1.65, 1.25, D2 + 0.1, 0, 0, 0, G);
    var gyP = gy(1.65, D2 + 0.5), pl = Math.hypot(0.45, gyP - 0.04), pa = Math.atan2(0.04 - gyP, 0.45);
    cpPart(new THREE.BoxGeometry(0.32, 0.03, pl), cpmPlank, 1.65, (0.04 + gyP) / 2, D2 + 0.08 + 0.225, pa, 0, 0, G);
    for (var pc = 0; pc < 3; pc++) cpPart(new THREE.BoxGeometry(0.3, 0.015, 0.02), cpmPlankDark, 1.65, 0.04 + (gyP - 0.04) * (0.25 + pc * 0.25) + 0.02, D2 + 0.08 + 0.45 * (0.25 + pc * 0.25), pa, 0, 0, G);
    // (a nesting box built out from the right-hand wall: shingled lid on strap hinges, a latch, and brackets under it)
    var NB = new THREE.Group(); NB.position.set(W2 + 0.06, 0, 0); G.add(NB);
    cpPart(new THREE.BoxGeometry(0.5, 0.55, 1.7), cpmBoard, 0.25, 0.85, 0, 0, 0, 0, NB);
    coopStrips(NB, 1.7, 0, [], null, 0.505, 0, Math.PI / 2, 0.34, 0.05, 0.02, 0.0, cpmBatten, 0.6, 1.1);
    [[0.5, 0.585, 1.74, 0.06], [0.5, 1.115, 1.74, 0.06]].forEach(function (t) { cpPart(new THREE.BoxGeometry(0.03, t[3], t[2]), cpmSage, t[0] + 0.01, t[1], 0, 0, 0, 0, NB); });
    var LID = new THREE.Group(); LID.position.set(0.3, 1.18, 0); LID.rotation.z = -0.3; NB.add(LID);
    cpPart(new THREE.BoxGeometry(0.66, 0.04, 1.86), new THREE.MeshStandardMaterial({ color: 0x5a3e28 }), 0, 0, 0, 0, 0, 0, LID);
    var lidShakes = []; for (var lr = 0; lr < 3; lr++) for (var lz = -0.92 + (lr % 2) * 0.1, lk = 0; lz < 0.92; lk++) { var lw = 0.16 + isle2Hash(lr * 9 + lk) * 0.12, lt = 0.65 + isle2Hash(lr + lk * 3) * 0.35; lidShakes.push([0.26 - lr * 0.2, 0.035, Math.min(lz + lw / 2, 0.9), 0, 0, -0.05, 0.26, 0.02, Math.min(lw, 0.92 - lz) - 0.012, new THREE.Color(0.6, 0.4, 0.27).multiplyScalar(lt).getHex()]); lz += lw; }
    coopInst(LID, COOP_BOX, cpmShake, lidShakes, true);
    [-0.5, 0.5].forEach(function (z) { cpPart(new THREE.BoxGeometry(0.3, 0.012, 0.045), cpmIron, -0.17, 0.03, z, 0, 0, 0, LID); });
    cpPart(new THREE.BoxGeometry(0.02, 0.1, 0.04), cpmIron, 0.52, 1.02, 0, 0, 0, 0, NB); cpPart(new THREE.TorusGeometry(0.02, 0.005, 5, 10), cpmIron, 0.53, 0.95, 0, 0, Math.PI / 2, 0, NB);
    [-0.7, 0.7].forEach(function (z) { var br = new THREE.Shape(); br.moveTo(0, 0); br.lineTo(0.42, 0); br.lineTo(0, -0.4); br.closePath(); var bg = new THREE.ExtrudeGeometry(br, { depth: 0.05, bevelEnabled: false }); bg.translate(0, 0, -0.025); cpPart(bg, cpmSage, 0.02, 0.575, z, 0, 0, 0, NB); });
    // (a painted sign on two posts beside the ramp, a lantern on a curly bracket by the door)
    var SG = new THREE.Group(), sgY = gy(2.45, D2 + 0.75); SG.position.set(2.45, sgY, D2 + 0.75); SG.rotation.y = -0.2; G.add(SG);
    [-0.42, 0.42].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.07, 0.95, 0.07), cpmPlankDark, x, 0.47, -0.02, 0, 0, 0, SG); cpPart(new THREE.ConeGeometry(0.05, 0.07, 4), cpmPlankDark, x, 0.98, -0.02, 0, Math.PI / 4, 0, SG); });
    cpPart(new THREE.BoxGeometry(1.08, 0.4, 0.04), cpmPlankDark, 0, 0.75, 0, 0, 0, 0, SG);
    cpPart(new THREE.PlaneGeometry(1.0, 0.34), new THREE.MeshStandardMaterial({ map: coopSignTex, roughness: 0.7 }), 0, 0.75, 0.022, 0, 0, 0, SG).castShadow = false;
    coopFlowers(SG, [[-0.3, 0, 0.12], [0.3, 0, 0.14]], 51);
    cpPart(new THREE.BoxGeometry(0.05, 0.05, 0.22), cpmIron, 0.8, 1.86, D2 + 0.12, 0, 0, 0, G);
    cpPart(new THREE.TorusGeometry(0.06, 0.01, 6, 16, Math.PI * 1.5), cpmIron, 0.8, 1.8, D2 + 0.12, 0, Math.PI / 2, 0, G);
    cpLantern(G, 0.8, 1.68, D2 + 0.24, coopGlows);
    // (flowers along the foot of the walls)
    var bed = []; [-2.45, -2.15, -1.25, -0.95, 0.8, 1.1, 2.15, 2.5].forEach(function (x) { bed.push([x, gy(x, D2 + 0.22), D2 + 0.22]); });
    [-1.6, -1.1, -0.6, 0.6, 1.1, 1.6].forEach(function (z) { bed.push([-W2 - 0.22, gy(-W2 - 0.22, z), z]); });
    coopFlowers(G, bed, 7);
    // (a hay bale with a pitchfork leaning on it, and a bucket)
    var bale = pickupModel('hay'); bale.scale.setScalar(2.6); bale.position.set(-1.75, gy(-1.75, 2.62) + 0.22, 2.62); bale.rotation.y = 0.15; G.add(bale);
    bale.traverse(function (o) { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
    var PF = new THREE.Group(); PF.position.set(-1.35, gy(-1.35, 2.55), 2.55); PF.rotation.set(0, 0.4, 0.32); G.add(PF);
    cpPart(new THREE.CylinderGeometry(0.016, 0.018, 1.3, 8), cpmBarrel, 0, 0.65, 0, 0, 0, 0, PF);
    cpPart(new THREE.BoxGeometry(0.16, 0.02, 0.02), cpmIron, 0, 1.3, 0, 0, 0, 0, PF);
    [-0.07, 0, 0.07].forEach(function (x) { cpPart(new THREE.CylinderGeometry(0.006, 0.003, 0.26, 5), cpmIron, x, 1.43, 0, 0, 0, 0, PF); });
    var bk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.22, 14, 1, true), cpmSteel); bk.position.set(-0.95, gy(-0.95, 2.78) + 0.11, 2.78); bk.castShadow = true; G.add(bk);
    cpPart(new THREE.TorusGeometry(0.12, 0.006, 5, 16, Math.PI), cpmIron, -0.95, gy(-0.95, 2.78) + 0.22, 2.78, 0, 0.3, 0, G);
    cpPart(new THREE.CircleGeometry(0.1, 14), cpmSteel, -0.95, gy(-0.95, 2.78) + 0.005, 2.78, -Math.PI / 2, 0, 0, G);
    scene.add(G);
    return G;
  }
  function updateCoopOutside(t, night) {
    if (!coopGroup || !coopGroup.userData.vane) return;   // (not while it's still a building site)
    coopGlows.forEach(function (L) { var fl = 1 + Math.sin(t * 11 + L.p) * 0.1 + Math.sin(t * 6.7 + L.p * 2) * 0.07; L.f.scale.set(fl, 1.5 * fl, fl); L.h.material.opacity = (0.25 + night * 0.5) * fl; });
    coopGroup.userData.vane.rotation.y = Math.sin(t * 0.21) * 0.9 + Math.sin(t * 0.63) * 0.25;   // (the hen turns with the breeze)
  }

  // ===== inside =====
  var coopScene = new THREE.Scene(); coopScene.background = new THREE.Color(0x1c1410);
  var COI_X = 800, COI_Z = 1000, COI_EXIT_Z = COOP_BD / 2 - 0.6;
  var coopRoom = new THREE.Group(); coopRoom.position.set(COI_X, 0, COI_Z); coopScene.add(coopRoom);
  coopScene.add(new THREE.HemisphereLight(0xfff0d8, 0x6a5440, 0.6));
  var coSun = new THREE.DirectionalLight(0xffe6c0, 0.5); coSun.position.set(COI_X - 4, 8, COI_Z + 5); coSun.target.position.set(COI_X, 0, COI_Z); coSun.castShadow = true; coSun.shadow.mapSize.set(1024, 1024);
  coSun.shadow.camera.left = -5; coSun.shadow.camera.right = 5; coSun.shadow.camera.top = 4; coSun.shadow.camera.bottom = -4; coSun.shadow.bias = -0.0006; coopScene.add(coSun); coopScene.add(coSun.target);
  var coLamp = new THREE.PointLight(0xffc888, 0.6, 9); coLamp.position.set(COI_X, 2.0, COI_Z); coopScene.add(coLamp);
  var coopSolids = [], coopInGlows = [], coopWalls = [], coopHayMeshes = [];
  for (var csl = COOP_STALL0; csl < COOP_STALL0 + COOP_CAP; csl++) abStallSlates[csl] = new THREE.MeshStandardMaterial({ map: abSlateTex, roughness: 0.95 });   // (a name slate over each nesting box)
  function coopInWindow(parent, x, y, z, ry, w, h) {                   // (a window from the inside: the real island through the glass, a frame and a sill)
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
    cpPart(new THREE.PlaneGeometry(w, h), siWindowMask, 0, 0, 0, 0, 0, 0, g).castShadow = false;
    [[0, h / 2 + 0.04, w + 0.2, 0.08], [0, -h / 2 - 0.04, w + 0.26, 0.08], [w / 2 + 0.04, 0, 0.08, h], [-w / 2 - 0.04, 0, 0.08, h], [0, 0, w, 0.03], [0, 0, 0.03, h]].forEach(function (f) { cpPart(new THREE.BoxGeometry(f[2], f[3], 0.06), cpmCream, f[0], f[1], 0.02, 0, 0, 0, g); });
    cpPart(new THREE.BoxGeometry(w + 0.3, 0.04, 0.14), cpmCream, 0, -h / 2 - 0.08, 0.06, 0, 0, 0, g);
    return g;
  }
  (function (R) {
    var W2 = COOP_BW / 2, D2 = COOP_BD / 2, H = COOP_WALL;
    function put(geo, m, x, y, z, rx, ry, rz, p) { return cpPart(geo, m, x, y, z, rx, ry, rz, p || R); }
    var mOld = new THREE.MeshStandardMaterial({ color: 0x7a5a3c, roughness: 0.85 }), mWood = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0xc89c6c, roughness: 0.8 });
    put(new THREE.PlaneGeometry(COOP_BW, COOP_BD), new THREE.MeshStandardMaterial({ map: coopStrawTex, roughness: 1 }), 0, 0.001, 0, -Math.PI / 2, 0, 0).castShadow = false;
    // (the four walls, each stepping aside when it's between you and the camera)
    function wall(w, peak, holes, door, x, z, ry, n, d) { var g = new THREE.Group(); R.add(g); coopWall(g, w, H, peak, holes, door, cpmBoardIn, x, z, ry); var W = { g: g, n: new THREE.Vector3(n[0], 0, n[1]), d: d }; coopWalls.push(W); return g; }
    var wB = wall(COOP_BW, 0, [[-1.8, -1.0, 1.2, 1.8], [1.0, 1.8, 1.2, 1.8]], null, 0, -D2, 0, [0, -1], D2);
    var wF = wall(COOP_BW, 0, [[-2.15, -1.15, 1.02, 1.78], [1.15, 2.15, 1.02, 1.78]], [-0.52, 0.52, 1.92], 0, D2, Math.PI, [0, 1], D2);
    var wL = wall(COOP_BD, COOP_PEAK, [[-0.5, 0.5, 1.02, 1.78]], null, -W2, 0, Math.PI / 2, [-1, 0], W2);
    var wR = wall(COOP_BD, COOP_PEAK, [], null, W2, 0, -Math.PI / 2, [1, 0], W2);
    coopInWindow(wB, -1.4, 1.5, -D2 + 0.07, 0, 0.8, 0.6); coopInWindow(wB, 1.4, 1.5, -D2 + 0.07, 0, 0.8, 0.6);
    coopInWindow(wF, -1.65, 1.4, D2 - 0.07, Math.PI, 1.0, 0.76); coopInWindow(wF, 1.65, 1.4, D2 - 0.07, Math.PI, 1.0, 0.76);
    coopInWindow(wL, -W2 + 0.07, 1.4, 0, Math.PI / 2, 1.0, 0.76);
    put(new THREE.BoxGeometry(1.02, 1.9, 0.05), cpmSageDoor, 0, 0.95, D2 - 0.02, 0, 0, 0, wF);                 // (the door, shut, from inside)
    [[0, 1.62], [0, 0.3]].forEach(function (b) { put(new THREE.BoxGeometry(0.92, 0.12, 0.04), cpmSage, b[0], b[1], D2 - 0.075, 0, 0, 0, wF); });
    put(new THREE.BoxGeometry(0.1, 1.48, 0.04), cpmSage, 0, 0.96, D2 - 0.075, 0, 0, 0.62, wF);
    // (a beam along the ridge, and a lantern hanging from it)
    put(new THREE.BoxGeometry(COOP_BW - 0.1, 0.14, 0.12), mOld, 0, H + COOP_PEAK - 0.2, 0);
    put(new THREE.CylinderGeometry(0.008, 0.008, 0.95, 4), cpmIron, 0, H + COOP_PEAK - 0.7, 0); cpLantern(R, 0, 2.1, 0, coopInGlows);
    // (four nesting boxes along the back wall, deep in straw, each with a name slate over it)
    var strawM = new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 });
    COOP_NESTS.forEach(function (n, k) {
      var B = new THREE.Group(); B.position.set(n.x, 0, n.z); R.add(B);
      [[0, 0.3, 0, 0.74, 0.04, 0.58], [0, 0.82, -0.02, 0.8, 0.04, 0.64], [-0.36, 0.56, 0, 0.03, 0.52, 0.58], [0.36, 0.56, 0, 0.03, 0.52, 0.58], [0, 0.37, 0.28, 0.74, 0.14, 0.03], [0, 0.76, 0.28, 0.74, 0.1, 0.03]].forEach(function (b) { put(new THREE.BoxGeometry(b[3], b[4], b[5]), mWood, b[0], b[1], b[2], 0, 0, 0, B); });
      [[-0.33, -0.24], [0.33, -0.24], [-0.33, 0.24], [0.33, 0.24]].forEach(function (l) { put(new THREE.BoxGeometry(0.05, 0.3, 0.05), mOld, l[0], 0.15, l[1], 0, 0, 0, B); });
      put(wbLumpGeo(700 + k, 0.3), strawM, 0, 0.36, -0.02, 0, k, 0, B).scale.set(0.3, 0.07, 0.24);
      put(new THREE.BoxGeometry(0.5, 0.28, 0.03), mOld, 0, 0.99, -0.27, 0, 0, 0, B);
      put(new THREE.PlaneGeometry(0.44, 0.22), abStallSlates[COOP_STALL0 + k], 0, 0.99, -0.25, 0, 0, 0, B).castShadow = false;
      coopSolids.push([n.x, n.z, 0.38]);
    });
    // (the feeding bench along the right-hand wall: eight spots for hay, with little dividers between them)
    var FB2 = new THREE.Group(); FB2.position.set(2.42, 0, 0); R.add(FB2);
    put(new THREE.BoxGeometry(0.5, 0.06, 3.4), mWood, 0, 0.46, 0, 0, 0, 0, FB2);
    put(new THREE.BoxGeometry(0.03, 0.1, 3.4), mOld, -0.25, 0.5, 0, 0, 0, 0, FB2); put(new THREE.BoxGeometry(0.03, 0.16, 3.4), mOld, 0.24, 0.53, 0, 0, 0, 0, FB2);
    [-1.6, -0.55, 0.55, 1.6].forEach(function (z) { [-0.2, 0.2].forEach(function (x) { put(new THREE.BoxGeometry(0.06, 0.44, 0.06), mOld, x, 0.22, z, 0, 0, 0, FB2); }); });
    put(new THREE.BoxGeometry(0.44, 0.04, 3.3), mOld, 0, 0.12, 0, 0, 0, 0, FB2);
    for (var dv = 1; dv < 8; dv++) put(new THREE.BoxGeometry(0.46, 0.08, 0.02), mOld, 0, 0.53, -1.64 + dv * 0.41, 0, 0, 0, FB2);
    COOP_SLOT_Z.forEach(function (z) { var hb = pickupModel('hay'); hb.position.set(0, 0.575, z); hb.rotation.y = Math.PI / 2 + (Math.random() - 0.5) * 0.15; hb.traverse(function (o) { if (o.isMesh) o.castShadow = true; }); hb.visible = false; FB2.add(hb); coopHayMeshes.push(hb); });
    put(new THREE.PlaneGeometry(0.9, 0.34), new THREE.MeshStandardMaterial({ map: coopBenchTex, roughness: 0.8 }), 0.25, 1.15, 0, 0, -Math.PI / 2, 0, FB2).castShadow = false;
    for (var bs = -1.2; bs <= 1.2; bs += 0.8) coopSolids.push([2.42, bs, 0.35]);
    // (a roosting ladder leaning on the left-hand wall)
    var RL = new THREE.Group(); RL.position.set(-W2 + 0.1, 0, -1.05); R.add(RL);
    [-0.4, 0.4].forEach(function (z) { put(new THREE.BoxGeometry(0.06, 1.7, 0.06), mOld, 0.42, 0.78, z, 0, 0, 0.5, RL); });
    for (var rg = 0; rg < 4; rg++) put(new THREE.CylinderGeometry(0.025, 0.025, 0.86, 8), mWood, 0.75 - rg * 0.2, 0.2 + rg * 0.36, 0, Math.PI / 2, 0, 0, RL);
    coopSolids.push([-W2 + 0.45, -1.05, 0.5]);
    // (a galvanised waterer by the door, and a hay bale with a basket of eggs on top)
    put(new THREE.CylinderGeometry(0.24, 0.24, 0.06, 20), cpmSteel, -2.25, 0.03, 1.45); put(new THREE.CylinderGeometry(0.14, 0.14, 0.42, 18), cpmSteel, -2.25, 0.27, 1.45);
    put(new THREE.SphereGeometry(0.14, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), cpmSteel, -2.25, 0.48, 1.45); put(new THREE.TorusGeometry(0.06, 0.008, 6, 16, Math.PI), cpmIron, -2.25, 0.6, 1.45);
    put(new THREE.CylinderGeometry(0.235, 0.235, 0.02, 20), new THREE.MeshStandardMaterial({ color: 0x8ac6e8, roughness: 0.1, transparent: true, opacity: 0.8 }), -2.25, 0.062, 1.45).castShadow = false;
    coopSolids.push([-2.25, 1.45, 0.3]);
    var bale = pickupModel('hay'); bale.scale.setScalar(3); bale.position.set(-2.3, 0.255, 0.55); bale.rotation.y = Math.PI / 2; bale.traverse(function (o) { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); R.add(bale);
    put(new THREE.CylinderGeometry(0.14, 0.11, 0.1, 14, 1, true), new THREE.MeshStandardMaterial({ color: 0xb08850, roughness: 0.9, side: THREE.DoubleSide }), -2.3, 0.57, 0.55);
    [[-0.05, -0.03], [0.05, 0.02], [0, 0.06], [-0.04, 0.05]].forEach(function (e, k) { put(new THREE.SphereGeometry(0.035, 12, 8), new THREE.MeshStandardMaterial({ color: [0xfff6e8, 0xf0dcc0, 0xe8f0ff, 0xfff0f4][k], roughness: 0.4 }), -2.3 + e[0], 0.6, 0.55 + e[1]).scale.set(1, 1.25, 1); });
    coopSolids.push([-2.3, 0.55, 0.45]);
  })(coopRoom);
  var coopShafts = [], coopMotes = null;
  (function (R) {                                                      // ===== the finer details inside =====
    var W2 = COOP_BW / 2, D2 = COOP_BD / 2, H = COOP_WALL, wB = coopWalls[0].g, wF = coopWalls[1].g, wL = coopWalls[2].g, wR = coopWalls[3].g;
    function put(geo, m, x, y, z, rx, ry, rz, p) { return cpPart(geo, m, x, y, z, rx, ry, rz, p || R); }
    var mStud = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0xc89c6c, roughness: 0.85 }), mOld = new THREE.MeshStandardMaterial({ color: 0x7a5a3c, roughness: 0.85 });
    var mWood = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0xc89c6c, roughness: 0.8 });
    // (the timber frame showing inside: studs, top plates, and the rafters up the gables)
    coopStrips(wB, COOP_BW, 0, [[-1.8, -1.0, 1.2, 1.8], [1.0, 1.8, 1.2, 1.8]], null, 0, -D2, 0, 0.8, 0.07, 0.08, 0.1, mStud, 0);
    coopStrips(wF, COOP_BW, 0, [[-2.15, -1.15, 1.02, 1.78], [1.15, 2.15, 1.02, 1.78]], [-0.52, 0.52, 1.92], 0, D2, Math.PI, 0.8, 0.07, 0.08, 0.1, mStud, 0);
    coopStrips(wL, COOP_BD, COOP_PEAK, [[-0.5, 0.5, 1.02, 1.78]], null, -W2, 0, Math.PI / 2, 0.8, 0.07, 0.08, 0.1, mStud, 0);
    coopStrips(wR, COOP_BD, COOP_PEAK, [], null, W2, 0, -Math.PI / 2, 0.8, 0.07, 0.08, 0.1, mStud, 0);
    put(new THREE.BoxGeometry(COOP_BW - 0.1, 0.09, 0.09), mStud, 0, H - 0.05, -D2 + 0.1, 0, 0, 0, wB); put(new THREE.BoxGeometry(COOP_BW - 0.1, 0.09, 0.09), mStud, 0, H - 0.05, D2 - 0.1, 0, 0, 0, wF);
    var ra = Math.atan(COOP_PEAK / D2), rl = Math.hypot(D2, COOP_PEAK);
    [[wL, -W2 + 0.1], [wR, W2 - 0.1]].forEach(function (w) {
      put(new THREE.BoxGeometry(0.09, 0.09, COOP_BD - 0.1), mStud, w[1], H - 0.05, 0, 0, 0, 0, w[0]);
      [-1, 1].forEach(function (s) { put(new THREE.BoxGeometry(0.09, 0.1, rl), mStud, w[1], H + COOP_PEAK / 2 - 0.06, s * D2 / 2, s * ra, 0, 0, w[0]); });
    });
    // (loose straw everywhere: thousands of single strands, drifted up thicker along the walls, and spilling out of the nesting boxes)
    var strands = [];
    for (var i = 0; i < 2600; i++) {
      var edge = i % 5 < 2, x, z, y = 0.004;
      if (edge) {
        var side = i % 4, u = Math.random(), r = Math.pow(Math.random(), 2) * 0.35;
        if (side === 0) { x = -W2 + 0.08 + u * (COOP_BW - 0.16); z = -D2 + 0.06 + r; } else if (side === 1) { x = -W2 + 0.08 + u * (COOP_BW - 0.16); z = D2 - 0.06 - r; }
        else if (side === 2) { x = -W2 + 0.06 + r; z = -D2 + 0.1 + u * (COOP_BD - 0.2); } else { x = W2 - 0.06 - r; z = -D2 + 0.1 + u * (COOP_BD - 0.2); }
        y += Math.random() * 0.03;
      }
      else { x = -W2 + 0.05 + Math.random() * (COOP_BW - 0.1); z = -D2 + 0.05 + Math.random() * (COOP_BD - 0.1); }
      var l = 0.05 + Math.random() * 0.12, c = new THREE.Color().setHSL(0.1 + Math.random() * 0.03, 0.5 + Math.random() * 0.25, 0.48 + Math.random() * 0.28);
      strands.push([x, y, z, 0, Math.random() * Math.PI * 2, Math.PI / 2 + (Math.random() - 0.5) * 0.25, 1, l, 1, c.getHex()]);
    }
    COOP_NESTS.forEach(function (n) { for (var j = 0; j < 26; j++) { var c2 = new THREE.Color().setHSL(0.11, 0.55, 0.5 + Math.random() * 0.25); strands.push([n.x + (Math.random() - 0.5) * 0.66, 0.43 + Math.random() * 0.02, n.z + 0.3 + Math.random() * 0.03, 0, Math.PI / 2 + (Math.random() - 0.5) * 0.8, Math.PI / 2 + 0.5 + Math.random() * 0.4, 1, 0.07 + Math.random() * 0.08, 1, c2.getHex()]); } });
    coopInst(R, new THREE.CylinderGeometry(0.0028, 0.0028, 1, 3), new THREE.MeshStandardMaterial({ roughness: 0.9 }), strands, true).castShadow = false;
    // (a few soft feathers dropped in the straw)
    var featherTex = cpTex(32, 128, function (g, w, h) {
      g.fillStyle = '#fff'; g.beginPath(); g.moveTo(16, 4); g.bezierCurveTo(30, 30, 28, 90, 17, 124); g.lineTo(15, 124); g.bezierCurveTo(4, 90, 2, 30, 16, 4); g.fill();
      g.globalCompositeOperation = 'destination-out'; for (var k = 0; k < 7; k++) { g.beginPath(); g.moveTo(k % 2 ? 32 : 0, 30 + k * 12); g.lineTo(16, 34 + k * 12); g.lineWidth = 1.5; g.stroke(); } g.globalCompositeOperation = 'source-over';
      g.strokeStyle = 'rgba(160,140,120,0.8)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(16, 6); g.lineTo(16, 126); g.stroke();
    });
    [0xffffff, 0xfff4e4, 0xf8c8d8, 0xd8c8f4, 0xc8e0f8, 0xf8e0b8].forEach(function (col, k) {
      var fm = new THREE.MeshStandardMaterial({ map: featherTex, color: col, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.8 });
      for (var j = 0; j < 3; j++) put(new THREE.PlaneGeometry(0.035, 0.12), fm, -2.1 + Math.random() * 3.8, 0.012 + j * 0.001, -1.2 + Math.random() * 2.7, -Math.PI / 2 + 0.08, 0, Math.random() * 6.28).castShadow = false;
    });
    // (gingham curtains on the nesting boxes, drawn back with ribbons, and a scalloped valance over each)
    var ginghamTex = cpTex(64, 64, function (g, w, h) { g.fillStyle = '#fff6f8'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(236,140,176,0.5)'; for (var k = 0; k < 4; k++) { g.fillRect(k * 16, 0, 8, h); g.fillRect(0, k * 16, w, 8); } }, [3, 3]);
    var mGing = new THREE.MeshStandardMaterial({ map: ginghamTex, roughness: 0.9, side: THREE.DoubleSide });
    var valTex = cpTex(128, 32, function (g, w, h) { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h * 0.55); for (var k = 0; k < 8; k++) { g.beginPath(); g.arc(8 + k * 16, h * 0.55, 8, 0, Math.PI); g.fill(); } });
    var mVal = new THREE.MeshStandardMaterial({ map: ginghamTex, alphaMap: valTex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.9 });
    COOP_NESTS.forEach(function (n) {
      var B = new THREE.Group(); B.position.set(n.x, 0, n.z + 0.31); R.add(B);
      put(new THREE.CylinderGeometry(0.006, 0.006, 0.74, 6), cpmIron, 0, 0.72, 0, 0, 0, Math.PI / 2, B);
      [-1, 1].forEach(function (s) {
        var cg = new THREE.PlaneGeometry(0.16, 0.28, 8, 6), cp = cg.attributes.position;
        for (var v = 0; v < cp.count; v++) { var cx = cp.getX(v), cy = cp.getY(v), pinch = (0.14 - cy) / 0.28; cp.setX(v, cx * (1 - pinch * 0.55) + s * pinch * 0.03); cp.setZ(v, Math.sin(cx * 60) * 0.008); }
        cg.computeVertexNormals(); put(cg, mGing, s * 0.27, 0.58, 0.012, 0, 0, 0, B).castShadow = false;
        put(new THREE.SphereGeometry(0.014, 8, 6), new THREE.MeshStandardMaterial({ color: 0xe86a98 }), s * 0.29, 0.52, 0.02, 0, 0, 0, B);
      });
      put(new THREE.PlaneGeometry(0.72, 0.07), mVal, 0, 0.68, 0.016, 0, 0, 0, B).castShadow = false;
    });
    // (round wooden number tags along the feeding bench, little iron brackets, and a tin scoop)
    for (var t = 0; t < 8; t++) {
      var numTex = cpTex(64, 64, (function (k) { return function (g, w, h) { g.fillStyle = '#d8b480'; g.beginPath(); g.arc(32, 32, 31, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#7a5230'; g.lineWidth = 3; g.stroke(); g.fillStyle = '#5a3a20'; g.font = '600 36px Fredoka, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(k + 1), 32, 34); }; })(t));
      put(new THREE.CircleGeometry(0.04, 18), new THREE.MeshStandardMaterial({ map: numTex, roughness: 0.8 }), 2.42 - 0.268, 0.5, COOP_SLOT_Z[t], 0, -Math.PI / 2, 0).castShadow = false;
    }
    [-1.6, -0.55, 0.55, 1.6].forEach(function (z) { [-0.2, 0.2].forEach(function (x) { put(new THREE.BoxGeometry(0.075, 0.012, 0.075), cpmIron, 2.42 + x, 0.425, z); }); });
    put(new THREE.CylinderGeometry(0.05, 0.045, 0.09, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xb8c0c8, metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide }), 2.42, 0.53, 1.73, 0, 0, Math.PI / 2 - 0.2);
    // (a chalkboard on the back wall keeping the egg tally, with bunting strung along the top of the walls)
    var chalk = cpTex(256, 128, function (g, w, h) {
      g.fillStyle = '#2c3a34'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(230,240,235,0.06)'; for (var k = 0; k < 30; k++) g.fillRect(Math.random() * w, Math.random() * h, 30, 2);
      g.fillStyle = '#f4f0e6'; g.font = 'italic 600 26px Georgia, serif'; g.textAlign = 'center'; g.fillText('Egg tally', w / 2, 30);
      g.strokeStyle = 'rgba(244,240,230,0.85)'; g.lineWidth = 2.5;
      [40, 102, 164, 226].forEach(function (cx, k) { for (var m = 0; m < Math.min(4, 2 + k); m++) { var x = cx - 14 + m * 7; g.beginPath(); g.moveTo(x, 56); g.lineTo(x - 1, 82); g.stroke(); } if (k === 3) { g.beginPath(); g.moveTo(cx - 18, 78); g.lineTo(cx + 12, 60); g.stroke(); } });
      g.fillStyle = '#f6b8cc'; g.beginPath(); g.moveTo(228, 112); g.bezierCurveTo(214, 102, 218, 92, 228, 98); g.bezierCurveTo(238, 92, 242, 102, 228, 112); g.fill();
      g.strokeStyle = '#f8e8a0'; g.lineWidth = 2; g.beginPath(); g.ellipse(40, 104, 9, 11, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.ellipse(62, 104, 9, 11, 0, 0, Math.PI * 2); g.stroke();
    });
    put(new THREE.BoxGeometry(1.06, 0.56, 0.03), mOld, 0, 1.62, -D2 + 0.155, 0, 0, 0, wB);
    put(new THREE.PlaneGeometry(0.98, 0.48), new THREE.MeshStandardMaterial({ map: chalk, roughness: 0.95 }), 0, 1.62, -D2 + 0.172, 0, 0, 0, wB).castShadow = false;
    put(new THREE.BoxGeometry(0.98, 0.03, 0.06), mOld, 0, 1.33, -D2 + 0.18, 0, 0, 0, wB); put(new THREE.CylinderGeometry(0.008, 0.008, 0.07, 6), new THREE.MeshBasicMaterial({ color: 0xf8f6f0 }), 0.3, 1.355, -D2 + 0.19, 0, 0, Math.PI / 2, wB);
    var flagCols = [0xf4a6c8, 0xfff0c8, 0xb8e0c8, 0xc8b8f0, 0xffc8a0, 0xa8d4f0];
    function bunting(parent, a, b, y, sag, seed) {                     // (a string of little pennant flags from point a to point b, sagging between)
      var dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ry = Math.atan2(-dz, dx), nF = Math.floor(L / 0.17), tri = new THREE.Shape(); tri.moveTo(-0.055, 0); tri.lineTo(0.055, 0); tri.lineTo(0, -0.13); tri.closePath();
      var tg = new THREE.ShapeGeometry(tri), pts = [];
      for (var k = 0; k <= 20; k++) { var f = k / 20; pts.push(new THREE.Vector3(a[0] + dx * f, y - Math.sin(f * Math.PI) * sag, a[1] + dz * f)); }
      put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.004, 4), new THREE.MeshStandardMaterial({ color: 0xf0e6d8 }), 0, 0, 0, 0, 0, 0, parent).castShadow = false;
      for (var j = 1; j < nF; j++) { var f2 = j / nF; put(tg, new THREE.MeshStandardMaterial({ color: flagCols[(j + seed) % flagCols.length], side: THREE.DoubleSide, roughness: 0.9 }), a[0] + dx * f2, y - Math.sin(f2 * Math.PI) * sag, a[1] + dz * f2, 0, ry, (isle2Hash(j + seed) - 0.5) * 0.15, parent).castShadow = false; }
    }
    bunting(wB, [-2.6, -D2 + 0.2], [2.6, -D2 + 0.2], 2.28, 0.14, 0);
    bunting(wL, [-W2 + 0.2, -1.85], [-W2 + 0.2, 1.85], 2.28, 0.12, 3);
    bunting(wR, [W2 - 0.2, -1.85], [W2 - 0.2, 1.85], 2.28, 0.12, 5);
    // (tools on a peg rail by the door: a pitchfork, a rake and a broom)
    put(new THREE.BoxGeometry(0.04, 0.08, 1.05), mOld, -W2 + 0.15, 1.62, 1.3, 0, 0, 0, wL);
    [0.95, 1.3, 1.65].forEach(function (z) { put(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 6), mWood, -W2 + 0.2, 1.62, z, 0, 0, Math.PI / 2, wL); });
    var tx = -W2 + 0.22;
    put(new THREE.CylinderGeometry(0.016, 0.016, 1.35, 8), mWood, tx, 1.0, 0.95, 0, 0, 0, wL); put(new THREE.BoxGeometry(0.02, 0.02, 0.17), cpmIron, tx, 1.7, 0.95, 0, 0, 0, wL);
    [-0.07, 0, 0.07].forEach(function (z) { put(new THREE.CylinderGeometry(0.005, 0.003, 0.24, 5), cpmIron, tx, 1.83, 0.95 + z, 0, 0, 0, wL); });
    put(new THREE.CylinderGeometry(0.016, 0.016, 1.35, 8), mWood, tx, 1.0, 1.3, 0, 0, 0, wL); put(new THREE.BoxGeometry(0.03, 0.03, 0.34), cpmIron, tx, 1.7, 1.3, 0, 0, 0, wL);
    for (var rk = 0; rk < 9; rk++) put(new THREE.CylinderGeometry(0.004, 0.004, 0.07, 4), cpmIron, tx, 1.75, 1.15 + rk * 0.0375, 0, 0, 0, wL);
    put(new THREE.CylinderGeometry(0.014, 0.014, 1.0, 8), mWood, tx, 1.15, 1.65, 0, 0, 0, wL);
    var brm = put(new THREE.ConeGeometry(0.12, 0.38, 12, 1, true), new THREE.MeshStandardMaterial({ map: haySideTex, color: 0xe0c070, roughness: 1, side: THREE.DoubleSide }), tx, 0.53, 1.65, 0, 0, 0, wL); brm.scale.set(1, 1, 0.45);
    put(new THREE.TorusGeometry(0.025, 0.006, 5, 10), new THREE.MeshStandardMaterial({ color: 0xa83a2a }), tx, 0.72, 1.65, 0, Math.PI / 2, 0, wL);
    // (a shelf over the feeding bench: jars of grain, a tin, a ball of twine, an oil can and a little pot of daisies)
    var sx = W2 - 0.2;
    put(new THREE.BoxGeometry(0.24, 0.035, 3.2), mWood, sx, 1.72, 0, 0, 0, 0, wR);
    [-1.3, 0, 1.3].forEach(function (z) { var br2 = new THREE.Shape(); br2.moveTo(0, 0); br2.lineTo(0.2, 0); br2.lineTo(0, -0.2); br2.closePath(); var bgeo = new THREE.ExtrudeGeometry(br2, { depth: 0.03, bevelEnabled: false }); bgeo.translate(0, 0, -0.015); put(bgeo, mOld, sx + 0.1, 1.7, z, 0, Math.PI, 0, wR); });
    var glassM = new THREE.MeshStandardMaterial({ color: 0xd8e8e8, roughness: 0.1, transparent: true, opacity: 0.45 }), grainCols = [0xe8c868, 0xc89048, 0xf0e0b0];
    [-1.35, -1.1, -0.85].forEach(function (z, k) { put(new THREE.CylinderGeometry(0.055, 0.055, 0.12, 14), new THREE.MeshStandardMaterial({ color: grainCols[k], roughness: 1 }), sx, 1.795, z, 0, 0, 0, wR); put(new THREE.CylinderGeometry(0.06, 0.06, 0.17, 14), glassM, sx, 1.825, z, 0, 0, 0, wR); put(new THREE.CylinderGeometry(0.062, 0.062, 0.025, 14), cpmSteel, sx, 1.92, z, 0, 0, 0, wR); });
    put(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 16), new THREE.MeshStandardMaterial({ color: 0x8aa0b8, metalness: 0.5, roughness: 0.4 }), sx, 1.81, -0.35, 0, 0, 0, wR);
    put(new THREE.SphereGeometry(0.06, 12, 10), new THREE.MeshStandardMaterial({ color: 0xc8a878, roughness: 1 }), sx, 1.795, 0.3, 0, 0, 0, wR);
    put(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 12), cpmCopper, sx, 1.79, 0.75, 0, 0, 0, wR); put(new THREE.CylinderGeometry(0.006, 0.01, 0.16, 6), cpmCopper, sx - 0.05, 1.87, 0.75, 0, 0, 0.9, wR);
    put(new THREE.CylinderGeometry(0.06, 0.045, 0.1, 12), new THREE.MeshStandardMaterial({ color: 0xc0704a, roughness: 0.9 }), sx, 1.79, 1.3, 0, 0, 0, wR);
    coopFlowers(wR, [[sx, 1.8, 1.3]], 91);
    // (two feed sacks by the door)
    [[-1.4, 1.62, 0.5, 0], [-1.05, 1.68, -0.3, 1]].forEach(function (sk) { if (!barnSackProtos[sk[3]]) return; var sg = barnSackProtos[sk[3]].clone(); sg.position.set(sk[0], 0, sk[1]); sg.rotation.set(0, sk[2], 0); sg.scale.setScalar(0.85); R.add(sg); });
    coopSolids.push([-1.25, 1.62, 0.4]);
    // (sunbeams slanting in through the windows, with dust drifting in them)
    var beamTex = cpTex(64, 128, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); var gx = g.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.2, 'rgba(0,0,0,0)'); gx.addColorStop(0.8, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, w, h); });
    var motePts = [];
    [[-1.65, 1.4, D2 - 0.08, Math.PI, 0.95], [1.65, 1.4, D2 - 0.08, Math.PI, 0.95], [-W2 + 0.08, 1.4, 0, Math.PI / 2, 0.95]].forEach(function (b) {
      var g = new THREE.Group(); g.position.set(b[0], b[1], b[2]); g.rotation.y = b[3]; R.add(g);
      var phi = 0.62, L = 2.3, bm = new THREE.MeshBasicMaterial({ map: beamTex, color: 0xfff0c8, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      var pl = new THREE.Mesh(new THREE.PlaneGeometry(b[4], L), bm); pl.position.set(0, -Math.sin(phi) * L / 2 + 0.3, Math.cos(phi) * L / 2); pl.rotation.x = phi - Math.PI / 2; g.add(pl); coopShafts.push(bm);
      g.updateMatrixWorld(true);
      for (var m = 0; m < 22; m++) { var f = Math.random(), p = new THREE.Vector3((Math.random() - 0.5) * b[4] * 0.7, 0.3 - Math.sin(phi) * L * f, Math.cos(phi) * L * f + (Math.random() - 0.5) * 0.2); g.localToWorld(p); R.worldToLocal(p); motePts.push(p.x, p.y, p.z); }
    });
    var mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.Float32BufferAttribute(motePts, 3));
    coopMotes = new THREE.Points(mg, new THREE.PointsMaterial({ map: dawnGlowTex, color: 0xfff4d8, size: 0.045, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
    coopMotes.userData.base = motePts.slice(); R.add(coopMotes);
  })(coopRoom);
  function coopHayShow() { coopHayMeshes.forEach(function (m, i) { m.visible = coop.hay[i]; }); }
  var coLook = new THREE.Vector3();
  function updateCoopInside(t) {
    coLook.set(camera.position.x - COI_X, 0, camera.position.z - COI_Z);
    coopWalls.forEach(function (W) { W.g.visible = coLook.dot(W.n) < W.d - 0.6; });
    var hr = state.minutes / 60, nt = hr < 5.5 ? 1 : hr < 7 ? (7 - hr) / 1.5 : hr < 18.5 ? 0 : hr < 20 ? (hr - 18.5) / 1.5 : 1;
    coSun.intensity = 0.5 * (1 - nt); coLamp.intensity = (0.5 + nt * 0.3) * (1 + Math.sin(t * 10) * 0.04);
    coopInGlows.forEach(function (L) { var f = 1 + Math.sin(t * 11 + L.p) * 0.1; L.f.scale.set(f, 1.5 * f, f); L.h.material.opacity = 0.5 * f; });
    coopShafts.forEach(function (m, i) { m.opacity = (1 - nt) * (0.1 + Math.sin(t * 0.4 + i) * 0.025); });   // (the sunbeams fade with the daylight)
    var mp = coopMotes.geometry.attributes.position, mb = coopMotes.userData.base;   // (and the dust drifts lazily in them)
    for (var k = 0; k < mp.count; k++) mp.setXYZ(k, mb[k * 3] + Math.sin(t * 0.3 + k * 1.7) * 0.06, mb[k * 3 + 1] + Math.sin(t * 0.22 + k * 2.3) * 0.08, mb[k * 3 + 2] + Math.cos(t * 0.27 + k) * 0.06);
    mp.needsUpdate = true; coopMotes.material.opacity = (1 - nt) * 0.75;
  }
  function drawCoopView() {                                            // (the windows look out on the real farm, like the shops')
    renderer.getDrawingBufferSize(shopViewSize);
    if (shopViewTarget.width !== shopViewSize.x || shopViewTarget.height !== shopViewSize.y) shopViewTarget.setSize(shopViewSize.x, shopViewSize.y);
    siWindowMask.uniforms.uSize.value.copy(shopViewSize);
    shopViewMap.makeTranslation(coop.x, coop.fy, coop.z).multiply(shopViewTmp.makeRotationY(bRot(coop))).multiply(shopViewTmp.makeTranslation(-COI_X, 0, -COI_Z));
    shopViewCam.projectionMatrix.copy(camera.projectionMatrix); shopViewCam.projectionMatrixInverse.copy(camera.projectionMatrixInverse);
    shopViewCam.matrix.multiplyMatrices(shopViewMap, camera.matrixWorld);
    shopViewCam.updateMatrixWorld(true);
    if (coopGroup) coopGroup.visible = false;                          // (you're inside it, so its own outside walls stay out of the way)
    renderer.setRenderTarget(shopViewTarget); renderer.render(scene, shopViewCam); renderer.setRenderTarget(null);
    if (coopGroup) coopGroup.visible = true;
  }
  function coopDoorUse(goIn) {                                         // through the coop's door, in or out
    if (doorBusy) return;
    doorBusy = true; doorArmed = false; walkTarget = null; doorSound(); fadeBox.style.opacity = 1;
    setTimeout(function () {
      if (goIn) {
        indoors = true; inShop = inClinic = inBarn = inCarp = false; inCoop = true;
        coopScene.add(player); player.position.set(COI_X, 0, COI_Z + COI_EXIT_Z - 1.0); facing = Math.PI;
        outsideCam = { dist: cam.dist, pitch: cam.pitch, yaw: cam.yaw }; cam.dist = 7.5; cam.pitch = 0.9; cam.yaw = 0;
      } else {
        indoors = false; inCoop = false; scene.add(player);
        var o = coopFront(1.6); player.position.set(o.x, 0, o.z); facing = bRot(coop);
        if (outsideCam) { cam.dist = outsideCam.dist; cam.pitch = outsideCam.pitch; cam.yaw = outsideCam.yaw; }
      }
      cam.target.set(player.position.x, 0.8, player.position.z);
      fadeBox.style.opacity = 0;
      setTimeout(function () { doorBusy = false; }, 380);
    }, 380);
  }

  // ===== building it, and taking it down (when a save without one is loaded) =====
  function coopPlace(c0, r0, start, rot) {
    coopRemove();
    coop.built = true; coop.c = c0; coop.r = r0; coop.start = start; coop.stage = siteStage(coop); coop.rot = rot || 0;   // (start: the farm day Oak & Ember started building it; rot: which way it faces)
    var FC = bFC(coop, COOP_FC, COOP_FR), FR = bFR(coop, COOP_FC, COOP_FR);
    coop.fx = FARM_X + (c0 + FC / 2) * TILE; coop.fz = FARM_Z + (r0 + FR / 2) * TILE;
    var back = bOff(coop, 0, -0.45); coop.x = coop.fx + back.x; coop.z = coop.fz + back.z;   // (the coop sits at the back of its patch, its ramp in front)
    var top = -9; for (var gx = -1; gx <= 1; gx++) for (var gz = -1; gz <= 1; gz++) top = Math.max(top, bGround(coop, gx * COOP_BW / 2, gz * COOP_BD / 2));
    coop.fy = top + 0.2;
    var HX = FC * TILE / 2, HZ = FR * TILE / 2;
    allScenery.forEach(function (t) {                                  // (whatever was cut down here stays down: stumps and saplings are cleared away)
      var u = t.userData; if (u.gone || u.state === 'standing') return;
      if (Math.abs(u.solid.x - coop.fx) < HX + u.solidR && Math.abs(u.solid.z - coop.fz) < HZ + u.solidR) setSceneryCut(t, u.state === 'regrowing' ? u.felledAt : gameMinutes());
    });
    mineable.forEach(function (r) {
      if (r.gone || r.state === 'whole') return;
      if (Math.abs(r.solid.x - coop.fx) < HX + r.solidR && Math.abs(r.solid.z - coop.fz) < HZ + r.solidR) setRockBroken(r, r.state === 'regrowing' ? r.brokeAt : gameMinutes());
    });
    for (var c = c0; c < c0 + FC; c++) for (var r = r0; r < r0 + FR; r++) { var ft = { x: FARM_X + (c + 0.5) * TILE, z: FARM_Z + (r + 0.5) * TILE }; coverGrass(ft); coop.grass.push(ft); }   // (no grass poking up through the floor)
    [[-1.8, -1], [0, -1], [1.8, -1], [-1.8, 1], [0, 1], [1.8, 1], [-2.3, -1.5, 0.7], [2.3, -1.5, 0.7], [-2.3, 1.5, 0.7], [2.3, 1.5, 0.7], [3.1, 0, 0.5], [-2.85, 2.5, 0.35], [-1.75, 2.62, 0.45]].forEach(function (s) {   // (you bump into its walls)
      var w = bOff(coop, s[0], s[1]), sd = { x: coop.x + w.x, z: coop.z + w.z, r: s[2] || 1.0 }; solids.push(sd); coop.solids.push(sd);
    });
    coopDoor = coop.stage < SITE_DAYS ? { x: 1e6, z: 1e6 } : coopFront(0.12);   // (no way in until it's finished)
    coopGroup = coop.stage < SITE_DAYS ? siteBuild('coop', coop.stage) : coopBuildOutside();
    if (!coop.tp) { coop.tp = { name: 'Your Coop', icon: '🐔', spot: function () { var f = coopFront(2.2); return { x: f.x, z: f.z, face: bRot(coop) + Math.PI, view: bRot(coop) }; } }; }
    if (TELEPORTS.indexOf(coop.tp) < 0) TELEPORTS.push(coop.tp);
    flushDirty();
  }
  function coopRemove() {
    if (!coop.built) return;
    if (coopGroup) { scene.remove(coopGroup); coopGroup = null; }
    coop.solids.forEach(function (sd) { var i = solids.indexOf(sd); if (i >= 0) solids.splice(i, 1); }); coop.solids = [];
    coop.grass.forEach(uncoverGrass); coop.grass = [];
    var ti = TELEPORTS.indexOf(coop.tp); if (ti >= 0) TELEPORTS.splice(ti, 1);
    coop.built = false; coopDoor = { x: 1e6, z: 1e6 };
  }
  function coopSaveData() { return coop.built ? { c: coop.c, r: coop.r, rot: coop.rot || 0, hay: coop.hay.slice(), start: coop.start } : null; }
  function coopLoadData(d) {
    coopRemove();
    coop.hay = [false, false, false, false, false, false, false, false]; coop.res = [];
    if (d) { coopPlace(d.c, d.r, d.start === undefined ? -99 : d.start, d.rot || 0); if (d.hay) d.hay.forEach(function (h, i) { if (i < 8) coop.hay[i] = !!h; }); }
    coopAnimals().forEach(function (g) { g.eatSlot = null; });
    coopHayShow();
  }

  // ===== the animals that live in it =====
  function coopMoveIn(g) {                                             // (called as one is adopted or loaded: it moves out of the barn room into the coop)
    var n = COOP_NESTS[g.stall - COOP_STALL0];
    coopRoom.add(g.m.root); coopRoom.add(g.eggMesh); g.eggMesh.position.set(n.x, 0.33, n.z + 0.04);
    if (g.hayMesh.parent) g.hayMesh.parent.remove(g.hayMesh);
    g.x = n.x + (Math.random() - 0.5) * 0.4; g.z = -0.7 + Math.random() * 0.8; g.tx = g.x; g.tz = g.z; g.face = 0; g.eatSlot = null; g.eatT = 0;
    g.m.root.position.set(g.x, 0, g.z);
  }
  function coopWander(g) {                                             // (where it potters to next)
    if (g.eatSlot !== null && g.eatSlot !== undefined) { g.wait = 0.5; return; }
    var n = COOP_NESTS[g.stall - COOP_STALL0], hr = state.minutes / 60, night = hr >= 20 || hr < 6, r = Math.random();
    if (night || r < 0.15) { g.tx = n.x + (Math.random() - 0.5) * 0.2; g.tz = -1.1 + Math.random() * 0.08; g.wait = (night ? 8 : 4) + Math.random() * 6; return; }   // (settling down by its own nesting box, and roosting there at night)
    if (r < 0.25) { g.tx = -2.25 + Math.random() * 0.3; g.tz = -0.42 + Math.random() * 0.4; }   // (the nook between the roosting ladder and the hay bale)
    else { g.tx = -1.8 + Math.random() * 3.7; g.tz = -1.0 + Math.random() * (g.kind === 'ostrich' ? 2.0 : 2.15); }   // (anywhere across the floor, from the nesting boxes to the door, and up to the feeding bench)
    g.wait = (g.kind === 'gem' ? 1.5 : g.kind === 'ember' ? 4 : 2.5) + Math.random() * 5;
  }
  function coopEat(g) {
    var i = g.eatSlot; coop.hay[i] = false; coop.res[i] = null; g.eatSlot = null; g.eatT = 0;
    g.fed = true; glimRefresh(g); coopHayShow();
    if (inCoop) { popSound(); petSound(g, 'eat', glimNear(g)); g.wait = 0.8 + Math.random(); }
  }
  function updateCoopFeeding(dt) {                                     // a hungry animal goes to the nearest bundle on the bench and eats it
    coopAnimals().forEach(function (g) {
      if (inCoop && (g.kind === 'glim' || g.kind === 'duck' || g.kind === 'ember' || g.kind === 'gem' || g.kind === 'ostrich')) {   // (each coop bird makes its own little sounds now and then)
        if (g.chirpT === undefined) g.chirpT = 3 + Math.random() * 8;
        g.chirpT -= dt;
        if (g.chirpT <= 0) { var hr = state.minutes / 60, night = hr >= 20 || hr < 6; g.chirpT = (night ? 25 : 7) + Math.random() * (night ? 30 : 12); petSound(g, 'chirp', glimNear(g) * (night ? 0.5 : 1)); }
      }
      if (g.fed) { if (g.eatSlot !== null && g.eatSlot !== undefined) { coop.res[g.eatSlot] = null; g.eatSlot = null; } return; }
      if (g.eatSlot === null || g.eatSlot === undefined) {
        var best = -1, bd = 1e9;
        for (var i = 0; i < 8; i++) if (coop.hay[i] && !coop.res[i]) { var d = Math.abs(COOP_SLOT_Z[i] - g.z); if (d < bd) { bd = d; best = i; } }
        if (best < 0) return;
        g.eatSlot = best; coop.res[best] = g; g.eatT = 0;
      }
      if (!inCoop) { coopEat(g); return; }                             // (while you're away, they just help themselves)
      var sx = 1.98, sz = COOP_SLOT_Z[g.eatSlot];
      g.tx = sx; g.tz = sz; g.wait = 1;
      if (Math.hypot(g.x - sx, g.z - sz) < 0.06) { g.face = Math.PI / 2; g.eatT += dt; if (g.eatT > 2.4) coopEat(g); }
    });
  }
  function glimNear(g) { var d = Math.hypot(player.position.x - (COI_X + g.x), player.position.z - (COI_Z + g.z)); return Math.max(0.25, Math.min(1, 1.6 / (d + 0.6))); }   // (softer the further it is from you)
  function coopCare(g) {                                               // collecting what it gave you, and petting it (it feeds itself at the bench)
    var wx = COI_X + g.x, wz = COI_Z + g.z, glim = g.kind === 'glim';
    if (g.egg && glim) {
      if (!roomFor(['glimmerEgg'])) { bagFull(); return; }
      addItem('glimmerEgg', 1); g.egg = false; glimRefresh(g); popSound(); glimSound('egg');
      showToast('You collected a Glimmer Egg from ' + g.name + '! ✧', 2200); return;
    }
    if (g.egg || (g.fed && !glim)) { (g.kind === 'duck' ? puddlewispAction : g.kind === 'ember' ? emberwingAction : g.kind === 'gem' ? gemwrenAction : celestaraAction)(g, wx, wz); return; }
    if (!g.petted) {
      g.petted = true; glimRefresh(g); g.pet = 1.4; g.face = Math.atan2(player.position.x - wx, player.position.z - wz);
      glimHeartBurst(g.x, g.kind === 'ostrich' ? 0.75 : 0.55, g.z); popSound(); petSound(g, 'pet');
      showToast(g.fed ? g.name + ' coos and flutters their wings 💜 An egg tomorrow morning!' : g.name + ' loves the attention 💜 Put hay on the feeding bench so they can eat too!', 2600); return;
    }
    if (!g.fed) { petSound(g, 'hungry'); showToast(g.name + ' is hungry! Put hay on the feeding bench 🌾', 2400); return; }
    g.pet = 0.8; glimHeartBurst(g.x, 0.5, g.z); if (glim) glimSound('content');
    showToast(g.name + ' is fed, petted and happy ✧ Come back tomorrow!', 2000);
  }
  function coopBenchAction() {
    var i = coop.hay.indexOf(false);
    if (i < 0) { showToast('The feeding bench is full: all 8 spots have hay 🌾', 2200); return; }
    if (!takeItem('hay', 1)) { showToast('You need hay to put on the bench. Take it from the hopper' + (siloReady() ? ' (' + silo.hay + ' in your silo)' : '') + ', buy it at Fluff & Feather, or trim bushes for it 🌾', 3000); return; }
    coop.hay[i] = true; coopHayShow(); popSound();
    showToast('You put a bundle of hay on the feeding bench (' + coop.hay.filter(Boolean).length + '/8) 🌾', 1800);
  }
  function coopTarget() {                                              // what Interact would do in here: the bench, or one of your animals (or its nesting box)
    if (!inCoop || glimNaming || siloHopperHere()) return null;      // (by the hopper, Interact takes hay out of it instead)
    var lx = player.position.x - COI_X, lz = player.position.z - COI_Z, best = null, bd = 1.0;
    coopAnimals().forEach(function (g) {
      var n = COOP_NESTS[g.stall - COOP_STALL0], d = Math.min(Math.hypot(lx - g.x, lz - g.z), g.egg ? Math.hypot(lx - n.x, lz - n.z) - 0.1 : 9);
      if (d < bd) { bd = d; best = g; }
    });
    var atBench = lx > 1.2 && Math.abs(lz) < 1.85;
    if (best && bd < 0.7 && (best.egg || !atBench)) return best;       // (right by the bench, the bench comes first, unless there's an egg to collect)
    return atBench ? 'bench' : best;
  }
  var coopBtn = document.createElement('button');
  coopBtn.type = 'button'; coopBtn.className = 'sleep-btn ship-btn';
  canvas.parentNode.appendChild(coopBtn);
  coopBtn.addEventListener('click', function () { var tg = coopTarget(); if (tg === 'bench') coopBenchAction(); else if (tg) coopCare(tg); focusGame(); });
  var coopBtnText = '';
  function updateCoopButton() {
    var tg = coopTarget(), txt = '';
    if (tg === 'bench') txt = '🌾 Put hay on the bench (' + coop.hay.filter(Boolean).length + '/8)';
    else if (tg) txt = tg.egg ? (tg.kind === 'ember' ? '🪶 Pick up quill' : '🥚 Collect egg') : !tg.petted ? '💜 Pet ' + tg.name : !tg.fed ? '🌾 ' + tg.name + ' is hungry' : '✧ ' + tg.name;
    if (txt !== coopBtnText) { coopBtnText = txt; if (txt) coopBtn.innerHTML = txt.replace(/&/g, '&amp;').replace(/</g, '&lt;') + ' <kbd>E</kbd>'; }
    var show = !!txt;
    if (coopBtn.classList.contains('show') !== show) coopBtn.classList.toggle('show', show);
  }

  // ===== adopting one at Fluff & Feather: the five coop birds only ever live in your coop =====
  var coopBaseAdopt = adoptGlimmerwing;
  adoptGlimmerwing = function (kind) {
    if (COOP_KINDS.indexOf(kind) < 0) return coopBaseAdopt(kind);
    if (!coop.built) { showToast(COOP_NAMES[kind] + 's live in a coop: build one at Oak & Ember first 🐔', 2800); return; }
    if (!siteReady(coop)) { showToast('Your coop is still being built: it\'ll be ready on the morning of ' + seasonDay(coop.start + SITE_DAYS) + ' 🪚', 2800); return; }
    var cs = coopFreeStall(), cost = coopKindCost(kind);
    if (cs < 0) { showToast('Your coop is full: it has room for 4', 2200); return; }
    if (state.coins < cost) { showToast('Not enough Star Coins', 1800); return; }
    state.coins -= cost; showCoins(true); coinSound(5); closeBarnShop(); glimStartNaming(cs, kind);
  };
  function homeCardText(card, where) {                                // (their descriptions say where they really live, not "in a stall here")
    var tw = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, null, false), t;
    while ((t = tw.nextNode())) if (t.nodeValue.indexOf('It lives in a stall here.') >= 0) t.nodeValue = t.nodeValue.replace('It lives in a stall here.', 'It lives in your ' + where + '.');
  }
  function homeNoteText(o, name) {                                     // (what the note on their card says, depending on how your coop or barn is getting on)
    if (!o.built) return 'Lives in your ' + name + ': build one at Oak & Ember';
    if (!siteReady(o)) return 'Lives in your ' + name + ': it\'s being built, ready on ' + seasonDay(o.start + SITE_DAYS);
    return 'Lives in your ' + name;
  }
  var COOP_NOTES = [];
  [glimAdoptBtn, duckAdoptBtn, emberAdoptBtn, gemAdoptBtn, ostAdoptBtn].forEach(function (b) {   // (their cards at Fluff & Feather say where they live)
    var card = b.closest('.shop-card'); if (!card) return;
    homeCardText(card, 'coop');
    var note = document.createElement('p'); note.className = 'ship-hint'; note.style.cssText = 'margin:6px 2px 8px;font-weight:600;color:#5a8a5e'; note.textContent = '🐔 ' + homeNoteText(coop, 'coop');
    card.insertBefore(note, card.querySelector('.shop-buy')); COOP_NOTES.push(note);
  });
  var coopBarnRender = renderBarnShop;
  renderBarnShop = function () {                                       // (they can be adopted while your coop has room, whatever the barn stalls hold)
    coopBarnRender();
    var free = siteReady(coop) && coopFreeStall() >= 0;
    [[glimAdoptBtn, GLIM_COST], [duckAdoptBtn, DUCK_COST], [emberAdoptBtn, EMBER_COST], [gemAdoptBtn, GEM_COST], [ostAdoptBtn, OST_COST]].forEach(function (b) {
      b[0].innerHTML = !coop.built ? '🐔 Needs a coop' : !siteReady(coop) ? '🪚 Coop being built' : !free ? 'Your coop is full' : 'Adopt · <img class="coin-icon" alt=""> ' + b[1].toLocaleString('en-US'); b[0].disabled = !free || state.coins < b[1];
    });
    var cn = '🐔 ' + homeNoteText(coop, 'coop'); COOP_NOTES.forEach(function (n) { if (n.textContent !== cn) n.textContent = cn; });
    barnTilesSync();
  };
  var coopBaseNaming = glimStartNaming, glimNameHint = glimNameBox.querySelector('.ship-hint'), glimNameHintText = glimNameHint.textContent;
  glimStartNaming = function (stall, kind) {
    coopBaseNaming(stall, kind);
    glimNameHint.textContent = stall >= FBARN_STALL0 ? 'What would you like to call your new friend? They\'ll move into your barn on the farm.' : stall >= COOP_STALL0 ? 'What would you like to call your new friend? They\'ll move into your coop on the farm.' : glimNameHintText;
  };

  // ===== the carpenter's menu, at Oak & Ember's counter =====
  var coopShopIcon = (function () {                                    // (a little picture of the coop, for the menu)
    var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d'); g.scale(2, 2);
    g.fillStyle = 'rgba(0,0,0,0.16)'; g.beginPath(); g.ellipse(64, 112, 56, 9, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#8a8478'; g.fillRect(17, 99, 94, 9); g.fillStyle = 'rgba(255,255,255,0.18)'; for (var s = 19; s < 110; s += 9) g.fillRect(s, 100 + (s % 2) * 3, 7, 3);   // (the stone footing)
    var wg = g.createLinearGradient(0, 52, 0, 100); wg.addColorStop(0, '#fdf7ea'); wg.addColorStop(1, '#e8dcc4'); g.fillStyle = wg; g.fillRect(19, 52, 90, 48);
    g.fillStyle = '#f6efe0'; for (var b = 23; b < 108; b += 7) g.fillRect(b, 52, 1.6, 48); g.strokeStyle = 'rgba(150,120,90,0.25)'; g.lineWidth = 0.6; for (var b2 = 23; b2 < 108; b2 += 7) { g.beginPath(); g.moveTo(b2 + 1.8, 52); g.lineTo(b2 + 1.8, 100); g.stroke(); }
    g.fillStyle = 'rgba(70,50,30,0.18)'; g.fillRect(19, 92, 90, 8);
    g.fillStyle = '#92b596'; g.fillRect(17, 52, 3, 48); g.fillRect(108, 52, 3, 48); g.fillRect(19, 97, 90, 3);
    g.fillStyle = '#5a3e28'; g.beginPath(); g.moveTo(6, 57); g.lineTo(64, 17); g.lineTo(122, 57); g.closePath(); g.fill();   // (the roof, in rows of shakes)
    for (var r = 0; r < 6; r++) { var y0 = 22 + r * 6.2, w = (y0 - 17) / 40 * 58; for (var x = 64 - w; x < 64 + w; x += 4 + (r % 2)) { var t2 = 0.75 + ((x * 7 + r * 13) % 10) / 40; g.fillStyle = 'rgb(' + Math.round(196 * t2) + ',' + Math.round(128 * t2) + ',' + Math.round(80 * t2) + ')'; g.fillRect(x, y0, 3.6, 5.4); } }
    g.fillStyle = '#6a4630'; g.beginPath(); g.moveTo(4, 58); g.lineTo(64, 16); g.lineTo(124, 58); g.lineTo(120, 60); g.lineTo(64, 21); g.lineTo(8, 60); g.closePath(); g.fill();
    g.fillStyle = '#c08050'; g.fillRect(8, 58, 112, 2.5);
    g.fillStyle = '#efe6d6'; g.fillRect(40, 7, 12, 14); g.fillStyle = '#2a1c12'; g.fillRect(42, 10, 8, 7); g.fillStyle = '#f6efe2'; for (var l = 0; l < 3; l++) g.fillRect(42, 10.5 + l * 2.4, 8, 1.1);   // (the cupola)
    g.fillStyle = '#7a5236'; g.beginPath(); g.moveTo(37, 8); g.lineTo(46, 1); g.lineTo(55, 8); g.closePath(); g.fill();
    g.strokeStyle = '#3a3634'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(46, 1); g.lineTo(46, -4); g.stroke();
    g.fillStyle = '#86aa88'; g.fillRect(55, 67, 18, 32); g.strokeStyle = 'rgba(60,90,60,0.45)'; g.lineWidth = 0.6; for (var d = 58.6; d < 73; d += 3.6) { g.beginPath(); g.moveTo(d, 67); g.lineTo(d, 99); g.stroke(); }   // (the door)
    g.fillStyle = '#3a3634'; g.fillRect(55, 71, 10, 1.6); g.fillRect(55, 93, 10, 1.6); g.fillStyle = '#f6efe2'; g.fillRect(53, 65, 22, 2.4); g.fillRect(53, 65, 2.2, 34); g.fillRect(72.8, 65, 2.2, 34);
    g.fillStyle = '#3a2418'; g.beginPath(); g.moveTo(64, 76); g.bezierCurveTo(59, 72, 60, 69, 64, 71.5); g.bezierCurveTo(68, 69, 69, 72, 64, 76); g.fill();
    g.strokeStyle = '#3a3634'; g.lineWidth = 1.2; g.beginPath(); g.arc(64, 61, 2.6, Math.PI * 0.2, Math.PI * 0.8, true); g.stroke();
    [[29, 64], [83, 64]].forEach(function (w) {                       // (windows with shutters and flower boxes)
      g.fillStyle = '#86aa88'; g.fillRect(w[0] - 6, w[1] - 1, 5, 16); g.fillRect(w[0] + 17, w[1] - 1, 5, 16);
      g.fillStyle = '#ffe2a8'; g.fillRect(w[0], w[1], 16, 13); g.strokeStyle = '#5a3c24'; g.lineWidth = 1.6; g.strokeRect(w[0], w[1], 16, 13); g.beginPath(); g.moveTo(w[0] + 8, w[1]); g.lineTo(w[0] + 8, w[1] + 13); g.moveTo(w[0], w[1] + 6.5); g.lineTo(w[0] + 16, w[1] + 6.5); g.stroke();
      g.fillStyle = '#7a5236'; g.fillRect(w[0] - 2, w[1] + 15, 20, 4); g.fillStyle = '#5f9a48'; g.fillRect(w[0] - 1, w[1] + 13.5, 18, 2);
      ['#f4a6c8', '#fff2e0', '#c8a8f0', '#ffb08a', '#f4a6c8'].forEach(function (col, k) { g.fillStyle = col; g.beginPath(); g.arc(w[0] + 1 + k * 3.6, w[1] + 13.5, 1.6, 0, Math.PI * 2); g.fill(); });
    });
    g.fillStyle = '#c8a070'; g.beginPath(); g.moveTo(54, 100); g.lineTo(74, 100); g.lineTo(78, 112); g.lineTo(50, 112); g.closePath(); g.fill(); g.fillStyle = 'rgba(90,60,30,0.5)'; for (var cl = 103; cl < 112; cl += 3) g.fillRect(52, cl, 24, 0.9);
    g.fillStyle = '#b88a5a'; g.fillRect(9, 86, 10, 16); g.fillStyle = '#3a3634'; g.fillRect(9, 89, 10, 1.2); g.fillRect(9, 98, 10, 1.2); g.fillStyle = '#c08050'; g.fillRect(12.5, 58, 2.4, 28);   // (the rain barrel and its downpipe)
    g.fillStyle = '#5f9a48'; [[24, 100], [36, 101], [92, 101], [104, 100]].forEach(function (f) { g.beginPath(); g.arc(f[0], f[1], 3.4, 0, Math.PI * 2); g.fill(); });
    [[22, 98, '#f4a6c8'], [26, 99, '#fff2e0'], [35, 98, '#c8a8f0'], [91, 98, '#ffb08a'], [95, 99, '#f8d860'], [104, 97, '#f4a6c8']].forEach(function (f) { g.fillStyle = f[2]; g.beginPath(); g.arc(f[0], f[1], 1.6, 0, Math.PI * 2); g.fill(); });
    g.fillStyle = '#fff6e6'; g.beginPath(); g.ellipse(98, 108, 8, 6, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(104, 101.5, 4.4, 0, Math.PI * 2); g.fill();   // (a little hen out front)
    g.beginPath(); g.moveTo(90, 106); g.lineTo(86, 100); g.lineTo(92, 104); g.fill();
    g.fillStyle = '#e05050'; g.beginPath(); g.arc(104, 97, 2.2, 0, Math.PI * 2); g.fill(); g.fillStyle = '#f0b040'; g.beginPath(); g.moveTo(108, 101); g.lineTo(111.5, 102); g.lineTo(108, 103); g.fill();
    g.fillStyle = '#2a2018'; g.beginPath(); g.arc(105.4, 100.8, 0.9, 0, Math.PI * 2); g.fill();
    return c.toDataURL();
  })();
  var carpShopOpen = false;
  var carpShopBtn = document.createElement('button');
  carpShopBtn.type = 'button'; carpShopBtn.className = 'sleep-btn ship-btn'; carpShopBtn.innerHTML = '🪚 Shop <kbd>E</kbd>';
  canvas.parentNode.appendChild(carpShopBtn);
  var carpShopBox = document.createElement('div');
  carpShopBox.className = 'inventory ship shop'; carpShopBox.hidden = true;
  carpShopBox.innerHTML = '<div class="inv-head"><b>🪚 Oak &amp; Ember</b><button type="button" class="inv-close" aria-label="Close the shop">✕</button></div>' +
    '<p class="ship-hint">Welcome to Oak &amp; Ember! Sturdy, handmade buildings for your farm, built right where you want them.</p>' +
    '<div class="shop-item"><div class="slot shop-pic coop-pic"></div><div class="shop-text"><b>Coop</b><span>A snug little whitewashed coop with a sage-green door, a shingled roof and flower boxes under the windows. Up to 4 Glimmerwings, Puddlewisps, Emberwings, Gemwrens or Celestaras can live in it, each with their own nesting box. Inside there\'s a feeding bench with 8 spots for hay: fill it up and your animals help themselves. It takes Oak &amp; Ember two days to build. You choose where it goes on a grid of your farm, even where a tree used to be.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + COOP_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="coop-buy">Build</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic fbarn-pic"></div><div class="shop-text"><b>Barn</b><span>A big red gambrel barn with white trim, sliding doors on an iron track, a hayloft with its pulley, a cupola with a moon-and-star weathervane, and a painted barn quilt. Every animal that isn\'t a coop bird lives here, up to 4, each in its own stall. Inside there\'s a feeding bench with 8 spots for hay down the middle: fill it up and your animals walk out of their stalls to eat. It takes Oak &amp; Ember two days to build. You choose where it goes on a grid of your farm, even where a tree used to be.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + FBARN_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="fbarn-buy">Build</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic mill-pic"></div><div class="shop-text"><b>Mill</b><span>A tall white windmill on a fieldstone base, with a wooden gallery all round, a green cap, four lattice sails with canvas that turn in the breeze, and a little fantail. It takes Oak &amp; Ember two days to build: watch it go up, from a timber frame to its sails. It doesn\'t do anything just yet. You choose where it goes on a grid of your farm.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + MILL_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="mill-buy">Build</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic silo-pic"></div><div class="shop-text"><b>Silo</b><span>A tall round silo of red-painted staves bound with iron hoops, on a fieldstone base, with a silver dome and a little weathervane, a ladder up its side, and a glass strip up its front that shows how full it is. It holds hay and only hay: up to 300 bundles. Pour your hay in through the chute at its foot, and take it out a bundle at a time from the hoppers in your coop and barn. It takes Oak &amp; Ember two days to build. You choose where it goes on a grid of your farm.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + SILO_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="silo-buy">Build</button></div>' +
    '<p class="ship-total">You have <img class="coin-icon" alt=""> <b>0</b></p>';
  canvas.parentNode.appendChild(carpShopBox);
  (function () { var pic = document.createElement('img'); pic.src = coopShopIcon; pic.alt = ''; pic.style.width = '96%'; pic.style.pointerEvents = 'none'; carpShopBox.querySelector('.coop-pic').appendChild(pic); })();
  (function () { var pic = document.createElement('img'); pic.src = fbarnShopIcon(); pic.alt = ''; pic.style.width = '96%'; pic.style.pointerEvents = 'none'; carpShopBox.querySelector('.fbarn-pic').appendChild(pic); })();
  (function () { var pic = document.createElement('img'); pic.src = millShopIcon(); pic.alt = ''; pic.style.width = '96%'; pic.style.pointerEvents = 'none'; carpShopBox.querySelector('.mill-pic').appendChild(pic); })();
  (function () { var pic = document.createElement('img'); pic.src = siloShopIcon(); pic.alt = ''; pic.style.width = '96%'; pic.style.pointerEvents = 'none'; carpShopBox.querySelector('.silo-pic').appendChild(pic); })();
  shopCards(carpShopBox);
  carpShopBox.querySelector('.shop-card').parentNode.insertBefore(shopHeading('Buildings'), carpShopBox.querySelector('.shop-card'));
  var carpTilesSync = shopCatalogue(carpShopBox); carpShopBox.classList.add('shop-wide');
  var carpShopCoins = carpShopBox.querySelector('.ship-total b'), coopBuyBtn = carpShopBox.querySelector('.coop-buy'), fbarnBuyBtn = carpShopBox.querySelector('.fbarn-buy'), millBuyBtn = carpShopBox.querySelector('.mill-buy'), siloBuyBtn = carpShopBox.querySelector('.silo-buy');
  function carpBusy() {                                                // (what Oak & Ember are building right now, if anything: they take one job at a time)
    if (coop.built && !siteReady(coop)) return { what: 'coop', ready: coop.start + SITE_DAYS };
    if (fbarn.built && !siteReady(fbarn)) return { what: 'barn', ready: fbarn.start + SITE_DAYS };
    if (mill.built && mill.stage < MILL_DAYS) return { what: 'mill', ready: mill.start + MILL_DAYS };
    if (silo.built && !siloReady()) return { what: 'silo', ready: silo.start + SILO_DAYS };
    return null;
  }
  function carpBusyNote(b) { return 'Oak & Ember are still building your ' + b.what + ': come back on ' + seasonDay(b.ready) + ' for your next one 🪚'; }
  function renderCarpShop() {
    carpShopCoins.textContent = state.coins;
    var busy = carpBusy();
    coopBuyBtn.innerHTML = coop.built ? (siteReady(coop) ? 'Built ✓' : 'Being built: ready ' + seasonDay(coop.start + SITE_DAYS)) : 'Build · <img class="coin-icon" alt=""> ' + COOP_COST.toLocaleString('en-US');
    coopBuyBtn.disabled = coop.built || state.coins < COOP_COST;
    fbarnBuyBtn.innerHTML = fbarn.built ? (siteReady(fbarn) ? 'Built ✓' : 'Being built: ready ' + seasonDay(fbarn.start + SITE_DAYS)) : 'Build · <img class="coin-icon" alt=""> ' + FBARN_COST.toLocaleString('en-US');
    fbarnBuyBtn.disabled = fbarn.built || state.coins < FBARN_COST;
    millBuyBtn.innerHTML = !mill.built ? 'Build · <img class="coin-icon" alt=""> ' + MILL_COST.toLocaleString('en-US') : mill.stage < MILL_DAYS ? 'Being built: ready ' + seasonDay(mill.start + MILL_DAYS) : 'Built ✓';
    millBuyBtn.disabled = mill.built || state.coins < MILL_COST;
    siloBuyBtn.innerHTML = !silo.built ? 'Build · <img class="coin-icon" alt=""> ' + SILO_COST.toLocaleString('en-US') : !siloReady() ? 'Being built: ready ' + seasonDay(silo.start + SILO_DAYS) : 'Built ✓';
    siloBuyBtn.disabled = silo.built || state.coins < SILO_COST;
    if (busy) [[coopBuyBtn, coop], [fbarnBuyBtn, fbarn], [millBuyBtn, mill], [siloBuyBtn, silo]].forEach(function (b) {   // (one building at a time: the rest wait until this one's done)
      if (b[1].built) return;
      b[0].innerHTML = 'After your ' + busy.what + ' · ' + seasonDay(busy.ready); b[0].disabled = true;
    });
    carpTilesSync();
  }
  function atCarpCounter(margin) {                                     // standing in front of the counter, on the door side
    if (!inCarp) return false;
    var lx = player.position.x - CPI_X, lz = player.position.z - CPI_Z, m = margin || 0;
    return Math.abs(lx) < 1.6 + m && lz > 0.8 && lz < 2.4 + m;
  }
  function openCarpShop() { if (carpShopOpen) return; toggleBag(false); carpShopOpen = true; menuOpenedAt = Date.now(); walkTarget = null; carpShopBox.hidden = false; renderCarpShop(); }
  function closeCarpShop() { carpShopOpen = false; carpShopBox.hidden = true; }
  carpShopBox.querySelector('.inv-close').addEventListener('click', function () { closeCarpShop(); focusGame(); });
  carpShopBtn.addEventListener('click', function () { openCarpShop(); focusGame(); });
  coopBuyBtn.addEventListener('click', function () {
    if (coop.built) { showToast('You already have a coop', 1800); return; }
    if (carpBusy()) { showToast(carpBusyNote(carpBusy()), 3200); return; }
    if (state.coins < COOP_COST) { showToast('Not enough Star Coins', 1800); return; }
    closeCarpShop(); coopOpenPlacer(COOP_SPEC);
  });
  fbarnBuyBtn.addEventListener('click', function () {
    if (fbarn.built) { showToast('You already have a barn', 1800); return; }
    if (carpBusy()) { showToast(carpBusyNote(carpBusy()), 3200); return; }
    if (state.coins < FBARN_COST) { showToast('Not enough Star Coins', 1800); return; }
    closeCarpShop(); coopOpenPlacer(FBARN_SPEC);
  });
  millBuyBtn.addEventListener('click', function () {
    if (mill.built) { showToast('You already have a mill', 1800); return; }
    if (carpBusy()) { showToast(carpBusyNote(carpBusy()), 3200); return; }
    if (state.coins < MILL_COST) { showToast('Not enough Star Coins', 1800); return; }
    closeCarpShop(); coopOpenPlacer(MILL_SPEC);
  });
  siloBuyBtn.addEventListener('click', function () {
    if (silo.built) { showToast('You already have a silo', 1800); return; }
    if (carpBusy()) { showToast(carpBusyNote(carpBusy()), 3200); return; }
    if (state.coins < SILO_COST) { showToast('Not enough Star Coins', 1800); return; }
    closeCarpShop(); coopOpenPlacer(SILO_SPEC);
  });
  function updateCarpShop() {
    if (carpShopOpen && !atCarpCounter(1.2)) closeCarpShop();          // it stays open until you really walk away from the counter
    if (carpShopOpen && carpShopCoins.textContent !== String(state.coins)) renderCarpShop();
    var show = atCarpCounter() && !carpShopOpen;
    if (carpShopBtn.classList.contains('show') !== show) carpShopBtn.classList.toggle('show', show);
  }

  // ===== choosing where it goes: a grid of your farm =====
  var CPG_X0 = -36, CPG_Z0 = -36, CPG_SPAN = 72, CPG_S = 12;          // the area the grid shows, and how many pixels a metre
  var coopPlacing = false, coopPick = null, coopHover = null, coopOK = {}, coopBg = null, placeSpec = null, placeRot = 0;   // (placeSpec: the building being placed: the coop or the barn)
  var coopPlaceBox = document.createElement('div');
  coopPlaceBox.className = 'inventory ship shop shop-wide'; coopPlaceBox.hidden = true;
  coopPlaceBox.innerHTML = '<div class="inv-head"><b class="place-title">🐔 Where should your coop go?</b><button type="button" class="inv-close" aria-label="Cancel">✕</button></div>' +
    '<p class="ship-hint place-hint">Tap your farm to choose a spot. The coop takes 5 × 4 tiles, with its door facing south (down the map) to start. <b style="color:#2f8a4e">Green</b> means it fits; <b style="color:#c0392b">red</b> means something\'s in the way. Where a tree, bush or rock was cleared is fine, and nothing will grow back under your coop.</p>' +
    '<div class="coop-map" style="height:min(52vh,420px);overflow:auto;border-radius:12px;box-shadow:inset 0 0 0 2px #fff;background:#cfe8ff;position:relative;cursor:crosshair;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y"></div>' +
    '<p class="ship-hint coop-note" style="margin:8px 2px;min-height:1.3em;font-weight:600"></p>' +
    '<div class="shop-buy"><button type="button" class="coop-cancel">Cancel</button><button type="button" class="coop-rotate" title="Turn it (R)">⟳ Rotate</button><button type="button" class="coop-build">Build here</button></div>';
  canvas.parentNode.appendChild(coopPlaceBox);
  var coopMapBox = coopPlaceBox.querySelector('.coop-map'), coopNote = coopPlaceBox.querySelector('.coop-note'), coopBuildBtn = coopPlaceBox.querySelector('.coop-build');
  var coopCv = document.createElement('canvas'); coopCv.width = coopCv.height = CPG_SPAN * CPG_S * 2;
  coopCv.style.cssText = 'display:block;width:' + CPG_SPAN * CPG_S + 'px;height:' + CPG_SPAN * CPG_S + 'px;max-width:none;';
  coopMapBox.appendChild(coopCv);
  function cpgXY(x, z) { return [(x - CPG_X0) * CPG_S * 2, (z - CPG_Z0) * CPG_S * 2]; }
  var CPG_C0 = Math.ceil((CPG_X0 - FARM_X) / TILE), CPG_C1 = Math.floor((CPG_X0 + CPG_SPAN - FARM_X) / TILE) - 1, CPG_R0 = Math.ceil((CPG_Z0 - FARM_Z) / TILE), CPG_R1 = Math.floor((CPG_Z0 + CPG_SPAN - FARM_Z) / TILE) - 1;
  function coopTileOK(c, r, clear) {                                   // is this tile open ground the coop could stand on?
    var x = FARM_X + (c + 0.5) * TILE, z = FARM_Z + (r + 0.5) * TILE, h = TILE / 2;
    var pts = [[x - h, z - h], [x + h, z - h], [x - h, z + h], [x + h, z + h], [x, z]];
    for (var k = 0; k < pts.length; k++) {
      var px = pts[k][0], pz = pts[k][1];
      if (!onIsland(px, pz) || onIsle2(px, pz, -2) || onDock(px, pz) || groundHeight(px, pz) < -0.02 || nearBridgeLanding(px, pz, 0) || pathDist(px, pz) < PATH_W + 0.15) return false;   // (on the land, off the lake, the dock, the bridge and the path)
    }
    if (dist(x, z, TREE_X, TREE_Z) < TREE_ZONE + 1.6 || inHouseYard(x, z) || dist(x, z, binWorld.x, binWorld.z) < 1.8) return false;
    var t = tileMap[tileKey(c, r)]; if (t && t.soil) return false;    // (not on your soil)
    if (coopCovers(x, z, -0.05) || fbarnCovers(x, z, -0.05) || millCovers(x, z, -0.05) || siloCovers(x, z, -0.05)) return false;   // (nor on your coop, barn, mill or silo)
    for (var i = 0; i < solids.length; i++) { var sd = solids[i]; if (sd.r > 0 && !clear[i] && Math.abs(sd.x - x) < sd.r + h && Math.abs(sd.z - z) < sd.r + h) return false; }   // (nothing standing in the way)
    return true;
  }
  function placeFC() { return placeRot % 2 ? placeSpec.fr : placeSpec.fc; }   // (tiles across and down, the way it's turned)
  function placeFR() { return placeRot % 2 ? placeSpec.fc : placeSpec.fr; }
  function coopFits(c0, r0) { for (var c = c0; c < c0 + placeFC(); c++) for (var r = r0; r < r0 + placeFR(); r++) if (!coopOK[c + ',' + r]) return false; return true; }
  function coopDrawBg() {                                              // the farm, its soil, its trees, bushes and rocks, the house and the Dawn Tree, and the grid over it all
    if (!mapBase) mapBase = drawMapBase();
    var cv = document.createElement('canvas'); cv.width = cv.height = coopCv.width; var g = cv.getContext('2d'), K = CPG_S * 2;
    var ms = MAP_S * 2; g.drawImage(mapBase, (CPG_X0 - MAP_X0) * ms, (CPG_Z0 - MAP_Z0) * ms, CPG_SPAN * ms, CPG_SPAN * ms, 0, 0, cv.width, cv.height);
    function dot(x, z, r, col, ring) { var p = cpgXY(x, z); g.beginPath(); g.arc(p[0], p[1], r, 0, Math.PI * 2); g.fillStyle = col; g.fill(); if (ring) { g.strokeStyle = ring; g.lineWidth = 2; g.stroke(); } }
    tiles.forEach(function (t) { if (!t.soil) return; var p = cpgXY(t.x, t.z), s = TILE * K * 0.92; g.fillStyle = t.wet ? '#5a3a24' : '#8a5a3c'; g.fillRect(p[0] - s / 2, p[1] - s / 2, s, s); });
    for (var c = CPG_C0; c <= CPG_C1; c++) for (var r = CPG_R0; r <= CPG_R1; r++) {   // (the grid: tiles where the coop can't go are shaded red)
      var x = FARM_X + (c + 0.5) * TILE, z = FARM_Z + (r + 0.5) * TILE; if (!onIsland(x, z)) continue;
      var p = cpgXY(FARM_X + c * TILE, FARM_Z + r * TILE), s = TILE * K;
      if (!coopOK[c + ',' + r]) { g.fillStyle = 'rgba(225,60,85,0.4)'; g.fillRect(p[0], p[1], s, s); }
      g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 1.5; g.strokeRect(p[0] + 0.75, p[1] + 0.75, s - 1.5, s - 1.5);
    }
    var hp = cpgXY(HOUSE_X, HOUSE_Z), hw2 = HW / 2 * K, hd2 = HD / 2 * K;   // (the house, the Dawn Tree, and everything standing)
    g.fillStyle = '#6a4aa8'; g.fillRect(hp[0] - hw2 - 4, hp[1] - hd2 - 4, hw2 * 2 + 8, hd2 * 2 + 8); g.fillStyle = '#7d5cc0'; g.fillRect(hp[0] - hw2 - 4, hp[1] - hd2 - 4, hw2 * 2 + 8, hd2 + 4);
    var dp = cpgXY(TREE_X, TREE_Z), dg = g.createRadialGradient(dp[0], dp[1], 4, dp[0], dp[1], TREE_ZONE * K + 20); dg.addColorStop(0, 'rgba(255,170,230,0.95)'); dg.addColorStop(1, 'rgba(255,170,230,0)');
    g.fillStyle = dg; g.beginPath(); g.arc(dp[0], dp[1], TREE_ZONE * K + 20, 0, Math.PI * 2); g.fill();
    mineable.forEach(function (r) { if (r.gone) return; if (r.state === 'whole') { dot(r.x, r.z, 4 + r.size * 4, '#a4a4ae', 'rgba(70,70,80,0.7)'); dot(r.x - 0.1, r.z - 0.12, 2 + r.size * 1.5, 'rgba(255,255,255,0.5)'); } });
    allScenery.forEach(function (t) {
      var u = t.userData; if (u.gone) return;
      if (u.state !== 'standing') { dot(u.base.x, u.base.z, 6, '#9a7048', '#6a4a2a'); dot(u.base.x, u.base.z, 3, '#e0c090'); return; }   // (a stump or a cleared spot: fine to build on)
      if (choppable.indexOf(t) < 0) { dot(u.base.x, u.base.z, 8, '#7cc464', 'rgba(40,90,40,0.6)'); return; }   // (a bush)
      var sz = u.size || 1; dot(u.base.x + 3, u.base.z + 4, 14 * sz, 'rgba(0,0,0,0.18)');
      dot(u.base.x, u.base.z, 14 * sz, u.leafy ? '#3f9a3a' : '#2a6a30', 'rgba(20,60,20,0.7)'); dot(u.base.x - 0.25, u.base.z - 0.25, 6 * sz, u.leafy ? '#74c45e' : '#4a8a46');   // (a tree, seen from above)
    });
    return cv;
  }
  function coopDrawPlacer() {
    var g = coopCv.getContext('2d'), K = CPG_S * 2; g.drawImage(coopBg, 0, 0);
    var yp = cpgXY(player.position.x, player.position.z);              // (you, as a little purple hat)
    if (!indoors) { g.beginPath(); g.ellipse(yp[0], yp[1] + 5, 13, 5, 0, 0, Math.PI * 2); g.fillStyle = '#5b3fb0'; g.fill(); g.beginPath(); g.moveTo(yp[0] - 7, yp[1] + 4); g.lineTo(yp[0] + 3, yp[1] - 16); g.lineTo(yp[0] + 7, yp[1] + 4); g.closePath(); g.fillStyle = '#7b4fd6'; g.fill(); }
    var sel = coopPick || coopHover; if (!sel) return;
    var ok = coopFits(sel[0], sel[1]), p = cpgXY(FARM_X + sel[0] * TILE, FARM_Z + sel[1] * TILE), w = placeFC() * TILE * K, h = placeFR() * TILE * K, P = placeSpec;
    g.fillStyle = ok ? 'rgba(80,200,110,' + (coopPick ? 0.5 : 0.3) + ')' : 'rgba(220,70,70,0.45)'; g.fillRect(p[0], p[1], w, h);
    g.lineWidth = coopPick ? 4 : 2; g.strokeStyle = ok ? '#2f8a4e' : '#c0392b'; g.strokeRect(p[0], p[1], w, h);
    g.save(); g.translate(p[0] + w / 2, p[1] + h / 2); g.rotate(-placeRot * Math.PI / 2);   // (turned the way it'll face)
    var bx = 0, by = -P.off * K;                                       // (the building's roof, and its door at the front)
    g.fillStyle = ok ? P.roof : 'rgba(122,82,54,0.5)'; g.fillRect(bx - P.bw / 2 * K, by - P.bd / 2 * K, P.bw * K, P.bd * K);
    g.fillStyle = 'rgba(60,50,40,0.9)'; if (P.ridgeZ) g.fillRect(bx - 2, by - P.bd / 2 * K, 4, P.bd * K); else g.fillRect(bx - P.bw / 2 * K, by - 2, P.bw * K, 4);
    g.fillStyle = P.doorCol; g.fillRect(bx - P.door / 2 * K, by + P.bd / 2 * K, P.door * K, 1.0 * K);
    g.restore();
    g.font = 'bold 26px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(P.emoji, p[0] + w / 2, p[1] + h / 2);
  }
  function coopPickAt(e) {
    var rc = coopCv.getBoundingClientRect(), x = CPG_X0 + (e.clientX - rc.left) / rc.width * CPG_SPAN, z = CPG_Z0 + (e.clientY - rc.top) / rc.height * CPG_SPAN;
    return [Math.floor((x - FARM_X) / TILE) - Math.floor(placeFC() / 2), Math.floor((z - FARM_Z) / TILE) - Math.floor(placeFR() / 2)];
  }
  function coopPlacerState() {
    var ok = coopPick && coopFits(coopPick[0], coopPick[1]);
    coopBuildBtn.innerHTML = 'Build here · <img class="coin-icon" alt=""> ' + placeSpec.cost.toLocaleString('en-US'); paintCoinIcons(coopPlaceBox);
    coopBuildBtn.disabled = !ok || state.coins < placeSpec.cost;
    coopNote.style.color = !coopPick ? '#7a6a98' : ok ? '#2f8a4e' : '#c0392b';
    coopNote.textContent = !coopPick ? 'Tap a spot on the map.' : ok ? 'That spot is perfect! Press "Build here".' : 'Something\'s in the way there: try somewhere else.';
  }
  (function () {                                                       // tap to choose; drag (or scroll) to look around
    var dragAt = null, dragged = false;
    coopMapBox.addEventListener('mousedown', function (e) { dragAt = { x: e.clientX, y: e.clientY, l: coopMapBox.scrollLeft, t: coopMapBox.scrollTop }; dragged = false; e.preventDefault(); });
    window.addEventListener('mousemove', function (e) {
      if (dragAt) { if (Math.abs(e.clientX - dragAt.x) + Math.abs(e.clientY - dragAt.y) > 6) dragged = true; if (dragged) { coopMapBox.scrollLeft = dragAt.l - (e.clientX - dragAt.x); coopMapBox.scrollTop = dragAt.t - (e.clientY - dragAt.y); } return; }
      if (coopPlacing && e.target === coopCv) { var h = coopPickAt(e); if (!coopHover || h[0] !== coopHover[0] || h[1] !== coopHover[1]) { coopHover = h; coopDrawPlacer(); } }
    });
    window.addEventListener('mouseup', function () { dragAt = null; });
    coopCv.addEventListener('mouseleave', function () { if (coopHover) { coopHover = null; coopDrawPlacer(); } });
    coopCv.addEventListener('click', function (e) { if (dragged) { dragged = false; return; } coopPick = coopPickAt(e); coopDrawPlacer(); coopPlacerState(); });
  })();
  function coopOpenPlacer(spec) {
    placeSpec = spec; placeRot = 0; coopPlaceBox.querySelector('.place-title').textContent = spec.title; coopPlaceBox.querySelector('.place-hint').innerHTML = spec.hint;
    var clear = solids.map(function () { return false; });             // (stumps, saplings and cleared spots don't count as in the way)
    allScenery.forEach(function (t) { var u = t.userData; if (!u.gone && u.state !== 'standing') { var i = solids.indexOf(u.solid); if (i >= 0) clear[i] = true; } });
    mineable.forEach(function (r) { if (!r.gone && r.state !== 'whole') { var i = solids.indexOf(r.solid); if (i >= 0) clear[i] = true; } });
    coopOK = {};
    for (var c = CPG_C0; c <= CPG_C1; c++) for (var r = CPG_R0; r <= CPG_R1; r++) coopOK[c + ',' + r] = coopTileOK(c, r, clear);
    coopBg = coopDrawBg(); coopPick = coopHover = null;
    toggleBag(false); coopPlacing = true; walkTarget = null; coopPlaceBox.hidden = false;
    coopDrawPlacer(); coopPlacerState();
    var fx = indoors ? 0 : player.position.x, fz = indoors ? 0 : player.position.z, cp = cpgXY(fx, fz);
    setTimeout(function () { coopMapBox.scrollLeft = cp[0] / 2 - coopMapBox.clientWidth / 2; coopMapBox.scrollTop = cp[1] / 2 - coopMapBox.clientHeight / 2; }, 0);
  }
  function coopClosePlacer() { coopPlacing = false; coopPlaceBox.hidden = true; coopBg = null; focusGame(); }
  coopPlaceBox.querySelector('.inv-close').addEventListener('click', coopClosePlacer);
  coopPlaceBox.querySelector('.coop-cancel').addEventListener('click', coopClosePlacer);
  function coopRotatePlacer() {                                        // (turn it a quarter, keeping it on the same spot)
    var keep = coopPick || coopHover, cx = keep ? keep[0] + placeFC() / 2 : 0, cz = keep ? keep[1] + placeFR() / 2 : 0;
    placeRot = (placeRot + 1) % 4;
    if (coopPick) coopPick = [Math.round(cx - placeFC() / 2), Math.round(cz - placeFR() / 2)];
    if (coopHover) coopHover = [Math.round(cx - placeFC() / 2), Math.round(cz - placeFR() / 2)];
    coopDrawPlacer(); coopPlacerState();
  }
  coopPlaceBox.querySelector('.coop-rotate').addEventListener('click', coopRotatePlacer);
  window.addEventListener('keydown', function (e) {                    // (R turns it too, while you're choosing a spot)
    if (!coopPlacing || e.code !== 'KeyR' || e.repeat) return;
    e.preventDefault(); e.stopImmediatePropagation(); coopRotatePlacer();
  }, true);
  coopBuildBtn.addEventListener('click', function () {
    if (!coopPick || !coopFits(coopPick[0], coopPick[1]) || placeSpec.built()) return;
    if (carpBusy()) { showToast(carpBusyNote(carpBusy()), 3200); return; }
    if (state.coins < placeSpec.cost) { showToast('Not enough Star Coins', 1800); return; }
    state.coins -= placeSpec.cost; showCoins(true); coinSound(10);
    placeSpec.build(coopPick[0], coopPick[1], placeRot); coopClosePlacer(); spellSound(); homeMigrate(false);
    showToast(typeof placeSpec.done === 'function' ? placeSpec.done() : placeSpec.done, 5200);
  });
  var PLACE_HINT_END = ' Press <b>⟳ Rotate</b> (or R) to turn it. <b style="color:#2f8a4e">Green</b> means it fits; <b style="color:#c0392b">red</b> means something\'s in the way. Where a tree, bush or rock was cleared is fine, and nothing will grow back under it.';
  var COOP_SPEC = { title: '🐔 Where should your coop go?', hint: 'Tap your farm to choose a spot. The coop takes 5 × 4 tiles, with its door facing south (down the map) to start.' + PLACE_HINT_END, fc: COOP_FC, fr: COOP_FR, bw: COOP_BW, bd: COOP_BD, off: 0.45, door: 1.1, roof: 'rgba(122,82,54,0.85)', doorCol: '#92b596', emoji: '🐔', cost: COOP_COST,
    built: function () { return coop.built; }, build: function (c, r, rot) { coop.hay = [false, false, false, false, false, false, false, false]; coop.res = []; coopPlace(c, r, farmDay(), rot); coopHayShow(); },
    done: function () { return '🐔 Oak & Ember have started building your coop! It takes two days: it\'ll be finished on the morning of ' + seasonDay(coop.start + SITE_DAYS) + '.'; } };
  window.addEventListener('keydown', function (e) {
    if (e.code !== 'Escape') return;
    if (carpShopOpen) closeCarpShop();
    if (coopPlacing) coopClosePlacer();
  });
  function coopDrawOnMap(g, K, label) {                                // (on the world map: its brown roof with the ridge along it, and its green door)
    var pc = mapXY(coop.x, coop.z), p = [0, 0];
    g.save(); g.translate(pc[0], pc[1]); g.rotate(-bRot(coop));          // (turned the way it faces)
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(p[0] - COOP_BW / 2 * K + 6, p[1] - COOP_BD / 2 * K + 8, COOP_BW * K, COOP_BD * K);
    g.fillStyle = '#6e5038'; g.fillRect(p[0] - COOP_BW / 2 * K - 4, p[1] - COOP_BD / 2 * K - 4, COOP_BW * K + 8, COOP_BD / 2 * K + 4);
    g.fillStyle = '#8a6646'; g.fillRect(p[0] - COOP_BW / 2 * K - 4, p[1], COOP_BW * K + 8, COOP_BD / 2 * K + 4);
    g.fillStyle = '#5a3c26'; g.fillRect(p[0] - COOP_BW / 2 * K - 4, p[1] - 2, COOP_BW * K + 8, 4);
    g.fillStyle = '#92b596'; g.fillRect(p[0] - 0.55 * K, p[1] + COOP_BD / 2 * K + 4, 1.1 * K, 0.9 * K);
    g.restore();
    label(siteReady(coop) ? 'Coop' : 'Coop (being built)', coop.x, coop.z, COOP_BD / 2 * K + 30);
  }

  // ===== every frame =====
  var coopBaseInteract = interact;
  interact = function () {
    if (coopPlacing) return;
    if (carpShopOpen) { if (!menuJustOpened()) closeCarpShop(); return; }
    if (atCarpCounter()) { openCarpShop(); return; }                   // at Oak & Ember's counter: the carpenter's menu
    if (inCoop && !glimNaming) { var tg = coopTarget(); if (tg) { if (tg === 'bench') coopBenchAction(); else coopCare(tg); return; } }
    return coopBaseInteract.apply(this, arguments);
  };
  function updateCoop(dt, night) {
    if (inCoop && player.parent !== coopScene) inCoop = false;         // (carried home or teleported away from inside)
    updateCarpShop();
    updateCoopButton();
    if (!coop.built) return;
    siteTick('coop');
    updateCoopFeeding(dt);
    if (inCoop) updateCoopInside(state.time); else updateCoopOutside(state.time, night);
  }
  // ---------- Your barn: Oak & Ember's second building ----------
  // For 3,000 Star Coins, Oak & Ember builds you a big red gambrel barn, placed with the same grid of your farm as the
  // coop (it takes 8 × 7 tiles). Every animal that isn't a coop bird lives here now, never at Fluff & Feather: up to
  // four, one to a stall. Inside, its four stalls are laid out just like Fluff & Feather's (only turned to run along
  // the back wall), so every animal behaves exactly as it always has; down the middle of the barn is a feeding bench
  // with eight spots for hay, and each hungry animal walks out of its stall to eat a bundle by itself
  var FBARN_STALL0 = 7, FBARN_CAP = 4;
  var FBARN_KINDS = ['moon', 'aurora', 'zephyra', 'luna', 'bubble', 'prism', 'lotus', 'axo', 'liz', 'tort', 'bison', 'crab'];
  var FBARN_NAMES = { moon: 'Mooncalf', aurora: 'Auroraram', zephyra: 'Zephyra', luna: 'Lunastra', bubble: 'Sirenna', prism: 'Prismara', lotus: 'Nymphalia', axo: 'Veilaris', liz: 'Lumora', tort: 'Amarys', bison: 'Nyxalia', crab: 'Iridelle' };
  var FBARN_FC = 8, FBARN_FR = 7, FBARN_BW = 9.4, FBARN_BD = 7.2, FBARN_WALL = 3.0, FBARN_OFF = 0.7;   // tiles it takes; its walls' width, depth and height; how far back of its patch it sits
  var FBARN_DZ = 4 - FBARN_BD / 2;                                     // (the stalls' frame: Fluff & Feather's stalls, turned a quarter so they run along the back wall)
  for (var fbs = 0; fbs < FBARN_CAP; fbs++) GLIM_STALLS[FBARN_STALL0 + fbs] = -3.3 + fbs * 2.2;
  var FBARN_SLOT_X = []; for (var fbx = 0; fbx < 8; fbx++) FBARN_SLOT_X.push(-2.45 + fbx * 0.7);
  var fbarn = { built: false, c: 0, r: 0, fx: 0, fz: 0, x: 0, z: 0, fy: 0, hay: [false, false, false, false, false, false, false, false], res: [], grass: [], solids: [], tp: null, start: 0, stage: -1 };
  var fbarnDoor = { x: 1e6, z: 1e6 }, fbarnGroup = null, fbarnGlows = [], inFbarn = false;
  var FBARN_SPEC = { title: '🐮 Where should your barn go?', hint: 'Tap your farm to choose a spot. The barn takes 8 × 7 tiles, with its big doors facing south (down the map) to start.' + PLACE_HINT_END, fc: FBARN_FC, fr: FBARN_FR, bw: FBARN_BW, bd: FBARN_BD, off: FBARN_OFF, door: 3.0, roof: 'rgba(100,96,92,0.88)', doorCol: '#b84a3c', emoji: '🐮', ridgeZ: true, cost: FBARN_COST,
    built: function () { return fbarn.built; }, build: function (c, r, rot) { fbarn.hay = [false, false, false, false, false, false, false, false]; fbarn.res = []; fbarnPlace(c, r, farmDay(), rot); fbarnHayShow(); },
    done: function () { return '🐮 Oak & Ember have started building your barn! It takes two days: it\'ll be finished on the morning of ' + seasonDay(fbarn.start + SITE_DAYS) + '.'; } };
  function fbarnFront(d) { var f = bOff(fbarn, 0, FBARN_BD / 2 + d); return { x: fbarn.x + f.x, z: fbarn.z + f.z }; }
  function fbarnCovers(x, z, r) { return fbarn.built && Math.abs(x - fbarn.fx) < bFC(fbarn, FBARN_FC, FBARN_FR) * TILE / 2 + r && Math.abs(z - fbarn.fz) < bFR(fbarn, FBARN_FC, FBARN_FR) * TILE / 2 + r; }
  var fbarnBaseSoilNear = soilNear;                                    // (nothing grows back under the barn either)
  soilNear = function (x, z, r) { return fbarnBaseSoilNear(x, z, r) || fbarnCovers(x, z, r); };
  function fbarnFreeStall() { for (var s = FBARN_STALL0; s < FBARN_STALL0 + FBARN_CAP; s++) if (!glimmers.some(function (g) { return g.stall === s; })) return s; return -1; }
  function fbarnAnimals() { return glimmers.filter(function (g) { return g.stall >= FBARN_STALL0; }); }
  function fbarnKindCost(kind) { return { moon: MOON_COST, aurora: AURORA_COST, zephyra: ZEPHYRA_COST, luna: LUNA_COST, bubble: BUBBLE_COST, prism: PRISM_COST, lotus: LOTUS_COST, axo: AXO_COST, liz: LIZ_COST, tort: TORT_COST, bison: BIS_COST, crab: CRB_COST }[kind]; }
  function fbarnToRoom(x, z) { return [-z, x + FBARN_DZ]; }            // (from the stalls' frame to the barn's room, and back)
  function fbarnToFrame(x, z) { return [z - FBARN_DZ, -x]; }
  function glimHome(g) { return g.stall >= FBARN_STALL0 ? 2 : g.stall >= COOP_STALL0 ? 1 : 0; }   // 0: a stall at Fluff & Feather, 1: your coop, 2: your barn

  // ===== what it's made of =====
  var FBG = [[-4.7, 0], [4.7, 0], [4.7, 3.0], [2.9, 4.5], [0, 5.35], [-2.9, 4.5], [-4.7, 3.0]];   // (the outline of its gambrel end walls)
  function fbarnTop(x) { var a = Math.abs(x); return a > 2.9 ? 3.0 + (4.7 - a) / 1.8 * 1.5 : 4.5 + (2.9 - a) / 2.9 * 0.85; }
  function fbarnWall(parent, pts, holes, door, mat, x, z, ry) {        // (one wall: boards in any outline, with holes for windows and a notch for a door)
    var s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]);
    if (door) { s.lineTo(door[0], 0); s.lineTo(door[0], door[2]); s.lineTo(door[1], door[2]); s.lineTo(door[1], 0); }
    for (var i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath();
    holes.forEach(function (o) { var p = new THREE.Path(); p.moveTo(o[0], o[2]); p.lineTo(o[1], o[2]); p.lineTo(o[1], o[3]); p.lineTo(o[0], o[3]); p.closePath(); s.holes.push(p); });
    var geo = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: false }); geo.translate(0, 0, -0.07);
    var m = new THREE.Mesh(geo, mat); m.position.set(x, 0, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; parent.add(m); return m;
  }
  var fbmRed = new THREE.MeshStandardMaterial({ map: coopBoardTex, color: 0xb84a3c, roughness: 0.85 });
  var fbmRedDark = new THREE.MeshStandardMaterial({ color: 0x9a3a30, roughness: 0.8 });
  var fbmDoor = new THREE.MeshStandardMaterial({ map: coopBoardTex, color: 0xa84236, roughness: 0.8 });
  var fbmBoardIn = new THREE.MeshStandardMaterial({ map: coopBoardTex, color: 0xd8b48a, roughness: 0.85 });
  var fbmShake = new THREE.MeshStandardMaterial({ map: coopShakeTex, roughness: 0.9 });
  var fbmWater = new THREE.MeshStandardMaterial({ color: 0x6a9ab0, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.85 });
  var fbmChurn = new THREE.MeshStandardMaterial({ color: 0xc8ced4, metalness: 0.65, roughness: 0.3 });
  var fbQuiltTex = cpTex(256, 256, function (g, w, h) {               // (a barn quilt: a painted eight-pointed star, block by block)
    g.fillStyle = '#fbf3e4'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ffffff'; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14);
    var cx = w / 2, cy = h / 2, cols = ['#e889b0', '#b89ae8', '#f2c25a', '#8cc8a8'];
    for (var k = 0; k < 8; k++) { var a = k / 8 * Math.PI * 2; g.fillStyle = cols[k % 4]; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 104, cy + Math.sin(a) * 104); g.lineTo(cx + Math.cos(a + Math.PI / 8) * 54, cy + Math.sin(a + Math.PI / 8) * 54); g.closePath(); g.fill(); g.fillStyle = cols[(k + 2) % 4]; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a + Math.PI / 8) * 54, cy + Math.sin(a + Math.PI / 8) * 54); g.lineTo(cx + Math.cos(a + Math.PI / 4) * 104, cy + Math.sin(a + Math.PI / 4) * 104); g.closePath(); g.fill(); }
    g.fillStyle = '#fbf3e4'; g.beginPath(); g.arc(cx, cy, 20, 0, Math.PI * 2); g.fill(); g.fillStyle = '#e889b0'; g.beginPath(); g.arc(cx, cy, 11, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(120,80,60,0.25)'; g.lineWidth = 1; for (var q = 1; q < 4; q++) { g.beginPath(); g.moveTo(q * w / 4, 14); g.lineTo(q * w / 4, h - 14); g.stroke(); g.beginPath(); g.moveTo(14, q * h / 4); g.lineTo(w - 14, q * h / 4); g.stroke(); }
  });
  var fbFloorTex = cpTex(512, 512, function (g, w, h) {               // (wide floorboards, worn pale down the middle)
    var n = 7, ph = h / n;
    for (var i = 0; i < n; i++) {
      var b = 128 + Math.random() * 34; g.fillStyle = 'rgb(' + Math.round(b) + ',' + Math.round(b * 0.74) + ',' + Math.round(b * 0.48) + ')'; g.fillRect(0, i * ph, w, ph);
      for (var s = 0; s < 50; s++) { var y = i * ph + Math.random() * ph; g.strokeStyle = 'rgba(70,45,25,' + (0.08 + Math.random() * 0.15) + ')'; g.lineWidth = 0.8 + Math.random(); g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + (Math.random() - 0.5) * 6, w * 0.6, y + (Math.random() - 0.5) * 6, w, y); g.stroke(); }
      g.fillStyle = 'rgba(40,25,12,0.6)'; g.fillRect(0, i * ph, w, 2); var j = Math.random() * w; g.fillRect(j, i * ph, 2, ph);
      g.fillStyle = 'rgba(30,20,10,0.6)'; [j - 7, j + 7].forEach(function (nx) { g.beginPath(); g.arc(nx, i * ph + ph * 0.3, 2, 0, Math.PI * 2); g.arc(nx, i * ph + ph * 0.7, 2, 0, Math.PI * 2); g.fill(); });
    }
    var wear = g.createLinearGradient(0, 0, 0, h); wear.addColorStop(0, 'rgba(255,240,210,0)'); wear.addColorStop(0.5, 'rgba(255,240,210,0.12)'); wear.addColorStop(1, 'rgba(255,240,210,0)'); g.fillStyle = wear; g.fillRect(0, 0, w, h);
  }, [3, 2.5]);
  function fbarnShakeRoof(G, A, B, len, list, s, row0) {               // (one slope of the roof: boards from A up to B, covered in rows of shakes)
    var ux = B[0] - A[0], uy = B[1] - A[1], L = Math.hypot(ux, uy); ux /= L; uy /= L;
    var nx = s > 0 ? uy : -uy, ny = s > 0 ? -ux : ux, ang = Math.atan2(uy, ux);
    cpPart(new THREE.BoxGeometry(L, 0.08, len), new THREE.MeshStandardMaterial({ color: 0x4a3a30, roughness: 0.9 }), (A[0] + B[0]) / 2 + nx * 0.05, (A[1] + B[1]) / 2 + ny * 0.05, 0, 0, 0, ang, G);
    for (var r = 0, d = 0.02; d < L - 0.08; d += 0.19, r++) {
      var off = 0.105 + (r % 2) * 0.005, cx = A[0] + ux * (d + 0.15) + nx * off, cy = A[1] + uy * (d + 0.15) + ny * off;
      for (var z = -len / 2 + ((r + row0) % 2 ? 0.12 : 0), k = 0; z < len / 2 - 0.02; k++) {
        var sw = 0.17 + isle2Hash(r * 37 + k * 3.1 + s * 5 + row0) * 0.16, zw = Math.min(sw, len / 2 - z), tone = 0.62 + isle2Hash(r * 11 + k * 5.7 + s * 3 + row0) * 0.38, odd = isle2Hash(r * 7 + k * 13 + row0) < 0.1;
        var c = odd ? new THREE.Color(0.52, 0.42, 0.34).multiplyScalar(tone + 0.1) : new THREE.Color(0.44, 0.42, 0.41).multiplyScalar(tone);
        list.push([cx, cy, z + zw / 2, 0, 0, ang, 0.32, 0.022, zw - 0.014, c.getHex()]);
        z += zw;
      }
    }
    return { ux: ux, uy: uy, nx: nx, ny: ny, L: L, ang: ang };
  }
  function fbarnWindow(G, x, y, z, ry, w, h, box) {                    // (a barn window from outside: six panes in a white frame, a sill, and maybe a flower box)
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; G.add(g);
    cpPart(new THREE.PlaneGeometry(w, h), cpmGlowWin, 0, 0, 0, 0, 0, 0, g).castShadow = false;
    [[0, h / 2 + 0.06, w + 0.3, 0.12], [w / 2 + 0.06, 0, 0.12, h + 0.02], [-w / 2 - 0.06, 0, 0.12, h + 0.02], [w / 2 + 0.17, h / 2 + 0.11, 0.08, 0.04], [-w / 2 - 0.17, h / 2 + 0.11, 0.08, 0.04]].forEach(function (f) { cpPart(new THREE.BoxGeometry(f[2], f[3], 0.07), cpmCream, f[0], f[1], 0.02, 0, 0, 0, g); });
    cpPart(new THREE.BoxGeometry(0.035, h, 0.04), cpmCream, 0, 0, 0.02, 0, 0, 0, g); [-h / 6, h / 6].forEach(function (yy) { cpPart(new THREE.BoxGeometry(w, 0.03, 0.04), cpmCream, 0, yy, 0.02, 0, 0, 0, g); });
    cpPart(new THREE.BoxGeometry(w + 0.34, 0.06, 0.16), cpmCream, 0, -h / 2 - 0.06, 0.06, 0, 0, 0, g);
    if (box) cpFlowerBox(g, w, -h / 2 - 0.24, 0.16);
    return g;
  }
  function fbarnGooseneck(G, x, y, z, glows) {                          // (a gooseneck barn lamp: a curved arm out from the wall and an enamel shade)
    var g = new THREE.Group(); g.position.set(x, y, z); G.add(g);
    var arm = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.15, 0), new THREE.Vector3(0, 0.12, 0.05), new THREE.Vector3(0, 0.24, 0.25), new THREE.Vector3(0, 0.18, 0.45), new THREE.Vector3(0, 0.08, 0.5)]);
    cpPart(new THREE.TubeGeometry(arm, 20, 0.018, 6), fbmRedDark, 0, 0, 0, 0, 0, 0, g); cpPart(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 12), fbmRedDark, 0, -0.15, 0.0, Math.PI / 2, 0, 0, g);
    cpPart(new THREE.CylinderGeometry(0.04, 0.2, 0.14, 18, 1, true), new THREE.MeshStandardMaterial({ color: 0x3a5a48, roughness: 0.4, metalness: 0.4, side: THREE.DoubleSide }), 0, 0.02, 0.5, 0, 0, 0, g);
    var bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe0a0 })); bulb.position.set(0, -0.03, 0.5); g.add(bulb);
    var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffc070, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.set(1.1, 1.1, 1); halo.position.set(0, -0.05, 0.5); g.add(halo);
    glows.push({ f: bulb, h: halo, p: Math.random() * 9 });
    return g;
  }
  function fbarnChurn(parent, x, y, z) {                                // (a tall milk churn)
    var pts = [[0.001, 0], [0.16, 0], [0.17, 0.02], [0.17, 0.42], [0.13, 0.5], [0.09, 0.56], [0.09, 0.62], [0.11, 0.64], [0.001, 0.66]].map(function (q) { return new THREE.Vector2(q[0], q[1]); });
    var g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
    cpPart(new THREE.LatheGeometry(pts, 22), fbmChurn, 0, 0, 0, 0, 0, 0, g);
    [0.08, 0.38].forEach(function (yy) { cpPart(new THREE.TorusGeometry(0.172, 0.012, 6, 24), fbmChurn, 0, yy, 0, Math.PI / 2, 0, 0, g); });
    [-1, 1].forEach(function (s) { cpPart(new THREE.TorusGeometry(0.05, 0.01, 5, 12, Math.PI), cpmIron, s * 0.15, 0.5, 0, 0, Math.PI / 2, s * 0.6, g); });
    return g;
  }

  // ===== outside: built where you choose =====
  var FB_FRH = [[-3.75, -2.75, 1.2, 2.1], [2.75, 3.75, 1.2, 2.1], [-0.7, 0.7, 3.35, 4.45]], FB_DOOR = [-1.45, 1.45, 2.75];
  var FB_BKH = [[-2.6, -1.6, 1.2, 2.1], [1.6, 2.6, 1.2, 2.1], [-0.45, 0.45, 3.5, 4.2]];
  var FB_SH = [[-2.65, -1.75, 1.2, 2.1], [-0.45, 0.45, 1.2, 2.1], [1.75, 2.65, 1.2, 2.1]];
  var FB_SIDE = [[-FBARN_BD / 2 - 0.07, 0], [FBARN_BD / 2 + 0.07, 0], [FBARN_BD / 2 + 0.07, FBARN_WALL], [-FBARN_BD / 2 - 0.07, FBARN_WALL]];
  function fbarnBuildOutside() {
    var G = new THREE.Group(), W2 = FBARN_BW / 2, D2 = FBARN_BD / 2, H = FBARN_WALL; fbarnGlows = [];
    G.position.set(fbarn.x, fbarn.fy, fbarn.z); G.rotation.y = bRot(fbarn);
    function gy(lx, lz) { return bGround(fbarn, lx, lz) - fbarn.fy; }
    var minG = 99; for (var gx = -1; gx <= 1; gx++) for (var gz = -1; gz <= 1; gz++) minG = Math.min(minG, gy(gx * (W2 + 0.3), gz * (D2 + 0.3)));
    var fh = -minG + 0.35;
    // (a footing of rough fieldstones)
    cpPart(new THREE.BoxGeometry(FBARN_BW + 0.18, fh, FBARN_BD + 0.18), new THREE.MeshStandardMaterial({ color: 0x6e6a62, roughness: 1 }), 0, -fh / 2 - 0.02, 0, 0, 0, 0, G);
    var stones = [], n = 0;
    [[0, D2 + 0.12, FBARN_BW + 0.34, 0], [0, -D2 - 0.12, FBARN_BW + 0.34, 0], [W2 + 0.12, 0, FBARN_BD + 0.34, Math.PI / 2], [-W2 - 0.12, 0, FBARN_BD + 0.34, Math.PI / 2]].forEach(function (sd) {
      for (var row = 0, y = -0.12; y > -fh - 0.05; y -= 0.2, row++) for (var u = -sd[2] / 2 + (row % 2) * 0.19; u < sd[2] / 2; n++) {
        var sw = 0.26 + isle2Hash(n * 1.7 + 9) * 0.22, k = 0.4 + isle2Hash(n * 2.3 + 1) * 0.22, c = new THREE.Color().setRGB(k * 1.02, k * 0.97, k * 0.88), along = Math.min(u + sw / 2, sd[2] / 2 - 0.05);
        stones.push([sd[0] + (sd[3] ? 0 : along), y + (isle2Hash(n) - 0.5) * 0.02, sd[1] + (sd[3] ? along : 0), (isle2Hash(n * 3) - 0.5) * 0.08, sd[3] + (isle2Hash(n * 5) - 0.5) * 0.06, (isle2Hash(n * 7) - 0.5) * 0.08, sw - 0.025, 0.17 + isle2Hash(n * 9) * 0.04, 0.11 + isle2Hash(n * 11) * 0.06, c.getHex()]);
        u += sw;
      }
    });
    coopInst(G, new THREE.DodecahedronGeometry(0.5, 1), cpmFootStone, stones, true);
    // (the walls: barn-red boards with battens over the joins, gambrel ends front and back)
    fbarnWall(G, FBG, FB_FRH, FB_DOOR, fbmRed, 0, D2, 0);
    fbarnWall(G, FBG, FB_BKH, null, fbmRed, 0, -D2, Math.PI);
    fbarnWall(G, FB_SIDE, FB_SH, null, fbmRed, -W2, 0, -Math.PI / 2);
    fbarnWall(G, FB_SIDE, FB_SH, null, fbmRed, W2, 0, Math.PI / 2);
    coopStrips(G, FBARN_BW, 0, FB_FRH.concat([[1.6, 2.9, 3.3, 4.5]]), FB_DOOR, 0, D2, 0, 0.45, 0.07, 0.03, 0.085, fbmRedDark, 0.16, fbarnTop);
    coopStrips(G, FBARN_BW, 0, FB_BKH, null, 0, -D2, Math.PI, 0.45, 0.07, 0.03, 0.085, fbmRedDark, 0.16, fbarnTop);
    coopStrips(G, FBARN_BD, 0, FB_SH.concat([[2.6, 3.4, 0.1, 1.3]]), null, -W2, 0, -Math.PI / 2, 0.45, 0.07, 0.03, 0.085, fbmRedDark, 0.16, H - 0.06);
    coopStrips(G, FBARN_BD, 0, FB_SH, null, W2, 0, Math.PI / 2, 0.45, 0.07, 0.03, 0.085, fbmRedDark, 0.16, H - 0.06);
    [[0, D2 + 0.074, FBARN_BW, 0], [0, -D2 - 0.074, FBARN_BW, Math.PI], [-W2 - 0.074, 0, FBARN_BD + 0.1, -Math.PI / 2], [W2 + 0.074, 0, FBARN_BD + 0.1, Math.PI / 2]].forEach(function (b) { var gm = cpPart(new THREE.PlaneGeometry(b[2], 0.55), cpmGrime, b[0], 0.275, b[1], 0, b[3], 0, G); gm.castShadow = false; gm.receiveShadow = false; gm.renderOrder = 1; });
    // (crisp white trim: corner boards, a skirting board, boards under the eaves, and along the gambrel edges)
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { cpPart(new THREE.BoxGeometry(0.2, H, 0.2), cpmCream, c[0] * (W2 + 0.05), H / 2, c[1] * (D2 + 0.05), 0, 0, 0, G); });
    [[0, D2 + 0.085, FBARN_BW, 0], [0, -D2 - 0.085, FBARN_BW, 0], [W2 + 0.085, 0, FBARN_BD, Math.PI / 2], [-W2 - 0.085, 0, FBARN_BD, Math.PI / 2]].forEach(function (b) { cpPart(new THREE.BoxGeometry(b[2], 0.16, 0.03), cpmCream, b[0], 0.08, b[1], 0, b[3], 0, G); });
    [-1, 1].forEach(function (s) { cpPart(new THREE.BoxGeometry(0.05, 0.16, FBARN_BD + 0.2), cpmCream, s * (W2 + 0.09), H - 0.08, 0, 0, 0, 0, G); });
    [-1, 1].forEach(function (f) { for (var i = 2; i < 6; i++) { var a = FBG[i], b = FBG[i + 1]; var L = Math.hypot(b[0] - a[0], b[1] - a[1]); cpPart(new THREE.BoxGeometry(L + 0.06, 0.16, 0.04), cpmCream, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 0.08, f * (D2 + 0.095), 0, 0, Math.atan2(b[1] - a[1], b[0] - a[0]), G); } });
    // (the gambrel roof: steep lower slopes and shallow upper ones, all in weathered grey shakes, with a ridge cap and copper gutters)
    var len = FBARN_BD + 0.8, shakes = [], segs = [];
    [-1, 1].forEach(function (s) {
      var lo = fbarnShakeRoof(G, [s * (4.7 + 0.5 * 0.77), 3.0 - 0.5 * 0.64], [s * 2.86, 4.53], len, shakes, s, 0);
      var hi = fbarnShakeRoof(G, [s * 2.9, 4.5], [s * 0.02, 5.39], len, shakes, s, 1);
      segs.push(lo, hi);
      [-1, 1].forEach(function (f) {                                   // (white bargeboards along the roof's edges, front and back)
        [[[s * 5.08, 2.68], [s * 2.86, 4.53]], [[s * 2.9, 4.5], [0, 5.39]]].forEach(function (e) { var L = Math.hypot(e[1][0] - e[0][0], e[1][1] - e[0][1]); cpPart(new THREE.BoxGeometry(L, 0.22, 0.06), cpmCream, (e[0][0] + e[1][0]) / 2, (e[0][1] + e[1][1]) / 2 - 0.02, f * (len / 2 + 0.01), 0, 0, Math.atan2(e[1][1] - e[0][1], e[1][0] - e[0][0]), G); });
      });
      cpPart(new THREE.CylinderGeometry(0.075, 0.075, len - 0.1, 14, 1, true, -Math.PI / 2, Math.PI), cpmCopper, s * 5.13, 2.6, 0, Math.PI / 2, 0, 0, G);   // (a gutter along each eave)
      for (var rt = -D2; rt <= D2 + 0.01; rt += 0.6) cpPart(new THREE.BoxGeometry(0.42, 0.11, 0.07), new THREE.MeshStandardMaterial({ color: 0xf2ece0, roughness: 0.8 }), s * (W2 + 0.2), H - 0.12, rt, 0, 0, s * -0.69, G);   // (rafter tails)
    });
    coopInst(G, COOP_BOX, fbmShake, shakes, true);
    [-1, 1].forEach(function (s) { cpPart(new THREE.BoxGeometry(0.24, 0.04, len + 0.04), new THREE.MeshStandardMaterial({ color: 0x3e3430, roughness: 0.85 }), s * 0.1, 5.5, 0, 0, 0, -s * 0.3, G); });
    // (a downpipe from the gutter into a rain barrel at the front corner)
    var bY = gy(4.85, D2 + 0.45);
    cpPart(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 10), cpmCopper, 5.02, 2.38, D2 + 0.4, 0, 0, 0.5, G);
    cpPart(new THREE.CylinderGeometry(0.04, 0.04, 2.2 - (bY + 0.82), 10), cpmCopper, 4.92, (2.2 + bY + 0.82) / 2, D2 + 0.45, 0, 0, 0, G);
    coopBarrel(G, 4.85, bY, D2 + 0.45, 0.28, 0.82, true);
    // (a big cupola on the ridge with louvred sides, and a crescent moon and star turning on the weathervane)
    var CU = new THREE.Group(); CU.position.set(0, 5.2, 0); G.add(CU);
    cpPart(new THREE.BoxGeometry(1.1, 0.7, 1.1), fbmRed, 0, 0.35, 0, 0, 0, 0, CU);
    [[0, 0.555], [0, -0.555], [0.555, 0], [-0.555, 0]].forEach(function (f) {
      var FG = new THREE.Group(); FG.position.set(f[0], 0.78, f[1]); FG.rotation.y = Math.atan2(f[0], f[1]); CU.add(FG);
      cpPart(new THREE.PlaneGeometry(0.8, 0.5), cpmDark, 0, 0, 0, 0, 0, 0, FG).castShadow = false;
      for (var l = 0; l < 6; l++) cpPart(new THREE.BoxGeometry(0.8, 0.06, 0.014), cpmCream, 0, -0.2 + l * 0.08, 0.025, -0.6, 0, 0, FG);
      cpPart(new THREE.BoxGeometry(0.92, 0.07, 0.04), cpmCream, 0, -0.29, 0.02, 0, 0, 0, FG); cpPart(new THREE.BoxGeometry(0.92, 0.07, 0.04), cpmCream, 0, 0.29, 0.02, 0, 0, 0, FG);
    });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { cpPart(new THREE.BoxGeometry(0.1, 0.62, 0.1), cpmCream, c[0] * 0.52, 0.78, c[1] * 0.52, 0, 0, 0, CU); });
    cpPart(new THREE.BoxGeometry(1.26, 0.07, 1.26), cpmCream, 0, 1.1, 0, 0, 0, 0, CU);
    cpPart(new THREE.ConeGeometry(0.98, 0.7, 4, 1), new THREE.MeshStandardMaterial({ color: 0x55504c, roughness: 0.85 }), 0, 1.48, 0, 0, Math.PI / 4, 0, CU);
    cpPart(new THREE.SphereGeometry(0.06, 12, 8), cpmCopper, 0, 1.86, 0, 0, 0, 0, CU);
    var WV = new THREE.Group(); WV.position.set(0, 1.88, 0); CU.add(WV);
    cpPart(new THREE.CylinderGeometry(0.016, 0.02, 0.7, 8), cpmIron, 0, 0.35, 0, 0, 0, 0, WV);
    cpPart(new THREE.BoxGeometry(0.44, 0.014, 0.014), cpmIron, 0, 0.26, 0, 0, 0, 0, WV); cpPart(new THREE.BoxGeometry(0.014, 0.014, 0.44), cpmIron, 0, 0.26, 0, 0, 0, 0, WV);
    var spin = new THREE.Group(); spin.position.y = 0.66; WV.add(spin); G.userData.vane = spin;
    cpPart(new THREE.BoxGeometry(0.7, 0.02, 0.02), cpmIron, 0, 0, 0, 0, 0, 0, spin); cpPart(new THREE.ConeGeometry(0.045, 0.12, 6), cpmIron, 0.38, 0, 0, 0, 0, -Math.PI / 2, spin);
    var moon = new THREE.Shape(); moon.absarc(0, 0, 0.17, Math.PI * 0.3, Math.PI * 1.7, false); moon.absarc(0.08, 0, 0.13, Math.PI * 1.62, Math.PI * 0.38, true);
    var mg = new THREE.ExtrudeGeometry(moon, { depth: 0.016, bevelEnabled: false }); mg.translate(0, 0, -0.008); cpPart(mg, cpmCopper, -0.12, 0.2, 0, 0, 0, 0, spin);
    var star = new THREE.Shape(); for (var sp = 0; sp < 10; sp++) { var sa = sp / 10 * Math.PI * 2 - Math.PI / 2, sr = sp % 2 ? 0.035 : 0.085; if (sp) star.lineTo(Math.cos(sa) * sr, Math.sin(sa) * sr); else star.moveTo(Math.cos(sa) * sr, Math.sin(sa) * sr); } star.closePath();
    var sg2 = new THREE.ExtrudeGeometry(star, { depth: 0.016, bevelEnabled: false }); sg2.translate(0, 0, -0.008); cpPart(sg2, cpmCopper, 0.14, 0.24, 0, 0, 0, 0, spin);
    // (the big sliding doors: red boards with white frames and crossbucks, hung on rollers from an iron track)
    [-1, 1].forEach(function (s) {
      var D = new THREE.Group(); D.position.set(s * 0.74, 0, D2 + 0.1); G.add(D);
      for (var b = 0; b < 7; b++) cpPart(new THREE.BoxGeometry(0.2, 2.78, 0.05), fbmDoor, -0.615 + b * 0.205, 1.4, 0, 0, 0, 0, D);
      [[0, 2.72, 1.5, 0.13], [0, 0.07, 1.5, 0.13], [-0.69, 1.4, 0.12, 2.78], [0.69, 1.4, 0.12, 2.78], [0, 1.38, 1.5, 0.11]].forEach(function (b) { cpPart(new THREE.BoxGeometry(b[2], b[3], 0.04), cpmCream, b[0], b[1], 0.045, 0, 0, 0, D); });
      [[0.725, 1.18], [2.05, 1.2]].forEach(function (pn) { [1, -1].forEach(function (d) { cpPart(new THREE.BoxGeometry(0.09, Math.hypot(1.26, pn[1]) - 0.08, 0.035), cpmCream, 0, pn[0], 0.05, 0, 0, d * Math.atan2(1.26, pn[1]), D); }); });
      cpPart(new THREE.BoxGeometry(0.035, 0.42, 0.035), cpmIron, -s * 0.52, 1.35, 0.11, 0, 0, 0, D); [1.18, 1.52].forEach(function (y) { cpPart(new THREE.BoxGeometry(0.03, 0.03, 0.08), cpmIron, -s * 0.52, y, 0.07, 0, 0, 0, D); });
      [-0.45, 0.45].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.06, 0.26, 0.02), cpmIron, x, 2.85, 0.04, 0, 0, 0, D); cpPart(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 16), cpmIron, x, 2.98, 0.07, Math.PI / 2, 0, 0, D); });
    });
    cpPart(new THREE.BoxGeometry(6.2, 0.08, 0.05), cpmIron, 0, 2.98, D2 + 0.14, 0, 0, 0, G);
    [-3.1, 3.1].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.06, 0.12, 0.08), cpmIron, x, 2.98, D2 + 0.16, 0, 0, 0, G); });
    cpPart(new THREE.BoxGeometry(6.4, 0.14, 0.22), cpmCream, 0, 3.12, D2 + 0.13, 0, 0, 0, G);
    // (the hayloft door above, hay poking out under it, a hay hood with a pulley beam, and a rope with a hook)
    var LD = new THREE.Group(); LD.position.set(0, 3.9, D2 + 0.09); G.add(LD);
    for (var lb = 0; lb < 6; lb++) cpPart(new THREE.BoxGeometry(0.225, 1.08, 0.05), fbmDoor, -0.5625 + lb * 0.225, 0, 0, 0, 0, 0, LD);
    [[0, 0.5, 1.4, 0.1], [0, -0.5, 1.4, 0.1], [-0.65, 0, 0.1, 1.08], [0.65, 0, 0.1, 1.08]].forEach(function (b) { cpPart(new THREE.BoxGeometry(b[2], b[3], 0.04), cpmCream, b[0], b[1], 0.04, 0, 0, 0, LD); });
    [1, -1].forEach(function (d) { cpPart(new THREE.BoxGeometry(0.08, 1.12, 0.03), cpmCream, 0, 0, 0.045, 0, 0, d * Math.atan2(1.2, 0.9), LD); });
    var strawM = new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), wisps = [];
    for (var hw = 0; hw < 60; hw++) { var c2 = new THREE.Color().setHSL(0.11, 0.55, 0.5 + isle2Hash(hw * 3.3) * 0.25); wisps.push([(isle2Hash(hw) - 0.5) * 1.2, -0.56 + isle2Hash(hw * 2.1) * 0.03, 0.06 + isle2Hash(hw * 5) * 0.06, 0, Math.PI / 2 + (isle2Hash(hw * 7) - 0.5) * 1.2, Math.PI / 2 + 0.6 + isle2Hash(hw * 9) * 0.5, 1, 0.08 + isle2Hash(hw * 11) * 0.1, 1, c2.getHex()]); }
    coopInst(LD, new THREE.CylinderGeometry(0.004, 0.004, 1, 3), new THREE.MeshStandardMaterial({ roughness: 0.9 }), wisps, true);
    cpPart(new THREE.BoxGeometry(0.16, 0.16, 1.25), new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.8 }), 0, 4.85, D2 + 0.55, 0, 0, 0, G);
    [-1, 1].forEach(function (s) { cpPart(new THREE.BoxGeometry(0.62, 0.05, 1.32), new THREE.MeshStandardMaterial({ color: 0x55504c, roughness: 0.85 }), s * 0.26, 5.07, D2 + 0.58, 0, 0, -s * 0.55, G); });
    cpPart(new THREE.TorusGeometry(0.08, 0.02, 8, 18), cpmIron, 0, 4.72, D2 + 1.08, 0, Math.PI / 2, 0, G);
    cpPart(new THREE.CylinderGeometry(0.008, 0.008, 1.3, 5), new THREE.MeshStandardMaterial({ color: 0xc8a878, roughness: 0.9 }), 0.075, 4.05, D2 + 1.08, 0, 0, 0, G);
    cpPart(new THREE.TorusGeometry(0.05, 0.01, 6, 14, Math.PI * 1.4), cpmIron, 0.075, 3.36, D2 + 1.08, 0, 0, Math.PI * 0.8, G);
    // (a barn quilt hung diamond-wise on the gable, and two gooseneck lamps over the doors)
    cpPart(new THREE.BoxGeometry(0.84, 0.84, 0.04), cpmCream, 2.25, 3.9, D2 + 0.095, 0, 0, Math.PI / 4, G);
    cpPart(new THREE.PlaneGeometry(0.75, 0.75), new THREE.MeshStandardMaterial({ map: fbQuiltTex, roughness: 0.8 }), 2.25, 3.9, D2 + 0.118, 0, 0, Math.PI / 4, G).castShadow = false;
    fbarnGooseneck(G, -1.85, 3.3, D2 + 0.09, fbarnGlows); fbarnGooseneck(G, 1.85, 3.3, D2 + 0.09, fbarnGlows);
    // (white-trimmed windows: flower boxes on the front ones)
    fbarnWindow(G, -3.25, 1.65, D2 + 0.08, 0, 1.0, 0.9, true); fbarnWindow(G, 3.25, 1.65, D2 + 0.08, 0, 1.0, 0.9, true);
    fbarnWindow(G, -2.1, 1.65, -D2 - 0.08, Math.PI, 1.0, 0.9, false); fbarnWindow(G, 2.1, 1.65, -D2 - 0.08, Math.PI, 1.0, 0.9, false); fbarnWindow(G, 0, 3.85, -D2 - 0.08, Math.PI, 0.9, 0.7, false);
    [-2.2, 0, 2.2].forEach(function (z) { fbarnWindow(G, -W2 - 0.08, 1.65, z, -Math.PI / 2, 0.9, 0.9, true); fbarnWindow(G, W2 + 0.08, 1.65, z, Math.PI / 2, 0.9, 0.9, true); });
    // (a wide plank ramp up to the doors, with side boards and cleats)
    var gyR = gy(0, D2 + 1.25), rl = Math.hypot(1.25, gyR), ra = Math.atan2(-gyR, 1.25);
    var RP = new THREE.Group(); RP.position.set(0, gyR / 2 - 0.02, D2 + 0.12 + 0.625); RP.rotation.x = ra; G.add(RP);
    for (var rb = 0; rb < 13; rb++) cpPart(new THREE.BoxGeometry(0.245, 0.07, rl), cpmPlank, -1.47 + rb * 0.245, 0, 0, 0, 0, 0, RP);
    for (var cl = -rl / 2 + 0.18; cl < rl / 2; cl += 0.24) cpPart(new THREE.BoxGeometry(2.9, 0.025, 0.04), cpmPlankDark, 0, 0.045, cl, 0, 0, 0, RP);
    [-1.66, 1.66].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.08, 0.14, rl), cpmPlankDark, x, 0.02, 0, 0, 0, 0, RP); });
    // (hay bales stacked by the doors with a pitchfork in them, a wooden water trough, milk churns, and a wagon wheel)
    [[-3.45, 0, 0], [-2.5, 0, 0.1], [-3.0, 1, -0.05]].forEach(function (hb) { var bale = pickupModel('hay'); bale.scale.setScalar(3.1); bale.position.set(hb[0], gy(hb[0], D2 + 0.8) + 0.265 + hb[1] * 0.53, D2 + 0.8); bale.rotation.y = hb[2]; bale.traverse(function (o) { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); G.add(bale); });
    var PF = new THREE.Group(); PF.position.set(-2.8, gy(-2.8, D2 + 0.8) + 0.9, D2 + 0.8); PF.rotation.set(0.15, 0.4, -0.35); G.add(PF);
    cpPart(new THREE.CylinderGeometry(0.016, 0.018, 1.3, 8), cpmBarrel, 0, 0.65, 0, 0, 0, 0, PF); cpPart(new THREE.BoxGeometry(0.16, 0.02, 0.02), cpmIron, 0, 0.0, 0, 0, 0, 0, PF);
    [-0.07, 0, 0.07].forEach(function (x) { cpPart(new THREE.CylinderGeometry(0.006, 0.003, 0.26, 5), cpmIron, x, -0.13, 0, 0, 0, 0, PF); });
    var TR = new THREE.Group(); TR.position.set(2.75, gy(2.75, D2 + 0.85), D2 + 0.85); G.add(TR);
    [[0, 0.06, 0, 1.4, 0.05, 0.5], [0, 0.3, 0.23, 1.4, 0.45, 0.05], [0, 0.3, -0.23, 1.4, 0.45, 0.05], [0.68, 0.3, 0, 0.05, 0.45, 0.5], [-0.68, 0.3, 0, 0.05, 0.45, 0.5]].forEach(function (b) { cpPart(new THREE.BoxGeometry(b[3], b[4], b[5]), cpmPlank, b[0], b[1], b[2], 0, 0, 0, TR); });
    [-0.55, 0.55].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.06, 0.48, 0.56), cpmIron, x, 0.3, 0, 0, 0, 0, TR).scale.set(1, 1, 1.02); });
    cpPart(new THREE.PlaneGeometry(1.3, 0.42), fbmWater, 0, 0.44, 0, -Math.PI / 2, 0, 0, TR).castShadow = false;
    fbarnChurn(G, 3.9, gy(3.9, D2 + 0.55), D2 + 0.55); fbarnChurn(G, 4.2, gy(4.2, D2 + 1.05), D2 + 1.05).rotation.y = 0.8;
    var WH = new THREE.Group(); WH.position.set(-W2 - 0.14, gy(-W2 - 0.14, 2.9) + 0.52, 2.9); WH.rotation.set(0, Math.PI / 2, 0.06); G.add(WH);
    cpPart(new THREE.TorusGeometry(0.48, 0.04, 6, 32), new THREE.MeshStandardMaterial({ color: 0x7a5236, roughness: 0.8 }), 0, 0, 0, 0, 0, 0, WH); cpPart(new THREE.TorusGeometry(0.5, 0.015, 5, 32), cpmIron, 0, 0, 0, 0, 0, 0, WH);
    cpPart(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 14), new THREE.MeshStandardMaterial({ color: 0x6a4630 }), 0, 0, 0, Math.PI / 2, 0, 0, WH);
    for (var sk = 0; sk < 12; sk++) cpPart(new THREE.CylinderGeometry(0.018, 0.024, 0.4, 6), new THREE.MeshStandardMaterial({ color: 0x8a5e3e, roughness: 0.8 }), Math.cos(sk / 12 * Math.PI * 2) * 0.27, Math.sin(sk / 12 * Math.PI * 2) * 0.27, 0, 0, 0, sk / 12 * Math.PI * 2 - Math.PI / 2, WH);
    // (flowers along the foot of the walls)
    var bed = [];
    [-2.6, -1.9, -1.2, -0.5, 0.2, 0.9, 1.6, 2.3].forEach(function (z) { bed.push([W2 + 0.26, gy(W2 + 0.26, z), z]); if (z < 2.0) bed.push([-W2 - 0.26, gy(-W2 - 0.26, z), z]); });
    [-1.9, 1.95].forEach(function (x) { bed.push([x, gy(x, D2 + 0.28), D2 + 0.28]); });
    coopFlowers(G, bed, 23);
    scene.add(G);
    return G;
  }
  function updateFbarnOutside(t, night) {
    if (!fbarnGroup || !fbarnGroup.userData.vane) return;   // (not while it's still a building site)
    fbarnGlows.forEach(function (L) { var fl = 1 + Math.sin(t * 9 + L.p) * 0.04; L.h.material.opacity = (0.15 + night * 0.7) * fl; L.f.material.color.setHSL(0.11, 1, 0.6 + night * 0.25); });
    fbarnGroup.userData.vane.rotation.y = Math.sin(t * 0.18 + 1) * 1.0 + Math.sin(t * 0.55) * 0.25;
  }

  // ===== inside =====
  var fbarnScene = new THREE.Scene(); fbarnScene.background = new THREE.Color(0x1c1410);
  var FBI_X = 1000, FBI_Z = 1000, FBI_EXIT_Z = FBARN_BD / 2 - 0.6;
  var fbarnRoom = new THREE.Group(); fbarnRoom.position.set(FBI_X, 0, FBI_Z); fbarnScene.add(fbarnRoom);
  var fbarnPen = new THREE.Group(); fbarnPen.position.set(0, 0, FBARN_DZ); fbarnPen.rotation.y = -Math.PI / 2; fbarnRoom.add(fbarnPen);   // (where the animals live, in Fluff & Feather's stall layout)
  fbarnScene.add(new THREE.HemisphereLight(0xfff0d8, 0x6a5440, 0.55));
  var fbSun = new THREE.DirectionalLight(0xffe6c0, 0.5); fbSun.position.set(FBI_X - 5, 9, FBI_Z + 6); fbSun.target.position.set(FBI_X, 0, FBI_Z); fbSun.castShadow = true; fbSun.shadow.mapSize.set(1024, 1024);
  fbSun.shadow.camera.left = -7; fbSun.shadow.camera.right = 7; fbSun.shadow.camera.top = 6; fbSun.shadow.camera.bottom = -6; fbSun.shadow.bias = -0.0006; fbarnScene.add(fbSun); fbarnScene.add(fbSun.target);
  var fbLamps = [[0, 2.6, 1.2], [0, 2.4, -2.6]].map(function (p) { var l = new THREE.PointLight(0xffc888, 0.55, 11); l.position.set(FBI_X + p[0], p[1], FBI_Z + p[2]); fbarnScene.add(l); return l; });
  var fbarnSolids = [], fbarnInGlows = [], fbarnWalls = [], fbarnHayMeshes = [], fbarnShafts = [], fbarnMotes = null;
  for (var fsl = FBARN_STALL0; fsl < FBARN_STALL0 + FBARN_CAP; fsl++) abStallSlates[fsl] = new THREE.MeshStandardMaterial({ map: abSlateTex, roughness: 0.95 });   // (a name slate over each stall)
  (function (R) {
    var W2 = FBARN_BW / 2, D2 = FBARN_BD / 2, H = FBARN_WALL;
    function put(geo, m, x, y, z, rx, ry, rz, p) { return cpPart(geo, m, x, y, z, rx, ry, rz, p || R); }
    var mWood = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0xc89c6c, roughness: 0.8 }), mOld = new THREE.MeshStandardMaterial({ color: 0x7a5a3c, roughness: 0.85 });
    var mStud = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0xb88a5c, roughness: 0.85 }), mPost = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0x9a6e48, roughness: 0.8 });
    // (wide floorboards, and deep straw in the stalls)
    put(new THREE.PlaneGeometry(FBARN_BW, FBARN_BD), new THREE.MeshStandardMaterial({ map: fbFloorTex, roughness: 0.9 }), 0, 0.001, 0, -Math.PI / 2, 0, 0).castShadow = false;
    put(new THREE.PlaneGeometry(FBARN_BW - 0.15, 1.62), new THREE.MeshStandardMaterial({ map: coopStrawTex, roughness: 1 }), 0, 0.004, -D2 + 0.83, -Math.PI / 2, 0, 0).castShadow = false;
    // (the four walls, each stepping aside when it's between you and the camera, with the real island through their windows)
    function wall(pts, holes, door, x, z, ry, n, d) { var g = new THREE.Group(); R.add(g); fbarnWall(g, pts, holes, door, fbmBoardIn, x, z, ry); fbarnWalls.push({ g: g, n: new THREE.Vector3(n[0], 0, n[1]), d: d }); return g; }
    var wB = wall(FBG, FB_BKH, null, 0, -D2, 0, [0, -1], D2), wF = wall(FBG, FB_FRH, FB_DOOR, 0, D2, Math.PI, [0, 1], D2);
    var wL = wall(FB_SIDE, FB_SH, null, -W2, 0, Math.PI / 2, [-1, 0], W2), wR = wall(FB_SIDE, FB_SH, null, W2, 0, -Math.PI / 2, [1, 0], W2);
    coopInWindow(wB, -2.1, 1.65, -D2 + 0.08, 0, 1.0, 0.9); coopInWindow(wB, 2.1, 1.65, -D2 + 0.08, 0, 1.0, 0.9); coopInWindow(wB, 0, 3.85, -D2 + 0.08, 0, 0.9, 0.7);
    coopInWindow(wF, -3.25, 1.65, D2 - 0.08, Math.PI, 1.0, 0.9); coopInWindow(wF, 3.25, 1.65, D2 - 0.08, Math.PI, 1.0, 0.9);
    [-2.2, 0, 2.2].forEach(function (z) { coopInWindow(wL, -W2 + 0.08, 1.65, z, Math.PI / 2, 0.9, 0.9); coopInWindow(wR, W2 - 0.08, 1.65, z, -Math.PI / 2, 0.9, 0.9); });
    [-0.74, 0.74].forEach(function (x) {                               // (the big doors and the loft door, shut, from inside)
      put(new THREE.BoxGeometry(1.46, 2.76, 0.05), fbmDoor, x, 1.4, D2 - 0.02, 0, 0, 0, wF);
      [[1.38, 0.12], [2.66, 0.1], [0.12, 0.1]].forEach(function (b) { put(new THREE.BoxGeometry(1.4, b[1], 0.04), mOld, x, b[0], D2 - 0.07, 0, 0, 0, wF); });
      [1, -1].forEach(function (d) { put(new THREE.BoxGeometry(0.08, 1.7, 0.035), mOld, x, 0.74, D2 - 0.075, 0, 0, d * 0.83, wF); });
    });
    put(new THREE.BoxGeometry(1.4, 1.1, 0.05), fbmDoor, 0, 3.9, D2 - 0.02, 0, 0, 0, wF);
    // (the timber frame showing inside: studs, plates, and rafters up the gambrel ends)
    coopStrips(wB, FBARN_BW, 0, FB_BKH, null, 0, -D2, 0, 1.0, 0.08, 0.09, 0.11, mStud, 0, fbarnTop);
    coopStrips(wF, FBARN_BW, 0, FB_FRH, FB_DOOR, 0, D2, Math.PI, 1.0, 0.08, 0.09, 0.11, mStud, 0, fbarnTop);
    coopStrips(wL, FBARN_BD, 0, FB_SH, null, -W2, 0, Math.PI / 2, 1.0, 0.08, 0.09, 0.11, mStud, 0, H - 0.06);
    coopStrips(wR, FBARN_BD, 0, FB_SH, null, W2, 0, -Math.PI / 2, 1.0, 0.08, 0.09, 0.11, mStud, 0, H - 0.06);
    [[wB, -D2 + 0.12], [wF, D2 - 0.12]].forEach(function (w) {
      put(new THREE.BoxGeometry(FBARN_BW - 0.1, 0.1, 0.1), mStud, 0, H - 0.05, w[1], 0, 0, 0, w[0]);
      for (var i = 2; i < 6; i++) { var a = FBG[i], b = FBG[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); put(new THREE.BoxGeometry(L, 0.12, 0.1), mStud, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 0.08, w[1], 0, 0, Math.atan2(b[1] - a[1], b[0] - a[0]), w[0]); }
    });
    [[wL, -W2 + 0.12], [wR, W2 - 0.12]].forEach(function (w) { put(new THREE.BoxGeometry(0.1, 0.1, FBARN_BD - 0.1), mStud, w[1], H - 0.05, 0, 0, 0, 0, w[0]); });
    // (the four stalls along the back wall: plank partitions topped with iron bars, stout posts, a header beam with each one's name slate, a hay rack, a bucket and a horseshoe)
    var bars = [];
    [2.2, 0, -2.2].forEach(function (x) {
      put(new THREE.BoxGeometry(0.07, 1.25, 1.62), mWood, x, 0.625, -D2 + 0.85);
      put(new THREE.BoxGeometry(0.11, 0.07, 1.66), mPost, x, 1.28, -D2 + 0.85);
      for (var b = 0; b < 12; b++) bars.push([x, 1.68, -D2 + 0.18 + b * 0.13, 0, 0, 0, 1, 0.78, 1]);
      put(new THREE.BoxGeometry(0.08, 0.06, 1.66), cpmIron, x, 2.08, -D2 + 0.85);
      for (var sz = -D2 + 0.3; sz < -D2 + 1.7; sz += 0.35) fbarnSolids.push([x, sz, 0.2]);
    });
    coopInst(R, new THREE.CylinderGeometry(0.011, 0.011, 1, 6), cpmIron, bars);
    [-4.62, 2.2, 0, -2.2, 4.62].forEach(function (x) { put(new THREE.BoxGeometry(0.16, 2.15, 0.16), mPost, x, 1.075, -D2 + 1.67); });
    put(new THREE.BoxGeometry(FBARN_BW - 0.1, 0.18, 0.16), mPost, 0, 2.22, -D2 + 1.67);
    [3.3, 1.1, -1.1, -3.3].forEach(function (x, k) {
      [-0.82, 0.82].forEach(function (e) { put(new THREE.BoxGeometry(0.4, 1.15, 0.06), mWood, x + e, 0.575, -D2 + 1.67); put(new THREE.BoxGeometry(0.44, 0.06, 0.1), mPost, x + e, 1.18, -D2 + 1.67); fbarnSolids.push([x + e, -D2 + 1.67, 0.22]); });
      put(new THREE.BoxGeometry(0.56, 0.32, 0.03), mOld, x, 2.0, -D2 + 1.76);
      put(new THREE.PlaneGeometry(0.5, 0.25), abStallSlates[FBARN_STALL0 + k], x, 2.0, -D2 + 1.776).castShadow = false;
      var BK = new THREE.Group(); BK.position.set(x + 0.6, 0.95, -D2 + 0.22); R.add(BK);   // (a water bucket on a hook)
      put(new THREE.CylinderGeometry(0.13, 0.1, 0.24, 16, 1, true), cpmSteel, 0, 0, 0, 0, 0, 0, BK); put(new THREE.CircleGeometry(0.1, 14), cpmSteel, 0, -0.12, 0, -Math.PI / 2, 0, 0, BK);
      put(new THREE.CircleGeometry(0.12, 16), fbmWater, 0, 0.08, 0, -Math.PI / 2, 0, 0, BK).castShadow = false; put(new THREE.TorusGeometry(0.125, 0.006, 5, 18, Math.PI), cpmIron, 0, 0.12, 0, 0, 0, 0, BK);
      put(new THREE.TorusGeometry(0.075, 0.015, 6, 18, Math.PI * 1.3), cpmIron, x - 0.35, 2.05, -D2 + 0.1, 0, 0, Math.PI * 0.85);   // (a horseshoe for luck)
    });
    // (the feeding bench down the middle: eight spots for hay with little dividers, number tags, and iron brackets)
    var FB3 = new THREE.Group(); R.add(FB3);
    put(new THREE.BoxGeometry(5.8, 0.07, 0.56), mWood, 0, 0.5, 0, 0, 0, 0, FB3);
    [-0.28, 0.28].forEach(function (z) { put(new THREE.BoxGeometry(5.8, 0.12, 0.03), mOld, 0, 0.56, z, 0, 0, 0, FB3); });
    [-2.85, -0.95, 0.95, 2.85].forEach(function (x) { [-0.22, 0.22].forEach(function (z) { put(new THREE.BoxGeometry(0.07, 0.48, 0.07), mPost, x, 0.24, z, 0, 0, 0, FB3); put(new THREE.BoxGeometry(0.09, 0.012, 0.09), cpmIron, x, 0.465, z, 0, 0, 0, FB3); }); });
    put(new THREE.BoxGeometry(5.7, 0.04, 0.48), mOld, 0, 0.12, 0, 0, 0, 0, FB3);
    for (var dv = 1; dv < 8; dv++) put(new THREE.BoxGeometry(0.02, 0.09, 0.54), mOld, -2.8 + dv * 0.7, 0.58, 0, 0, 0, 0, FB3);
    FBARN_SLOT_X.forEach(function (x, i) {
      var hb2 = pickupModel('hay'); hb2.position.set(x, 0.62, 0); hb2.rotation.y = (Math.random() - 0.5) * 0.15; hb2.traverse(function (o) { if (o.isMesh) o.castShadow = true; }); hb2.visible = false; FB3.add(hb2); fbarnHayMeshes.push(hb2);
      var numTex = cpTex(64, 64, function (g) { g.fillStyle = '#d8b480'; g.beginPath(); g.arc(32, 32, 31, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#7a5230'; g.lineWidth = 3; g.stroke(); g.fillStyle = '#5a3a20'; g.font = '600 36px Fredoka, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(i + 1), 32, 34); });
      put(new THREE.CircleGeometry(0.045, 18), new THREE.MeshStandardMaterial({ map: numTex, roughness: 0.8 }), x, 0.555, 0.3, 0, 0, 0, FB3).castShadow = false;
    });
    for (var bsx = -2.4; bsx <= 2.41; bsx += 0.8) fbarnSolids.push([bsx, 0, 0.36]);
    // (hay bales stacked in the front corner, with a ladder leaning by them and a pitchfork)
    [[-4.05, 0, 2.95, 0], [-3.1, 0, 2.95, 0.04], [-2.15, 0, 2.95, -0.03], [-3.6, 1, 2.95, 0.05], [-2.65, 1, 2.95, -0.04], [-3.12, 2, 2.95, 0.02], [-4.05, 0, 2.3, Math.PI / 2]].forEach(function (b) { var bale = pickupModel('hay'); bale.scale.setScalar(3.2); bale.position.set(b[0], 0.27 + b[1] * 0.545, b[2]); bale.rotation.y = b[3]; bale.traverse(function (o) { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); R.add(bale); });
    fbarnSolids.push([-3.6, 2.95, 0.75], [-2.3, 2.95, 0.5], [-4.05, 2.25, 0.45]);
    var LA = new THREE.Group(); LA.position.set(-4.04, 0, -1.1); LA.rotation.z = 0.2; R.add(LA); fbarnSolids.push([-4.15, -1.1, 0.3]);   // (feet out in the barn, top resting on the wall between two windows)
    [-0.22, 0.22].forEach(function (z) { put(new THREE.BoxGeometry(0.06, 2.6, 0.06), mPost, 0, 1.3, z, 0, 0, 0, LA); });
    for (var lr = 0; lr < 8; lr++) put(new THREE.CylinderGeometry(0.02, 0.02, 0.44, 6), mWood, 0, 0.25 + lr * 0.32, 0, Math.PI / 2, 0, 0, LA);
    var PF = new THREE.Group(); PF.position.set(-1.75, 0, 3.2); PF.rotation.set(-0.15, 0.3, 0.12); R.add(PF);
    put(new THREE.CylinderGeometry(0.016, 0.018, 1.35, 8), mWood, 0, 0.68, 0, 0, 0, 0, PF); put(new THREE.BoxGeometry(0.16, 0.02, 0.02), cpmIron, 0, 1.36, 0, 0, 0, 0, PF);
    [-0.07, 0, 0.07].forEach(function (x) { put(new THREE.CylinderGeometry(0.006, 0.003, 0.26, 5), cpmIron, x, 1.49, 0, 0, 0, 0, PF); });
    // (in the other front corner: a grain bin with its scoop, milk churns, a milking stool and pail, and feed sacks)
    var GB = new THREE.Group(); GB.position.set(3.75, 0, 3.15); R.add(GB);
    put(new THREE.BoxGeometry(1.3, 0.72, 0.62), mWood, 0, 0.36, 0, 0, 0, 0, GB); put(new THREE.BoxGeometry(1.36, 0.06, 0.68), mPost, 0, 0.75, 0, 0, 0, -0.04, GB);
    [-0.4, 0.4].forEach(function (x) { put(new THREE.BoxGeometry(0.14, 0.02, 0.08), cpmIron, x, 0.77, -0.3, 0, 0, 0, GB); });
    [[0, 0.36, 0.315, 1.3, 0.08], [-0.62, 0.36, 0.315, 0.06, 0.72], [0.62, 0.36, 0.315, 0.06, 0.72]].forEach(function (b) { put(new THREE.BoxGeometry(b[3], b[4], 0.02), mPost, b[0], b[1], b[2], 0, 0, 0, GB); });
    var stencil = cpTex(128, 32, function (g, w, h) { g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(250,244,230,0.85)'; g.font = 'bold 24px Georgia, serif'; g.textAlign = 'center'; g.fillText('GRAIN', w / 2, 24); });
    put(new THREE.PlaneGeometry(0.62, 0.155), new THREE.MeshStandardMaterial({ map: stencil, transparent: true, roughness: 0.9 }), 0, 0.42, 0.33, 0, 0, 0, GB).castShadow = false;
    put(new THREE.CylinderGeometry(0.06, 0.05, 0.1, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xb8c0c8, metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide }), 0.3, 0.83, 0.05, 0, 0, Math.PI / 2 - 0.2, GB);
    fbarnSolids.push([3.75, 3.15, 0.7]);
    fbarnChurn(R, 2.55, 0, 3.2); fbarnChurn(R, 2.95, 0, 3.4).rotation.y = 1.2; fbarnSolids.push([2.75, 3.3, 0.35]);
    var ST = new THREE.Group(); ST.position.set(2.35, 0, 2.35); R.add(ST);
    put(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 16), mWood, 0, 0.32, 0, 0, 0, 0, ST);
    [0, 2.1, 4.2].forEach(function (a) { put(new THREE.CylinderGeometry(0.018, 0.022, 0.34, 6), mPost, Math.cos(a) * 0.11, 0.16, Math.sin(a) * 0.11, Math.sin(a) * 0.2, 0, -Math.cos(a) * 0.2, ST); });
    put(new THREE.CylinderGeometry(0.14, 0.11, 0.26, 16, 1, true), cpmSteel, 0.38, 0.13, 0.1, 0, 0, 0, ST); put(new THREE.CircleGeometry(0.12, 14), new THREE.MeshStandardMaterial({ color: 0xfaf6ee, roughness: 0.3 }), 0.38, 0.2, 0.1, -Math.PI / 2, 0, 0, ST);
    fbarnSolids.push([2.5, 2.4, 0.35]);
    [[4.25, 2.3, 0.5, 0], [4.3, 1.75, -0.4, 1]].forEach(function (sk) { if (!barnSackProtos[sk[3]]) return; var sg = barnSackProtos[sk[3]].clone(); sg.position.set(sk[0], 0, sk[1]); sg.rotation.set(0, sk[2], 0); sg.scale.setScalar(0.9); R.add(sg); });
    fbarnSolids.push([4.25, 2.0, 0.45]);
    // (tack on the left wall: halters, lead ropes and brushes on a peg rail, and a shelf of tins)
    put(new THREE.BoxGeometry(0.05, 0.1, 1.2), mPost, -W2 + 0.16, 1.85, 1.1);
    [0.65, 0.95, 1.25, 1.55].forEach(function (z, k) {
      put(new THREE.CylinderGeometry(0.014, 0.014, 0.12, 6), mWood, -W2 + 0.24, 1.85, z, 0, 0, Math.PI / 2);
      if (k % 2) put(new THREE.TorusGeometry(0.11, 0.025, 6, 18), new THREE.MeshStandardMaterial({ color: k === 1 ? 0xc06a3a : 0x5a7a9a, roughness: 0.8 }), -W2 + 0.26, 1.66, z, 0, Math.PI / 2, 0).scale.set(1, 1.6, 1);
      else { put(new THREE.TorusGeometry(0.12, 0.02, 6, 20), new THREE.MeshStandardMaterial({ color: k ? 0xd84a6a : 0x8a5a3a, roughness: 0.8 }), -W2 + 0.26, 1.7, z, 0, Math.PI / 2, 0).scale.set(1, 1.4, 1); put(new THREE.BoxGeometry(0.03, 0.1, 0.24), cpmBrass, -W2 + 0.27, 1.52, z, 0, 0, 0); }
    });
    put(new THREE.BoxGeometry(0.22, 0.035, 1.1), mWood, -W2 + 0.2, 1.25, 1.1);
    [[0.7, 0xa04a3a], [0.92, 0x4a6a8a], [1.14, 0xc8a050], [1.38, 0x6a8a5a]].forEach(function (b) { put(new THREE.BoxGeometry(0.12, 0.06, 0.18), new THREE.MeshStandardMaterial({ color: b[1], roughness: 0.7 }), -W2 + 0.2, 1.3, b[0], 0, 0.2, 0); put(new THREE.BoxGeometry(0.1, 0.04, 0.16), new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 1 }), -W2 + 0.2, 1.35, b[0], 0, 0.2, 0); });
    // (a chalkboard of the day's chores on the right wall)
    var chores = cpTex(256, 192, function (g, w, h) {
      g.fillStyle = '#2c3a34'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(230,240,235,0.06)'; for (var k = 0; k < 40; k++) g.fillRect(Math.random() * w, Math.random() * h, 34, 2);
      g.fillStyle = '#f4f0e6'; g.font = 'italic 600 28px Georgia, serif'; g.textAlign = 'center'; g.fillText('Barn chores', w / 2, 34);
      g.textAlign = 'left'; g.font = '20px Georgia, serif'; ['Fill the bench', 'Pet everyone', 'Milk & shear', 'Fresh straw'].forEach(function (t2, k) { g.strokeStyle = '#f4f0e6'; g.lineWidth = 2; g.strokeRect(26, 56 + k * 32, 16, 16); if (k < 2) { g.strokeStyle = '#f6b8cc'; g.beginPath(); g.moveTo(28, 64 + k * 32); g.lineTo(34, 70 + k * 32); g.lineTo(46, 52 + k * 32); g.stroke(); } g.fillStyle = '#f4f0e6'; g.fillText(t2, 54, 70 + k * 32); });
    });
    put(new THREE.BoxGeometry(0.04, 0.78, 1.04), mOld, W2 - 0.15, 1.75, 1.1); put(new THREE.PlaneGeometry(0.96, 0.72), new THREE.MeshStandardMaterial({ map: chores, roughness: 0.95 }), W2 - 0.175, 1.75, 1.1, 0, -Math.PI / 2, 0).castShadow = false;
    // (lanterns on the stall posts and by the doors, and bunting along the header beam)
    [-4.62, -2.2, 0, 2.2, 4.62].forEach(function (x) { cpLantern(R, x, 1.9, -D2 + 1.86, fbarnInGlows); put(new THREE.BoxGeometry(0.04, 0.2, 0.04), cpmIron, x, 2.1, -D2 + 1.8); });   // (on the posts between the stalls, clear of the name slates)
    [-2.0, 2.0].forEach(function (x) { cpLantern(R, x, 2.3, D2 - 0.3, fbarnInGlows); put(new THREE.BoxGeometry(0.04, 0.04, 0.2), cpmIron, x, 2.45, D2 - 0.2); });
    var flagCols = [0xf4a6c8, 0xfff0c8, 0xb8e0c8, 0xc8b8f0, 0xffc8a0, 0xa8d4f0], tri = new THREE.Shape(); tri.moveTo(-0.06, 0); tri.lineTo(0.06, 0); tri.lineTo(0, -0.14); tri.closePath();
    var tg = new THREE.ShapeGeometry(tri), bpts = []; for (var k2 = 0; k2 <= 24; k2++) { var f = k2 / 24; bpts.push(new THREE.Vector3(-4.5 + 9 * f, 2.12 - Math.sin(f * Math.PI * 4) * 0.06 - 0.02, -D2 + 1.77)); }
    put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bpts), 60, 0.004, 4), new THREE.MeshStandardMaterial({ color: 0xf0e6d8 }), 0, 0, 0).castShadow = false;
    for (var bf = 1; bf < 50; bf++) { var f2 = bf / 50; if (Math.abs((-4.5 + 9 * f2) - Math.round((-4.5 + 9 * f2) / 2.2) * 2.2) < 0.32) continue; put(tg, new THREE.MeshStandardMaterial({ color: flagCols[bf % flagCols.length], side: THREE.DoubleSide, roughness: 0.9 }), -4.5 + 9 * f2, 2.1 - Math.sin(f2 * Math.PI * 4) * 0.06 - 0.02, -D2 + 1.775).castShadow = false; }
    // (loose straw everywhere, thickest in the stalls, and a few feathers of ... well, straw)
    var strands = [];
    for (var i = 0; i < 4200; i++) {
      var inStall = i % 2 === 0, x = -W2 + 0.08 + Math.random() * (FBARN_BW - 0.16), z = inStall ? -D2 + 0.08 + Math.random() * 1.55 : -D2 + 1.7 + Math.random() * (FBARN_BD - 1.8);
      if (!inStall && Math.random() < 0.55) continue;
      var c = new THREE.Color().setHSL(0.1 + Math.random() * 0.03, 0.5 + Math.random() * 0.25, 0.48 + Math.random() * 0.28);
      strands.push([x, 0.006 + (inStall ? Math.random() * 0.03 : 0), z, 0, Math.random() * Math.PI * 2, Math.PI / 2 + (Math.random() - 0.5) * 0.25, 1, 0.05 + Math.random() * 0.13, 1, c.getHex()]);
    }
    coopInst(R, new THREE.CylinderGeometry(0.0028, 0.0028, 1, 3), new THREE.MeshStandardMaterial({ roughness: 0.9 }), strands, true).castShadow = false;
    // (sunbeams slanting in through the side windows, with dust drifting in them)
    var beamTex = cpTex(64, 128, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); var gx = g.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.2, 'rgba(0,0,0,0)'); gx.addColorStop(0.8, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, w, h); });
    var motePts = [];
    [[-W2 + 0.09, 1.65, 0, Math.PI / 2], [-W2 + 0.09, 1.65, 2.2, Math.PI / 2], [-3.25, 1.65, D2 - 0.09, Math.PI], [3.25, 1.65, D2 - 0.09, Math.PI]].forEach(function (b) {
      var g = new THREE.Group(); g.position.set(b[0], b[1], b[2]); g.rotation.y = b[3]; R.add(g);
      var phi = 0.6, L = 2.7, bm = new THREE.MeshBasicMaterial({ map: beamTex, color: 0xfff0c8, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      var pl = new THREE.Mesh(new THREE.PlaneGeometry(0.95, L), bm); pl.position.set(0, -Math.sin(phi) * L / 2 + 0.35, Math.cos(phi) * L / 2); pl.rotation.x = phi - Math.PI / 2; g.add(pl); fbarnShafts.push(bm);
      g.updateMatrixWorld(true);
      for (var m = 0; m < 22; m++) { var fq = Math.random(), p = new THREE.Vector3((Math.random() - 0.5) * 0.65, 0.35 - Math.sin(phi) * L * fq, Math.cos(phi) * L * fq + (Math.random() - 0.5) * 0.2); g.localToWorld(p); R.worldToLocal(p); motePts.push(p.x, p.y, p.z); }
    });
    var mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.Float32BufferAttribute(motePts, 3));
    fbarnMotes = new THREE.Points(mg, new THREE.PointsMaterial({ map: dawnGlowTex, color: 0xfff4d8, size: 0.05, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
    fbarnMotes.userData.base = motePts.slice(); R.add(fbarnMotes);
  })(fbarnRoom);
  function fbarnHayShow() { fbarnHayMeshes.forEach(function (m, i) { m.visible = fbarn.hay[i]; }); }
  var fbLook = new THREE.Vector3();
  function updateFbarnInside(t) {
    fbLook.set(camera.position.x - FBI_X, 0, camera.position.z - FBI_Z);
    fbarnWalls.forEach(function (W) { W.g.visible = fbLook.dot(W.n) < W.d - 0.6; });
    var hr = state.minutes / 60, nt = hr < 5.5 ? 1 : hr < 7 ? (7 - hr) / 1.5 : hr < 18.5 ? 0 : hr < 20 ? (hr - 18.5) / 1.5 : 1;
    fbSun.intensity = 0.5 * (1 - nt); fbLamps.forEach(function (l, i) { l.intensity = (0.5 + nt * 0.3) * (1 + Math.sin(t * 10 + i) * 0.04); });
    fbarnInGlows.forEach(function (L) { var f = 1 + Math.sin(t * 11 + L.p) * 0.1; L.f.scale.set(f, 1.5 * f, f); L.h.material.opacity = 0.5 * f; });
    fbarnShafts.forEach(function (m, i) { m.opacity = (1 - nt) * (0.1 + Math.sin(t * 0.4 + i) * 0.025); });
    var mp = fbarnMotes.geometry.attributes.position, mb = fbarnMotes.userData.base;
    for (var k = 0; k < mp.count; k++) mp.setXYZ(k, mb[k * 3] + Math.sin(t * 0.3 + k * 1.7) * 0.06, mb[k * 3 + 1] + Math.sin(t * 0.22 + k * 2.3) * 0.08, mb[k * 3 + 2] + Math.cos(t * 0.27 + k) * 0.06);
    mp.needsUpdate = true; fbarnMotes.material.opacity = (1 - nt) * 0.75;
  }
  function drawFbarnView() {                                           // (the windows look out on the real farm)
    renderer.getDrawingBufferSize(shopViewSize);
    if (shopViewTarget.width !== shopViewSize.x || shopViewTarget.height !== shopViewSize.y) shopViewTarget.setSize(shopViewSize.x, shopViewSize.y);
    siWindowMask.uniforms.uSize.value.copy(shopViewSize);
    shopViewMap.makeTranslation(fbarn.x, fbarn.fy, fbarn.z).multiply(shopViewTmp.makeRotationY(bRot(fbarn))).multiply(shopViewTmp.makeTranslation(-FBI_X, 0, -FBI_Z));
    shopViewCam.projectionMatrix.copy(camera.projectionMatrix); shopViewCam.projectionMatrixInverse.copy(camera.projectionMatrixInverse);
    shopViewCam.matrix.multiplyMatrices(shopViewMap, camera.matrixWorld);
    shopViewCam.updateMatrixWorld(true);
    if (fbarnGroup) fbarnGroup.visible = false;
    renderer.setRenderTarget(shopViewTarget); renderer.render(scene, shopViewCam); renderer.setRenderTarget(null);
    if (fbarnGroup) fbarnGroup.visible = true;
  }
  function fbarnDoorUse(goIn) {                                        // through the barn's doors, in or out
    if (doorBusy) return;
    doorBusy = true; doorArmed = false; walkTarget = null; doorSound(); fadeBox.style.opacity = 1;
    setTimeout(function () {
      if (goIn) {
        indoors = true; inShop = inClinic = inBarn = inCarp = inCoop = false; inFbarn = true;
        fbarnScene.add(player); player.position.set(FBI_X, 0, FBI_Z + FBI_EXIT_Z - 1.0); facing = Math.PI;
        outsideCam = { dist: cam.dist, pitch: cam.pitch, yaw: cam.yaw }; cam.dist = 9.5; cam.pitch = 0.88; cam.yaw = 0;
      } else {
        indoors = false; inFbarn = false; scene.add(player);
        var o = fbarnFront(1.9); player.position.set(o.x, 0, o.z); facing = bRot(fbarn);
        if (outsideCam) { cam.dist = outsideCam.dist; cam.pitch = outsideCam.pitch; cam.yaw = outsideCam.yaw; }
      }
      cam.target.set(player.position.x, 0.8, player.position.z);
      fadeBox.style.opacity = 0;
      setTimeout(function () { doorBusy = false; }, 380);
    }, 380);
  }

  // ===== building it, and taking it down (when a save without one is loaded) =====
  function fbarnPlace(c0, r0, start, rot) {
    fbarnRemove();
    fbarn.built = true; fbarn.c = c0; fbarn.r = r0; fbarn.start = start; fbarn.stage = siteStage(fbarn); fbarn.rot = rot || 0;   // (start: the farm day Oak & Ember started building it; rot: which way it faces)
    var FC = bFC(fbarn, FBARN_FC, FBARN_FR), FR = bFR(fbarn, FBARN_FC, FBARN_FR);
    fbarn.fx = FARM_X + (c0 + FC / 2) * TILE; fbarn.fz = FARM_Z + (r0 + FR / 2) * TILE;
    var back = bOff(fbarn, 0, -FBARN_OFF); fbarn.x = fbarn.fx + back.x; fbarn.z = fbarn.fz + back.z;
    var top = -9; for (var gx = -1; gx <= 1; gx++) for (var gz = -1; gz <= 1; gz++) top = Math.max(top, bGround(fbarn, gx * FBARN_BW / 2, gz * FBARN_BD / 2));
    fbarn.fy = top + 0.22;
    var HX = FC * TILE / 2, HZ = FR * TILE / 2;
    allScenery.forEach(function (t) { var u = t.userData; if (u.gone || u.state === 'standing') return; if (Math.abs(u.solid.x - fbarn.fx) < HX + u.solidR && Math.abs(u.solid.z - fbarn.fz) < HZ + u.solidR) setSceneryCut(t, u.state === 'regrowing' ? u.felledAt : gameMinutes()); });
    mineable.forEach(function (r) { if (r.gone || r.state === 'whole') return; if (Math.abs(r.solid.x - fbarn.fx) < HX + r.solidR && Math.abs(r.solid.z - fbarn.fz) < HZ + r.solidR) setRockBroken(r, r.state === 'regrowing' ? r.brokeAt : gameMinutes()); });
    for (var c = c0; c < c0 + FC; c++) for (var r = r0; r < r0 + FR; r++) { var ft = { x: FARM_X + (c + 0.5) * TILE, z: FARM_Z + (r + 0.5) * TILE }; coverGrass(ft); fbarn.grass.push(ft); }
    var sl = [[-3.6, 2.85, 0.6], [3.6, 2.85, 0.6], [-3.45, 3.6 + 0.8, 0.6], [2.75, 3.6 + 0.85, 0.75], [4.05, 3.6 + 0.8, 0.45]];
    for (var sx = -3.5; sx <= 3.51; sx += 1.4) for (var sz = -2.4; sz <= 2.41; sz += 1.6) sl.push([sx, sz, 1.15]);
    [-1, 1].forEach(function (s) { [-2.9, 0, 2.9].forEach(function (z) { sl.push([s * 4.1, z, 0.7]); }); });
    sl.forEach(function (s) { var w = bOff(fbarn, s[0], s[1]), sd = { x: fbarn.x + w.x, z: fbarn.z + w.z, r: s[2] }; solids.push(sd); fbarn.solids.push(sd); });
    fbarnDoor = fbarn.stage < SITE_DAYS ? { x: 1e6, z: 1e6 } : fbarnFront(0.15);   // (no way in until it's finished)
    fbarnGroup = fbarn.stage < SITE_DAYS ? siteBuild('fbarn', fbarn.stage) : fbarnBuildOutside();
    if (!fbarn.tp) fbarn.tp = { name: 'Your Barn', icon: '🐮', spot: function () { var f = fbarnFront(2.6); return { x: f.x, z: f.z, face: bRot(fbarn) + Math.PI, view: bRot(fbarn) }; } };
    if (TELEPORTS.indexOf(fbarn.tp) < 0) TELEPORTS.push(fbarn.tp);
    flushDirty();
  }
  function fbarnRemove() {
    if (!fbarn.built) return;
    if (fbarnGroup) { scene.remove(fbarnGroup); fbarnGroup = null; }
    fbarn.solids.forEach(function (sd) { var i = solids.indexOf(sd); if (i >= 0) solids.splice(i, 1); }); fbarn.solids = [];
    fbarn.grass.forEach(uncoverGrass); fbarn.grass = [];
    var ti = TELEPORTS.indexOf(fbarn.tp); if (ti >= 0) TELEPORTS.splice(ti, 1);
    fbarn.built = false; fbarnDoor = { x: 1e6, z: 1e6 };
  }
  function fbarnSaveData() { return fbarn.built ? { c: fbarn.c, r: fbarn.r, rot: fbarn.rot || 0, hay: fbarn.hay.slice(), start: fbarn.start } : null; }
  function fbarnLoadData(d) {
    fbarnRemove();
    fbarn.hay = [false, false, false, false, false, false, false, false]; fbarn.res = [];
    if (d) { fbarnPlace(d.c, d.r, d.start === undefined ? -99 : d.start, d.rot || 0); if (d.hay) d.hay.forEach(function (h, i) { if (i < 8) fbarn.hay[i] = !!h; }); }
    fbarnAnimals().forEach(function (g) { g.eatSlot = null; });
    fbarnHayShow();
  }
  // (animals still in Fluff & Feather's stalls from before move to the coop or the barn as soon as there's room)
  function homeMigrate(quiet) {
    var moved = [];
    glimmers.slice().forEach(function (g) {
      if (g.stall >= COOP_STALL0) return;
      var to = COOP_KINDS.indexOf(g.kind) >= 0 ? (siteReady(coop) ? coopFreeStall() : -1) : (siteReady(fbarn) ? fbarnFreeStall() : -1);
      if (to < 0) return;
      [g.m.root, g.eggMesh, g.hayMesh].forEach(function (o) { if (o && o.parent) o.parent.remove(o); }); g.slate.map = abSlateTex; g.slate.needsUpdate = true;
      glimmers.splice(glimmers.indexOf(g), 1);
      glimAdd({ kind: g.kind, name: g.name, stall: to, pal: g.pal, fed: g.fed, petted: g.petted, egg: g.egg, days: g.days });
      moved.push(g.name);
    });
    if (moved.length && !quiet) setTimeout(function () { showToast('✧ ' + moved.join(' and ') + (moved.length > 1 ? ' have' : ' has') + ' moved out of Fluff & Feather into their new home on your farm!', 4200); }, 5400);
  }

  // ===== the animals that live in it =====
  function fbarnMoveIn(g, added) {                                     // (called as one is adopted or loaded: everything built for it moves from the barn room into your barn's stalls)
    added.forEach(function (o) { if (o !== g.hayMesh) fbarnPen.add(o); });
    if (g.hayMesh.parent) g.hayMesh.parent.remove(g.hayMesh);
    g.eatSlot = null; g.eatT = 0;
  }
  function fbarnEat(g) {
    var i = g.eatSlot; fbarn.hay[i] = false; fbarn.res[i] = null; g.eatSlot = null; g.eatT = 0; g.routeTo = null;
    g.fed = true; glimRefresh(g); fbarnHayShow();
    if (inFbarn) { popSound(); petSound(g, 'eat', fbarnNear(g)); g.wait = 0.4; }
  }
  function fbarnNear(g) { var r = fbarnToRoom(g.x, g.z), d = Math.hypot(player.position.x - FBI_X - r[0], player.position.z - FBI_Z - r[1]); return Math.max(0.25, Math.min(1, 2.2 / (d + 0.8))); }   // (softer the further it is from you)
  function updateFbarnFeeding(dt) {                                    // a hungry animal walks out of its stall to the nearest bundle on the bench, and eats it
    fbarnAnimals().forEach(function (g) {
      if (inFbarn && (g.kind === 'moon' || g.kind === 'aurora' || g.kind === 'zephyra' || g.kind === 'luna' || g.kind === 'bubble' || g.kind === 'prism' || g.kind === 'lotus' || g.kind === 'axo' || g.kind === 'liz' || g.kind === 'tort' || g.kind === 'bison' || g.kind === 'crab')) {   // (each barn animal with a voice makes its sounds now and then, and less at night)
        if (g.chirpT === undefined) g.chirpT = 4 + Math.random() * 10;
        g.chirpT -= dt;
        if (g.chirpT <= 0) { var hr = state.minutes / 60, night = hr >= 20 || hr < 6; g.chirpT = (night ? 35 : 12) + Math.random() * (night ? 40 : 18); petSound(g, 'chirp', fbarnNear(g) * (night ? 0.5 : 1)); }
      }
      if (g.fed) { if (g.eatSlot !== null && g.eatSlot !== undefined) { fbarn.res[g.eatSlot] = null; g.eatSlot = null; g.routeTo = null; } return; }
      if (g.eatSlot === null || g.eatSlot === undefined) {
        var rx = fbarnToRoom(g.x, g.z)[0], best = -1, bd = 1e9;
        for (var i = 0; i < 8; i++) if (fbarn.hay[i] && !fbarn.res[i]) { var d = Math.abs(FBARN_SLOT_X[i] - rx); if (d < bd) { bd = d; best = i; } }
        if (best < 0) return;
        g.eatSlot = best; fbarn.res[best] = g; g.eatT = 0;
      }
      if (!inFbarn) { fbarnEat(g); return; }
      var big = g.kind === 'bison' || g.kind === 'lotus' || g.kind === 'moon' || g.kind === 'aurora', spot = fbarnToFrame(FBARN_SLOT_X[g.eatSlot], big ? -0.75 : -0.5);
      if (g.routeTo !== 'eat' + g.eatSlot) { fbarnGo(g, [FBARN_SLOT_X[g.eatSlot], big ? -0.75 : -0.5], 0); g.routeTo = 'eat' + g.eatSlot; }   // (round the end of the bench if it's on the other side)
      g.wait = 1;
      if (Math.hypot(g.x - spot[0], g.z - spot[1]) < 0.06) { g.face = Math.PI / 2; g.eatT += dt; if (g.eatT > 2.6) fbarnEat(g); }
    });
  }
  // (wandering all over the barn: out of its stall into the aisle behind the feeding bench, round either end of the
  // bench to the open floor by the big doors, and home to its own stall again, where they all go to sleep at night.
  // Points here are in the barn's room: x across it, z from the stalls at the back (-) to the doors at the front (+))
  function fbarnZone(p) { return p[1] < -1.75 ? 'stall' : p[1] < 0 ? 'aisle' : 'front'; }
  function fbarnRoute(a, b) {                                          // (the corners to walk through from a to b, ending at b)
    var pts = [], za = fbarnZone(a), zb = fbarnZone(b);
    if (za === 'stall' && zb === 'stall' && Math.abs(a[0] - b[0]) < 1) return [b];   // (just pottering about its own stall)
    if (za === 'stall') { a = [a[0], -1.1]; pts.push(a); za = 'aisle'; }               // (out through the stall's opening)
    var b2 = zb === 'stall' ? [b[0], -1.1] : b, zb2 = zb === 'stall' ? 'aisle' : zb;
    if (za !== zb2) { var sx = a[0] + b2[0] >= 0 ? 3.55 : -3.55; if (za === 'aisle') pts.push([sx, -0.9], [sx, 0.9]); else pts.push([sx, 0.9], [sx, -0.9]); }   // (round the nearer end of the bench)
    if (zb === 'stall') pts.push(b2);
    pts.push(b);
    return pts;
  }
  function fbarnGo(g, to, rest) {
    var pts = fbarnRoute(fbarnToRoom(g.x, g.z), to).map(function (p) { return fbarnToFrame(p[0], p[1]); });
    var first = pts.shift(); g.tx = first[0]; g.tz = first[1]; g.route = pts; g.restT = rest || 0; g.routeTo = null;
  }
  function fbarnRouteTick(g) {
    var left = Math.hypot(g.tx - g.x, g.tz - g.z);
    if (left < 0.05 && g.route && g.route.length) { var nx = g.route.shift(); g.tx = nx[0]; g.tz = nx[1]; left = 1; }
    if (left > 0.05) g.wait = Math.max(g.wait, 0.3 + (g.restT || 0));  // (no new idea where to go until it gets there, then a rest)
  }
  function fbarnWander(g) {
    if (g.eatSlot !== null && g.eatSlot !== undefined) { g.wait = 0.5; return; }
    var home = -GLIM_STALLS[g.stall], hr = state.minutes / 60, night = hr >= 20 || hr < 6, r = Math.random();
    var slow = g.kind === 'tort' || g.kind === 'bison' || g.kind === 'lotus' || g.kind === 'moon', to;
    if (night || r < 0.2) to = [home + (Math.random() - 0.5) * 0.6, -2.35 - Math.random() * 0.6];   // (home to its own stall, and to sleep there at night)
    else if (r < 0.6) to = [-3.9 + Math.random() * 7.3, -1.3 + Math.random() * 0.5];            // (somewhere along the aisle behind the bench)
    else to = [-1.5 + Math.random() * 3.4, 0.8 + Math.random() * 1.15];                          // (out on the open floor by the big doors)
    fbarnGo(g, to, ((slow ? 6 : 3) + Math.random() * (slow ? 8 : 6)) * (night ? 2 : 1));
    g.wait = 0.3 + g.restT;
  }
  var FBARN_ACT = { moon: mooncalfAction, aurora: auroraramAction, zephyra: zephyraAction, luna: lunastraAction, bubble: sirennaAction, prism: prismaraAction, lotus: lotaraAction, axo: axoriaAction, liz: solarithAction, tort: grovellaAction, bison: nocturraAction, crab: iridelleAction };
  function fbarnCare(g) {                                              // milking, shearing, collecting, and petting (it feeds itself at the bench)
    var pf = fbarnToFrame(player.position.x - FBI_X, player.position.z - FBI_Z);
    var wx = player.position.x - (pf[0] - g.x), wz = player.position.z - (pf[1] - g.z);   // (so it turns to face you in its own stall frame)
    if (g.egg || g.fed) { FBARN_ACT[g.kind](g, wx, wz); return; }
    if (!g.petted) {
      g.petted = true; glimRefresh(g); g.pet = 1.4; g.face = Math.atan2(pf[0] - g.x, pf[1] - g.z);
      glimHeartBurst(g.x, g.kind === 'bison' || g.kind === 'lotus' ? 1.3 : 0.85, g.z); popSound(); petSound(g, 'pet');
      showToast(g.name + ' loves the attention 💜 Put hay on the feeding bench so they can eat too!', 2600); return;
    }
    petSound(g, 'hungry'); showToast(g.name + ' is hungry! Put hay on the feeding bench 🌾', 2400);
  }
  function fbarnBenchAction() {
    var i = fbarn.hay.indexOf(false);
    if (i < 0) { showToast('The feeding bench is full: all 8 spots have hay 🌾', 2200); return; }
    if (!takeItem('hay', 1)) { showToast('You need hay to put on the bench. Take it from the hopper' + (siloReady() ? ' (' + silo.hay + ' in your silo)' : '') + ', buy it at Fluff & Feather, or trim bushes for it 🌾', 3000); return; }
    fbarn.hay[i] = true; fbarnHayShow(); popSound();
    showToast('You put a bundle of hay on the feeding bench (' + fbarn.hay.filter(Boolean).length + '/8) 🌾', 1800);
  }
  function fbarnTarget() {                                             // what Interact would do in here: the bench, or one of your animals
    if (!inFbarn || glimNaming || siloHopperHere()) return null;     // (by the hopper, Interact takes hay out of it instead)
    var lx = player.position.x - FBI_X, lz = player.position.z - FBI_Z, best = null, bd = 1.3;
    fbarnAnimals().forEach(function (g) { var p = fbarnToRoom(g.x, g.z), d = Math.hypot(lx - p[0], lz - p[1]); if (d < bd) { bd = d; best = g; } });
    var atBench = Math.abs(lx) < 3.1 && lz > 0.25 && lz < 1.25;
    if (best && bd < 0.9 && (best.egg || !atBench)) return best;
    return atBench ? 'bench' : best;
  }
  var fbarnBtn = document.createElement('button');
  fbarnBtn.type = 'button'; fbarnBtn.className = 'sleep-btn ship-btn';
  canvas.parentNode.appendChild(fbarnBtn);
  fbarnBtn.addEventListener('click', function () { var tg = fbarnTarget(); if (tg === 'bench') fbarnBenchAction(); else if (tg) fbarnCare(tg); focusGame(); });
  var fbarnBtnText = '';
  function updateFbarnButton() {
    var tg = fbarnTarget(), txt = '';
    if (tg === 'bench') txt = '🌾 Put hay on the bench (' + fbarn.hay.filter(Boolean).length + '/8)';
    else if (tg) txt = tg.egg ? (tg.kind === 'moon' || tg.kind === 'aurora' || tg.kind === 'lotus' || tg.kind === 'bison' ? '🥛 Milk ' + tg.name : tg.kind === 'zephyra' || tg.kind === 'prism' || tg.kind === 'axo' ? '✂️ Shear ' + tg.name : tg.kind === 'luna' ? '⚪ Take the Moonpearl' : tg.kind === 'bubble' ? '🫧 Take the Wishbubble' : tg.kind === 'liz' ? '☀️ Take the Sunscale' : tg.kind === 'tort' ? '🌸 Pick the Starbloom' : '⚪ Take the Tidelight Pearl') : !tg.petted ? '💜 Pet ' + tg.name : !tg.fed ? '🌾 ' + tg.name + ' is hungry' : '✧ ' + tg.name;
    if (txt !== fbarnBtnText) { fbarnBtnText = txt; if (txt) fbarnBtn.innerHTML = txt.replace(/&/g, '&amp;').replace(/</g, '&lt;') + ' <kbd>E</kbd>'; }
    var show = !!txt;
    if (fbarnBtn.classList.contains('show') !== show) fbarnBtn.classList.toggle('show', show);
  }

  // ===== adopting at Fluff & Feather: every animal that isn't a coop bird lives in your barn =====
  var fbarnBaseAdopt = adoptGlimmerwing;
  adoptGlimmerwing = function (kind) {
    if (FBARN_KINDS.indexOf(kind) < 0) return fbarnBaseAdopt(kind);
    if (!fbarn.built) { showToast('A ' + FBARN_NAMES[kind] + ' lives in a barn: build one at Oak & Ember first 🐮', 2800); return; }
    if (!siteReady(fbarn)) { showToast('Your barn is still being built: it\'ll be ready on the morning of ' + seasonDay(fbarn.start + SITE_DAYS) + ' 🪚', 2800); return; }
    var fs2 = fbarnFreeStall(), cost = fbarnKindCost(kind);
    if (fs2 < 0) { showToast('Your barn is full: it has room for 4', 2200); return; }
    if (state.coins < cost) { showToast('Not enough Star Coins', 1800); return; }
    state.coins -= cost; showCoins(true); coinSound(5); closeBarnShop(); glimStartNaming(fs2, kind);
  };
  var FBARN_BTNS = [[moonAdoptBtn, MOON_COST], [auroraAdoptBtn, AURORA_COST], [zephyraAdoptBtn, ZEPHYRA_COST], [lunaAdoptBtn, LUNA_COST], [bubbleAdoptBtn, BUBBLE_COST], [prismAdoptBtn, PRISM_COST], [lotusAdoptBtn, LOTUS_COST], [axoAdoptBtn, AXO_COST], [lizAdoptBtn, LIZ_COST], [tortAdoptBtn, TORT_COST], [bisAdoptBtn, BIS_COST], [crbAdoptBtn, CRB_COST]];
  var FBARN_NOTES = [];
  FBARN_BTNS.forEach(function (b) {                                    // (their cards at Fluff & Feather say where they live)
    var card = b[0].closest('.shop-card'); if (!card) return;
    homeCardText(card, 'barn');
    var note = document.createElement('p'); note.className = 'ship-hint'; note.style.cssText = 'margin:6px 2px 8px;font-weight:600;color:#a84a3c'; note.textContent = '🐮 ' + homeNoteText(fbarn, 'barn');
    card.insertBefore(note, card.querySelector('.shop-buy')); FBARN_NOTES.push(note);
  });
  var fbarnBarnRender = renderBarnShop;
  renderBarnShop = function () {
    fbarnBarnRender();
    var free = siteReady(fbarn) && fbarnFreeStall() >= 0;
    FBARN_BTNS.forEach(function (b) { b[0].innerHTML = !fbarn.built ? '🐮 Needs a barn' : !siteReady(fbarn) ? '🪚 Barn being built' : !free ? 'Your barn is full' : 'Adopt · <img class="coin-icon" alt=""> ' + b[1].toLocaleString('en-US'); b[0].disabled = !free || state.coins < b[1]; });
    var bn = '🐮 ' + homeNoteText(fbarn, 'barn'); FBARN_NOTES.forEach(function (n) { if (n.textContent !== bn) n.textContent = bn; });
    barnTilesSync();
  };

  // ===== choosing your new animal's colour at Fluff & Feather =====
  // Every animal at Fluff & Feather comes in three colours. "Surprise colour" adopts one at the usual price in a colour
  // picked at random; "Pick colour" costs 1,500 Star Coins more and lets you choose which of the three you get first
  var PICK_COST = 1500, pickKind = null;
  var PICK_PALS = { glim: [GLIM_PALS, 'fur', 'glow'], duck: [DUCK_PALS, 'mid', 'breast'], ember: [EMBER_PALS, 'mid', 'tip'], gem: [GEM_PALS, 'mid', 'gem'], ostrich: [OST_PALS, 'body', 'plume'],
    moon: [MOON_PALS, 'coat', 'ribbon'], aurora: [AURORA_PALS, 'coat2', 'glow'], zephyra: [ZEPHYRA_PALS, 'low', 'gold'], luna: [LUNA_PALS, 'fur', 'nebula'], bubble: [BUBBLE_PALS, 'back', 'fin'],
    prism: [PRISM_PALS], lotus: [LOTUS_PALS, 'back', 'petal'], axo: [AXO_PALS, 'back', 'gill'], liz: [LIZ_PALS, 'back', 'frill'], tort: [TORT_PALS, 'shell', 'bloom'], bison: [BIS_PALS, 'coat', 'mane'], crab: [CRB_PALS, 'shell', 'rim'] };
  function pickCss(c) { if (c && c.length !== undefined && typeof c !== 'string') c = c[c.length - 1]; return typeof c === 'number' ? '#' + ('00000' + c.toString(16)).slice(-6) : c; }
  function pickSwatch(kind, i) {                                       // (a little round swatch of that colour: its main colour, and its accent)
    var P = PICK_PALS[kind], p = P[0][i];
    if (kind === 'prism') return 'conic-gradient(' + [0, 0.25, 0.5, 0.75, 1].map(function (t) { return 'hsl(' + Math.round((p.hue + t * p.hueSpan) * 360) + ',' + Math.round(p.sat * 100) + '%,' + Math.round(p.light * 100) + '%)'; }).join(',') + ')';
    return 'linear-gradient(135deg,' + pickCss(p[P[1]]) + ' 55%,' + pickCss(p[P[2]]) + ' 55%)';
  }
  function pickCost(kind) { return (COOP_KINDS.indexOf(kind) >= 0 ? coopKindCost(kind) : fbarnKindCost(kind)) + PICK_COST; }
  var pickBox = document.createElement('div'); pickBox.className = 'inventory ship shop'; pickBox.hidden = true;
  pickBox.innerHTML = '<div class="inv-head"><b class="pick-title">🎨 Pick a colour</b><button type="button" class="inv-close" aria-label="Close">✕</button></div>' +
    '<p class="ship-hint pick-hint"></p><div class="pick-row" style="display:flex;gap:10px;flex-wrap:wrap;margin:6px 0 4px"></div>';
  canvas.parentNode.appendChild(pickBox);
  function closePick(back) { pickBox.hidden = true; pickKind = null; glimNaming = false; if (back) openBarnShop(); else focusGame(); }
  pickBox.querySelector('.inv-close').addEventListener('click', function () { closePick(true); });
  window.addEventListener('keydown', function (e) { if (e.code === 'Escape' && pickKind) closePick(true); });
  function openPick(kind) {
    var name = COOP_NAMES[kind] || FBARN_NAMES[kind], row = pickBox.querySelector('.pick-row');
    pickKind = kind; closeBarnShop(); glimNaming = true; walkTarget = null; keys = {};
    pickBox.querySelector('.pick-title').textContent = '🎨 Pick a colour for your ' + name;
    pickBox.querySelector('.pick-hint').innerHTML = 'Choosing costs 1,500 Star Coins more: <img class="coin-icon" alt=""> ' + pickCost(kind).toLocaleString('en-US') + ' in all.';
    row.innerHTML = '';
    PICK_PALS[kind][0].forEach(function (p, i) {
      var b = document.createElement('button'); b.type = 'button'; b.style.cssText = 'flex:1 1 30%;min-width:96px;display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 8px';
      b.innerHTML = '<span style="width:58px;height:58px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(60,40,90,.3);background:' + pickSwatch(kind, i) + '"></span><span>' + p.name + '</span>';
      b.addEventListener('click', function () { closePick(false); adoptGlimmerwing(kind, i); });
      row.appendChild(b);
    });
    paintCoinIcons(pickBox); pickBox.hidden = false;
  }
  var pickBaseAdopt = adoptGlimmerwing;
  adoptGlimmerwing = function (kind, pal) {                            // (pal: the colour you chose, or nothing for a surprise)
    if (pal === undefined) return pickBaseAdopt(kind);
    if (state.coins < pickCost(kind)) { showToast('Not enough Star Coins', 1800); return; }
    pickBaseAdopt(kind);
    if (glimNaming && glimPending && glimPending.kind === kind) { glimPending.pal = pal; state.coins -= PICK_COST; showCoins(true); }   // (adopted: it's the colour you picked, for the extra 1,500)
  };
  var PICK_BTNS = [[glimAdoptBtn, 'glim'], [duckAdoptBtn, 'duck'], [emberAdoptBtn, 'ember'], [gemAdoptBtn, 'gem'], [ostAdoptBtn, 'ostrich'], [moonAdoptBtn, 'moon'], [auroraAdoptBtn, 'aurora'], [zephyraAdoptBtn, 'zephyra'],
    [lunaAdoptBtn, 'luna'], [bubbleAdoptBtn, 'bubble'], [prismAdoptBtn, 'prism'], [lotusAdoptBtn, 'lotus'], [axoAdoptBtn, 'axo'], [lizAdoptBtn, 'liz'], [tortAdoptBtn, 'tort'], [bisAdoptBtn, 'bison'], [crbAdoptBtn, 'crab']].map(function (b) {
    var pb = document.createElement('button'); pb.type = 'button';
    pb.addEventListener('click', function () { openPick(b[1]); });
    b[0].parentNode.insertBefore(pb, b[0].nextSibling); b[0].parentNode.style.flexWrap = 'wrap';
    return [b[0], b[1], pb];
  });
  var pickBarnRender = renderBarnShop;
  renderBarnShop = function () {
    pickBarnRender();
    PICK_BTNS.forEach(function (b) {
      var open = b[0].innerHTML.indexOf('Adopt · ') === 0;             // (only once it could be adopted: there's a home with room for it)
      if (open) b[0].innerHTML = b[0].innerHTML.replace('Adopt · ', '🎲 Surprise colour · ');
      b[2].hidden = !open; b[2].innerHTML = '🎨 Pick colour · <img class="coin-icon" alt=""> ' + pickCost(b[1]).toLocaleString('en-US'); b[2].disabled = !open || state.coins < pickCost(b[1]);
    });
    barnTilesSync();
  };

  // ===== on the world map, and every frame =====
  function fbarnDrawOnMap(g, K, label) {                               // (its grey gambrel roof with the ridge down the middle, the cupola, and its red doors)
    var pc = mapXY(fbarn.x, fbarn.z), p = [0, 0], hw = FBARN_BW / 2 * K + 6, hd = FBARN_BD / 2 * K + 6;
    g.save(); g.translate(pc[0], pc[1]); g.rotate(-bRot(fbarn));         // (turned the way it faces)
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(p[0] - hw + 8, p[1] - hd + 10, hw * 2, hd * 2);
    g.fillStyle = '#5a5654'; g.fillRect(p[0] - hw, p[1] - hd, hw, hd * 2); g.fillStyle = '#6e6a66'; g.fillRect(p[0], p[1] - hd, hw, hd * 2);
    g.fillStyle = '#7c7874'; g.fillRect(p[0] - hw * 0.62, p[1] - hd, hw * 0.62, hd * 2); g.fillStyle = '#8a8682'; g.fillRect(p[0], p[1] - hd, hw * 0.62, hd * 2);
    g.fillStyle = '#3e3430'; g.fillRect(p[0] - 2, p[1] - hd, 4, hd * 2);
    g.fillStyle = '#b84a3c'; g.fillRect(p[0] - 9, p[1] - 9, 18, 18); g.fillStyle = '#f6efe2'; g.fillRect(p[0] - 9, p[1] - 9, 18, 3);
    g.fillStyle = '#b84a3c'; g.fillRect(p[0] - 1.5 * K, p[1] + hd, 3 * K, 6); g.fillStyle = '#f6efe2'; g.fillRect(p[0] - 1, p[1] + hd, 2, 6);
    g.restore();
    label(siteReady(fbarn) ? 'Barn' : 'Barn (being built)', fbarn.x, fbarn.z, hd + 30);
  }
  var fbarnBaseInteract = interact;
  interact = function () {
    if (inFbarn && !glimNaming && !coopPlacing) { var tg = fbarnTarget(); if (tg) { if (tg === 'bench') fbarnBenchAction(); else fbarnCare(tg); return; } }
    return fbarnBaseInteract.apply(this, arguments);
  };
  function updateFbarn(dt, night) {
    if (inFbarn && player.parent !== fbarnScene) inFbarn = false;      // (carried home or teleported away from inside)
    updateFbarnButton();
    if (!fbarn.built) return;
    siteTick('fbarn');
    updateFbarnFeeding(dt);
    if (inFbarn) updateFbarnInside(state.time); else updateFbarnOutside(state.time, night);
  }
  function fbarnShopIcon() {                                           // (a little picture of the barn, for Oak & Ember's menu)
    var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d'); g.scale(2, 2);
    g.fillStyle = 'rgba(0,0,0,0.16)'; g.beginPath(); g.ellipse(64, 114, 58, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#8a8478'; g.fillRect(14, 104, 100, 7);
    var wg = g.createLinearGradient(0, 40, 0, 104); wg.addColorStop(0, '#c4544a'); wg.addColorStop(1, '#a8443a'); g.fillStyle = wg;
    g.beginPath(); g.moveTo(16, 104); g.lineTo(16, 64); g.lineTo(34, 40); g.lineTo(64, 28); g.lineTo(94, 40); g.lineTo(112, 64); g.lineTo(112, 104); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(80,20,15,0.35)'; g.lineWidth = 0.8; for (var b = 20; b < 110; b += 5) { g.beginPath(); g.moveTo(b, 104); g.lineTo(b, 40); g.stroke(); }
    g.fillStyle = 'rgba(70,40,20,0.2)'; g.fillRect(16, 96, 96, 8);
    g.strokeStyle = '#4e4a48'; g.lineWidth = 6; g.lineJoin = 'round'; g.beginPath(); g.moveTo(10, 68); g.lineTo(33, 37); g.lineTo(64, 24); g.lineTo(95, 37); g.lineTo(118, 68); g.stroke();
    g.strokeStyle = '#f6efe2'; g.lineWidth = 2; g.beginPath(); g.moveTo(14, 66); g.lineTo(34, 40); g.lineTo(64, 28); g.lineTo(94, 40); g.lineTo(114, 66); g.stroke();
    g.fillStyle = '#c4544a'; g.fillRect(58, 14, 12, 12); g.fillStyle = '#f6efe2'; g.fillRect(60, 17, 8, 7); g.fillStyle = '#2a1c12'; for (var l = 0; l < 3; l++) g.fillRect(60, 18 + l * 2.2, 8, 1);
    g.fillStyle = '#55504c'; g.beginPath(); g.moveTo(55, 15); g.lineTo(64, 7); g.lineTo(73, 15); g.closePath(); g.fill();
    g.fillStyle = '#c08050'; g.beginPath(); g.arc(64, 3, 2.2, Math.PI * 0.3, Math.PI * 1.7); g.fill();
    [[46, 70], [65, 70]].forEach(function (d) { g.fillStyle = '#a84236'; g.fillRect(d[0], d[1], 17, 34); g.strokeStyle = '#f6efe2'; g.lineWidth = 1.6; g.strokeRect(d[0] + 0.8, d[1] + 0.8, 15.4, 32.4); g.beginPath(); g.moveTo(d[0] + 1, d[1] + 1); g.lineTo(d[0] + 16, d[1] + 17); g.moveTo(d[0] + 16, d[1] + 1); g.lineTo(d[0] + 1, d[1] + 17); g.moveTo(d[0] + 1, d[1] + 17); g.lineTo(d[0] + 16, d[1] + 33); g.moveTo(d[0] + 16, d[1] + 17); g.lineTo(d[0] + 1, d[1] + 33); g.stroke(); });
    g.fillStyle = '#3a3634'; g.fillRect(40, 68, 48, 2);
    g.fillStyle = '#a84236'; g.fillRect(57, 46, 14, 14); g.strokeStyle = '#f6efe2'; g.lineWidth = 1.4; g.strokeRect(57, 46, 14, 14); g.beginPath(); g.moveTo(57, 46); g.lineTo(71, 60); g.moveTo(71, 46); g.lineTo(57, 60); g.stroke();
    g.fillStyle = '#e8d070'; g.fillRect(58, 58, 12, 2);
    [[24, 76], [93, 76]].forEach(function (w) { g.fillStyle = '#ffe2a8'; g.fillRect(w[0], w[1], 11, 11); g.strokeStyle = '#f6efe2'; g.lineWidth = 1.6; g.strokeRect(w[0], w[1], 11, 11); g.beginPath(); g.moveTo(w[0] + 5.5, w[1]); g.lineTo(w[0] + 5.5, w[1] + 11); g.moveTo(w[0], w[1] + 5.5); g.lineTo(w[0] + 11, w[1] + 5.5); g.stroke(); g.fillStyle = '#7a5236'; g.fillRect(w[0] - 1, w[1] + 12, 13, 3); ['#f4a6c8', '#fff2e0', '#c8a8f0'].forEach(function (col, k) { g.fillStyle = col; g.beginPath(); g.arc(w[0] + 2 + k * 3.6, w[1] + 11.5, 1.5, 0, Math.PI * 2); g.fill(); }); });
    g.save(); g.translate(84, 54); g.rotate(Math.PI / 4); g.fillStyle = '#fbf3e4'; g.fillRect(-5, -5, 10, 10); g.fillStyle = '#e889b0'; g.fillRect(-3, -3, 6, 6); g.restore();
    g.fillStyle = '#e0c060'; g.fillRect(18, 98, 14, 8); g.fillRect(21, 92, 10, 7); g.fillStyle = '#b8343a'; g.fillRect(18, 101, 14, 1.2);
    g.fillStyle = '#c8ced4'; g.fillRect(100, 95, 7, 11); g.fillRect(101, 92, 5, 3);
    return c.toDataURL();
  }

  // ---------- Your mill: Oak & Ember's third building ----------
  // For 2,000 Star Coins, Oak & Ember builds you a windmill, placed with the same grid of your farm (it takes 4 × 4
  // tiles). It takes two days to build: right away a building site goes up on its spot (a stone footing, a timber
  // frame, scaffolding and stacks of lumber), by the next morning the lower half is boarded and its gallery is on,
  // and on the second morning it's finished, its sails turning in the breeze. It has no use just yet
  var MILL_FC = 4, MILL_FR = 4, MILL_DAYS = 2, MILL_R = 1.6, MILL_TOP = 6.4;   // tiles it takes; the days it takes to build; its tower's radius at the bottom, and its height
  var mill = { built: false, c: 0, r: 0, x: 0, z: 0, fy: 0, start: 0, stage: -1, grass: [], solids: [], tp: null };
  var millGroup = null, millSails = null, millFan = null, millGlows = [];
  function millCovers(x, z, r) { return mill.built && Math.abs(x - mill.x) < MILL_FC * TILE / 2 + r && Math.abs(z - mill.z) < MILL_FR * TILE / 2 + r; }
  var millBaseSoilNear = soilNear;                                     // (nothing grows back under the mill either)
  soilNear = function (x, z, r) { return millBaseSoilNear(x, z, r) || millCovers(x, z, r); };
  function millStage() { return !mill.built ? -1 : Math.min(MILL_DAYS, farmDay() - mill.start); }   // 0: just started, 1: half built, 2: finished
  var MILL_SPEC = { title: '🌾 Where should your mill go?', hint: 'Tap your farm to choose a spot. The mill takes 4 × 4 tiles, with its door facing south (down the map) to start.' + PLACE_HINT_END, fc: MILL_FC, fr: MILL_FR, bw: 3.6, bd: 3.6, off: 0, door: 0.9, roof: 'rgba(240,232,214,0.9)', doorCol: '#7a5236', emoji: '🌾', cost: MILL_COST,
    built: function () { return mill.built; }, build: function (c, r, rot) { millPlace(c, r, farmDay(), rot); },
    done: function () { return '🌾 Oak & Ember have started building your mill! It takes two days: it\'ll be finished on the morning of ' + seasonDay(mill.start + MILL_DAYS) + '.'; } };

  // ===== what it's made of =====
  var millBoardTex = cpTex(256, 256, function (g, w, h) {             // (white weatherboards, overlapping, each with a shadow under its edge)
    var n = 8, ph = h / n;
    for (var i = 0; i < n; i++) {
      var l = 232 + Math.random() * 16; g.fillStyle = 'rgb(' + Math.round(l) + ',' + Math.round(l * 0.97) + ',' + Math.round(l * 0.9) + ')'; g.fillRect(0, i * ph, w, ph);
      var sh = g.createLinearGradient(0, i * ph + ph - 7, 0, i * ph + ph); sh.addColorStop(0, 'rgba(90,70,50,0)'); sh.addColorStop(1, 'rgba(90,70,50,0.4)'); g.fillStyle = sh; g.fillRect(0, i * ph + ph - 7, w, 7);
      for (var s = 0; s < 14; s++) { var y = i * ph + 3 + Math.random() * (ph - 10); g.strokeStyle = 'rgba(150,120,90,' + (0.05 + Math.random() * 0.08) + ')'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (Math.random() - 0.5) * 3); g.stroke(); }
    }
  }, [6, 5]);
  var millStoneTex = cpTex(256, 128, function (g, w, h) {             // (rough fieldstone, mortared)
    g.fillStyle = '#8a857c'; g.fillRect(0, 0, w, h);
    for (var r = 0, y = 0; y < h; r++) { var rh = 14 + Math.random() * 8; for (var x = -(r % 2) * 14; x < w;) { var sw = 22 + Math.random() * 20, k = 140 + Math.random() * 50;
      g.fillStyle = 'rgb(' + Math.round(k) + ',' + Math.round(k * 0.97) + ',' + Math.round(k * 0.9) + ')'; g.beginPath(); g.ellipse(x + sw / 2, y + rh / 2, sw / 2 - 1.5, rh / 2 - 1.5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.14)'; g.beginPath(); g.ellipse(x + sw / 2 - 3, y + rh / 2 - 3, sw / 4, rh / 5, 0, 0, Math.PI * 2); g.fill(); x += sw; } y += rh; }
  }, [5, 1]);
  var mlmBoard = new THREE.MeshStandardMaterial({ map: millBoardTex, roughness: 0.85 });
  var mlmStone = new THREE.MeshStandardMaterial({ map: millStoneTex, bumpMap: millStoneTex, bumpScale: 0.03, roughness: 0.95 });
  var mlmWood = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0xb08a62, roughness: 0.85 });
  var mlmFrame = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0xd8b48a, roughness: 0.85 });
  var mlmDark = new THREE.MeshStandardMaterial({ color: 0x4a3626, roughness: 0.8 });
  var mlmCloth = new THREE.MeshStandardMaterial({ color: 0xf2e8d4, roughness: 0.95, side: THREE.DoubleSide });
  var mlmCap = new THREE.MeshStandardMaterial({ color: 0x5a6a5e, roughness: 0.75 });
  var millSignTex = cpTex(512, 160, function (g, w, h) {
    g.fillStyle = '#7a5236'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4e6c8'; g.fillRect(8, 8, w - 16, h - 16);
    g.fillStyle = '#5a3a20'; g.textAlign = 'center'; g.font = '600 50px Fredoka, Georgia, serif'; g.fillText('Your mill is coming!', w / 2, 70);
    g.font = '28px Fredoka, Georgia, serif'; g.fillText('🪚 Built by Oak & Ember · ready in two days', w / 2, 120);
  });
  function millRing(r, y) {                                            // (a point on an octagon of radius r, for a corner k)
    return function (k) { var a = (k + 0.5) / 8 * Math.PI * 2; return [Math.sin(a) * r, y, Math.cos(a) * r]; };
  }
  function millBeam(G, a, b, s, m) {                                   // (a square beam from point a to point b)
    var d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length(), o = new THREE.Mesh(new THREE.BoxGeometry(s, L, s), m);
    o.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); o.castShadow = o.receiveShadow = true; G.add(o); return o;
  }
  function millTowerRadius(y) { return MILL_R - (MILL_R - 1.0) * (y - 1.6) / (MILL_TOP - 1.6); }

  // ===== building it: a building site, then half built, then finished =====
  function millBuildModel(stage) {
    var G = new THREE.Group(); G.position.set(mill.x, mill.fy, mill.z); G.rotation.y = bRot(mill); millGlows = []; millSails = null; millFan = null;
    function gy(lx, lz) { return bGround(mill, lx, lz) - mill.fy; }
    var minG = 99; for (var gx = -1; gx <= 1; gx++) for (var gz = -1; gz <= 1; gz++) minG = Math.min(minG, gy(gx * 2, gz * 2));
    // (the stone base: two storeys of fieldstone, an octagon, with an arched door and little windows)
    var baseH = 1.6;
    cpPart(new THREE.CylinderGeometry(1.95, 2.05, baseH - minG + 0.1, 8), mlmStone, 0, (baseH + minG - 0.1) / 2, 0, 0, Math.PI / 8, 0, G);
    cpPart(new THREE.CylinderGeometry(2.0, 2.0, 0.1, 8), mlmDark, 0, baseH, 0, 0, Math.PI / 8, 0, G);
    if (stage === 0) cpPart(new THREE.PlaneGeometry(0.84, 1.2), cpmDark, 0, 0.6, 1.87, 0, 0, 0, G).castShadow = false;   // (the doorway, not hung yet)
    if (stage > 0) {
      var arch = new THREE.Shape(); arch.moveTo(-0.42, 0); arch.lineTo(0.42, 0); arch.lineTo(0.42, 0.95); arch.absarc(0, 0.95, 0.42, 0, Math.PI, false); arch.closePath();
      var ag = new THREE.ExtrudeGeometry(arch, { depth: 0.06, bevelEnabled: false });
      cpPart(ag, new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0x9a6e48, roughness: 0.8 }), 0, 0, 1.9, 0, 0, 0, G);
      var archF = new THREE.Shape(); archF.moveTo(-0.55, 0); archF.lineTo(0.55, 0); archF.lineTo(0.55, 0.95); archF.absarc(0, 0.95, 0.55, 0, Math.PI, false); archF.closePath();
      var hole = new THREE.Path(); hole.moveTo(-0.42, 0); hole.lineTo(0.42, 0); hole.lineTo(0.42, 0.95); hole.absarc(0, 0.95, 0.42, 0, Math.PI, false); hole.closePath(); archF.holes.push(hole);
      cpPart(new THREE.ExtrudeGeometry(archF, { depth: 0.1, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: 0xc8c0b0, roughness: 0.9 }), 0, 0, 1.86, 0, 0, 0, G);
      [0.25, 0.75].forEach(function (y) { cpPart(new THREE.BoxGeometry(0.5, 0.04, 0.012), cpmIron, -0.12, y, 1.97, 0, 0, 0, G); });
      cpPart(new THREE.TorusGeometry(0.05, 0.01, 6, 14), cpmIron, 0.28, 0.55, 1.98, 0, 0, 0, G);
      [-1, 1].forEach(function (s) { var a = s * Math.PI / 2, wg = new THREE.Group(); wg.position.set(Math.sin(a) * 1.93, 1.0, Math.cos(a) * 1.93); wg.rotation.y = a; G.add(wg); cpPart(new THREE.PlaneGeometry(0.36, 0.44), cpmGlowWin, 0, 0, 0.05, 0, 0, 0, wg).castShadow = false; [[0, 0.25, 0.5, 0.07], [0, -0.25, 0.56, 0.08], [0.21, 0, 0.07, 0.5], [-0.21, 0, 0.07, 0.5], [0, 0, 0.36, 0.03], [0, 0, 0.03, 0.44]].forEach(function (f) { cpPart(new THREE.BoxGeometry(f[2], f[3], 0.06), cpmCream, f[0], f[1], 0.07, 0, 0, 0, wg); }); cpFlowerBox(wg, 0.4, -0.36, 0.12); });
      for (var st = 0; st < 3; st++) cpPart(new THREE.BoxGeometry(1.2 - st * 0.1, 0.12, 0.3), mlmStone, 0, gy(0, 2.2 + 0.3 * (2 - st)) + 0.06 + st * 0.12 - 0.12, 2.0 + 0.3 * (2 - st) - 0.2, 0, 0, 0, G);
    }
    var topY = stage === 0 ? 0 : stage === 1 ? 3.9 : MILL_TOP;            // (how high the boarding reaches)
    // (the smock tower: an octagon tapering up, boarded white with corner posts)
    if (stage > 0) {
      var tb = new THREE.CylinderGeometry(millTowerRadius(topY), MILL_R, topY - 1.6, 8, 1, true); tb.translate(0, (topY - 1.6) / 2 + 1.6, 0);
      cpPart(tb, mlmBoard, 0, 0, 0, 0, Math.PI / 8, 0, G).material.side = THREE.DoubleSide;
      [2.4, 3.7, 5.0].forEach(function (y, k) { if (y + 0.4 > topY) return; var r = millTowerRadius(y); [0, 3, 6].forEach(function (f) { var a = (f + k * 2) / 8 * Math.PI * 2 + Math.PI / 8 - Math.PI / 8, wg = new THREE.Group(); wg.position.set(Math.sin(a) * (r * Math.cos(Math.PI / 8) + 0.02), y, Math.cos(a) * (r * Math.cos(Math.PI / 8) + 0.02)); wg.rotation.y = a; G.add(wg); cpPart(new THREE.PlaneGeometry(0.3, 0.38), cpmGlowWin, 0, 0, 0.01, -0.12, 0, 0, wg).castShadow = false; [[0, 0.22, 0.42, 0.06], [0, -0.22, 0.46, 0.07], [0.18, 0, 0.06, 0.44], [-0.18, 0, 0.06, 0.44]].forEach(function (fr) { cpPart(new THREE.BoxGeometry(fr[2], fr[3], 0.05), mlmDark, fr[0], fr[1], 0.03, -0.12, 0, 0, wg); }); }); });
    }
    var frameTop = stage === 2 ? MILL_TOP : MILL_TOP;                  // (the frame is up from the first day)
    for (var k = 0; k < 8; k++) { var a0 = millRing(MILL_R + 0.02, 1.6)(k), a1 = millRing(millTowerRadius(frameTop) + 0.02, frameTop)(k); millBeam(G, a0, a1, stage === 0 ? 0.13 : 0.1, stage === 2 ? cpmCream : mlmFrame); }
    if (stage < 2) [2.6, 3.6, 4.6, 5.6, 6.35].forEach(function (y) { var r = millTowerRadius(y) + 0.03; for (var k2 = 0; k2 < 8; k2++) millBeam(G, millRing(r, y)(k2), millRing(r, y)(k2 + 1), 0.09, mlmFrame); });
    if (stage === 0) [1.0].forEach(function () { for (var k3 = 0; k3 < 8; k3++) millBeam(G, millRing(MILL_R + 0.02, 1.6)(k3), millRing(MILL_R + 0.02, 1.6)(k3 + 1), 0.12, mlmFrame); });
    // (the gallery: a wooden stage all round at the top of the stone base, with a railing)
    if (stage > 0) {
      var gal = new THREE.CylinderGeometry(2.45, 2.45, 0.08, 8); cpPart(gal, mlmWood, 0, 1.68, 0, 0, Math.PI / 8, 0, G);
      for (var b = 0; b < 8; b++) {
        var p0 = millRing(2.38, 1.72)(b), p1 = millRing(2.38, 1.72)(b + 1);
        millBeam(G, p0, [p0[0], 2.55, p0[2]], 0.07, mlmDark);
        millBeam(G, [p0[0], 2.55, p0[2]], [p1[0], 2.55, p1[2]], 0.07, mlmDark); millBeam(G, [p0[0], 2.12, p0[2]], [p1[0], 2.12, p1[2]], 0.05, mlmDark);
        for (var sp = 1; sp < 5; sp++) { var f = sp / 5; millBeam(G, [p0[0] + (p1[0] - p0[0]) * f, 1.72, p0[2] + (p1[2] - p0[2]) * f], [p0[0] + (p1[0] - p0[0]) * f, 2.12, p0[2] + (p1[2] - p0[2]) * f], 0.03, mlmDark); }
        millBeam(G, millRing(2.0, 1.2)(b), millRing(2.4, 1.64)(b), 0.07, mlmDark);   // (brackets under it)
      }
    }
    // (finished: the cap with its ridge, the windshaft, four lattice sails with canvas, and the fantail that turns it into the wind)
    if (stage === 2) {
      var CAP = new THREE.Group(); CAP.position.y = MILL_TOP; G.add(CAP);
      cpPart(new THREE.CylinderGeometry(1.12, 1.12, 0.14, 16), mlmDark, 0, 0.07, 0, 0, 0, 0, CAP);
      var capG = new THREE.SphereGeometry(1.15, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2); capG.scale(1, 0.85, 1.25);
      cpPart(capG, mlmCap, 0, 0.12, 0, 0, 0, 0, CAP);
      for (var rb = 0; rb < 9; rb++) { var ra = -Math.PI / 2 + rb / 8 * Math.PI; var ribPts = []; for (var q = 0; q <= 12; q++) { var t = q / 12 * Math.PI / 2; ribPts.push(new THREE.Vector3(Math.cos(t) * Math.sin(ra) * 1.16, 0.12 + Math.sin(t) * 0.98, Math.cos(t) * Math.cos(ra) * 1.44)); } cpPart(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ribPts), 16, 0.025, 5), cpmCream, 0, 0, 0, 0, 0, 0, CAP); }
      cpPart(new THREE.SphereGeometry(0.1, 12, 8), cpmCopper, 0, 1.12, 0, 0, 0, 0, CAP); cpPart(new THREE.ConeGeometry(0.05, 0.3, 8), cpmCopper, 0, 1.3, 0, 0, 0, 0, CAP);
      cpPart(new THREE.CylinderGeometry(0.16, 0.18, 1.0, 12), mlmDark, 0, 0.55, 1.2, Math.PI / 2 - 0.12, 0, 0, CAP);   // (the windshaft, tilted up a little)
      var SL = new THREE.Group(); SL.position.set(0, 0.6, 1.72); SL.rotation.x = -0.12; CAP.add(SL); millSails = new THREE.Group(); SL.add(millSails);
      cpPart(new THREE.CylinderGeometry(0.28, 0.28, 0.3, 14), mlmDark, 0, 0, 0, Math.PI / 2, 0, 0, millSails); cpPart(new THREE.SphereGeometry(0.16, 12, 8), cpmCopper, 0, 0, 0.18, 0, 0, 0, millSails);
      for (var sl = 0; sl < 4; sl++) {
        var S = new THREE.Group(); S.rotation.z = sl * Math.PI / 2 + Math.PI / 4; millSails.add(S);
        cpPart(new THREE.BoxGeometry(0.13, 4.3, 0.12), mlmWood, 0, 2.15, 0.05, 0, 0, 0, S);   // (the whip)
        for (var bar = 0; bar < 15; bar++) cpPart(new THREE.BoxGeometry(0.75, 0.035, 0.04), mlmDark, 0.38, 0.75 + bar * 0.24, 0.07, 0, 0, 0, S);
        [0.06, 0.74].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.04, 3.4, 0.05), mlmDark, x, 2.45, 0.07, 0, 0, 0, S); });
        var cloth = new THREE.PlaneGeometry(0.66, 3.3, 2, 12), cp2 = cloth.attributes.position; for (var v = 0; v < cp2.count; v++) cp2.setZ(v, Math.sin((cp2.getX(v) + 0.33) / 0.66 * Math.PI) * 0.05);
        cloth.computeVertexNormals(); cpPart(cloth, mlmCloth, 0.4, 2.45, 0.1, 0, 0, 0, S).castShadow = true;
        [1.2, 2.4, 3.6].forEach(function (y) { cpPart(new THREE.BoxGeometry(0.74, 0.015, 0.015), new THREE.MeshStandardMaterial({ color: 0xc8a878 }), 0.4, y, 0.14, 0, 0, 0, S); });   // (reefing ropes)
      }
      var FT = new THREE.Group(); FT.position.set(0, 0.35, -1.25); CAP.add(FT);   // (the fantail on its frame at the back)
      millBeam(FT, [0, 0, 0], [0, 0.3, -0.9], 0.06, mlmDark); millBeam(FT, [-0.3, -0.1, 0], [0, 0.3, -0.9], 0.05, mlmDark); millBeam(FT, [0.3, -0.1, 0], [0, 0.3, -0.9], 0.05, mlmDark);
      millFan = new THREE.Group(); millFan.position.set(0, 0.45, -0.92); millFan.rotation.y = Math.PI / 2; FT.add(millFan);
      for (var fb = 0; fb < 6; fb++) { var bl = new THREE.Group(); bl.rotation.x = fb / 6 * Math.PI * 2; millFan.add(bl); cpPart(new THREE.BoxGeometry(0.03, 0.42, 0.12), cpmCream, 0, 0.24, 0, 0, 0.5, 0, bl); }
      cpPart(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 10), mlmDark, 0, 0, 0, 0, 0, Math.PI / 2, millFan);
      cpLantern(G, 0.62, 1.25, 2.12, millGlows); cpPart(new THREE.BoxGeometry(0.04, 0.04, 0.2), cpmIron, 0.62, 1.42, 2.02, 0, 0, 0, G);
      // (sacks of flour by the door, a barrel, and flowers)
      [[-1.4, 2.0, 0.4, 0], [-1.75, 1.6, -0.3, 1]].forEach(function (sk) { if (!barnSackProtos[sk[3]]) return; var sg = barnSackProtos[sk[3]].clone(); sg.position.set(sk[0], gy(sk[0], sk[1]), sk[1]); sg.rotation.set(0, sk[2], 0); sg.scale.setScalar(0.85); G.add(sg); });
      coopBarrel(G, 1.55, gy(1.55, 1.75), 1.75, 0.26, 0.74, false);
      coopFlowers(G, [[-0.9, gy(-0.9, 2.15), 2.15], [0.95, gy(0.95, 2.15), 2.15], [-2.1, gy(-2.1, 0.2), 0.2], [2.1, gy(2.1, 0.2), 0.2], [-1.2, gy(-1.2, -1.8), -1.8], [1.2, gy(1.2, -1.8), -1.8]], 77);
    } else {
      // (the building site: scaffolding up two sides with ladders, stacks of lumber, a sawhorse, stones, and Oak & Ember's sign)
      var hgt = stage === 0 ? 4.4 : 6.6;
      [[-1, 1], [1, 1]].forEach(function (sd) {
        var cx = sd[0] * 1.55, cz = 2.15;
        [[cx - 0.6, cz], [cx + 0.6, cz], [cx - 0.6, cz - 1.05], [cx + 0.6, cz - 1.05]].forEach(function (p) { cpPart(new THREE.CylinderGeometry(0.035, 0.035, hgt - minG, 6), mlmFrame, p[0], (hgt + minG) / 2, p[1], 0, 0, 0, G); });
        for (var lv = 1.2; lv < hgt; lv += 1.1) { cpPart(new THREE.BoxGeometry(1.3, 0.04, 0.32), mlmWood, cx, lv, cz - 0.15, 0, 0, 0, G); cpPart(new THREE.CylinderGeometry(0.025, 0.025, 1.25, 6), mlmFrame, cx, lv + 0.45, cz, 0, 0, Math.PI / 2, G); }
        millBeam(G, [cx - 0.6, 0.3, cz], [cx + 0.6, Math.min(hgt - 0.3, 2.6), cz], 0.04, mlmFrame);
      });
      var LD = new THREE.Group(); LD.position.set(2.15, 0, 2.3); LD.rotation.set(0.0, 0.3, -0.25); G.add(LD);
      [-0.2, 0.2].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.05, 3.2, 0.05), mlmFrame, x, 1.6, 0, 0, 0, 0, LD); }); for (var lr = 0; lr < 10; lr++) cpPart(new THREE.CylinderGeometry(0.018, 0.018, 0.4, 5), mlmWood, 0, 0.25 + lr * 0.3, 0, 0, 0, Math.PI / 2, LD);
      [[-2.05, -1.9, 0.3], [2.0, -1.85, -0.4]].forEach(function (lp, li) { for (var pl = 0; pl < 7; pl++) cpPart(new THREE.BoxGeometry(1.6, 0.06, 0.2), [mlmWood, mlmFrame][(pl + li) % 2], lp[0] + (pl % 2) * 0.05, gy(lp[0], lp[1]) + 0.05 + Math.floor(pl / 3) * 0.06, lp[1] + (pl % 3) * 0.21 - 0.21, 0, lp[2], 0, G); });
      var SH = new THREE.Group(); SH.position.set(-2.1, gy(-2.1, 0.9), 0.9); SH.rotation.y = 0.5; G.add(SH);
      cpPart(new THREE.BoxGeometry(1.0, 0.1, 0.12), mlmWood, 0, 0.62, 0, 0, 0, 0, SH); [-0.4, 0.4].forEach(function (x) { [-1, 1].forEach(function (s) { cpPart(new THREE.BoxGeometry(0.06, 0.7, 0.06), mlmWood, x, 0.32, s * 0.14, s * 0.35, 0, 0, SH); }); });
      cpPart(new THREE.BoxGeometry(0.5, 0.05, 0.16), mlmFrame, 0.1, 0.7, 0, 0, 0.2, 0, SH);
      for (var sn = 0; sn < 9; sn++) cpPart(new THREE.DodecahedronGeometry(0.16 + isle2Hash(sn) * 0.08, 0), cpmFootStone, 2.1 + (isle2Hash(sn * 3) - 0.5) * 0.6, gy(2.1, 0.6) + 0.12 + (sn > 5 ? 0.18 : 0), 0.6 + (isle2Hash(sn * 5) - 0.5) * 0.6, sn, sn * 2, 0, G).material = new THREE.MeshStandardMaterial({ color: 0x9a948a, roughness: 0.95 });
      var SG = new THREE.Group(); SG.position.set(0, gy(0, 2.45), 2.45); G.add(SG);
      [-0.55, 0.55].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.07, 1.1, 0.07), mlmWood, x, 0.55, -0.02, 0, 0, 0, SG); });
      cpPart(new THREE.BoxGeometry(1.3, 0.44, 0.04), mlmWood, 0, 0.85, 0, 0, 0, 0, SG);
      cpPart(new THREE.PlaneGeometry(1.24, 0.39), new THREE.MeshStandardMaterial({ map: millSignTex, roughness: 0.8 }), 0, 0.85, 0.022, 0, 0, 0, SG).castShadow = false;
    }
    scene.add(G);
    return G;
  }
  function millPlace(c0, r0, start, rot) {
    millRemove();
    mill.built = true; mill.c = c0; mill.r = r0; mill.start = start; mill.rot = rot || 0;
    mill.x = FARM_X + (c0 + MILL_FC / 2) * TILE; mill.z = FARM_Z + (r0 + MILL_FR / 2) * TILE;
    var top = -9; for (var gx = -1; gx <= 1; gx++) for (var gz = -1; gz <= 1; gz++) top = Math.max(top, groundHeight(mill.x + gx * 2, mill.z + gz * 2));
    mill.fy = top + 0.05;
    var HX = MILL_FC * TILE / 2, HZ = MILL_FR * TILE / 2;
    allScenery.forEach(function (t) { var u = t.userData; if (u.gone || u.state === 'standing') return; if (Math.abs(u.solid.x - mill.x) < HX + u.solidR && Math.abs(u.solid.z - mill.z) < HZ + u.solidR) setSceneryCut(t, u.state === 'regrowing' ? u.felledAt : gameMinutes()); });
    mineable.forEach(function (r) { if (r.gone || r.state === 'whole') return; if (Math.abs(r.solid.x - mill.x) < HX + r.solidR && Math.abs(r.solid.z - mill.z) < HZ + r.solidR) setRockBroken(r, r.state === 'regrowing' ? r.brokeAt : gameMinutes()); });
    for (var c = c0; c < c0 + MILL_FC; c++) for (var r = r0; r < r0 + MILL_FR; r++) { var ft = { x: FARM_X + (c + 0.5) * TILE, z: FARM_Z + (r + 0.5) * TILE }; coverGrass(ft); mill.grass.push(ft); }
    [[0, 0, 2.45], [-2.05, -1.9, 0.5], [2.0, -1.85, 0.5]].forEach(function (s) { var w = bOff(mill, s[0], s[1]), sd = { x: mill.x + w.x, z: mill.z + w.z, r: s[2] }; solids.push(sd); mill.solids.push(sd); });
    mill.stage = millStage(); millGroup = millBuildModel(mill.stage);
    if (!mill.tp) mill.tp = { name: 'Your Mill', icon: '🌾', spot: function () { var f = bOff(mill, 0, 3.6); return { x: mill.x + f.x, z: mill.z + f.z, face: bRot(mill) + Math.PI, view: bRot(mill) }; } };
    if (TELEPORTS.indexOf(mill.tp) < 0) TELEPORTS.push(mill.tp);
    flushDirty();
  }
  function millRemove() {
    if (!mill.built) return;
    if (millGroup) { scene.remove(millGroup); millGroup = null; }
    mill.solids.forEach(function (sd) { var i = solids.indexOf(sd); if (i >= 0) solids.splice(i, 1); }); mill.solids = [];
    mill.grass.forEach(uncoverGrass); mill.grass = [];
    var ti = TELEPORTS.indexOf(mill.tp); if (ti >= 0) TELEPORTS.splice(ti, 1);
    mill.built = false; mill.stage = -1;
  }
  function millSaveData() { return mill.built ? { c: mill.c, r: mill.r, rot: mill.rot || 0, start: mill.start } : null; }
  function millLoadData(d) { millRemove(); if (d) millPlace(d.c, d.r, d.start, d.rot || 0); }
  function millDrawOnMap(g, K, label) {                                // (on the world map: its octagon, and its sails, once it's finished)
    var pc = mapXY(mill.x, mill.z), p = [0, 0], r = 2.4 * K;
    g.save(); g.translate(pc[0], pc[1]); g.rotate(-bRot(mill));           // (turned the way it faces)
    g.beginPath(); for (var k = 0; k < 8; k++) { var a = (k + 0.5) / 8 * Math.PI * 2; g.lineTo(p[0] + Math.sin(a) * r, p[1] + Math.cos(a) * r); } g.closePath(); g.fillStyle = mill.stage === 2 ? '#e8e0cc' : '#c8a878'; g.fill(); g.strokeStyle = '#7a5236'; g.lineWidth = 2; g.stroke();
    g.beginPath(); g.arc(p[0], p[1], 1.1 * K, 0, Math.PI * 2); g.fillStyle = mill.stage === 2 ? '#5a6a5e' : '#a07850'; g.fill();
    if (mill.stage === 2) { g.strokeStyle = '#4a3626'; g.lineWidth = 5; [[-1, -1], [1, 1], [-1, 1], [1, -1]].forEach(function (d) { g.beginPath(); g.moveTo(p[0], p[1] + 1.5 * K); g.lineTo(p[0] + d[0] * 3 * K, p[1] + 1.5 * K + d[1] * 0.4 * K); g.stroke(); }); }
    g.restore();
    label(mill.stage === 2 ? 'Mill' : 'Mill (being built)', mill.x, mill.z, 2.4 * K + 28);
  }
  function updateMill(dt, night) {
    if (!mill.built) return;
    var st = millStage();
    if (st !== mill.stage) {                                            // (a new morning: Oak & Ember have got further)
      var was = mill.stage; mill.stage = st;
      if (millGroup) scene.remove(millGroup); millGroup = millBuildModel(st);
      if (was >= 0) setTimeout(function () { showToast(st === 2 ? '🌾 Your mill is finished! Oak & Ember have put the last of its sails up.' : '🪚 Oak & Ember worked on your mill all day: it\'s half built! One more day to go.', 4200); }, 6400);
    }
    if (millSails) millSails.rotation.z -= dt * 0.55;
    if (millFan) millFan.rotation.x += dt * 1.1;
    millGlows.forEach(function (L) { var fl = 1 + Math.sin(state.time * 11 + L.p) * 0.1; L.f.scale.set(fl, 1.5 * fl, fl); L.h.material.opacity = (0.25 + night * 0.5) * fl; });
  }
  function millShopIcon() {                                            // (a little picture of the mill, for Oak & Ember's menu)
    var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d'); g.scale(2, 2);
    g.fillStyle = 'rgba(0,0,0,0.16)'; g.beginPath(); g.ellipse(64, 116, 40, 7, 0, 0, Math.PI * 2); g.fill();
    var sg = g.createLinearGradient(0, 86, 0, 116); sg.addColorStop(0, '#a8a296'); sg.addColorStop(1, '#888276'); g.fillStyle = sg; g.fillRect(40, 86, 48, 30);
    g.fillStyle = 'rgba(255,255,255,0.2)'; for (var s = 0; s < 12; s++) g.fillRect(42 + (s % 4) * 12 + (Math.floor(s / 4) % 2) * 5, 89 + Math.floor(s / 4) * 9, 9, 6);
    g.fillStyle = '#7a5236'; g.beginPath(); g.moveTo(58, 116); g.lineTo(58, 102); g.arc(64, 102, 6, Math.PI, 0); g.lineTo(70, 116); g.closePath(); g.fill();
    g.fillStyle = '#5a3a26'; g.fillRect(30, 84, 68, 4); for (var r = 32; r < 98; r += 6) g.fillRect(r, 78, 1.6, 7); g.fillRect(30, 77, 68, 2);
    var tg = g.createLinearGradient(44, 0, 84, 0); tg.addColorStop(0, '#e8e0cc'); tg.addColorStop(0.5, '#fbf6ea'); tg.addColorStop(1, '#dcd2bc'); g.fillStyle = tg;
    g.beginPath(); g.moveTo(44, 84); g.lineTo(52, 34); g.lineTo(76, 34); g.lineTo(84, 84); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(120,100,80,0.3)'; g.lineWidth = 0.7; for (var b = 38; b < 84; b += 4) { var w = 12 + (b - 34) / 50 * 8; g.beginPath(); g.moveTo(64 - w, b); g.lineTo(64 + w, b); g.stroke(); }
    g.fillStyle = '#ffe2a8'; g.fillRect(60, 52, 8, 9); g.strokeStyle = '#4a3626'; g.lineWidth = 1.2; g.strokeRect(60, 52, 8, 9);
    g.fillStyle = '#5a6a5e'; g.beginPath(); g.ellipse(64, 34, 15, 9, 0, Math.PI, 0); g.fill(); g.fillStyle = '#c08050'; g.beginPath(); g.arc(64, 24, 2, 0, Math.PI * 2); g.fill();
    g.save(); g.translate(64, 36); g.rotate(0.3);
    for (var sl = 0; sl < 4; sl++) { g.save(); g.rotate(sl * Math.PI / 2); g.fillStyle = '#7a5236'; g.fillRect(-1.2, 0, 2.4, 34); g.fillStyle = '#f2e8d4'; g.fillRect(1.2, 8, 9, 25); g.strokeStyle = '#4a3626'; g.lineWidth = 0.7; g.strokeRect(1.2, 8, 9, 25); for (var bb = 11; bb < 33; bb += 4) { g.beginPath(); g.moveTo(1.2, bb); g.lineTo(10.2, bb); g.stroke(); } g.restore(); }
    g.fillStyle = '#4a3626'; g.beginPath(); g.arc(0, 0, 3.4, 0, Math.PI * 2); g.fill(); g.restore();
    [[38, 112, '#f4a6c8'], [44, 113, '#fff2e0'], [86, 112, '#c8a8f0'], [91, 113, '#ffb08a']].forEach(function (f) { g.fillStyle = '#5f9a48'; g.beginPath(); g.arc(f[0], f[1] + 1, 3, 0, Math.PI * 2); g.fill(); g.fillStyle = f[2]; g.beginPath(); g.arc(f[0], f[1] - 1, 1.6, 0, Math.PI * 2); g.fill(); });
    return c.toDataURL();
  }

  // ---------- Your silo: Oak & Ember's fourth building ----------
  // For 2,500 Star Coins, Oak & Ember builds you a tall red stave silo with a silver dome, placed with the same grid
  // of your farm (it takes 3 × 3 tiles). It takes two days to build. It holds hay and nothing else, 300 bundles at
  // most: walk up to it with hay in your bag and press Interact to pour it in through the chute. A glass strip up its
  // front shows how full it is. The hay comes back out through hoppers, one in your coop by the door and one on the
  // right-hand wall of your barn: each press of Interact at a hopper drops a bundle into your bag, ready for the bench
  var SILO_FC = 3, SILO_FR = 3, SILO_DAYS = 2, SILO_R = 1.3, SILO_H = 5.2, SILO_CAP = 300;   // tiles it takes; days to build; its radius and the height of its walls; the most hay it holds
  var silo = { built: false, c: 0, r: 0, x: 0, z: 0, fy: 0, start: 0, stage: -1, hay: 0, grass: [], solids: [] };
  var siloGroup = null, siloGauge = null, siloTuft = null, siloGlows = [], siloHopperTufts = [];
  function siloCovers(x, z, r) { return silo.built && Math.abs(x - silo.x) < SILO_FC * TILE / 2 + r && Math.abs(z - silo.z) < SILO_FR * TILE / 2 + r; }
  var siloBaseSoilNear = soilNear;                                     // (nothing grows back under the silo either)
  soilNear = function (x, z, r) { return siloBaseSoilNear(x, z, r) || siloCovers(x, z, r); };
  function siloStage() { return !silo.built ? -1 : Math.min(SILO_DAYS, farmDay() - silo.start); }   // 0: just started, 1: half built, 2: finished
  function siloReady() { return silo.built && silo.stage >= SILO_DAYS; }
  var SILO_SPEC = { title: '🌾 Where should your silo go?', hint: 'Tap your farm to choose a spot. The silo takes 3 × 3 tiles, with its hay chute facing south (down the map) to start.' + PLACE_HINT_END, fc: SILO_FC, fr: SILO_FR, bw: 2.7, bd: 2.7, off: 0, door: 0.7, roof: 'rgba(200,206,214,0.92)', doorCol: '#8a6040', emoji: '🌾', cost: SILO_COST,
    built: function () { return silo.built; }, build: function (c, r, rot) { silo.hay = 0; siloPlace(c, r, farmDay(), rot); },
    done: function () { return '🌾 Oak & Ember have started building your silo! It takes two days: it\'ll be finished on the morning of ' + seasonDay(silo.start + SILO_DAYS) + '.'; } };

  // ===== what it's made of =====
  var siloStaveTex = cpTex(256, 256, function (g, w, h) {             // (red-painted staves standing side by side, each with its own grain and a pale seam)
    var n = 16, sw = w / n;
    for (var i = 0; i < n; i++) {
      var k = 0.9 + Math.random() * 0.14; g.fillStyle = 'rgb(' + Math.round(184 * k) + ',' + Math.round(74 * k) + ',' + Math.round(60 * k) + ')'; g.fillRect(i * sw, 0, sw, h);
      for (var s = 0; s < 6; s++) { var x = i * sw + 2 + Math.random() * (sw - 4); g.strokeStyle = 'rgba(90,30,20,' + (0.08 + Math.random() * 0.1) + ')'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 2, h * 0.3, x - 2, h * 0.7, x + 1, h); g.stroke(); }
      g.fillStyle = 'rgba(60,20,14,0.45)'; g.fillRect(i * sw, 0, 1.5, h); g.fillStyle = 'rgba(255,220,200,0.12)'; g.fillRect(i * sw + 1.5, 0, 1.5, h);
      for (var p = 0; p < 3; p++) { g.fillStyle = 'rgba(240,226,206,' + (0.05 + Math.random() * 0.08) + ')'; g.fillRect(i * sw + Math.random() * sw, Math.random() * h, 2 + Math.random() * 4, 6 + Math.random() * 20); }   // (weathered paint)
    }
  }, [6, 3]);
  var smStave = new THREE.MeshStandardMaterial({ map: siloStaveTex, roughness: 0.82 });
  var smStaveIn = new THREE.MeshStandardMaterial({ map: siloStaveTex, color: 0x9a7060, roughness: 0.9, side: THREE.BackSide });
  var smDome = new THREE.MeshStandardMaterial({ color: 0xc4cad2, metalness: 0.65, roughness: 0.32 });
  var smRib = new THREE.MeshStandardMaterial({ color: 0x9aa2ac, metalness: 0.7, roughness: 0.3 });
  var smHoop = new THREE.MeshStandardMaterial({ color: 0x3a3634, metalness: 0.55, roughness: 0.45 });
  var smHay = new THREE.MeshStandardMaterial({ map: haySideTex, color: 0xf0d080, roughness: 1 });
  var smGlass = new THREE.MeshStandardMaterial({ color: 0xcfe6f0, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.32, depthWrite: false });
  var smConcrete = new THREE.MeshStandardMaterial({ color: 0xb8b2a6, roughness: 0.95 });
  var siloCountCv = document.createElement('canvas'); siloCountCv.width = 256; siloCountCv.height = 128;
  var siloCountTex = new THREE.CanvasTexture(siloCountCv), siloCountShown = -1;
  function siloDrawCount() {                                           // (the little plaque on the silo and on each hopper: how much hay is in your silo)
    if (siloCountShown === silo.hay) return; siloCountShown = silo.hay;
    var g = siloCountCv.getContext('2d'), w = 256, h = 128;
    g.fillStyle = '#6a4630'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4e6c8'; g.fillRect(7, 7, w - 14, h - 14);
    g.strokeStyle = 'rgba(122,82,54,0.5)'; g.lineWidth = 2; g.strokeRect(13, 13, w - 26, h - 26);
    g.fillStyle = '#5a3a20'; g.textAlign = 'center'; g.font = '600 30px Fredoka, Georgia, serif'; g.fillText('🌾 Silo hay', w / 2, 50);
    g.font = '600 40px Fredoka, Georgia, serif'; g.fillStyle = silo.hay >= SILO_CAP ? '#2f8a4e' : silo.hay ? '#5a3a20' : '#a04a3a'; g.fillText(silo.hay + ' / ' + SILO_CAP, w / 2, 98);
    siloCountTex.needsUpdate = true;
  }

  // ===== building it: a building site, then half built, then finished =====
  function siloBuildModel(stage) {
    var G = new THREE.Group(); G.position.set(silo.x, silo.fy, silo.z); G.rotation.y = bRot(silo); siloGlows = []; siloGauge = null; siloTuft = null;
    var R = SILO_R;
    function gy(lx, lz) { return bGround(silo, lx, lz) - silo.fy; }
    function on(a, r, y) { return [Math.sin(a) * r, y, Math.cos(a) * r]; }   // (a point round the silo, at angle a from the front)
    var minG = 99; for (var k = 0; k < 12; k++) { var a0 = k / 12 * Math.PI * 2; minG = Math.min(minG, gy(Math.sin(a0) * (R + 0.4), Math.cos(a0) * (R + 0.4))); }
    var fh = -minG + 0.12;
    cpPart(new THREE.CylinderGeometry(R + 0.42, R + 0.46, fh, 40), smConcrete, 0, -fh / 2 + 0.06, 0, 0, 0, 0, G);   // (a round concrete pad it all stands on)
    var wallTop = stage === 0 ? 0.55 : stage === 1 ? 2.9 : SILO_H;
    // (a fieldstone base, then the red staves above it, open at the top until the dome goes on)
    cpPart(new THREE.CylinderGeometry(R + 0.1, R + 0.14, 0.86, 40), mlmStone, 0, 0.49, 0, 0, 0, 0, G);
    cpPart(new THREE.TorusGeometry(R + 0.1, 0.035, 6, 48), smConcrete, 0, 0.92, 0, Math.PI / 2, 0, 0, G);
    if (wallTop > 1) {
      var body = new THREE.CylinderGeometry(R, R, wallTop - 0.9, 48, 1, true);
      cpPart(body, smStave, 0, 0.9 + (wallTop - 0.9) / 2, 0, 0, 0, 0, G); cpPart(body, smStaveIn, 0, 0.9 + (wallTop - 0.9) / 2, 0, 0, 0, 0, G);
      for (var hy = 1.4; hy < wallTop - 0.15; hy += 0.62) {            // (iron hoops round it, each drawn tight with a pair of lugs)
        cpPart(new THREE.TorusGeometry(R + 0.014, 0.022, 6, 64), smHoop, 0, hy, 0, Math.PI / 2, 0, 0, G);
        var la = 2.2 + (hy * 1.7) % 1.2, lp = on(la, R + 0.05, hy);
        cpPart(new THREE.BoxGeometry(0.07, 0.09, 0.06), smHoop, lp[0], lp[1], lp[2], 0, la, 0, G);
        cpPart(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 6), cpmBrass, lp[0], lp[1], lp[2], 0, la, Math.PI / 2, G);
      }
      cpPart(new THREE.TorusGeometry(R + 0.02, 0.04, 6, 64), mlmDark, 0, wallTop - 0.02, 0, Math.PI / 2, 0, 0, G);   // (a dark rim along the top)
    }
    if (stage === 2) {
      // (the silver dome, with ribs down it, a ring round its foot, and a little vent with a cap on top)
      var D = new THREE.Group(); D.position.y = SILO_H; D.scale.y = 0.72; G.add(D);
      cpPart(new THREE.SphereGeometry(R + 0.07, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), smDome, 0, 0, 0, 0, 0, 0, D);
      for (var rb = 0; rb < 16; rb++) cpPart(new THREE.TorusGeometry(R + 0.08, 0.016, 4, 24, Math.PI / 2), smRib, 0, 0, 0, 0, rb / 16 * Math.PI * 2, 0, D);
      cpPart(new THREE.TorusGeometry(R + 0.09, 0.05, 8, 64), smRib, 0, SILO_H + 0.02, 0, Math.PI / 2, 0, 0, G);
      var vy = SILO_H + (R + 0.07) * 0.72;
      cpPart(new THREE.CylinderGeometry(0.16, 0.2, 0.3, 16), smDome, 0, vy + 0.1, 0, 0, 0, 0, G);
      cpPart(new THREE.ConeGeometry(0.3, 0.2, 16), smRib, 0, vy + 0.36, 0, 0, 0, 0, G);
      cpPart(new THREE.SphereGeometry(0.06, 12, 8), cpmBrass, 0, vy + 0.5, 0, 0, 0, 0, G);
      [0, 1, 2, 3].forEach(function (q) { var a = q * Math.PI / 2 + 0.4; cpPart(new THREE.BoxGeometry(0.03, 0.12, 0.03), smHoop, Math.sin(a) * 0.17, vy + 0.29, Math.cos(a) * 0.17, 0, 0, 0, G); });
      // (a tiny weathervane: a hay bundle on an arrow)
      var WV = new THREE.Group(); WV.position.set(0, vy + 0.55, 0); WV.rotation.y = 0.7; G.add(WV);
      cpPart(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 6), smHoop, 0, 0.25, 0, 0, 0, 0, WV);
      cpPart(new THREE.BoxGeometry(0.42, 0.012, 0.012), smHoop, 0, 0.4, 0, 0, 0, 0, WV); cpPart(new THREE.ConeGeometry(0.03, 0.08, 4), smHoop, 0.23, 0.4, 0, 0, 0, -Math.PI / 2, WV);
      cpPart(new THREE.BoxGeometry(0.06, 0.08, 0.008), smHoop, -0.2, 0.4, 0, 0, 0, 0, WV);
      var vb = pickupModel('hay'); vb.scale.setScalar(0.55); vb.position.set(0, 0.46, 0); WV.add(vb);
      // (a ladder up its side to the dome, with a safety cage round the top half)
      var la2 = -2.35, LD = new THREE.Group(); var lp2 = on(la2, R + 0.12, 0); LD.position.set(lp2[0], 0, lp2[2]); LD.rotation.y = la2; G.add(LD);
      var ltop = SILO_H + 0.5;
      [-0.18, 0.18].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.035, ltop - 0.6, 0.035), smHoop, x, 0.6 + (ltop - 0.6) / 2, 0, 0, 0, 0, LD); cpPart(new THREE.BoxGeometry(0.03, 0.03, 0.12), smHoop, x, 1.0, -0.06, 0, 0, 0, LD); cpPart(new THREE.BoxGeometry(0.03, 0.03, 0.12), smHoop, x, ltop - 0.6, -0.06, 0, 0, 0, LD); });
      for (var rg = 0.9; rg < ltop - 0.1; rg += 0.3) cpPart(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 6), smHoop, 0, rg, 0, 0, 0, Math.PI / 2, LD);
      for (var cg = 2.4; cg < ltop; cg += 0.55) cpPart(new THREE.TorusGeometry(0.28, 0.012, 4, 16, Math.PI), smHoop, 0, cg, 0, Math.PI / 2, 0, 0, LD);
      [-0.26, 0, 0.26].forEach(function (x) { var zz = Math.sqrt(Math.max(0, 0.0784 - x * x)); cpPart(new THREE.BoxGeometry(0.014, ltop - 2.4, 0.014), smHoop, x, 2.4 + (ltop - 2.4) / 2, zz, 0, 0, 0, LD); });
      // (the fill gauge: a glass strip up the front, with the hay inside rising and falling as you fill it and use it)
      var ga = -0.42, GG = new THREE.Group(); var gp = on(ga, R + 0.005, 0); GG.position.set(gp[0], 0, gp[2]); GG.rotation.y = ga; G.add(GG);
      cpPart(new THREE.BoxGeometry(0.22, 3.5, 0.03), mlmDark, 0, 1.1 + 1.75, -0.005, 0, 0, 0, GG);
      siloGauge = cpPart(new THREE.BoxGeometry(0.16, 1, 0.02), smHay, 0, 1.15, 0.012, 0, 0, 0, GG); siloGauge.castShadow = false;
      cpPart(new THREE.PlaneGeometry(0.16, 3.4), smGlass, 0, 1.15 + 1.7, 0.026, 0, 0, 0, GG).castShadow = false;
      [[0, 0.06, 0.26, 0.05], [3.4, 0.06, 0.26, 0.05], [1.7, 0.03, 0.06, 0.02], [0.85, 0.02, 0.04, 0.02], [2.55, 0.02, 0.04, 0.02]].forEach(function (b) { cpPart(new THREE.BoxGeometry(b[2], b[1], b[3]), b[1] > 0.04 ? mlmDark : cpmBrass, 0.1, 1.15 + b[0], 0.03, 0, 0, 0, GG); });
      // (the hay chute at the front: a hatch in the staves and a wooden trough sloping up to it, with a bundle waiting in it when there's hay inside)
      var CH = new THREE.Group(); var cp2 = on(0, R, 0); CH.position.set(cp2[0], 0, cp2[2]); G.add(CH);
      cpPart(new THREE.BoxGeometry(0.66, 0.74, 0.1), mlmWood, 0, 1.38, -0.005, 0, 0, 0, CH);
      [[0, 1.77, 0.76, 0.06], [0, 0.99, 0.76, 0.06], [-0.36, 1.38, 0.06, 0.84], [0.36, 1.38, 0.06, 0.84]].forEach(function (b) { cpPart(new THREE.BoxGeometry(b[2], b[3], 0.06), mlmDark, b[0], b[1], 0.04, 0, 0, 0, CH); });
      [1.15, 1.6].forEach(function (y) { cpPart(new THREE.BoxGeometry(0.3, 0.04, 0.02), smHoop, -0.18, y, 0.06, 0, 0, 0, CH); });
      cpPart(new THREE.BoxGeometry(0.05, 0.05, 0.05), cpmBrass, 0.24, 1.38, 0.07, 0, 0, 0, CH);
      var TR = new THREE.Group(); TR.position.set(0, 1.0, 0.1); TR.rotation.x = 0.42; CH.add(TR);
      cpPart(new THREE.BoxGeometry(0.62, 0.04, 0.72), mlmWood, 0, 0, 0.36, 0, 0, 0, TR);
      [-0.31, 0.31].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.04, 0.18, 0.72), mlmFrame, x, 0.08, 0.36, 0, 0, 0, TR); });
      cpPart(new THREE.BoxGeometry(0.62, 0.14, 0.04), mlmFrame, 0, 0.06, 0.72, 0, 0, 0, TR);
      siloTuft = pickupModel('hay'); siloTuft.scale.setScalar(1.6); siloTuft.position.set(0, 0.12, 0.42); siloTuft.rotation.y = Math.PI / 2; TR.add(siloTuft);
      [-0.24, 0.24].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.05, 0.66, 0.05), mlmDark, x, 0.39, 0.76, 0, 0, 0, CH); });   // (and legs under its outer end)
      // (the plaque over the chute, saying how much hay is in it, and a lantern to see it by at night)
      cpPart(new THREE.BoxGeometry(0.86, 0.46, 0.16), mlmDark, 0, 2.25, -0.03, 0, 0, 0, CH);
      cpPart(new THREE.PlaneGeometry(0.8, 0.4), new THREE.MeshStandardMaterial({ map: siloCountTex, roughness: 0.8 }), 0, 2.25, 0.055, 0, 0, 0, CH).castShadow = false;
      var lnp = on(0.5, R + 0.22, 0); cpLantern(G, lnp[0], 2.2, lnp[2], siloGlows); var lbp = on(0.5, R + 0.08, 0); cpPart(new THREE.BoxGeometry(0.04, 0.04, 0.2), smHoop, lbp[0], 2.42, lbp[2], 0, 0.5, 0, G);
      // (the pipe that carries the hay underground to your coop and barn, leaving from its side and going down into the ground)
      var pa = 1.75, PP = new THREE.Group(); var pp = on(pa, R, 0); PP.position.set(pp[0], 0, pp[2]); PP.rotation.y = pa; G.add(PP);
      cpPart(new THREE.CylinderGeometry(0.09, 0.09, 0.42, 16), cpmSteel, 0, 1.15, 0.2, Math.PI / 2, 0, 0, PP);
      cpPart(new THREE.SphereGeometry(0.1, 16, 10), cpmSteel, 0, 1.15, 0.42, 0, 0, 0, PP);
      var pgy = gy(pp[0] + Math.sin(pa) * 0.42, pp[2] + Math.cos(pa) * 0.42);
      cpPart(new THREE.CylinderGeometry(0.09, 0.09, 1.15 - pgy + 0.1, 16), cpmSteel, 0, (1.15 + pgy - 0.1) / 2, 0.42, 0, 0, 0, PP);
      [0.25, 0.75].forEach(function (y) { cpPart(new THREE.TorusGeometry(0.1, 0.018, 6, 20), smRib, 0, pgy + y, 0.42, Math.PI / 2, 0, 0, PP); });
      cpPart(new THREE.CylinderGeometry(0.2, 0.24, 0.12, 18), smConcrete, 0, pgy + 0.04, 0.42, 0, 0, 0, PP);
      cpPart(new THREE.TorusGeometry(0.1, 0.02, 6, 20), smRib, 0, 1.15, 0.03, 0, 0, 0, PP);
      // (a hay bale and a pitchfork by its foot, and flowers round the pad)
      var bl = pickupModel('hay'); bl.scale.setScalar(3.1); var bp = on(0.95, R + 0.62, 0); bl.position.set(bp[0], gy(bp[0], bp[2]) + 0.26, bp[2]); bl.rotation.y = 0.95 + Math.PI / 2; bl.traverse(function (o) { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); G.add(bl);
      var PF = new THREE.Group(); var pfp = on(-0.75, R + 0.25, 0); PF.position.set(pfp[0], gy(pfp[0], pfp[2]), pfp[2]); PF.rotation.set(0.28, -0.75, 0.05); G.add(PF);
      cpPart(new THREE.CylinderGeometry(0.016, 0.018, 1.35, 8), mlmWood, 0, 0.68, 0, 0, 0, 0, PF); cpPart(new THREE.BoxGeometry(0.16, 0.02, 0.02), smHoop, 0, 1.36, 0, 0, 0, 0, PF);
      [-0.07, 0, 0.07].forEach(function (x) { cpPart(new THREE.CylinderGeometry(0.006, 0.003, 0.26, 5), smHoop, x, 1.49, 0, 0, 0, 0, PF); });
      var fl = []; [-1.25, -1.0, 0.55, 1.3, 2.55, 3.0, 3.6].forEach(function (a) { var fp = on(a, R + 0.36, 0); fl.push([fp[0], gy(fp[0], fp[2]), fp[2]]); }); coopFlowers(G, fl, 131);
    } else {
      // (still being built: scaffolding round it, with planks at each level and a ladder, lumber and Oak & Ember's sign)
      var top = stage === 0 ? 2.4 : 4.2, SR = R + 0.5, posts = [];
      for (var p = 0; p < 8; p++) { var pa2 = (p + 0.5) / 8 * Math.PI * 2, pq = on(pa2, SR, 0); posts.push(pq); cpPart(new THREE.CylinderGeometry(0.035, 0.035, top - gy(pq[0], pq[2]), 6), mlmFrame, pq[0], (top + gy(pq[0], pq[2])) / 2, pq[2], 0, 0, 0, G); }
      for (var lv = 1.1; lv < top - 0.2; lv += 1.05) posts.forEach(function (q, k) {
        var q2 = posts[(k + 1) % 8], m = [(q[0] + q2[0]) / 2, (q[2] + q2[2]) / 2], len = Math.hypot(q2[0] - q[0], q2[2] - q[2]), ang = Math.atan2(q2[0] - q[0], q2[2] - q[2]);
        cpPart(new THREE.BoxGeometry(0.4, 0.04, len), mlmWood, m[0] * 0.93, lv, m[1] * 0.93, 0, ang, 0, G);
        millBeam(G, [q[0], lv + 0.45, q[2]], [q2[0], lv + 0.45, q2[2]], 0.04, mlmFrame);
      });
      if (stage === 0) {                                              // (day one: a ring of staves standing ready, and hoops waiting)
        for (var st = 0; st < 10; st++) { var sa = 2.6 + st * 0.11; var sp = on(sa, R + 0.95, 0); cpPart(new THREE.BoxGeometry(0.14, 2.2, 0.04), smStave, sp[0], gy(sp[0], sp[2]) + 1.05, sp[2], -0.1, sa, 0.05 * (st % 3 - 1), G); }
        for (var hp = 0; hp < 3; hp++) { var hq = on(-2.0, R + 0.95, 0); cpPart(new THREE.TorusGeometry(0.45, 0.02, 6, 28), smHoop, hq[0], gy(hq[0], hq[2]) + 0.03 + hp * 0.04, hq[2], Math.PI / 2, 0, 0, G); }
      }
      var LD2 = new THREE.Group(); var lq = on(0.4, SR + 0.35, 0); LD2.position.set(lq[0], gy(lq[0], lq[2]), lq[2]); LD2.rotation.set(-0.25, 0.4, 0); G.add(LD2);
      [-0.2, 0.2].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.05, top + 0.3, 0.05), mlmFrame, x, (top + 0.3) / 2, 0, 0, 0, 0, LD2); }); for (var lr = 0; lr < Math.floor(top / 0.3); lr++) cpPart(new THREE.CylinderGeometry(0.018, 0.018, 0.4, 5), mlmWood, 0, 0.25 + lr * 0.3, 0, 0, 0, Math.PI / 2, LD2);
      var lz = on(-0.6, R + 1.05, 0);
      for (var pl = 0; pl < 9; pl++) cpPart(new THREE.BoxGeometry(1.4, 0.06, 0.2), [mlmWood, mlmFrame][pl % 2], lz[0] + (pl % 2) * 0.05, gy(lz[0], lz[2]) + 0.05 + Math.floor(pl / 3) * 0.06, lz[2] + (pl % 3) * 0.21 - 0.21, 0, -0.6, 0, G);
      var bq = on(1.0, R + 0.95, 0); coopBarrel(G, bq[0], gy(bq[0], bq[2]), bq[2], 0.16, 0.36, false);
      var SG = new THREE.Group(); var sq = on(0.05, R + 1.15, 0); SG.position.set(sq[0], gy(sq[0], sq[2]), sq[2]); G.add(SG);
      [-0.55, 0.55].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.07, 1.1, 0.07), mlmWood, x, 0.55, -0.02, 0, 0, 0, SG); });
      cpPart(new THREE.BoxGeometry(1.3, 0.44, 0.04), mlmWood, 0, 0.85, 0, 0, 0, 0, SG);
      cpPart(new THREE.PlaneGeometry(1.24, 0.39), new THREE.MeshStandardMaterial({ map: siteSignTex('silo'), roughness: 0.8 }), 0, 0.85, 0.022, 0, 0, 0, SG).castShadow = false;
    }
    scene.add(G);
    return G;
  }
  function siloShowHay() {                                             // (the gauge, the plaques, and the bundles waiting in the chute and the hoppers)
    siloDrawCount();
    if (siloGauge) { var f = Math.max(0.004, silo.hay / SILO_CAP) * 3.36; siloGauge.scale.y = f; siloGauge.position.y = 1.17 + f / 2; }
    if (siloTuft) siloTuft.visible = silo.hay > 0;
    siloHopperTufts.forEach(function (t) { t.visible = siloReady() && silo.hay > 0; });
  }
  function siloPlace(c0, r0, start, rot) {
    siloRemove();
    silo.built = true; silo.c = c0; silo.r = r0; silo.start = start; silo.rot = rot || 0;
    silo.x = FARM_X + (c0 + SILO_FC / 2) * TILE; silo.z = FARM_Z + (r0 + SILO_FR / 2) * TILE;
    var top = -9; for (var gx = -1; gx <= 1; gx++) for (var gz = -1; gz <= 1; gz++) top = Math.max(top, groundHeight(silo.x + gx * 1.4, silo.z + gz * 1.4));
    silo.fy = top + 0.05;
    var HX = SILO_FC * TILE / 2, HZ = SILO_FR * TILE / 2;
    allScenery.forEach(function (t) { var u = t.userData; if (u.gone || u.state === 'standing') return; if (Math.abs(u.solid.x - silo.x) < HX + u.solidR && Math.abs(u.solid.z - silo.z) < HZ + u.solidR) setSceneryCut(t, u.state === 'regrowing' ? u.felledAt : gameMinutes()); });
    mineable.forEach(function (r) { if (r.gone || r.state === 'whole') return; if (Math.abs(r.solid.x - silo.x) < HX + r.solidR && Math.abs(r.solid.z - silo.z) < HZ + r.solidR) setRockBroken(r, r.state === 'regrowing' ? r.brokeAt : gameMinutes()); });
    for (var c = c0; c < c0 + SILO_FC; c++) for (var r = r0; r < r0 + SILO_FR; r++) { var ft = { x: FARM_X + (c + 0.5) * TILE, z: FARM_Z + (r + 0.5) * TILE }; coverGrass(ft); silo.grass.push(ft); }
    var sd = { x: silo.x, z: silo.z, r: SILO_R + 0.22 }; solids.push(sd); silo.solids.push(sd);
    silo.stage = siloStage(); siloGroup = siloBuildModel(silo.stage); siloShowHay();
    flushDirty();
  }
  function siloRemove() {
    if (!silo.built) return;
    if (siloGroup) { scene.remove(siloGroup); siloGroup = null; } siloGauge = siloTuft = null;
    silo.solids.forEach(function (sd) { var i = solids.indexOf(sd); if (i >= 0) solids.splice(i, 1); }); silo.solids = [];
    silo.grass.forEach(uncoverGrass); silo.grass = [];
    silo.built = false; silo.stage = -1;
  }
  function siloSaveData() { return silo.built ? { c: silo.c, r: silo.r, rot: silo.rot || 0, start: silo.start, hay: silo.hay } : null; }
  function siloLoadData(d) { siloRemove(); silo.hay = 0; if (d) { silo.hay = Math.max(0, Math.min(SILO_CAP, d.hay | 0)); siloPlace(d.c, d.r, d.start === undefined ? -99 : d.start, d.rot || 0); } siloShowHay(); }

  // ===== filling it, and taking hay out at the hoppers =====
  function siloNear() { return silo.built && !indoors && !flying && dist(player.position.x, player.position.z, silo.x, silo.z) < SILO_R + 1.35; }
  function siloFill() {
    if (!siloReady()) { showToast('Your silo is still being built: it\'ll be ready on the morning of ' + seasonDay(silo.start + SILO_DAYS) + ' 🪚', 2600); return; }
    if (silo.hay >= SILO_CAP) { showToast('Your silo is full: it holds ' + SILO_CAP + ' hay 🌾', 2200); return; }
    var have = bagCount('hay');
    if (!have) { showToast('Your silo only takes hay, and you don\'t have any. Buy it at Fluff & Feather, or trim bushes for it 🌾 (' + silo.hay + '/' + SILO_CAP + ')', 3200); return; }
    var n = Math.min(have, SILO_CAP - silo.hay);
    if (!takeItem('hay', n)) return;
    silo.hay += n; siloShowHay(); popSound();
    showToast('🌾 You poured ' + n + ' hay into your silo (' + silo.hay + '/' + SILO_CAP + ')' + (n < have ? ': it\'s full now, so you kept the other ' + (have - n) : ''), 3000);
  }
  function siloHopperTake() {                                          // (a bundle of hay from your silo, through the hopper)
    if (!silo.built) { showToast('This hopper gives you hay from a silo, but you don\'t have one yet: Oak & Ember can build you one 🌾', 3000); return; }
    if (!siloReady()) { showToast('Your silo is still being built: hay will come out here from the morning of ' + seasonDay(silo.start + SILO_DAYS) + ' 🪚', 2800); return; }
    if (silo.hay <= 0) { showToast('Your silo is empty: put hay in it through its chute, outside 🌾', 2600); return; }
    if (!addItem('hay', 1)) { bagFull(); return; }
    silo.hay--; siloShowHay(); popSound();
    showToast('🌾 A bundle of hay drops out of the hopper (' + silo.hay + ' left in your silo)', 1800);
  }
  function siloAtHopper(hop, room) {                                   // (standing in front of a hopper)
    var lx = player.position.x - room[0], lz = player.position.z - room[1];
    return Math.hypot(lx - hop[0], lz - hop[1]) < 1.0;
  }
  function siloHopperHere() { return !glimNaming && ((inCoop && siloAtHopper(SILO_HOP_COOP, [COI_X, COI_Z])) || (inFbarn && siloAtHopper(SILO_HOP_FBARN, [FBI_X, FBI_Z]))); }
  function siloAction() {                                              // (Interact by a hopper, or by your silo: true if it did something)
    if (coopPlacing || carpShopOpen) return false;
    if (siloHopperHere()) { siloHopperTake(); return true; }
    if (siloNear() && siloReady()) { siloFill(); return true; }
    return false;
  }
  var siloBtn = document.createElement('button');
  siloBtn.type = 'button'; siloBtn.className = 'sleep-btn ship-btn';
  canvas.parentNode.appendChild(siloBtn);
  siloBtn.addEventListener('click', function () { siloAction(); focusGame(); });
  var siloBtnText = '';
  function updateSiloButton() {
    var txt = coopPlacing ? '' : siloHopperHere() ? '🌾 Take hay from the hopper (' + (siloReady() ? silo.hay + ' in your silo' : silo.built ? 'silo being built' : 'no silo yet') + ')' : siloNear() && siloReady() ? '🌾 Put hay in the silo (' + silo.hay + '/' + SILO_CAP + ')' : '';
    if (txt !== siloBtnText) { siloBtnText = txt; if (txt) siloBtn.innerHTML = txt + ' <kbd>E</kbd>'; }
    var show = !!txt;
    if (siloBtn.classList.contains('show') !== show) siloBtn.classList.toggle('show', show);
  }
  // (the hoppers: a wooden cabinet with a steel funnel on top, fed by a pipe coming down the wall, a crank on its side,
  // a little tray at the front where the hay drops out, and a plaque saying how much is left in your silo)
  var SILO_HOP_COOP = [0.95, 1.7], SILO_HOP_FBARN = [4.22, -1.1];   // (in the barn: far enough off the wall for its funnel, between two windows)
  function siloHopper(R, x, z, ry, pipeTop, sol, reach) {
    reach = reach || 0.22;                                             // (how far back the pipe's elbow runs, into the wall)
    var H = new THREE.Group(); H.position.set(x, 0, z); H.rotation.y = ry; R.add(H);
    var mW = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0xc89c6c, roughness: 0.8 }), mO = new THREE.MeshStandardMaterial({ color: 0x7a5a3c, roughness: 0.85 });
    [[-0.27, -0.19], [0.27, -0.19], [-0.27, 0.19], [0.27, 0.19]].forEach(function (l) { cpPart(new THREE.BoxGeometry(0.07, 0.78, 0.07), mO, l[0], 0.39, l[1], 0, 0, 0, H); });
    cpPart(new THREE.BoxGeometry(0.6, 0.5, 0.44), mW, 0, 0.5, 0, 0, 0, 0, H);
    [0.26, 0.74].forEach(function (y) { cpPart(new THREE.BoxGeometry(0.64, 0.05, 0.48), mO, 0, y, 0, 0, 0, 0, H); });
    cpPart(new THREE.CylinderGeometry(0.47, 0.25, 0.3, 4, 1, true), new THREE.MeshStandardMaterial({ color: 0xc9ced6, metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide }), 0, 0.92, 0, 0, Math.PI / 4, 0, H);
    cpPart(new THREE.BoxGeometry(0.68, 0.03, 0.03), cpmIron, 0, 1.07, 0.24, 0, 0, 0, H); cpPart(new THREE.BoxGeometry(0.68, 0.03, 0.03), cpmIron, 0, 1.07, -0.24, 0, 0, 0, H);
    cpPart(new THREE.CylinderGeometry(0.06, 0.06, pipeTop - 0.95, 14), cpmSteel, 0, (pipeTop + 0.95) / 2, -0.05, 0, 0, 0, H);   // (the pipe from your silo)
    for (var fy = 1.3; fy < pipeTop - 0.1; fy += 0.7) cpPart(new THREE.TorusGeometry(0.066, 0.014, 6, 16), cpmIron, 0, fy, -0.05, Math.PI / 2, 0, 0, H);
    cpPart(new THREE.SphereGeometry(0.065, 12, 8), cpmSteel, 0, pipeTop, -0.05, 0, 0, 0, H);
    cpPart(new THREE.CylinderGeometry(0.06, 0.06, reach, 14), cpmSteel, 0, pipeTop, -0.05 - reach / 2, Math.PI / 2, 0, 0, H);
    cpPart(new THREE.BoxGeometry(0.16, 0.04, reach - 0.12), cpmIron, 0, pipeTop - 0.5, -0.11 - reach / 2 + 0.06, 0, 0, 0, H);
    var TR = new THREE.Group(); TR.position.set(0, 0.3, 0.22); TR.rotation.x = 0.3; H.add(TR);   // (the tray at the front, where a bundle waits)
    cpPart(new THREE.BoxGeometry(0.4, 0.03, 0.26), mO, 0, 0, 0.12, 0, 0, 0, TR);
    [-0.2, 0.2].forEach(function (xx) { cpPart(new THREE.BoxGeometry(0.03, 0.08, 0.26), mO, xx, 0.04, 0.12, 0, 0, 0, TR); });
    var tuft = pickupModel('hay'); tuft.scale.setScalar(0.9); tuft.position.set(0, 0.07, 0.12); tuft.rotation.y = Math.PI / 2 + 0.1; TR.add(tuft); siloHopperTufts.push(tuft);
    cpPart(new THREE.BoxGeometry(0.34, 0.12, 0.03), mO, 0, 0.36, 0.215, 0, 0, 0, H);           // (the little door the hay drops through)
    var CR = new THREE.Group(); CR.position.set(0.31, 0.58, 0); H.add(CR);                    // (the crank on its side)
    cpPart(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 14), cpmIron, 0.01, 0, 0, 0, 0, Math.PI / 2, CR);
    cpPart(new THREE.BoxGeometry(0.02, 0.2, 0.03), cpmIron, 0.03, -0.08, 0, 0, 0, 0, CR);
    cpPart(new THREE.CylinderGeometry(0.018, 0.018, 0.08, 8), cpmBrass, 0.07, -0.17, 0, 0, 0, Math.PI / 2, CR);
    cpPart(new THREE.BoxGeometry(0.34, 0.18, 0.012), mO, 0, 0.56, 0.227, 0, 0, 0, H);         // (the plaque: how much hay your silo has)
    cpPart(new THREE.PlaneGeometry(0.31, 0.155), new THREE.MeshStandardMaterial({ map: siloCountTex, roughness: 0.8 }), 0, 0.56, 0.234, 0, 0, 0, H).castShadow = false;
    sol.push([x, z, 0.36]);
    return H;
  }
  siloHopper(coopRoom, SILO_HOP_COOP[0], SILO_HOP_COOP[1], Math.PI, COOP_WALL - 0.08, coopSolids);
  siloHopper(fbarnRoom, SILO_HOP_FBARN[0], SILO_HOP_FBARN[1], -Math.PI / 2, FBARN_WALL - 0.1, fbarnSolids, 0.42);
  siloDrawCount(); siloShowHay();

  // ===== on Oak & Ember's menu, on the world map, and every frame =====
  function siloShopIcon() {                                            // (a little picture of the silo, for Oak & Ember's menu)
    var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d'); g.scale(2, 2);
    g.fillStyle = 'rgba(0,0,0,0.16)'; g.beginPath(); g.ellipse(64, 118, 36, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#b8b2a6'; g.beginPath(); g.ellipse(64, 114, 33, 6, 0, 0, Math.PI * 2); g.fill();
    var sg = g.createLinearGradient(40, 0, 88, 0); sg.addColorStop(0, '#8a857c'); sg.addColorStop(0.5, '#aaa498'); sg.addColorStop(1, '#7a756c'); g.fillStyle = sg; g.fillRect(41, 98, 46, 15);
    g.fillStyle = 'rgba(255,255,255,0.18)'; for (var s = 0; s < 8; s++) g.fillRect(43 + (s % 4) * 11 + Math.floor(s / 4) * 5, 100 + Math.floor(s / 4) * 6, 8, 4);
    var bg = g.createLinearGradient(42, 0, 86, 0); bg.addColorStop(0, '#8a3428'); bg.addColorStop(0.45, '#c8564a'); bg.addColorStop(1, '#7a2e24'); g.fillStyle = bg; g.fillRect(42, 32, 44, 67);
    g.strokeStyle = 'rgba(70,20,14,0.35)'; g.lineWidth = 0.8; for (var x = 45; x < 86; x += 3.4) { g.beginPath(); g.moveTo(x, 32); g.lineTo(x, 99); g.stroke(); }
    g.strokeStyle = '#3a3634'; g.lineWidth = 1.6; for (var y = 42; y < 98; y += 9) { g.beginPath(); g.moveTo(42, y); g.lineTo(86, y); g.stroke(); }
    var dg = g.createLinearGradient(42, 0, 86, 0); dg.addColorStop(0, '#9aa2ac'); dg.addColorStop(0.45, '#eef2f6'); dg.addColorStop(1, '#8a929c'); g.fillStyle = dg;
    g.beginPath(); g.ellipse(64, 33, 23, 16, 0, Math.PI, 0); g.fill(); g.strokeStyle = 'rgba(80,90,100,0.5)'; g.lineWidth = 0.7; [-14, -7, 0, 7, 14].forEach(function (d) { g.beginPath(); g.moveTo(64 + d * 1.55, 33); g.quadraticCurveTo(64 + d * 1.1, 22, 64, 17); g.stroke(); });
    g.fillStyle = '#9aa2ac'; g.fillRect(41, 31, 46, 3); g.fillStyle = '#c4cad2'; g.fillRect(60, 11, 8, 6); g.fillStyle = '#8a929c'; g.beginPath(); g.moveTo(56, 12); g.lineTo(64, 6); g.lineTo(72, 12); g.closePath(); g.fill();
    g.fillStyle = '#3a2a1e'; g.fillRect(55.5, 46, 4, 50); g.fillStyle = '#f0d080'; g.fillRect(56.3, 74, 2.4, 21.5); g.fillStyle = 'rgba(220,240,255,0.35)'; g.fillRect(56.3, 47, 2.4, 48);   // (the gauge, about half full)
    g.fillStyle = '#7a5236'; g.fillRect(64, 81, 13, 14); g.strokeStyle = '#3a2a1e'; g.lineWidth = 1; g.strokeRect(64, 81, 13, 14);
    g.fillStyle = '#b08a62'; g.beginPath(); g.moveTo(63, 95); g.lineTo(78, 95); g.lineTo(82, 108); g.lineTo(59, 108); g.closePath(); g.fill(); g.fillStyle = '#e8c870'; g.fillRect(64, 99, 13, 5);
    g.fillStyle = '#f4e6c8'; g.fillRect(62, 68, 17, 9); g.strokeStyle = '#4a3626'; g.strokeRect(62, 68, 17, 9);
    g.strokeStyle = '#3a3634'; g.lineWidth = 1.2; [37, 39.5].forEach(function (x) { g.beginPath(); g.moveTo(x, 40); g.lineTo(x, 100); g.stroke(); }); for (var r2 = 44; r2 < 100; r2 += 5) { g.beginPath(); g.moveTo(37, r2); g.lineTo(39.5, r2); g.stroke(); }
    g.fillStyle = '#c9ced6'; g.fillRect(86, 86, 9, 5); g.fillRect(91, 86, 4, 28);
    [[30, 112, '#f4a6c8'], [36, 114, '#fff2e0'], [96, 113, '#c8a8f0'], [101, 112, '#ffb08a']].forEach(function (f) { g.fillStyle = '#5f9a48'; g.beginPath(); g.arc(f[0], f[1] + 1, 3, 0, Math.PI * 2); g.fill(); g.fillStyle = f[2]; g.beginPath(); g.arc(f[0], f[1] - 1, 1.6, 0, Math.PI * 2); g.fill(); });
    return c.toDataURL();
  }
  function siloDrawOnMap(g, K, label) {                                // (on the world map: its round silver dome, seen from above)
    var pc = mapXY(silo.x, silo.z), p = [0, 0], r = (SILO_R + 0.1) * K;
    g.save(); g.translate(pc[0], pc[1]); g.rotate(-bRot(silo));           // (turned the way it faces)
    g.beginPath(); g.arc(p[0] + 5, p[1] + 7, r, 0, Math.PI * 2); g.fillStyle = 'rgba(0,0,0,0.2)'; g.fill();
    g.beginPath(); g.arc(p[0], p[1], r, 0, Math.PI * 2); var dg = g.createRadialGradient(p[0] - r * 0.3, p[1] - r * 0.3, 2, p[0], p[1], r); dg.addColorStop(0, siloReady() ? '#f2f5f8' : '#e0c090'); dg.addColorStop(1, siloReady() ? '#8a929c' : '#a07850'); g.fillStyle = dg; g.fill();
    g.strokeStyle = siloReady() ? '#b8564a' : '#7a5236'; g.lineWidth = 3; g.stroke();
    if (siloReady()) { g.strokeStyle = 'rgba(80,90,100,0.4)'; g.lineWidth = 1.2; for (var k = 0; k < 8; k++) { var a = k / 8 * Math.PI * 2; g.beginPath(); g.moveTo(p[0] + Math.cos(a) * 3, p[1] + Math.sin(a) * 3); g.lineTo(p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r); g.stroke(); } }
    g.fillStyle = '#8a6040'; g.fillRect(p[0] - 0.35 * K, p[1] + r, 0.7 * K, 0.7 * K);
    g.restore();
    label(siloReady() ? 'Silo · ' + silo.hay + '/' + SILO_CAP + ' hay' : 'Silo (being built)', silo.x, silo.z, r + 26);
  }
  var siloBaseInteract = interact;
  interact = function () {
    if (siloAction()) return;
    return siloBaseInteract.apply(this, arguments);
  };
  function updateSilo(dt, night) {
    updateSiloButton();
    if (!silo.built) return;
    var st = siloStage();
    if (st !== silo.stage) {                                            // (a new morning: Oak & Ember have got further)
      var was = silo.stage; silo.stage = st;
      if (siloGroup) scene.remove(siloGroup); siloGroup = siloBuildModel(st); siloShowHay();
      if (was >= 0) setTimeout(function () { showToast(st === SILO_DAYS ? '🌾 Your silo is finished! Pour hay in through its chute, and take it out at the hoppers in your coop and barn.' : '🪚 Oak & Ember worked on your silo all day: it\'s half built! One more day to go.', 4600); }, 8200);
    }
    siloGlows.forEach(function (L) { var fl = 1 + Math.sin(state.time * 11 + L.p) * 0.1; L.f.scale.set(fl, 1.5 * fl, fl); L.h.material.opacity = (0.25 + night * 0.5) * fl; });
  }

  // ---------- Building sites: the coop and the barn take two days to build too ----------
  // Like the mill: the day you buy one, a building site goes up on its spot (a stone footing and floorboards, a bare
  // timber frame with its roof skeleton, scaffolding, lumber and Oak & Ember's sign); by the next morning its walls
  // are up; and on the second morning it's finished. You can't go in, or adopt animals into it, until then
  var SITE_DAYS = 2, siteSigns = {};
  function siteStage(o) { return Math.min(SITE_DAYS, farmDay() - o.start); }   // 0: just started, 1: walls up, 2: finished
  function siteSignTex(name) {
    if (!siteSigns[name]) siteSigns[name] = cpTex(512, 160, function (g, w, h) {
      g.fillStyle = '#7a5236'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4e6c8'; g.fillRect(8, 8, w - 16, h - 16);
      g.fillStyle = '#5a3a20'; g.textAlign = 'center'; g.font = '600 48px Fredoka, Georgia, serif'; g.fillText('Your ' + name + ' is coming!', w / 2, 70);
      g.font = '28px Fredoka, Georgia, serif'; g.fillText('🪚 Built by Oak & Ember · ready in two days', w / 2, 120);
    });
    return siteSigns[name];
  }
  function siteBuild(kind, stage) {                                    // (the building site for your coop or barn, as far as it's got)
    var coopK = kind === 'coop', o = coopK ? coop : fbarn, W = coopK ? COOP_BW : FBARN_BW, D = coopK ? COOP_BD : FBARN_BD, H = coopK ? COOP_WALL : FBARN_WALL, apron = coopK ? 0.95 : 1.6;
    var G = new THREE.Group(); G.position.set(o.x, o.fy, o.z); G.rotation.y = bRot(o);
    function gy(lx, lz) { return bGround(o, lx, lz) - o.fy; }
    var minG = 99; for (var gx = -1; gx <= 1; gx++) for (var gz = -1; gz <= 1; gz++) minG = Math.min(minG, gy(gx * (W / 2 + 0.3), gz * (D / 2 + 0.3)));
    var fh = -minG + 0.3;
    cpPart(new THREE.BoxGeometry(W + 0.2, fh, D + 0.2), mlmStone, 0, -fh / 2, 0, 0, 0, 0, G);   // (the footing, and the floor laid on it)
    for (var fb = -W / 2 + 0.15; fb < W / 2; fb += 0.3) cpPart(new THREE.BoxGeometry(0.28, 0.05, D), [mlmWood, mlmFrame][Math.round((fb + W) / 0.3) % 2], fb, 0.025, 0, 0, 0, 0, G);
    if (stage >= 1) {                                                  // (day two: the walls are up)
      if (coopK) {
        coopWall(G, COOP_BW, H, 0, [[-2.15, -1.15, 1.02, 1.78], [1.15, 2.15, 1.02, 1.78]], [-0.52, 0.52, 1.92], cpmBoard, 0, D / 2, 0);
        coopWall(G, COOP_BW, H, 0, [[-1.8, -1.0, 1.2, 1.8], [1.0, 1.8, 1.2, 1.8]], null, cpmBoard, 0, -D / 2, Math.PI);
        coopWall(G, COOP_BD + 0.12, H, COOP_PEAK, [[-0.5, 0.5, 1.02, 1.78]], null, cpmBoard, -W / 2, 0, -Math.PI / 2);
        coopWall(G, COOP_BD + 0.12, H, COOP_PEAK, [], null, cpmBoard, W / 2, 0, Math.PI / 2);
      } else {
        fbarnWall(G, FBG, FB_FRH, FB_DOOR, fbmRed, 0, D / 2, 0); fbarnWall(G, FBG, FB_BKH, null, fbmRed, 0, -D / 2, Math.PI);
        fbarnWall(G, FB_SIDE, FB_SH, null, fbmRed, -W / 2, 0, -Math.PI / 2); fbarnWall(G, FB_SIDE, FB_SH, null, fbmRed, W / 2, 0, Math.PI / 2);
      }
    } else {                                                           // (day one: just the timber frame)
      var posts = [];
      for (var px = -W / 2; px <= W / 2 + 0.01; px += W / Math.round(W / 0.9)) posts.push([px, -D / 2], [px, D / 2]);
      for (var pz = -D / 2 + D / Math.round(D / 0.9); pz < D / 2 - 0.01; pz += D / Math.round(D / 0.9)) posts.push([-W / 2, pz], [W / 2, pz]);
      posts.forEach(function (p) { millBeam(G, [p[0], 0, p[1]], [p[0], H, p[1]], 0.1, mlmFrame); });
      [[-W / 2, -D / 2, W / 2, -D / 2], [-W / 2, D / 2, W / 2, D / 2], [-W / 2, -D / 2, -W / 2, D / 2], [W / 2, -D / 2, W / 2, D / 2]].forEach(function (e) {
        [0.08, H].forEach(function (y) { millBeam(G, [e[0], y, e[1]], [e[2], y, e[3]], 0.11, mlmFrame); });
        millBeam(G, [e[0], 0.3, e[1]], [e[2], H - 0.3, e[3]], 0.07, mlmWood);   // (a brace across each side)
      });
    }
    // (the roof's skeleton: rafters along its length, a ridge beam, and purlins, with no roof on yet)
    var prof = coopK ? [[-D / 2 - 0.3, H - 0.2], [0, H + COOP_PEAK], [D / 2 + 0.3, H - 0.2]] : [[-5.0, 2.75], [-2.9, 4.5], [0, 5.35], [2.9, 4.5], [5.0, 2.75]];
    var L = coopK ? W + 0.3 : D + 0.4, n = Math.round(L / 0.75);
    function at(p, q) { return coopK ? [p, q[1], q[0]] : [q[0], q[1], p]; }
    for (var i = 0; i <= n; i++) { var p = -L / 2 + i * L / n; for (var k = 0; k < prof.length - 1; k++) millBeam(G, at(p, prof[k]), at(p, prof[k + 1]), 0.08, mlmFrame); }
    prof.forEach(function (q, k) { if (k === 0 || k === prof.length - 1) return; millBeam(G, at(-L / 2, q), at(L / 2, q), 0.1, mlmFrame); });
    prof.slice(0, -1).forEach(function (q, k) { var m = [(q[0] + prof[k + 1][0]) / 2, (q[1] + prof[k + 1][1]) / 2]; millBeam(G, at(-L / 2, m), at(L / 2, m), 0.06, mlmWood); });
    // (scaffolding along the front, with a ladder, planks at each level and a rail)
    var sz = D / 2 + 0.38, top = coopK ? H + 0.6 : H + 1.6;
    for (var sx = -W / 2 + 0.3; sx <= W / 2 - 0.29; sx += (W - 0.6) / Math.round((W - 0.6) / 1.4)) [sz - 0.25, sz + 0.25].forEach(function (z) { cpPart(new THREE.CylinderGeometry(0.035, 0.035, top - gy(sx, z), 6), mlmFrame, sx, (top + gy(sx, z)) / 2, z, 0, 0, 0, G); });
    for (var lv = 1.0; lv < top - 0.2; lv += 1.05) { cpPart(new THREE.BoxGeometry(W - 0.4, 0.04, 0.42), mlmWood, 0, lv, sz, 0, 0, 0, G); cpPart(new THREE.CylinderGeometry(0.022, 0.022, W - 0.5, 6), mlmFrame, 0, lv + 0.45, sz + 0.24, 0, 0, Math.PI / 2, G); }
    var LD = new THREE.Group(); LD.position.set(W / 2 - 0.5, gy(W / 2 - 0.5, sz + 0.55), sz + 0.55); LD.rotation.set(-0.25, 0, 0); G.add(LD);
    [-0.2, 0.2].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.05, top + 0.3, 0.05), mlmFrame, x, (top + 0.3) / 2, 0, 0, 0, 0, LD); }); for (var lr = 0; lr < Math.floor(top / 0.3); lr++) cpPart(new THREE.CylinderGeometry(0.018, 0.018, 0.4, 5), mlmWood, 0, 0.25 + lr * 0.3, 0, 0, 0, Math.PI / 2, LD);
    // (stacks of lumber, a sawhorse with a plank on it, a keg of nails, and Oak & Ember's sign)
    var lx = -W / 2 + 1.0, lz = D / 2 + apron * 0.62;
    for (var pl = 0; pl < 9; pl++) cpPart(new THREE.BoxGeometry(1.7, 0.06, 0.2), [mlmWood, mlmFrame][pl % 2], lx + (pl % 2) * 0.05, gy(lx, lz) + 0.05 + Math.floor(pl / 3) * 0.06, lz + (pl % 3) * 0.21 - 0.21, 0, 0.1, 0, G);
    var SH = new THREE.Group(); SH.position.set(-0.6, gy(-0.6, D / 2 + apron * 0.7), D / 2 + apron * 0.7); SH.rotation.y = 0.3; G.add(SH);
    cpPart(new THREE.BoxGeometry(1.0, 0.1, 0.12), mlmWood, 0, 0.62, 0, 0, 0, 0, SH); [-0.4, 0.4].forEach(function (x) { [-1, 1].forEach(function (s) { cpPart(new THREE.BoxGeometry(0.06, 0.7, 0.06), mlmWood, x, 0.32, s * 0.14, s * 0.35, 0, 0, SH); }); });
    cpPart(new THREE.BoxGeometry(1.4, 0.05, 0.2), mlmFrame, 0.2, 0.7, 0, 0, 0.1, 0, SH);
    coopBarrel(G, 0.55, gy(0.55, D / 2 + apron * 0.75), D / 2 + apron * 0.75, 0.16, 0.36, false);
    var SG = new THREE.Group(); SG.position.set(W / 2 - 1.1, gy(W / 2 - 1.1, D / 2 + apron * 0.8), D / 2 + apron * 0.8); SG.rotation.y = -0.15; G.add(SG);
    [-0.55, 0.55].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.07, 1.1, 0.07), mlmWood, x, 0.55, -0.02, 0, 0, 0, SG); });
    cpPart(new THREE.BoxGeometry(1.3, 0.44, 0.04), mlmWood, 0, 0.85, 0, 0, 0, 0, SG);
    cpPart(new THREE.PlaneGeometry(1.24, 0.39), new THREE.MeshStandardMaterial({ map: siteSignTex(coopK ? 'coop' : 'barn'), roughness: 0.8 }), 0, 0.85, 0.022, 0, 0, 0, SG).castShadow = false;
    scene.add(G);
    return G;
  }
  function siteTick(kind) {                                            // (each morning Oak & Ember get further; on the second, it's finished)
    var coopK = kind === 'coop', o = coopK ? coop : fbarn, st = siteStage(o);
    if (st === o.stage) return;
    var was = o.stage; o.stage = st;
    if (coopK) { if (coopGroup) scene.remove(coopGroup); coopGroup = st < SITE_DAYS ? siteBuild('coop', st) : coopBuildOutside(); if (st === SITE_DAYS) coopDoor = coopFront(0.12); }
    else { if (fbarnGroup) scene.remove(fbarnGroup); fbarnGroup = st < SITE_DAYS ? siteBuild('fbarn', st) : fbarnBuildOutside(); if (st === SITE_DAYS) fbarnDoor = fbarnFront(0.15); }
    if (was < 0) return;
    if (st === SITE_DAYS) homeMigrate(false);
    var nm = coopK ? 'coop' : 'barn';
    setTimeout(function () { showToast(st === SITE_DAYS ? (coopK ? '🐔' : '🐮') + ' Your ' + nm + ' is finished! You can go in, and adopt animals for it at Fluff & Feather.' : '🪚 Oak & Ember worked on your ' + nm + ' all day: its walls are up! One more day to go.', 4600); }, coopK ? 7000 : 7600);
  }
  function siteReady(o) { return o.built && o.stage >= SITE_DAYS; }

  // ---------- Sitting in the rowboat ----------
  // Walk to the end of the dock and press Interact to climb into the little rowboat tied there: she sits on its front
  // seat facing the stern, legs stretched out in front of her and hands in her lap, bobbing and rocking with the boat on
  // the water. Press Interact again (or try to walk, fly or teleport) to climb back out onto the dock
  var inBoat = false, BOAT_SEAT = new THREE.Vector3(0.3 * BOAT_L / 2, hullRise(0.3) - 0.07 + 0.018, 0), boatSeatW = new THREE.Vector3(), boatFwd = new THREE.Vector3();
  function boatWorldPos() { boat.updateWorldMatrix(true, false); return boat.localToWorld(boatSeatW.set(0, 0, 0)); }
  function boatNear() {
    if (inBoat || indoors || flying || flyH > 0 || teleporting || sleeping) return false;
    var b = boatWorldPos();
    return onDock(player.position.x, player.position.z) && dist(player.position.x, player.position.z, b.x, b.z) < 2.6;
  }
  function boatSeat() {                                                // (where her hips go, and which way she faces: back toward the stern)
    boat.updateWorldMatrix(true, false);
    var p = boat.localToWorld(boatSeatW.copy(BOAT_SEAT));
    boatFwd.set(1, 0, 0).transformDirection(boat.matrixWorld);
    return { x: p.x, y: p.y, z: p.z, face: Math.atan2(-boatFwd.x, -boatFwd.z) };
  }
  function boatClimbIn() {
    inBoat = true; walkTarget = null; keys = {};
    var s = boatSeat(); facing = s.face; popSound();
    burst(s.x, s.y - 0.1, s.z, 0xbfe6ff, 12, 1.2, 1.4, -2);               // (a little splash as the boat dips)
    showToast('🛶 You climb into the rowboat and settle on its seat. Press Interact to climb back out.', 3200);
  }
  function boatClimbOut(quiet) {
    if (!inBoat) return;
    inBoat = false;
    var p = dock.localToWorld(new THREE.Vector3(DOCK_LEN - 0.7, 0, 0.35));
    player.position.set(p.x, DOCK_Y, p.z); body.position.set(0, 0, 0); body.rotation.set(0, 0, 0);
    if (!quiet) popSound();
  }
  var boatBaseUpdatePlayer = updatePlayer;
  updatePlayer = function (dt) {
    if (inBoat && (indoors || teleporting || sleeping || player.parent !== scene)) inBoat = false;   // (carried home, or whisked away some other way)
    if (!inBoat) return boatBaseUpdatePlayer(dt);
    var tryWalk = upHeld() || downHeld() || rightHeld() || leftHeld() || walkTarget;
    if (tryWalk) { walkTarget = null; boatClimbOut(); return boatBaseUpdatePlayer(dt); }   // (walking off: she steps back onto the dock)
    var s = boatSeat();
    facing = s.face; player.rotation.y = facing;
    player.position.set(s.x, s.y - 0.36, s.z);                          // (her hips on the seat)
    body.position.set(0, 0, 0);
    body.rotation.set(boat.rotation.x * 1.2, 0, boat.rotation.z * 1.2);  // (rocking with the boat)
    hatStar.rotation.y += dt * 2;
    witchLook(dt, false);
    var w = wl, t = state.time;                                        // (sitting: legs stretched out in front, hands resting in her lap, broom laid down)
    w.legs[0].rotation.set(-1.42, 0, 0.1); w.legs[1].rotation.set(-1.42, 0, -0.1); w.legs[0].userData.shin.rotation.x = w.legs[1].userData.shin.rotation.x = 0; w.chibi.rotation.set(0, 0, 0);   // (straight-legged)
    w.armL.rotation.x = -0.55; w.armR.rotation.x = -0.55;
    w.chibi.position.y = 0; w.broom.visible = false;
    w.head.rotation.z = Math.sin(t * 0.6) * 0.05;                       // (looking about, enjoying the water)
  };
  var boatBaseToggleFlying = toggleFlying;
  toggleFlying = function () { if (inBoat) boatClimbOut(); return boatBaseToggleFlying.apply(this, arguments); };
  var boatBaseTeleport = teleportTo;
  teleportTo = function () { if (inBoat) boatClimbOut(true); return boatBaseTeleport.apply(this, arguments); };
  var boatBaseInteract = interact;
  interact = function () {
    if (inBoat) { boatClimbOut(); return; }
    if (boatNear() && !coopPlacing) { boatClimbIn(); return; }
    return boatBaseInteract.apply(this, arguments);
  };
  var boatBtn = document.createElement('button');
  boatBtn.type = 'button'; boatBtn.className = 'sleep-btn ship-btn';
  canvas.parentNode.appendChild(boatBtn);
  boatBtn.addEventListener('click', function () { if (inBoat) boatClimbOut(); else if (boatNear()) boatClimbIn(); focusGame(); });
  var boatBtnText = '';
  function updateBoatButton() {
    var txt = inBoat ? '🛶 Climb out of the boat' : boatNear() ? '🛶 Sit in the boat' : '';
    if (txt !== boatBtnText) { boatBtnText = txt; if (txt) boatBtn.innerHTML = txt + ' <kbd>E</kbd>'; }
    var show = !!txt;
    if (boatBtn.classList.contains('show') !== show) boatBtn.classList.toggle('show', show);
  }

  // ---------- Flying on her broom ----------
  // B (or the Fly button) hops on and off her broom; only outdoors. Once up she flies a little faster than she walks,
  // anywhere over the island, the lake and just out over the sea; Space climbs higher and Shift drops lower. Landing
  // needs dry ground beneath her, and she lands by herself if she goes through a door, gets carried home or teleports inside
  var flying = false, flyH = 0, flyGoal = 0, flySpeed = 0, flyTrail = 0, FLY_SPEED = SPEED * 1.6, FLY_MIN = 1.2, FLY_MAX = 9, FLY_START = 3.5;
  function toggleFlying() {
    if (teleporting || sleeping) return;
    if (!flying) {
      if (indoors) { showToast('You can only fly outdoors', 1800); return; }
      flying = true; flyGoal = FLY_START; walkTarget = null; spellSound();
      burst(player.position.x, player.position.y + 0.3, player.position.z, 0xffd6f5, 14, 1.4, 1.2, -1.5);
    } else if (flyGoal > 0) {
      if (inLake(player.position.x, player.position.z) || !walkable(player.position.x, player.position.z)) { showToast('Find dry land to land on', 1800); return; }
      flyGoal = 0;                                                     // (floating gently down; she steps off once she touches the ground)
    }
  }
  function flyArea(x, z) {                                            // (anywhere within a short way of land)
    if (walkable(x, z) || inLake(x, z)) return true;
    for (var a = 0; a < 8; a++) if (walkable(x + Math.cos(a * Math.PI / 4) * 5, z + Math.sin(a * Math.PI / 4) * 5)) return true;
    return false;
  }
  window.addEventListener('keydown', function (e) { if (e.code === 'KeyB' && !e.repeat) toggleFlying(); });
  window.addEventListener('keydown', function (e) { if (flying && (e.code === 'ShiftLeft' || e.code === 'ShiftRight')) keys.FlyDown = true; });
  window.addEventListener('keyup', function (e) { if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.FlyDown = false; });
  // ---------- Going in through a door ----------
  // Outside, walking up to a door no longer takes you in: stand by it and press E (or tap Interact) to go in. Inside,
  // walking out through the doorway still takes you back out
  var doorNear = null, doorHinted = null, doorWasIn = false, DOOR_REACH = 1.3;
  var DOOR_NAMES = { house: 'the farmhouse', shop: 'the seed shop', clinic: 'the clinic', barn: 'Fluff & Feather', carp: 'Oak & Ember', coop: 'your coop', fbarn: 'your barn' };
  updateDoors = function () {
    var px = player.position.x, pz = player.position.z;
    if (!indoors) {                                                    // (outside: just notice which door she's standing by)
      var near = [['house', dist(px, pz, OUT_DOOR_X, OUT_DOOR_Z)], ['shop', dist(px, pz, shopDoor.x, shopDoor.z)], ['clinic', dist(px, pz, clinicDoor.x, clinicDoor.z)], ['barn', dist(px, pz, barnDoor.x, barnDoor.z)], ['carp', dist(px, pz, carpDoor.x, carpDoor.z)], ['coop', dist(px, pz, coopDoor.x, coopDoor.z)], ['fbarn', dist(px, pz, fbarnDoor.x, fbarnDoor.z) - 0.6]]
        .filter(function (n) { return n[1] < DOOR_REACH; }).sort(function (a, b) { return a[1] - b[1]; })[0];
      doorNear = near ? near[0] : null;
      if (doorWasIn) { doorHinted = doorNear; doorWasIn = false; }   // (no hint for the door she's just come out of)
      if (doorNear && doorNear !== doorHinted && !doorBusy) showToast('Press ' + (interactKey ? everdawnKeyName(interactKey) : 'E') + ' or tap Interact to go into ' + DOOR_NAMES[doorNear], 2000);
      doorHinted = doorNear; doorArmed = true;
      return;
    }
    doorWasIn = true; doorNear = doorHinted = null;                                      // (inside: walking out through the doorway takes her out, as before)
    var dShop = inShop ? dist(px, pz, SIN_X, SIN_Z + SIN_EXIT_Z) : 99, dClinic = inClinic ? dist(px, pz, CIN_X, CIN_Z + CIN_EXIT_Z) : 99, dBarn = inBarn ? dist(px, pz, AB_X, AB_Z + AB_EXIT_Z) : 99;
    if (inFbarn) { if (!doorArmed) { if (dist(px, pz, FBI_X, FBI_Z + FBI_EXIT_Z) > 0.85) doorArmed = true; return; } if (Math.abs(px - FBI_X) < 1.2 && pz > FBI_Z + FBI_EXIT_Z - 0.1) fbarnDoorUse(false); return; }   // (out of the barn)
    if (inCoop) { if (!doorArmed) { if (dist(px, pz, COI_X, COI_Z + COI_EXIT_Z) > 0.85) doorArmed = true; return; } if (dist(px, pz, COI_X, COI_Z + COI_EXIT_Z) < 0.5) coopDoorUse(false); return; }   // (out of the coop)
    if (inCarp) { if (!doorArmed) { if (dist(px, pz, CPI_X, CPI_Z + CPI_EXIT_Z) > 0.85) doorArmed = true; return; } if (dist(px, pz, CPI_X, CPI_Z + CPI_EXIT_Z) < 0.5) carpDoorUse(false); return; }   // (out of Oak & Ember)
    var d = inShop || inClinic || inBarn ? 99 : dist(px, pz, IN_X, IN_Z + EXIT_Z);
    if (!doorArmed) { if (Math.min(d, dShop, dClinic, dBarn) > 0.85) doorArmed = true; return; }   // (stepping away from the door she came in by first)
    if (d < 0.5) useDoor(false);
    else if (dShop < 0.5) useDoor(false, true);
    else if (dClinic < 0.5) useDoor(false, 'clinic');
    else if (dBarn < 0.5) useDoor(false, 'barn');
  };
  var interactOnFoot = interact;
  interact = function () {                                             // (Space climbs while she's flying; she has to land before she can work the land)
    if (flying) { if (!keys.Space) showToast('Land your broom first (B)', 1500); return; }
    if (!indoors && doorNear && !doorBusy && !binOpen && !shopOpen && !barnShopOpen) {   // (by a door: in she goes)
      var which = doorNear; doorNear = null; walkTarget = null;
      if (which === 'carp') carpDoorUse(true); else if (which === 'coop') coopDoorUse(true); else if (which === 'fbarn') fbarnDoorUse(true); else useDoor(true, which === 'shop' ? true : which === 'house' ? undefined : which);
      return;
    }
    return interactOnFoot.apply(this, arguments);
  };
  (function () {                                                       // (a Fly button beside the others, for tapping)
    var row = document.querySelector('.controls'); if (!row) return;
    var b = document.createElement('button'); b.id = 'btnFly'; b.type = 'button'; b.innerHTML = '🧹 Fly <kbd>B</kbd>';
    row.insertBefore(b, row.children[2] || null);
    b.addEventListener('click', function () { toggleFlying(); focusGame(); });
    var help = document.querySelector('.help'); if (help) help.insertAdjacentHTML('beforeend', ' · <b>B</b> hops on your broom (outdoors): <b>Space</b> flies higher, <b>Shift</b> lower');
  })();
  function updateFlying(dt) {
    if (!flying) return;
    if (indoors) { flying = false; flyH = flyGoal = 0; return; }       // (carried home, or through a door: off the broom)
    if (flyGoal > 0) flyGoal = THREE.MathUtils.clamp(flyGoal + ((keys.Space ? 1 : 0) - (keys.FlyDown ? 1 : 0)) * 3 * dt, FLY_MIN, FLY_MAX);
    flyH += (flyGoal - flyH) * Math.min(1, dt * 2.2);
    if (flyGoal === 0 && flyH < 0.04) { flying = false; flyH = 0; burst(player.position.x, player.position.y + 0.2, player.position.z, 0xffd6f5, 10, 1.2, 0.6, -2); return; }
    flyTrail -= dt;
    if (flyTrail <= 0) {                                               // (a little trail of sparkles off the end of her bristles)
      flyTrail = 0.07;
      burst(player.position.x - Math.sin(facing) * 0.55, player.position.y + 0.4, player.position.z - Math.cos(facing) * 0.55, [0xffd6f5, 0xfff2a8, 0xc8b8ff][Math.floor(Math.random() * 3)], 2, 0.35, 0.15, -0.4);
    }
  }
  function updatePlayer(dt) {
    var forward = (upHeld() ? 1 : 0) - (downHeld() ? 1 : 0);
    var side = (rightHeld() ? 1 : 0) - (leftHeld() ? 1 : 0);
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
      player.position.x += mx * (flying ? FLY_SPEED : SPEED) * dt;
      player.position.z += mz * (flying ? FLY_SPEED : SPEED) * dt;

      if (flying) {                                                    // (in the air: over the land, the lake and just out over the sea, brushing past only what's tall enough to reach her)
        if (!flyArea(player.position.x, player.position.z)) {
          if (flyArea(player.position.x, beforeZ)) player.position.z = beforeZ;
          else if (flyArea(beforeX, player.position.z)) player.position.x = beforeX;
          else { player.position.x = beforeX; player.position.z = beforeZ; }
        }
        if (flyH < 2.2) solids.forEach(function (o) {
          if (o.young) return;                                        // (still small after being cut down: you go right over it)
          var dx = player.position.x - o.x, dz = player.position.z - o.z, d = Math.hypot(dx, dz), min = o.r + 0.35;
          if (d < min && d > 0.0001) { player.position.x = o.x + dx / d * min; player.position.z = o.z + dz / d * min; }
        });
      } else if (indoors) { // inside the farmhouse or the seed shop: stay between the walls and bump into the furniture
        var rx0 = inFbarn ? FBI_X : inCoop ? COI_X : inCarp ? CPI_X : inBarn ? AB_X : inClinic ? CIN_X : inShop ? SIN_X : IN_X, rz0 = inFbarn ? FBI_Z : inCoop ? COI_Z : inCarp ? CPI_Z : inBarn ? AB_Z : inClinic ? CIN_Z : inShop ? SIN_Z : IN_Z;
        var hw = (inFbarn ? FBARN_BW : inCoop ? COOP_BW : inCarp ? CPI_W : inBarn ? AB_W : inClinic ? CIN_W : inShop ? SIN_W : ROOM_W) / 2 - 0.45, hd = (inFbarn ? FBARN_BD : inCoop ? COOP_BD : inCarp ? CPI_D : inBarn ? AB_D : inClinic ? CIN_D : inShop ? SIN_D : ROOM_D) / 2 - 0.45;
        player.position.x = Math.max(rx0 - hw, Math.min(rx0 + hw, player.position.x));
        player.position.z = Math.max(rz0 - hd, Math.min(rz0 + hd, player.position.z));
        (inFbarn ? fbarnSolids : inCoop ? coopSolids : inCarp ? carpSolids : inBarn ? abSolids : inClinic ? ciSolids : inShop ? shopInSolids : inSolids).forEach(function (o) {
          var dx = player.position.x - (rx0 + o[0]), dz = player.position.z - (rz0 + o[1]);
          var d = Math.hypot(dx, dz), min = o[2] + 0.35;
          if (d < min && d > 0.0001) {
            player.position.x = rx0 + o[0] + dx / d * min;
            player.position.z = rz0 + o[1] + dz / d * min;
          }
        });
      } else {
      if (!walkable(player.position.x, player.position.z)) {        // stay on the land and the bridge: slide along the edge
        if (walkable(player.position.x, beforeZ)) player.position.z = beforeZ;
        else if (walkable(beforeX, player.position.z)) player.position.x = beforeX;
        else { player.position.x = beforeX; player.position.z = beforeZ; }
      }
      solids.forEach(function (o) {
        if (o.young) return;                                          // (still small after being cut down: you go right over it)
        var dx = player.position.x - o.x, dz = player.position.z - o.z;
        var d = Math.hypot(dx, dz), min = o.r + 0.35;
        if (d < min && d > 0.0001) {
          player.position.x = o.x + dx / d * min;
          player.position.z = o.z + dz / d * min;
        }
      });
      }
      // No walking on water: slide along the shore instead
      if (!indoors && !flying && inLake(player.position.x, player.position.z)) {
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
    var footY = indoors ? 0 : onDock(player.position.x, player.position.z) ? DOCK_Y : onBridge(player.position.x, player.position.z) ? Math.max(groundHeight(player.position.x, player.position.z), bridgeY(player.position.z)) : onBridge2(player.position.x, player.position.z) ? Math.max(groundHeight(player.position.x, player.position.z), bridgeY(-player.position.x)) : groundHeight(player.position.x, player.position.z) + porchHeight(player.position.x, player.position.z) + shopStepHeight(player.position.x, player.position.z) + clinicStepHeight(player.position.x, player.position.z) + barnRampHeight(player.position.x, player.position.z); // up the porch, shop and clinic steps, the barn's ramp, and over the bridge
    var stepUp = footY - player.position.y;                             // ease up and down steps instead of popping, but snap after a door or a teleport
    player.position.y = Math.abs(stepUp) > 0.5 ? footY : player.position.y + stepUp * Math.min(1, dt * 16);
    updateFlying(dt);
    flySpeed += ((flying && moving ? 1 : 0) - flySpeed) * Math.min(1, dt * 3);
    if (flying || flyH > 0) {
      player.position.y = Math.max(footY, WATER_Y) + flyH;
      body.position.y = Math.sin(state.time * 2.2) * 0.05;
      body.rotation.z = (typeof turn === 'number' ? -THREE.MathUtils.clamp(turn, -0.6, 0.6) * 0.5 : 0) * 0.6 + body.rotation.z * 0.4;   // (leaning into her turns)
      body.rotation.x = -flySpeed * 0.12;                              // (and a little forward as she picks up speed)
    } else {
      body.rotation.x = 0;
    body.position.y *= 0.8; body.rotation.z *= 0.8;                    // (her walk does its own rising and swaying now: see witchLook)
    }
    hatStar.rotation.y += dt * 2;
    witchLook(dt, moving);
  }

  function updateCrops(dt, night) {
    tiles.forEach(function (tile) {
      if (!tile.crop) return;
      if (tile.wet && tile.wetDay !== farmDay()) {   // 6 am: a crop that was watered yesterday grows a day, then the soil dries out
        setWet(tile, false);
        if (tile.stage < 3) {
          tile.growth = Math.min(GROW_DAYS, tile.growth + 1); // tile.growth counts the watered days so far
          var newStage = STAGE_ON_DAY[tile.growth];
          if (newStage !== tile.stage) {
            tile.stage = newStage;
            showStage(tile);
            burst(tile.x, 0.7, tile.z, tile.stage === 3 ? 0xffb3e6 : 0x9be08a, tile.stage === 3 ? 14 : 6, 1.2, 1.6, -2);
          }
        }
      }
      tile.crop.rotation.z = Math.sin(state.time * 1.6 + tile.x * 1.3 + tile.z) * 0.05;
      tile.drop.visible = !tile.wet && tile.stage < 3;
      tile.drop.position.y = 1 + Math.sin(state.time * 3 + tile.x) * 0.08;
    });
    M.petal.emissiveIntensity = 0.3 + night * 0.6 + Math.sin(state.time * 3) * 0.1;
    cropPetalMat.emissiveIntensity = 0.2 + night * 0.5 + Math.sin(state.time * 3) * 0.08; // moonblooms glow brighter at night
    cropGlowMat.opacity = 0.3 + night * 0.4;
  }

  function updateWorld(dt, night) {
    var t = state.time;

    // Dawn Tree glow and mana
    var pulse = 0.5 + Math.sin(t * 2) * 0.5;
    updateDawnTree(dt, t, night, pulse);
    groundPetalMat.emissiveIntensity = 0.35 + night * 0.65 + Math.sin(t * 1.5) * 0.06; // the fallen petals glow, brighter at night
    petalGlowMat.opacity = 0.18 + night * 0.35 + Math.sin(t * 2.3) * 0.05;
    updateFallingPetals(dt, t);
    updateHouse(dt, t, night);
    var sp = sparkles.geometry.attributes.position;
    for (var i = 0; i < 40; i++) {
      var a = i * 2.4 + t * (0.3 + (i % 5) * 0.12), r = 1.6 + (i % 7) * 0.4;
      sp.setXYZ(i, Math.cos(a) * r, 1 + (i % 9) * 0.7 + Math.sin(t * 1.5 + i) * 0.3, Math.sin(a) * r);
    }
    sp.needsUpdate = true;

    var inZone = dist(player.position.x, player.position.z, TREE_X, TREE_Z) < TREE_ZONE;
    state.inTreeZone = inZone;
    var manaBefore = state.mana;
    state.mana = Math.min(MAX_MANA, state.mana + (inZone ? 32 : 1.5) * dt);
    if (inZone && manaBefore < MAX_MANA) {                          // the Dawn Tree is filling you up
      manaFillSound(state.mana / MAX_MANA, dt);
      if (state.mana >= MAX_MANA) manaFullSound();
    } else manaChimeT = 0;
    ui.mana.style.width = (state.mana / MAX_MANA * 100).toFixed(1) + '%';
    var manaText = Math.floor(state.mana + 0.001) + ' / ' + MAX_MANA;   // the number under the bar, like 65 / 100
    if (ui.manaNum && ui.manaNum.textContent !== manaText) ui.manaNum.textContent = manaText;

    // Lake: moving water, bobbing lily pads, the odd ripple
    waterUniforms.uTime.value = t;
    waterUniforms.uNight.value = night;
    waterUniforms.uSky.value.copy(scene.background);
    waterUniforms.uSunDir.value.copy(sun.position).sub(sun.target.position).normalize();
    waterUniforms.uSunColor.value.copy(sun.color).multiplyScalar(sun.intensity);
    lilyPads.forEach(function (pad, n) {
      pad.position.y = WATER_Y + 0.01 + Math.sin(t * 1.4 + n * 1.3) * 0.008;
      pad.rotation.y += dt * 0.02 * (n % 2 ? 1 : -1);
    });
    globeMat.emissiveIntensity = 0.4 + night * 1.4;
    dockLights.forEach(function (glow) { glow.intensity = night * 1.3; });
    boat.position.y = BOAT_Y + Math.sin(t * 1.3) * 0.02; // the boat gently bobs and rocks
    boat.rotation.z = Math.sin(t * 1.1) * 0.03;
    boat.rotation.x = Math.sin(t * 0.9 + 1) * 0.02;
    updateFish(dt, t, night); // magical fish swim, glow and leap
    updateTrees(dt);          // chopped trees fall, stumps wait, and new trees grow back
    markYoungScenery();       // and until they're halfway grown back, you can walk right over them
    forestTime.value = t;     // trees sway in the breeze
    lilyFlowers.forEach(function (flower, n) {
      flower.position.y = WATER_Y + 0.03 + Math.sin(t * 1.4 + n * 2.1) * 0.008;
      flower.rotation.y += dt * 0.05;
    });
    rippleTimer -= dt;
    if (rippleTimer <= 0) {
      rippleTimer = 0.6 + Math.random() * 0.9;
      var re = lakeEdge(Math.random() * Math.PI * 2, 0, ISLAND - 1.3), rf = Math.random() * 0.7;
      var rpx = LAKE_X + re.x * rf, rpz = LAKE_Z + re.z * rf;
      if (groundHeight(rpx, rpz) < WATER_Y - 0.1) ripple(rpx, rpz, 0xffffff, 0.9, 1.6);
    }

    // Fireflies come out at night: they drift lazily, bob up and down, and blink on and off
    fireflies.visible = fireflyCores.visible = night > 0.02;
    if (fireflies.visible) {
      var fp = fireflies.geometry.attributes.position, fc = fireflies.geometry.attributes.color;
      var cp = fireflyCores.geometry.attributes.position, cc = fireflyCores.geometry.attributes.color;
      flyHome.forEach(function (h, n) {
        var fx = h.x + Math.sin(t * 0.31 + h.p) * 1.2 + Math.sin(t * 0.83 + h.p * 3) * 0.35;
        var fz = h.z + Math.cos(t * 0.27 + h.p * 1.7) * 1.2 + Math.cos(t * 0.71 + h.p * 2) * 0.35;
        var fy = Math.max(0.25, h.y + Math.sin(t * 0.9 + h.p * 2) * 0.4 + Math.sin(t * 2.3 + h.p) * 0.08);
        var blink = Math.pow(Math.max(0, Math.sin(t * (0.9 + (h.p % 1) * 0.8) + h.p * 5)), 3); // glows up, then fades out
        var b = Math.min(1, night * 1.4) * (0.1 + blink * 0.9);
        var tint = FLY_TINTS[n % 7 === 6 ? 4 + (n % 2) : n % 4];
        fp.setXYZ(n, fx, fy, fz);
        cp.setXYZ(n, fx, fy, fz);
        fc.setXYZ(n, tint.r * b, tint.g * b, tint.b * b);
        cc.setXYZ(n, (tint.r + 1) * 0.5 * b, (tint.g + 1) * 0.5 * b, (tint.b + 1) * 0.5 * b);
      });
      fp.needsUpdate = fc.needsUpdate = cp.needsUpdate = cc.needsUpdate = true;
    }

    // Highlight the tile in front of you
    var tile = targetTile();
    if (tileHighlightOff) tile = null;                                 // ("Tile Highlight While Moving" in Settings: Enabled marks the tile in front of you wherever you go, Disabled shows no marker at all)
    cursor.visible = !!tile;
    if (tile) {
      cursor.position.x = tile.x;
      cursor.position.z = tile.z;
      cursor.material.opacity = 0.45 + Math.sin(t * 5) * 0.25;
      cursor.material.color.set(tile.crop && tile.stage === 3 ? 0xffb3e6 : tile.crop && !tile.wet ? 0x8ec5ff : 0xffffff);
    }
  }

  var spellTime = 0;
  function updateEffects(dt) {
    spellTime += dt;
    updateSpellSparks(dt, spellTime);
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
    camGoal.set(player.position.x, 0.8 + flyH, player.position.z);
    cam.target.lerp(camGoal, calmMotion ? 1 : 1 - Math.exp(-dt * 6));   // ("Enable Excessive Animations" set to No: the camera stays right with you, never trailing or swooping)
    var d = camClear(dt);                                              // (outdoors, it comes in in front of a wall or roof rather than going through it)
    var flat = Math.cos(cam.pitch) * d;
    camera.position.set(
      cam.target.x + Math.sin(cam.yaw) * flat,
      cam.target.y + Math.sin(cam.pitch) * d,
      cam.target.z + Math.cos(cam.yaw) * flat
    );
    camera.lookAt(cam.target);
  }
  // Outdoors, the camera never ends up inside a building looking at its hollow insides: if it would, it slides in to
  // just in front of the wall it went through, and once it's clear again it eases back out. (It's inside when there's
  // a wall between you and it and a roof right over it.) Looking over a building from the far side stays as it is
  var camMats = [], camRay = new THREE.Raycaster(), camDir = new THREE.Vector3(), camFrom = new THREE.Vector3(), camUp = new THREE.Vector3(0, 1, 0), camWalls = [], camWallsAt = -1, camDistNow = null, camSize = new THREE.Vector3();
  function camWallList() {                                             // (the big pieces of every building outside: walls, roofs, logs; not the little props, rails or glass)
    var list = [];
    [house, shopGroup, clinicGroup, barnGroup, carpGroup, coopGroup, fbarnGroup, millGroup, siloGroup].forEach(function (g) {
      if (!g || !g.parent) return;
      g.updateMatrixWorld(true);
      g.traverse(function (o) {
        if (!o.isMesh || !o.geometry) return;
        var m = Array.isArray(o.material) ? o.material[0] : o.material;
        if (!m || m.depthWrite === false && m.blending === THREE.AdditiveBlending) return;   // (not glows; glass and doors count, so it can't slip in through a window)
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        o.getWorldScale(camSize); var bb = o.geometry.boundingBox;
        var e = [(bb.max.x - bb.min.x) * Math.abs(camSize.x), (bb.max.y - bb.min.y) * Math.abs(camSize.y), (bb.max.z - bb.min.z) * Math.abs(camSize.z)].sort(function (p, q) { return q - p; });
        if (e[1] >= 0.3) list.push(o);                                 // (at least as wide as a log both ways)
      });
    });
    var houseMats = Object.keys(houseByMat).map(function (k) { return houseByMat[k].mat; });   // (the farmhouse's still parts were joined into a few meshes of their own)
    scene.children.forEach(function (o) { if (o.isMesh && houseMats.indexOf(o.material) >= 0) list.push(o); });
    camMats = [];                                                      // (every material they use, so the camera's checks can see both sides of a wall or roof)
    list.forEach(function (o) { (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { if (camMats.indexOf(m) < 0) camMats.push(m); }); });
    return list;
  }
  var camHid = false;
  function camHideMe(on) { if (on === camHid) return; camHid = on; player.visible = !on; }
  function camFirstHit(from, dir, far) {
    camRay.set(from, dir); camRay.near = 0.05; camRay.far = far;
    var sides = camMats.map(function (m) { var sd = m.side; m.side = THREE.DoubleSide; return sd; });   // (from inside, a wall or roof is only drawn from its outside, so check both faces)
    var hits = camRay.intersectObjects(camWalls, false);
    camMats.forEach(function (m, i) { m.side = sides[i]; });
    for (var i = 0; i < hits.length; i++) if (hits[i].object.visible && hits[i].object.parent && hits[i].object.parent.visible !== false) return hits[i].distance;
    return -1;
  }
  function camClear(dt) {
    var want = cam.dist, fit = want;
    if (indoors) { camDistNow = want; camHideMe(false); return want; }
    if (camWallsAt < 0 || state.time - camWallsAt > 2 || state.time < camWallsAt) { camWalls = camWallList(); camWallsAt = state.time; }
    camDir.set(Math.sin(cam.yaw) * Math.cos(cam.pitch), Math.sin(cam.pitch), Math.cos(cam.yaw) * Math.cos(cam.pitch));
    var out = camFirstHit(cam.target, camDir, want);                   // (the first wall or roof on the way out to the camera...)
    if (out > 0) {
      camFrom.copy(cam.target).addScaledVector(camDir, want);
      if (camFirstHit(camFrom, camUp, 12) > 0) fit = Math.max(0.25, out - 0.2);   // (...and if there's a roof right over the camera, it's inside: bring it in front of that wall, however close that is)
    }
    if (camDistNow === null || fit < camDistNow) camDistNow = fit;       // (straight in, so it's never seen poking through)
    else camDistNow += (fit - camDistNow) * (1 - Math.exp(-dt * 4));   // (and gently back out)
    camHideMe(camDistNow < 0.75);                                      // (right up against a wall, the camera is almost in her hat: she steps out of view for a moment)
    return camDistNow;
  }

  // ---------- Saving and loading ----------
  // Your game is kept in this browser (localStorage): your bag, the time and day, mana, harvests,
  // the garden, which trees, bushes and rocks are cut down and when, and where you're standing
  var SAVE_KEY = 'everdawn-save-1';                                    // (slot 1: the save slot you pick on the title screen changes this)
  function saveGame(quiet) {
    var px = player.position.x, pz = player.position.z;
    if (indoors) { px = OUT_DOOR_X; pz = OUT_DOOR_Z + 1.0; }          // saved inside the house? you'll load in at the front door
    if (inShop) { var so = shopFront(2.0); px = so.x; pz = so.z; }    // saved inside the shop? you'll load in outside its door
    if (inClinic) { var co = clinicFront(2.3); px = co.x; pz = co.z; } // and the same for the clinic
    if (inBarn) { var bo = animalFront(1.6); px = bo.x; pz = bo.z; }  // and Fluff & Feather
    if (inCarp) { var cpo = carpFront(1.8); px = cpo.x; pz = cpo.z; } // and Oak & Ember
    if (inCoop) { var coo = coopFront(1.8); px = coo.x; pz = coo.z; } // and your coop
    if (inFbarn) { var fbo = fbarnFront(2.0); px = fbo.x; pz = fbo.z; } // and your barn
    var data = {
      v: 1, savedAt: Date.now(), name: saveName,                      // (the name you gave this save)
      state: { mana: state.mana, stamina: state.stamina, harvest: state.harvest, coins: state.coins, minutes: state.minutes, day: state.day, petalDay: state.petalDay },
      bag: bag, selectedSlot: selectedSlot, hotRow: hotRow,
      player: { x: px, z: pz, facing: facing },
      shipBin: shipBin,
      farm: tiles.filter(function (t) { return t.soil; }).map(function (t) { return { c: t.c, r: t.r, crop: !!t.crop, stage: t.stage || 0, growth: t.growth || 0, wet: !!t.wet }; }),
      scenery: allScenery.map(function (t) {                          // when each tree or bush was cut (null = standing)
        var u = t.userData;
        if (u.state === 'standing' || u.gone) return null;
        return u.state === 'regrowing' ? u.felledAt : gameMinutes();
      }),
      rocks: mineable.map(function (r) { return r.state === 'whole' || r.gone ? null : (r.state === 'regrowing' ? r.brokeAt : gameMinutes()); }),
      glimmers: glimmerSaveData(),                                    // your Glimmerwings
      coop: coopSaveData(),                                           // your coop: where it stands, and the hay on its bench
      fbarn: fbarnSaveData(),                                         // and the same for your barn
      mill: millSaveData(),                                           // your mill: where it is, and the day Oak & Ember started on it
      silo: siloSaveData()                                            // your silo: where it is, when Oak & Ember started on it, and how much hay is in it
    };
    var before = null; try { before = localStorage.getItem(SAVE_KEY); } catch (err) {}   // (what was in the slot until now, in case it's a day to keep as a backup)
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      keepBackup(before, data.state.day);
      if (!quiet) showToast('Game saved ✦');
    } catch (err) {
      showToast('Could not save here (this browser blocks saving)', 3000);
    }
  }
  // Day backups: when you save on a new day, the last save from the day before is kept as a backup of that slot (the
  // three most recent days are kept). With "Show Backup" set to Yes in Settings, the title screen lets you go back to
  // one of them. Backups are always kept, so turning it on later still finds them
  var BACKUPS_KEPT = 3;
  function keepBackup(raw, today) {
    var old = null; try { old = JSON.parse(raw); } catch (err) {}
    if (!old || old.v !== 1 || !old.state || !(old.state.day < today)) return;
    var key = SAVE_KEY + '-backups', list = [];
    try { list = JSON.parse(localStorage.getItem(key)) || []; } catch (err) {}
    list = [old].concat(list.filter(function (b) { return b && b.state && b.state.day !== old.state.day; })).slice(0, BACKUPS_KEPT);
    while (list.length) { try { localStorage.setItem(key, JSON.stringify(list)); return; } catch (err) { list.pop(); } }   // (short of room? keep fewer)
  }
  function clearTile(tile) {
    if (tile.crop) { scene.remove(tile.crop); tile.crop = null; }
    if (tile.drop) { scene.remove(tile.drop); tile.drop = null; }
    if (tile.soil) { scene.remove(tile.soil); tile.soil = null; uncoverGrass(tile); }
    var ti = tilling.indexOf(tile);
    if (ti >= 0) tilling.splice(ti, 1);
    tile.wet = false; tile.stage = 0; tile.growth = 0;
  }
  rwGlassMat.map = siGlassTex; rwGlassMat.needsUpdate = true;         // (Fluff & Feather's round window gets its glass now that the glass is made)
  // ---------- The seasons ----------
  // The year has four seasons of 28 days each: Spring, Summer, Fall and Winter, and then it's Spring again. The day
  // counter says the day of the week, which season it is and how far into it you are ("Monday · Spring, Day 1" up to
  // "Sunday · Spring, Day 28", then "Monday · Summer, Day 1"), and the morning a new season starts, a message says so
  var SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'], SEASON_DAYS = 28;
  var SEASON_NEWS = ['🌸 Spring has arrived! Blossoms and fresh green shoots everywhere.', '☀ Summer has arrived! Long, warm, golden days.', '🍂 Fall has arrived! Crisp air and leaves of red and gold.', '❄ Winter has arrived! Frosty mornings and cozy evenings.'];
  function seasonOf(day) { return Math.floor((day - 1) / SEASON_DAYS) % SEASONS.length; }   // (0: Spring, 1: Summer, 2: Fall, 3: Winter)
  function seasonDayNum(day) { return (day - 1) % SEASON_DAYS + 1; }  // (1 to 28)
  function seasonDay(day) { return SEASONS[seasonOf(day)] + ', Day ' + seasonDayNum(day); }   // ("Spring, Day 1")
  var WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];   // (every season is four whole weeks, so each one starts on a Monday)
  function weekdayOf(day) { return WEEKDAYS[(day - 1) % 7]; }
  function fullDay(day) { return weekdayOf(day) + ', ' + seasonDay(day); }   // ("Monday, Spring, Day 1")
  var seasonLastDay = state.day, seasonNewsDue = false;
  updateClock = function (dt) {
    state.minutes += dt * GAME_MINUTES_PER_SECOND;
    if (state.minutes >= 24 * 60) { state.minutes -= 24 * 60; state.day += 1; }
    var text = clockText(state.minutes);
    if (ui.clock.textContent !== text) ui.clock.textContent = text;
    var dayText = weekdayOf(state.day) + ' \u00b7 ' + seasonDay(state.day);   // ("Monday · Spring, Day 1")
    if (ui.day.textContent !== dayText) ui.day.textContent = dayText;
    if (state.day !== seasonLastDay) {                                 // (a new day: by the clock, or by sleeping, but not by loading a save)
      if (state.day === seasonLastDay + 1 && seasonDayNum(state.day) === 1) seasonNewsDue = true;
      seasonLastDay = state.day;
    }
    if (seasonNewsDue && !sleeping && state.minutes >= 6 * 60) {       // (said in the morning, once you're up)
      seasonNewsDue = false;
      var sn = SEASON_NEWS[seasonOf(state.day)];
      setTimeout(function () { showToast(sn + ' ' + fullDay(state.day) + '.', 4600); }, 3000);
    }
  };
  (function () {                                                      // (on a phone, the coins, time, mana and stamina wrap onto two lines instead of running off the edge)
    var st = document.createElement('style'); st.textContent = '@media (max-width: 640px) { .stats { flex-wrap: wrap !important; row-gap: 6px; } }'; document.head.appendChild(st);
  })();
  var seasonBaseToast = showToast;                                    // (the good-morning messages say the season too: "☀ Spring, Day 2")
  showToast = function (message, ms) {
    if (typeof message === 'string') message = message.replace(/☀ Day (\d+)/, function (m, n) { return '☀ ' + fullDay(+n); });
    return seasonBaseToast.call(this, message, ms);
  };

  // ---------- Spring on the island ----------
  // While it's Spring, the island looks it: many of the broadleaf trees (and some of the bushes) are covered in pink,
  // white and rose blossom, patches of tulips and daffodils come up in the meadows, and on fine days a few loose
  // petals drift down through the air around you. The blossom moves with its tree, so it falls with a chopped tree,
  // grows back with it, and shudders with it when you swing your axe. Out of Spring it's all tucked away
  function springHash(n) { var v = Math.sin(n * 78.233 + 1.7) * 43758.5453; return v - Math.floor(v); }
  function springNow() { return seasonOf(state.day) === 0; }
  // ===== blossom on the trees =====
  var springBlossomTex = (function () {                                // (a little spray of blossom, white so each card can be tinted: open five-petalled
    var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d');   //  flowers with notched petals, pink veins and stamens, plump buds, and a few new leaves)
    function leaf(x, y, a, L) { g.save(); g.translate(x, y); g.rotate(a); var gr = g.createLinearGradient(0, 0, L, 0); gr.addColorStop(0, '#6aa848'); gr.addColorStop(1, '#9ad070'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(L * 0.5, -L * 0.32, L, 0); g.quadraticCurveTo(L * 0.5, L * 0.32, 0, 0); g.fill(); g.strokeStyle = 'rgba(60,110,40,0.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 0); g.lineTo(L * 0.9, 0); g.stroke(); g.restore(); }
    function bud(x, y, a, r) { g.save(); g.translate(x, y); g.rotate(a); var gr = g.createRadialGradient(-r * 0.3, -r * 0.4, 1, 0, 0, r * 1.3); gr.addColorStop(0, '#fff4f8'); gr.addColorStop(1, '#e89ab8'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, -r * 0.3, r * 0.75, r * 1.05, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#6a9a48'; g.beginPath(); g.moveTo(-r * 0.7, r * 0.3); g.quadraticCurveTo(0, r * 1.4, r * 0.7, r * 0.3); g.quadraticCurveTo(0, r * 0.7, -r * 0.7, r * 0.3); g.fill(); g.restore(); }
    function flower(cx, cy, r, a0) {
      for (var p = 0; p < 5; p++) {
        var a = a0 + p / 5 * Math.PI * 2; g.save(); g.translate(cx, cy); g.rotate(a);
        var gr = g.createLinearGradient(0, 0, r, 0); gr.addColorStop(0, '#f0b8cc'); gr.addColorStop(0.35, '#fff2f6'); gr.addColorStop(1, '#ffffff');
        g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0);
        g.bezierCurveTo(r * 0.3, -r * 0.55, r * 0.95, -r * 0.5, r, -r * 0.12); g.lineTo(r * 0.86, 0); g.lineTo(r, r * 0.12);   // (the little notch at its tip)
        g.bezierCurveTo(r * 0.95, r * 0.5, r * 0.3, r * 0.55, 0, 0); g.fill();
        g.strokeStyle = 'rgba(214,120,150,0.35)'; g.lineWidth = 0.8; [-0.18, 0, 0.18].forEach(function (v) { g.beginPath(); g.moveTo(r * 0.12, 0); g.quadraticCurveTo(r * 0.5, v * r * 0.6, r * 0.8, v * r * 1.1); g.stroke(); });
        g.restore();
      }
      g.fillStyle = '#c8d870'; g.beginPath(); g.arc(cx, cy, r * 0.16, 0, Math.PI * 2); g.fill();
      for (var s = 0; s < 12; s++) { var sa = s / 12 * Math.PI * 2 + a0, sl = r * (0.36 + (s % 3) * 0.06); g.strokeStyle = 'rgba(220,150,170,0.9)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(sa) * sl, cy + Math.sin(sa) * sl); g.stroke(); g.fillStyle = '#f2b830'; g.beginPath(); g.arc(cx + Math.cos(sa) * sl, cy + Math.sin(sa) * sl, 1.5, 0, Math.PI * 2); g.fill(); }
    }
    for (var l = 0; l < 4; l++) leaf(40 + springHash(l * 4.1) * 170, 40 + springHash(l * 6.3) * 170, springHash(l * 2.2) * 6.28, 30 + springHash(l) * 16);
    for (var b = 0; b < 5; b++) bud(30 + springHash(b * 8.3 + 1) * 196, 30 + springHash(b * 3.9 + 2) * 196, springHash(b * 1.7) * 6.28, 7 + springHash(b * 5.5) * 4);
    for (var f = 0; f < 8; f++) flower(44 + springHash(f * 3.1) * 168, 44 + springHash(f * 7.7) * 168, 20 + springHash(f * 5.3) * 12, springHash(f) * 6.28);
    var t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
  })();
  var springBlossoms = foliageBatch(new THREE.PlaneGeometry(1, 1), springBlossomTex, 16000);
  var springBlossomM = new THREE.Matrix4();
  scene.add(springBlossoms);
  (function () {
    var m = new THREE.Matrix4(), rot = new THREE.Matrix4(), sc = new THREE.Matrix4(), off = new THREE.Matrix4(), cur = new THREE.Matrix4(), inv = new THREE.Matrix4(), p = new THREE.Vector3(), mid = new THREE.Vector3(), col = new THREE.Color();
    var TINTS = [[1, 0.72, 0.84], [1, 0.8, 0.9], [1, 0.62, 0.78], [1, 0.95, 0.97], [1, 0.76, 0.88]];
    allScenery.forEach(function (t, ti) {
      var u = t.userData, tree = choppable.indexOf(t) >= 0;
      if (u.gone || (tree && !u.leafy) || !u.leaves || !u.leafOrig) return;
      if (springHash(ti * 1.37) > (tree ? 0.62 : 0.4)) return;          // (not every tree blossoms)
      var tint = TINTS[Math.floor(springHash(ti * 2.9) * TINTS.length)], start = springBlossoms.count, orig = [];
      u.leaves.forEach(function (L, n) {
        if (L.batch !== leafBatch || !L.count) return;
        var o = u.leafOrig[n]; mid.set(0, 0, 0);
        for (var i = 0; i < L.count; i++) { p.set(o[i * 16 + 12], o[i * 16 + 13], o[i * 16 + 14]); mid.add(p); }
        mid.multiplyScalar(1 / L.count);
        for (var j = 0; j < L.count; j++) {
          if (springHash(ti * 31 + n * 7 + j * 1.91) > 0.75 || springBlossoms.count >= springBlossoms.instanceMatrix.count) continue;
          m.fromArray(o, j * 16); p.set(o[j * 16 + 12], o[j * 16 + 13], o[j * 16 + 14]).sub(mid);
          if (p.y < -0.25 * (u.size || 1)) continue;                    // (blossom on the outside and the top of the canopy, not underneath)
          p.normalize().multiplyScalar(0.1 * (u.size || 1));
          m.premultiply(off.makeTranslation(p.x, p.y + 0.03, p.z)).multiply(rot.makeRotationZ(springHash(j * 5.1) * 6.28)).multiply(sc.makeScale(0.9, 0.9, 0.9));
          orig.push.apply(orig, m.toArray());
          var k = 0.92 + springHash(j * 2.3) * 0.12; col.setRGB(tint[0] * k, tint[1] * k, tint[2] * k);
          springBlossoms.setMatrixAt(springBlossoms.count, m); springBlossoms.setColorAt(springBlossoms.count, col); springBlossoms.count++;
        }
      });
      var count = springBlossoms.count - start; if (!count) return;
      u.blossoms = { start: start, count: count, orig: orig };
      // (if the tree is already cut down or growing back, its blossom starts out the same way)
      var L0 = u.leaves[0];
      if (L0 && L0.count) { cur.fromArray(L0.batch.instanceMatrix.array, L0.start * 16); inv.fromArray(u.leafOrig[0], 0).invert(); springBlossomMove(u, cur.multiply(inv)); }
    });
    springBlossoms.instanceMatrix.needsUpdate = true; if (springBlossoms.instanceColor) springBlossoms.instanceColor.needsUpdate = true;
  })();
  function springBlossomMove(u, M) {
    var B = u.blossoms, arr = springBlossoms.instanceMatrix.array, m = springBlossomM;
    for (var i = 0; i < B.count; i++) { m.fromArray(B.orig, i * 16).premultiply(M); m.toArray(arr, (B.start + i) * 16); }
    markDirty(springBlossoms.instanceMatrix, B.start * 16, B.count * 16);
  }
  var springBaseTreeTransform = setTreeTransform;                     // (the blossom goes wherever its tree goes)
  setTreeTransform = function (t, M, which) {
    springBaseTreeTransform(t, M, which);
    if (which !== 'ground' && t.userData.blossoms) springBlossomMove(t.userData, M);
  };
  // ===== tulips and daffodils in the meadows =====
  var SPRING_FLOWERS = [], SPRING_CLUMPS = [], springFlowerMesh = [], springFlowerShown = null;
  (function () {
    // (each patch is one kind: tulips in red, pink, white, purple or orange; daffodils in yellow or cream with a deeper trumpet; or low crocuses)
    var KINDS = [
      { kind: 'tulip', cols: [0xe8404e, 0xf05a6a], h: 0.34 }, { kind: 'tulip', cols: [0xff8fb0, 0xffb4cc], h: 0.34 }, { kind: 'tulip', cols: [0xfff2f6, 0xffe0ea], h: 0.34 },
      { kind: 'tulip', cols: [0xa070e0, 0xb48af0], h: 0.34 }, { kind: 'tulip', cols: [0xff9a4a, 0xffb060], h: 0.34 },
      { kind: 'daff', cols: [0xffe46a, 0xf6d24a], trumpet: 0xf09a20, h: 0.36 }, { kind: 'daff', cols: [0xfff6d8, 0xfff0c0], trumpet: 0xf6c030, h: 0.36 },
      { kind: 'crocus', cols: [0x9a6ad8, 0xb890f0, 0xfff4fa, 0xf8d050], h: 0.1 }
    ];
    for (var c = 0, tries = 0; c < 80 && tries < 5000; tries++) {
      var cx = -ISLAND + 3 + springHash(tries * 3.7 + 11) * (ISLAND * 2 - 6), cz = -ISLAND + 3 + springHash(tries * 5.3 + 7) * (ISLAND * 2 - 6);
      if (!springFlowerSpot(cx, cz, 1.0)) continue;
      c++; SPRING_CLUMPS.push({ x: cx, z: cz, y: groundHeight(cx, cz) });
      var K = KINDS[Math.floor(springHash(c * 9.1) * KINDS.length)], n = (K.kind === 'crocus' ? 9 : 6) + Math.floor(springHash(c * 4.4) * 7);
      for (var f = 0; f < n; f++) {
        var a = springHash(c * 17 + f * 3.3) * 6.28, r = 0.12 + springHash(c * 13 + f * 1.7) * (K.kind === 'crocus' ? 0.45 : 0.55), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
        if (!springFlowerSpot(x, z, 0.3)) continue;
        SPRING_FLOWERS.push({ x: x, z: z, y: groundHeight(x, z), kind: K.kind, h: K.h + springHash(c * 7 + f) * K.h * 0.4, rot: springHash(c * 3 + f * 5) * 6.28, tilt: (springHash(c + f * 11) - 0.5) * 0.25,
          col: K.cols[Math.floor(springHash(c * 2 + f * 1.3) * K.cols.length)], trumpet: K.trumpet, open: springHash(c * 5 + f * 2.1) });
      }
    }
    // (a stem; and a long strap leaf that arches outward and narrows to its tip)
    var stemGeo = new THREE.CylinderGeometry(0.009, 0.013, 1, 6); stemGeo.translate(0, 0.5, 0);
    var leafGeo = new THREE.PlaneGeometry(0.05, 0.3, 1, 8), lp = leafGeo.attributes.position;
    for (var v = 0; v < lp.count; v++) { var ly = lp.getY(v) + 0.15, t = ly / 0.3; lp.setXYZ(v, lp.getX(v) * (1 - t * 0.75), ly * (1 - t * 0.25), t * t * 0.11); }
    leafGeo.computeVertexNormals();
    // (a tulip: an inner and an outer ring of three curved petals, making a deep cup)
    var tulipParts = [];
    for (var pp = 0; pp < 6; pp++) {
      var inner = pp % 2, pr = inner ? 0.041 : 0.045, pg = new THREE.SphereGeometry(pr, 8, 8, pp / 6 * Math.PI * 2 - 0.62, 1.24, Math.PI * 0.3, Math.PI * 0.7);
      pg.scale(1, 1.45, 1); pg.translate(0, pr * 1.45, 0); tulipParts.push(pg);
    }
    var tulipGeo = mergeSimple(tulipParts);
    // (a daffodil: six pointed petals in a star, cupped forward a little, round a ruffled trumpet)
    var petal = new THREE.Shape(); petal.moveTo(0, 0); petal.quadraticCurveTo(0.017, 0.022, 0, 0.056); petal.quadraticCurveTo(-0.017, 0.022, 0, 0);
    var daffParts = [];
    for (var dp = 0; dp < 6; dp++) { var sg = new THREE.ShapeGeometry(petal, 6); sg.rotateX(-0.3); sg.rotateZ(dp / 6 * Math.PI * 2 + (dp % 2) * 0.08); daffParts.push(sg); }
    var daffGeo = mergeSimple(daffParts);
    var trumpetGeo = new THREE.LatheGeometry([[0.008, 0], [0.013, 0.012], [0.015, 0.03], [0.02, 0.042], [0.024, 0.046]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 18);
    var tp = trumpetGeo.attributes.position;
    for (var w = 0; w < tp.count; w++) if (tp.getY(w) > 0.044) { var ang = Math.atan2(tp.getZ(w), tp.getX(w)), rr = 1 + Math.sin(ang * 9) * 0.14; tp.setX(w, tp.getX(w) * rr); tp.setZ(w, tp.getZ(w) * rr); }   // (its frilly rim)
    trumpetGeo.rotateX(Math.PI / 2); trumpetGeo.computeVertexNormals();
    var mStem = new THREE.MeshStandardMaterial({ color: 0x5aa04a, roughness: 0.75, side: THREE.DoubleSide }), mLeaf = new THREE.MeshStandardMaterial({ color: 0x4f9440, roughness: 0.7, side: THREE.DoubleSide });
    var mHead = new THREE.MeshStandardMaterial({ roughness: 0.5, side: THREE.DoubleSide });
    function only(k) { return SPRING_FLOWERS.filter(function (f) { return f.kind === k; }); }
    var daffs = only('daff');
    springFlowerMesh = [
      { geo: stemGeo, m: mStem, list: SPRING_FLOWERS, part: 'stem' },
      { geo: leafGeo, m: mLeaf, list: SPRING_FLOWERS, part: 'leaf', side: 0 }, { geo: leafGeo, m: mLeaf, list: SPRING_FLOWERS, part: 'leaf', side: 1 },
      { geo: tulipGeo, m: mHead, list: only('tulip'), part: 'tulip' }, { geo: tulipGeo, m: mHead, list: only('crocus'), part: 'crocus' },
      { geo: daffGeo, m: mHead, list: daffs, part: 'daff' }, { geo: trumpetGeo, m: mHead, list: daffs, part: 'trumpet' }
    ].map(function (F) {
      F.im = new THREE.InstancedMesh(F.geo, F.m, Math.max(1, F.list.length)); F.im.castShadow = true; F.im.frustumCulled = false; scene.add(F.im);
      var col = new THREE.Color();
      F.list.forEach(function (f, i) { var k = 0.92 + f.open * 0.16; F.im.setColorAt(i, F.part === 'stem' || F.part === 'leaf' ? col.setRGB(k, k, k) : col.set(F.part === 'trumpet' ? f.trumpet : f.col)); });
      return F;
    });
  })();
  function mergeUV(geos) {                                             // (the same, keeping each shape's texture coordinates, for petals with a painted face)
    var out = mergeSimple(geos), uv = [];
    geos.forEach(function (g) { var u = g.attributes.uv; for (var i = 0; i < g.attributes.position.count; i++) uv.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0); });
    out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); return out;
  }
  function mergeSimple(geos) {                                         // (a handful of little shapes joined into one)
    var pos = [], nor = [], idx = [], off = 0;
    geos.forEach(function (g) { var p = g.attributes.position, nn = g.attributes.normal; for (var i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(nn.getX(i), nn.getY(i), nn.getZ(i)); } if (g.index) for (var k = 0; k < g.index.count; k++) idx.push(g.index.getX(k) + off); else for (var q = 0; q < p.count; q++) idx.push(q + off); off += p.count; });
    var out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); out.setIndex(idx); return out;
  }
  function springFlowerSpot(x, z, pad) {                               // (open meadow: not on a path, your fields or yard, a building, the lake or under a tree or rock)
    if (!onIsland(x, z) || inLake(x, z) || onDock(x, z) || underDock(x, z) || groundHeight(x, z) < 0) return false;
    if (pathDist(x, z) < PATH_W + 0.6 || stonePathDist(x, z) < 1.2 || inHouseYard(x, z) || dist(x, z, HOUSE_X, HOUSE_Z) < 7 || dist(x, z, TREE_X, TREE_Z) < TREE_ZONE + 2) return false;
    if (Math.abs(x - (FARM_X + COLS * TILE / 2)) < COLS * TILE / 2 + 1.5 && Math.abs(z - (FARM_Z + ROWS * TILE / 2)) < ROWS * TILE / 2 + 1.5) return false;
    for (var i = 0; i < solids.length; i++) { var sd = solids[i]; if (sd.r > 0 && Math.abs(sd.x - x) < sd.r + pad && Math.abs(sd.z - z) < sd.r + pad && dist(x, z, sd.x, sd.z) < sd.r + pad) return false; }
    return true;
  }
  function springFlowerOK(f) {                                         // (still there? not dug up into soil, built over, or under a tree that's grown back)
    var t = tileMap[tileKey(Math.floor((f.x - FARM_X) / TILE), Math.floor((f.z - FARM_Z) / TILE))];
    if (t && t.soil) return false;
    return !(coopCovers(f.x, f.z, 0.3) || fbarnCovers(f.x, f.z, 0.3) || millCovers(f.x, f.z, 0.3) || siloCovers(f.x, f.z, 0.3));
  }
  var springFlowerM = new THREE.Matrix4(), springFlowerQ = new THREE.Quaternion(), springFlowerE = new THREE.Euler(), springFlowerV = new THREE.Vector3(), springFlowerS = new THREE.Vector3(), springFlowerT = -99, springWasOn = null;
  function springFlowersPlace(show) {
    var key = SPRING_FLOWERS.map(function (f) { return show && springFlowerOK(f) ? 1 : 0; }).join('');
    if (key === springFlowerShown) return; springFlowerShown = key;
    springFlowerMesh.forEach(function (F) {
      F.list.forEach(function (f, i) {
        var k = key[SPRING_FLOWERS.indexOf(f)] === '1' ? 1 : 0;
        springFlowerE.set(f.tilt, f.rot, f.tilt * 0.6); springFlowerQ.setFromEuler(springFlowerE);   // (each stem leans a little its own way)
        springFlowerV.set(f.x, f.y, f.z);
        if (F.part === 'stem') springFlowerS.set(k, f.h * k, k);
        else if (F.part === 'leaf') {                                    // (two leaves from the base, arching out on either side)
          var big = f.kind === 'crocus' ? 0.55 : 1.1 + f.open * 0.3; springFlowerS.setScalar(k * big);
          springFlowerE.set(0.12 + f.open * 0.2, f.rot + 1.3 + F.side * Math.PI + (f.open - 0.5) * 0.6, 0, 'YXZ'); springFlowerQ.setFromEuler(springFlowerE);
        } else {                                                         // (the flower on top of its stem: tulips and crocuses upright, daffodils nodding outward)
          springFlowerV.set(0, f.h, 0).applyQuaternion(springFlowerQ).add(springFlowerS.set(f.x, f.y, f.z));
          springFlowerS.setScalar(k * (F.part === 'tulip' ? 1.7 + f.open * 0.3 : F.part === 'crocus' ? 1.25 : 2.0));
          if (F.part === 'daff' || F.part === 'trumpet') { springFlowerE.set(-0.35, f.rot, 0); springFlowerQ.setFromEuler(springFlowerE); }
          if (F.part === 'crocus') { springFlowerE.set(f.tilt, f.rot, 0); springFlowerQ.setFromEuler(springFlowerE); springFlowerS.y *= 1.25; }
        }
        springFlowerM.compose(springFlowerV, springFlowerQ, springFlowerS); F.im.setMatrixAt(i, springFlowerM);
      });
      F.im.instanceMatrix.needsUpdate = true; if (F.im.instanceColor) F.im.instanceColor.needsUpdate = true;
    });
  }
  // ===== petals drifting down =====
  var springPetals = (function () {
    var N = 150, pos = new Float32Array(N * 3), seeds = [];
    for (var i = 0; i < N; i++) seeds.push({ x: (springHash(i * 3.3) - 0.5) * 28, y: springHash(i * 5.7) * 9, z: (springHash(i * 7.1) - 0.5) * 28, s: 0.25 + springHash(i * 2.2) * 0.35, w: springHash(i * 9.9) * 6.28 });
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var c = document.createElement('canvas'); c.width = c.height = 32; var x = c.getContext('2d');
    x.fillStyle = '#ffd6e4'; x.beginPath(); x.ellipse(16, 16, 11, 6, 0.6, 0, Math.PI * 2); x.fill(); x.fillStyle = 'rgba(255,255,255,0.7)'; x.beginPath(); x.ellipse(13, 14, 5, 2.5, 0.6, 0, Math.PI * 2); x.fill();
    var pts = new THREE.Points(g, new THREE.PointsMaterial({ map: new THREE.CanvasTexture(c), size: 0.15, transparent: true, alphaTest: 0.3, depthWrite: false }));
    pts.frustumCulled = false; pts.userData.seeds = seeds; scene.add(pts); return pts;
  })();
  function springPetalsMove(dt) {
    var a = springPetals.geometry.attributes.position, S = springPetals.userData.seeds, cx = cam.target.x, cz = cam.target.z, t = state.time;
    S.forEach(function (s, i) {
      s.y -= dt * s.s; s.x += dt * (0.25 + Math.sin(t * 0.7 + s.w) * 0.3); s.z += dt * Math.cos(t * 0.5 + s.w) * 0.2;
      var wx = cx + ((s.x % 28) + 42) % 28 - 14, wz = cz + ((s.z % 28) + 42) % 28 - 14, gy = groundHeight(wx, wz);
      if (s.y < Math.max(gy, WATER_Y) + 0.05) { s.y = gy + 7 + springHash(i + t) * 3; }   // (a petal that reaches the ground is gone; a new one starts up high)
      a.setXYZ(i, wx + Math.sin(t * 2 + s.w) * 0.15, s.y, wz);
    });
    a.needsUpdate = true;
  }
  // ===== butterflies over the flowers =====
  var springButterflies = (function () {
    var SPECIES = [['#fbfaf4', '#4a4a4a', '#e8e4d8'], ['#f6e46a', '#c8a020', '#f0d850'], ['#fbfaf4', '#f08a2a', '#e8e0d0'], ['#8ab8f0', '#3a5aa8', '#b8d4f8'], ['#f4a6c8', '#b85a88', '#f8c8dc']];
    function wingTex(sp, lower) {                                      // (a wing, with darker tips and veins, and a spot)
      var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d');
      g.fillStyle = sp[0]; g.beginPath();
      if (lower) { g.moveTo(2, 4); g.bezierCurveTo(30, 0, 56, 18, 46, 44); g.bezierCurveTo(36, 62, 10, 52, 2, 30); }
      else { g.moveTo(2, 58); g.bezierCurveTo(10, 20, 40, 0, 62, 8); g.bezierCurveTo(60, 34, 40, 56, 2, 60); }
      g.closePath(); g.fill(); g.save(); g.clip();
      g.fillStyle = sp[1]; if (lower) { g.beginPath(); g.arc(40, 40, 10, 0, 6.28); g.fill(); } else { g.beginPath(); g.ellipse(56, 12, 14, 9, 0.5, 0, 6.28); g.fill(); g.fillStyle = sp[0]; g.beginPath(); g.arc(52, 16, 3, 0, 6.28); g.fill(); }
      g.strokeStyle = 'rgba(60,50,40,0.35)'; g.lineWidth = 1; for (var v = 0; v < 5; v++) { g.beginPath(); g.moveTo(3, lower ? 6 : 56); g.lineTo(lower ? 20 + v * 8 : 30 + v * 7, lower ? 20 + v * 7 : 6 + v * 9); g.stroke(); }
      g.fillStyle = sp[1]; g.beginPath(); g.arc(lower ? 24 : 34, lower ? 26 : 28, 3.4, 0, 6.28); g.fill();
      g.restore(); g.strokeStyle = 'rgba(60,50,40,0.5)'; g.lineWidth = 1.5; g.stroke();
      var t = new THREE.CanvasTexture(c); return t;
    }
    var mBody = new THREE.MeshStandardMaterial({ color: 0x3a3028, roughness: 0.7 });
    var list = [];
    for (var b = 0; b < 12; b++) {
      var sp = SPECIES[b % SPECIES.length], G = new THREE.Group(), mats = [false, true].map(function (lower) { return new THREE.MeshStandardMaterial({ map: wingTex(sp, lower), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6 }); });
      var body = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, 0.06, 6), mBody); body.rotation.x = Math.PI / 2; G.add(body);
      var head = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), mBody); head.position.z = 0.032; G.add(head);
      [-1, 1].forEach(function (s) { var an = new THREE.Mesh(new THREE.CylinderGeometry(0.0012, 0.0012, 0.04, 3), mBody); an.position.set(s * 0.008, 0.012, 0.048); an.rotation.set(0.9, 0, -s * 0.3); G.add(an); });
      var wings = [-1, 1].map(function (s) {                          // (each side: a hinge at the body, with the fore and hind wing on it)
        var hinge = new THREE.Group(); hinge.scale.x = s; G.add(hinge);
        var up = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.07), mats[0]); up.rotation.x = -Math.PI / 2; up.position.set(0.035, 0, 0.012); hinge.add(up);
        var lo = new THREE.Mesh(new THREE.PlaneGeometry(0.055, 0.055), mats[1]); lo.rotation.x = -Math.PI / 2; lo.position.set(0.027, -0.001, -0.022); hinge.add(lo);
        return hinge;
      });
      G.scale.setScalar(2.4); G.visible = false; scene.add(G);   // (a little bigger than life, so you can see them)
      list.push({ g: G, wings: wings, clump: null, ph: springHash(b * 3.1) * 6.28, sp: 0.7 + springHash(b * 1.9) * 0.6, x: 0, y: 0, z: 0 });
    }
    return list;
  })();
  function springButterfliesMove(dt, on) {
    var px = player.position.x, pz = player.position.z, t = state.time;
    springButterflies.forEach(function (B, i) {
      if (B.g.visible !== on) B.g.visible = on;
      if (!on) { B.clump = null; return; }
      var patches = summerNow() ? SUMMER_CLUMPS : SPRING_CLUMPS;          // (in Summer they visit the summer flowers)
      if (!B.clump || patches.indexOf(B.clump) < 0 || dist(B.clump.x, B.clump.z, px, pz) > 26) {   // (each one keeps to a flower patch near you, moving on to another as you go)
        var near = patches.filter(function (c) { return dist(c.x, c.z, px, pz) < 18; });
        if (!near.length) { B.g.visible = false; return; }
        B.clump = near[Math.floor(springHash(i * 7.7 + Math.floor(t / 20)) * near.length) % near.length];
        B.x = B.clump.x; B.z = B.clump.z; B.y = B.clump.y + 0.6;
      }
      var c = B.clump, a = t * 0.45 * B.sp + B.ph;                      // (a lazy, looping wander over its patch, dipping toward the flowers now and then)
      var nx = c.x + Math.sin(a) * 1.3 + Math.sin(a * 2.3) * 0.5, nz = c.z + Math.cos(a * 0.8) * 1.2 + Math.cos(a * 1.9) * 0.4, ny = c.y + 0.55 + Math.sin(a * 1.6) * 0.3 + Math.sin(t * 7 + B.ph) * 0.04;
      var dx = nx - B.x, dz = nz - B.z;
      B.x = nx; B.y = ny; B.z = nz; B.g.position.set(nx, ny, nz);
      if (Math.abs(dx) + Math.abs(dz) > 1e-5) B.g.rotation.y = Math.atan2(dx, dz);
      var flap = Math.sin(t * 18 * B.sp + B.ph) * 0.9 + 0.35;              // (wings beating)
      B.wings[0].rotation.z = flap; B.wings[1].rotation.z = flap;
    });
  }
  // ===== every frame =====
  function updateSpring(dt) {
    var on = springNow();
    if (springBlossoms.visible !== on) springBlossoms.visible = on;
    if (on !== springWasOn || state.time - springFlowerT > 2) { springWasOn = on; springFlowerT = state.time; springFlowersPlace(on); }   // (and every couple of seconds, in case one's been dug up or built over)
    var hr = state.minutes / 60, petals = on && !indoors && hr > 6 && hr < 19.5;
    if (springPetals.visible !== petals) springPetals.visible = petals;
    if (petals) springPetalsMove(dt);
    springButterfliesMove(dt, (on || summerNow()) && !indoors && hr > 6 && hr < 19.5);   // (butterflies through Spring and Summer)
  }


  // ---------- Summer on the island ----------
  // While it's Summer: the broadleaf trees and bushes are a deep, rich green, and the trees that blossomed in Spring
  // are hung with ripe red and orange fruit (which falls with a chopped tree and grows back with it, like the blossom).
  // Tall sunflowers, red poppies, oxeye daisies and bushes of lavender fill the meadows, the butterflies stay on for
  // the summer flowers, and on warm evenings fireflies blink over the grass
  function summerNow() { return seasonOf(state.day) === 1; }
  // ===== a deeper green =====
  var SUMMER_LEAF = new THREE.Color(0.58, 0.8, 0.46), PLAIN_LEAF = new THREE.Color(1, 1, 1);
  // ===== fruit on the trees that blossomed =====
  var summerFruitGeo = new THREE.LatheGeometry([[0, -0.052], [0.022, -0.058], [0.05, -0.04], [0.066, -0.005], [0.064, 0.028], [0.046, 0.05], [0.02, 0.052], [0.006, 0.04], [0, 0.036]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 16);   // (an apple: round, with a dimple at the top and a smaller one underneath)
  summerFruitGeo.computeVertexNormals();
  var summerStalkGeo = new THREE.CylinderGeometry(0.004, 0.006, 0.06, 5); summerStalkGeo.translate(0, 0.064, 0); summerStalkGeo.rotateZ(0.2);
  var summerLeafGeo = (function () { var sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(0.03, 0.02, 0.07, 0); sh.quadraticCurveTo(0.03, -0.02, 0, 0); var g = new THREE.ShapeGeometry(sh, 5); g.rotateX(-1.1); g.rotateY(0.6); g.translate(-0.01, 0.085, 0); return g; })();
  var summerFruitLeaves = new THREE.InstancedMesh(summerLeafGeo, new THREE.MeshStandardMaterial({ color: 0x4a8a34, roughness: 0.7, side: THREE.DoubleSide }), 3000);
  var summerFruit = new THREE.InstancedMesh(summerFruitGeo, new THREE.MeshStandardMaterial({ roughness: 0.35 }), 3000);
  var summerStalks = new THREE.InstancedMesh(summerStalkGeo, new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.8 }), 3000);
  summerFruit.castShadow = true; summerFruit.setColorAt(0, new THREE.Color(1, 1, 1)); summerFruit.count = summerStalks.count = summerFruitLeaves.count = 0; scene.add(summerFruitLeaves);   // (making room for each fruit's colour first)
  scene.add(summerFruit); scene.add(summerStalks);
  var summerFruitM = new THREE.Matrix4();
  (function () {
    var m = new THREE.Matrix4(), cur = new THREE.Matrix4(), inv = new THREE.Matrix4(), col = new THREE.Color(), p = new THREE.Vector3();
    var FRUIT = [[0xd8302c, 0xe84838], [0xf08a2a, 0xf6a040], [0xc81e3a, 0xe03c50], [0xe8c040, 0xb8d050]];   // (red apples, apricots, cherries, golden plums)
    allScenery.forEach(function (t, ti) {
      var u = t.userData; if (!u.blossoms || choppable.indexOf(t) < 0) return;
      var B = u.blossoms, pal = FRUIT[Math.floor(springHash(ti * 4.7) * FRUIT.length)], start = summerFruit.count, orig = [];
      for (var i = 0; i < B.count; i += 3) {
        if (summerFruit.count >= 3000) break;
        p.set(B.orig[i * 16 + 12], B.orig[i * 16 + 13] - 0.12, B.orig[i * 16 + 14]);   // (hanging just under the leaves)
        var s = (0.85 + springHash(ti + i * 1.3) * 0.35) * Math.max(0.8, Math.min(1.3, u.size || 1));
        m.makeRotationY(springHash(i * 2.1) * 6.28).scale(p.clone().set(s, s, s)).setPosition(p);
        orig.push.apply(orig, m.toArray());
        col.set(pal[i % 2]).multiplyScalar(0.9 + springHash(i * 7.3) * 0.2);
        summerFruit.setMatrixAt(summerFruit.count, m); summerStalks.setMatrixAt(summerFruit.count, m); summerFruitLeaves.setMatrixAt(summerFruit.count, m); summerFruit.setColorAt(summerFruit.count, col);
        summerFruit.count++;
      }
      summerStalks.count = summerFruitLeaves.count = summerFruit.count;
      var count = summerFruit.count - start; if (!count) return;
      u.fruits = { start: start, count: count, orig: orig };
      var L0 = u.leaves[0]; if (L0 && L0.count) { cur.fromArray(L0.batch.instanceMatrix.array, L0.start * 16); inv.fromArray(u.leafOrig[0], 0).invert(); summerFruitMove(u, cur.multiply(inv)); }
    });
    summerFruit.instanceMatrix.needsUpdate = summerStalks.instanceMatrix.needsUpdate = summerFruitLeaves.instanceMatrix.needsUpdate = true; if (summerFruit.instanceColor) summerFruit.instanceColor.needsUpdate = true;
  })();
  function summerFruitMove(u, M) {
    var F = u.fruits, a1 = summerFruit.instanceMatrix.array, a2 = summerStalks.instanceMatrix.array, a3 = summerFruitLeaves.instanceMatrix.array, m = summerFruitM;
    for (var i = 0; i < F.count; i++) { m.fromArray(F.orig, i * 16).premultiply(M); m.toArray(a1, (F.start + i) * 16); m.toArray(a2, (F.start + i) * 16); m.toArray(a3, (F.start + i) * 16); }
    markDirty(summerFruit.instanceMatrix, F.start * 16, F.count * 16); markDirty(summerStalks.instanceMatrix, F.start * 16, F.count * 16); markDirty(summerFruitLeaves.instanceMatrix, F.start * 16, F.count * 16);
  }
  var summerBaseTreeTransform = setTreeTransform;                     // (the fruit goes wherever its tree goes, like the blossom)
  setTreeTransform = function (t, M, which) {
    summerBaseTreeTransform(t, M, which);
    if (which !== 'ground' && t.userData.fruits) summerFruitMove(t.userData, M);
  };
  // ===== sunflowers, poppies, daisies and lavender =====
  var SUMMER_FLOWERS = [], SUMMER_LEAVES = [], SUMMER_CLUMPS = [], summerFlowerMesh = [], summerFlowerShown = null, summerFlowerT = -99, summerWasOn = null;
  (function () {
    var KINDS = ['sun', 'sun', 'poppy', 'poppy', 'daisy', 'daisy', 'lav'], sunPatches = [];
    for (var c = 0, tries = 0; c < 75 && tries < 5000; tries++) {
      var cx = -ISLAND + 3 + springHash(tries * 4.9 + 301) * (ISLAND * 2 - 6), cz = -ISLAND + 3 + springHash(tries * 6.1 + 77) * (ISLAND * 2 - 6);
      if (!springFlowerSpot(cx, cz, 1.0)) continue;
      c++; SUMMER_CLUMPS.push({ x: cx, z: cz, y: groundHeight(cx, cz) });
      var kind = KINDS[Math.floor(springHash(c * 3.3 + 50) * KINDS.length)];
      if (kind === 'sun' && sunPatches.some(function (q) { return dist(q[0], q[1], cx, cz) < 8; })) kind = springHash(c * 1.9) < 0.5 ? 'poppy' : 'daisy';   // (sunflower patches keep well apart)
      if (kind === 'sun') sunPatches.push([cx, cz]);
      var n = kind === 'sun' ? 3 + Math.floor(springHash(c * 2.7) * 4) : kind === 'lav' ? 2 + Math.floor(springHash(c * 2.7) * 2) : 8 + Math.floor(springHash(c * 2.7) * 8);
      for (var f = 0; f < n; f++) {
        var a = springHash(c * 19 + f * 3.7) * 6.28, r = (kind === 'sun' ? 0.45 : kind === 'lav' ? 0.35 : 0.12) + springHash(c * 11 + f * 1.9) * (kind === 'sun' ? 1.1 : 0.55), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
        if (!springFlowerSpot(x, z, kind === 'sun' ? 0.45 : 0.3)) continue;
        if (kind === 'sun' && SUMMER_FLOWERS.some(function (o) { return o.kind === 'sun' && dist(o.x, o.z, x, z) < 0.85; })) continue;   // (each sunflower with room round it)
        if (kind === 'lav') {                                            // (a lavender bush: a dome of slender stems, each with a purple spike)
          for (var st = 0; st < 16; st++) { var la = st / 16 * 6.28 + springHash(st + f * 9) * 0.4, lt = 0.15 + springHash(st * 3 + f) * 0.4;
            SUMMER_FLOWERS.push({ x: x, z: z, y: groundHeight(x, z), kind: 'lav', h: 0.38 + springHash(st * 7 + f) * 0.16, rot: la, tilt: lt, v: springHash(st * 5.5 + c) }); }
          continue;
        }
        var fl = { x: x, z: z, y: groundHeight(x, z), kind: kind, h: kind === 'sun' ? 1.15 + springHash(c * 5 + f) * 0.5 : kind === 'poppy' ? 0.36 + springHash(c * 5 + f) * 0.16 : 0.3 + springHash(c * 5 + f) * 0.14,
          rot: kind === 'sun' ? (springHash(c + f * 3) - 0.5) * 0.9 : springHash(c * 3 + f * 5) * 6.28, tilt: (springHash(c + f * 11) - 0.5) * (kind === 'sun' ? 0.12 : 0.3), v: springHash(c * 9 + f * 2.2) };
        SUMMER_FLOWERS.push(fl);
        if (kind === 'sun') for (var lv = 0; lv < 5; lv++) SUMMER_LEAVES.push({ f: fl, at: 0.2 + lv * 0.14, a: lv * 2.4 + fl.v * 6.28, s: 1.6 - lv * 0.2 });   // (big leaves up its stem)
      }
    }
    var stemGeo = new THREE.CylinderGeometry(0.009, 0.013, 1, 6); stemGeo.translate(0, 0.5, 0);
    var thickGeo = new THREE.CylinderGeometry(0.018, 0.026, 1, 8); thickGeo.translate(0, 0.5, 0);
    // (a sunflower leaf: broad and heart-shaped, drooping from its stalk)
    var sl = new THREE.Shape(); sl.moveTo(0, 0); sl.bezierCurveTo(0.06, 0.07, 0.2, 0.08, 0.26, 0); sl.bezierCurveTo(0.2, -0.08, 0.06, -0.07, 0, 0);
    var sLeafGeo = new THREE.ShapeGeometry(sl, 8), slp = sLeafGeo.attributes.position;
    for (var v = 0; v < slp.count; v++) { var lx = slp.getX(v); slp.setZ(v, -lx * lx * 1.6); }
    sLeafGeo.rotateX(-Math.PI / 2); sLeafGeo.computeVertexNormals();
    // (a sunflower head: a domed brown disc of seeds, and two rings of long golden petals; it faces +z)
    var seedTex = cpTex(128, 128, function (g, w, h) {
      var gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, '#5a3818'); gr.addColorStop(0.7, '#3a220e'); gr.addColorStop(1, '#6a4a1a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (var s = 0; s < 1100; s++) { var a = s * 2.39996, r = Math.sqrt(s) * 1.85, sz = 0.8 + r / 64 * 1.3; if (r > 62) break; g.fillStyle = r > 52 ? (s % 2 ? '#e8a020' : '#c88018') : s % 3 ? '#7a4e1c' : '#2a180a'; g.beginPath(); g.ellipse(64 + Math.cos(a) * r, 64 + Math.sin(a) * r, sz, sz * 0.75, a, 0, Math.PI * 2); g.fill(); }   // (seeds in their golden spiral, and a ring of tiny florets round the edge)
    });
    // (the seed disc: a gently domed face covered in seeds in their golden spiral; and a rim behind it)
    var discGeo = new THREE.CircleGeometry(0.12, 48), dgp = discGeo.attributes.position;
    for (var dv = 0; dv < dgp.count; dv++) { var dr = Math.hypot(dgp.getX(dv), dgp.getY(dv)) / 0.12; dgp.setZ(dv, 0.026 * (1 - dr * dr)); }
    discGeo.computeVertexNormals();
    // (the petals: broad and pointed, folded down the middle and curling back at the tips, in two overlapping rings)
    function sunPetal(len, wid) {
      var g = new THREE.PlaneGeometry(1, 1, 4, 8), gp = g.attributes.position;
      for (var i = 0; i < gp.count; i++) {
        var u = gp.getX(i) + 0.5, t = gp.getY(i) + 0.5, w = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.08)), 0.7) * (1 - t * 0.35);
        var x = (u - 0.5) * wid * w, y = t * len;
        gp.setXYZ(i, x, y, Math.abs(x) * 0.35 - t * t * len * 0.28);
      }
      g.computeVertexNormals(); return g;
    }
    var sunPetals = [];
    for (var pr2 = 0; pr2 < 2; pr2++) for (var pj = 0; pj < 22; pj++) {
      var pg2 = sunPetal(0.13 + springHash(pj * 3.3 + pr2) * 0.025, 0.05); pg2.translate(0, 0.105, 0); pg2.rotateX(-0.18 - pr2 * 0.18);
      pg2.rotateZ((pj + pr2 * 0.5) / 22 * Math.PI * 2 + (springHash(pj * 7.1) - 0.5) * 0.08); pg2.translate(0, 0, -0.004 - pr2 * 0.01); sunPetals.push(pg2);
    }
    var rimGeo = new THREE.TorusGeometry(0.118, 0.012, 6, 40);
    var sunBackGeo = new THREE.SphereGeometry(0.13, 28, 6, 0, Math.PI * 2, 0, Math.PI * 0.32);   // (the back of the head: a shallow dome of brown seeds too, so the middle is brown from every side)
    sunBackGeo.scale(1, 0.45, 1); sunBackGeo.rotateX(-Math.PI / 2); sunBackGeo.translate(0, 0, 0.027);
    for (var bv = 0, bp = sunBackGeo.attributes.position, buv = sunBackGeo.attributes.uv; bv < bp.count; bv++) buv.setXY(bv, 0.5 - bp.getX(bv) / 0.24, 0.5 + bp.getY(bv) / 0.24);   // (the seed spiral laid flat across it)
    var sunPetalGeo = mergeSimple(sunPetals);
    var bract = new THREE.Shape(); bract.moveTo(0, 0); bract.quadraticCurveTo(0.02, 0.04, 0, 0.075); bract.quadraticCurveTo(-0.02, 0.04, 0, 0);
    var bracts = []; for (var bi = 0; bi < 14; bi++) { var bg = new THREE.ShapeGeometry(bract, 3); bg.translate(0, 0.112, 0); bg.rotateX(-0.6); bg.rotateZ(bi / 14 * Math.PI * 2 + 0.11); bg.translate(0, 0, -0.012); bracts.push(bg); }   // (green bracts round the rim, peeping out behind the petals, not over the seeds)
    var bractGeo = mergeSimple(bracts);
    // (a poppy: two outer and two inner petals, broad, cupped and crinkled like tissue, each with a dark blotch at its base
    // and fine veins; in the middle a green seed pod with its ridged crown, ringed by dark stamens. Some are still nodding buds)
    var poppyTex = cpTex(128, 128, function (g, w, h) {
      g.fillStyle = '#fff4f0'; g.fillRect(0, 0, w, h);
      for (var v = 0; v < 26; v++) { var a = -1.25 + v / 25 * 2.5; g.strokeStyle = 'rgba(150,40,40,0.16)'; g.lineWidth = 1; g.beginPath(); g.moveTo(w / 2, h); g.quadraticCurveTo(w / 2 + Math.sin(a) * w * 0.3, h * 0.55, w / 2 + Math.sin(a) * w * 0.62, 0); g.stroke(); }
      var bl = g.createRadialGradient(w / 2, h - 4, 2, w / 2, h - 4, 30); bl.addColorStop(0, 'rgba(20,10,16,1)'); bl.addColorStop(0.7, 'rgba(30,14,20,0.95)'); bl.addColorStop(1, 'rgba(30,14,20,0)');
      g.fillStyle = bl; g.beginPath(); g.ellipse(w / 2, h - 4, 26, 24, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.ellipse(w / 2, h - 4, 27, 25, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
    });
    function poppyPetal(len, wid, lean, seed) {
      var g = new THREE.PlaneGeometry(1, 1, 7, 7), gp = g.attributes.position;
      for (var i = 0; i < gp.count; i++) {
        var u = gp.getX(i) + 0.5, t = gp.getY(i) + 0.5, w = Math.pow(Math.sin(Math.PI * (0.12 + 0.86 * t)), 0.55), x = (u - 0.5) * wid * w;
        gp.setXYZ(i, x, t * len, -Math.pow(x / wid, 2) * wid * 0.9 + Math.sin(u * 13 + t * 7 + seed) * 0.0025 * t);   // (cupped inward, crinkled toward the edge)
      }
      g.rotateX(lean); g.computeVertexNormals(); return g;
    }
    var poppyParts = [];
    for (var pp = 0; pp < 4; pp++) { var ppg = pp % 2 ? poppyPetal(0.048, 0.07, 0.5, pp) : poppyPetal(0.056, 0.082, 0.82, pp); ppg.translate(0, 0.002 + (pp % 2) * 0.003, 0); ppg.rotateY(pp / 4 * Math.PI * 2 + (pp % 2) * 0.35); poppyParts.push(ppg); }
    var poppyGeo = mergeUV(poppyParts);
    var poppyPodGeo = new THREE.LatheGeometry([[0, 0], [0.008, 0.002], [0.012, 0.012], [0.011, 0.022], [0.014, 0.026], [0.008, 0.029], [0, 0.03]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 12);
    var stamParts = [];
    for (var sm = 0; sm < 28; sm++) { var sa = sm / 28 * Math.PI * 2, st = new THREE.CylinderGeometry(0.0008, 0.0008, 0.016, 3); st.translate(0, 0.008, 0); st.rotateZ(0.5 + (sm % 3) * 0.12); st.rotateY(sa); st.translate(Math.cos(sa) * 0.012, 0.006, -Math.sin(sa) * 0.012); stamParts.push(st);
      var an = new THREE.SphereGeometry(0.0022, 4, 3); an.translate(Math.cos(sa) * (0.012 + 0.008), 0.02, -Math.sin(sa) * (0.012 + 0.008)); stamParts.push(an); }
    for (var ray = 0; ray < 9; ray++) { var rb = new THREE.BoxGeometry(0.0022, 0.0015, 0.012); rb.translate(0, 0.0305, 0.006); rb.rotateY(ray / 9 * Math.PI * 2); stamParts.push(rb); }   // (the dark rays on the pod's crown)
    var poppyStamGeo = mergeSimple(stamParts);
    var poppyBudGeo = new THREE.SphereGeometry(0.018, 10, 8); poppyBudGeo.scale(0.85, 1.35, 0.85); poppyBudGeo.translate(0, -0.022, 0);
    // (an oxeye daisy: slim, notched white petals with fine grooves, drooping a little at the tips; a domed golden centre packed
    // with tiny florets; and a ring of green bracts underneath)
    var daisyTex = cpTex(64, 128, function (g, w, h) {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); var gr = g.createLinearGradient(0, h, 0, h * 0.7); gr.addColorStop(0, 'rgba(240,220,120,0.5)'); gr.addColorStop(1, 'rgba(240,220,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (var v = 1; v < 5; v++) { g.strokeStyle = 'rgba(180,180,190,0.35)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(v / 5 * w, h); g.lineTo(v / 5 * w + (v - 2.5) * 2, 0); g.stroke(); }
    });
    function daisyPetal(len, wid) {
      var g = new THREE.PlaneGeometry(1, 1, 2, 6), gp = g.attributes.position;
      for (var i = 0; i < gp.count; i++) {
        var u = gp.getX(i) + 0.5, t = gp.getY(i) + 0.5, w = Math.pow(Math.sin(Math.PI * (0.18 + 0.8 * t)), 0.4);
        gp.setXYZ(i, (u - 0.5) * wid * w, t * len - (t > 0.99 && Math.abs(u - 0.5) < 0.1 ? 0.004 : 0), -t * t * 0.012);   // (a notch at the tip, and drooping)
      }
      g.rotateX(-Math.PI / 2); g.computeVertexNormals(); return g;
    }
    var daisyParts = []; for (var di = 0; di < 22; di++) { var dg = daisyPetal(0.05 + springHash(di * 2.7) * 0.008, 0.013); dg.translate(0, 0.002, -0.013); dg.rotateY(di / 22 * Math.PI * 2 + springHash(di) * 0.06); daisyParts.push(dg); }
    var daisyGeo = mergeUV(daisyParts);
    var floretTex = cpTex(128, 128, function (g, w, h) {
      g.fillStyle = '#e8a818'; g.fillRect(0, 0, w, h);
      for (var s = 0; s < 500; s++) { var a = s * 2.39996, r = Math.sqrt(s) * 2.8; if (r > 64) break; g.fillStyle = r < 14 ? '#c89a20' : s % 2 ? '#f6c830' : '#d89818'; g.beginPath(); g.arc(64 + Math.cos(a) * r, 64 + Math.sin(a) * r, 1.8, 0, Math.PI * 2); g.fill(); }
    });
    var daisyMidGeo = new THREE.CircleGeometry(0.016, 24), dmp = daisyMidGeo.attributes.position;
    for (var dm = 0; dm < dmp.count; dm++) { var drr = Math.hypot(dmp.getX(dm), dmp.getY(dm)) / 0.016; dmp.setZ(dm, 0.008 * (1 - drr * drr)); }
    daisyMidGeo.rotateX(-Math.PI / 2); daisyMidGeo.translate(0, 0.002, 0); daisyMidGeo.computeVertexNormals();
    var dBr = new THREE.Shape(); dBr.moveTo(-0.004, 0); dBr.lineTo(0.004, 0); dBr.lineTo(0, 0.016); dBr.closePath();
    var dBracts = []; for (var db = 0; db < 12; db++) { var dbg = new THREE.ShapeGeometry(dBr, 1); dbg.rotateX(-Math.PI / 2 - 0.6); dbg.rotateY(db / 12 * Math.PI * 2); dbg.translate(0, -0.003, 0); dBracts.push(dbg); }
    var daisyBractGeo = mergeSimple(dBracts);
    // (a lavender spike: whorls of tiny florets up the top of its stem, deeper purple below and paler at the tip; and narrow
    // silvery leaves at the foot of the bush)
    function lavWhorls(from, to) {
      var parts = [];
      for (var lw = from; lw < to; lw++) for (var fl = 0; fl < 6; fl++) {
        var fa = fl / 6 * Math.PI * 2 + lw * 0.6, fr = 0.0078 * (1 - lw * 0.05), lg = new THREE.SphereGeometry(fr, 5, 3); lg.scale(0.8, 1.3, 0.8); lg.rotateZ(0.5); lg.rotateY(fa);
        lg.translate(Math.cos(fa) * 0.006 * (1 - lw * 0.05), lw * 0.016 + (lw % 2) * 0.004, -Math.sin(fa) * 0.006 * (1 - lw * 0.05)); parts.push(lg);
      }
      return mergeSimple(parts);
    }
    var lavGeo = lavWhorls(0, 6), lavTopGeo = lavWhorls(6, 9);
    var lavStemGeo = new THREE.CylinderGeometry(0.0035, 0.005, 1, 5); lavStemGeo.translate(0, 0.5, 0);
    var lavLeafGeo = new THREE.PlaneGeometry(0.008, 0.14, 1, 4), llp = lavLeafGeo.attributes.position;
    for (var ll = 0; ll < llp.count; ll++) { var lt2 = (llp.getY(ll) + 0.07) / 0.14; llp.setXYZ(ll, llp.getX(ll) * (1 - lt2 * 0.6), lt2 * 0.14, lt2 * lt2 * 0.03); }
    lavLeafGeo.computeVertexNormals();
    var mStem = new THREE.MeshStandardMaterial({ color: 0x5a9a44, roughness: 0.75, side: THREE.DoubleSide }), mSunLeaf = new THREE.MeshStandardMaterial({ color: 0x4a8a38, roughness: 0.7, side: THREE.DoubleSide });
    var mHead = new THREE.MeshStandardMaterial({ roughness: 0.5, side: THREE.DoubleSide }), mDisc = new THREE.MeshStandardMaterial({ map: seedTex, roughness: 0.9 });
    var mPoppy = new THREE.MeshStandardMaterial({ map: poppyTex, roughness: 0.55, side: THREE.DoubleSide }), mDaisy = new THREE.MeshStandardMaterial({ map: daisyTex, roughness: 0.6, side: THREE.DoubleSide });
    var mFloret = new THREE.MeshStandardMaterial({ map: floretTex, roughness: 0.8 }), mLavLeaf = new THREE.MeshStandardMaterial({ color: 0x8aa684, roughness: 0.8, side: THREE.DoubleSide });
    function only(k) { return SUMMER_FLOWERS.filter(function (f) { return f.kind === k; }); }
    var suns = only('sun'), poppies = only('poppy'), poppyOpen = poppies.filter(function (f) { return f.v <= 0.8; }), poppyBuds = poppies.filter(function (f) { return f.v > 0.8; }), daisies = only('daisy'), lav = only('lav'), thin = SUMMER_FLOWERS.filter(function (f) { return f.kind !== 'sun' && f.kind !== 'lav'; });
    summerFlowerMesh = [
      { geo: thickGeo, m: mStem, list: suns, part: 'stem' }, { geo: stemGeo, m: mStem, list: thin, part: 'stem' },
      { geo: sLeafGeo, m: mSunLeaf, list: SUMMER_LEAVES, part: 'sunleaf' },
      { geo: discGeo, m: mDisc, list: suns, part: 'disc' }, { geo: rimGeo, m: mHead, list: suns, part: 'rim', col: function () { return 0x6a4a1c; } }, { geo: sunBackGeo, m: mDisc, list: suns, part: 'sunback' }, { geo: bractGeo, m: mSunLeaf, list: suns, part: 'bracts' }, { geo: sunPetalGeo, m: mHead, list: suns, part: 'sunpetals', col: function (f) { return f.v < 0.7 ? 0xf6c428 : 0xf0a020; } },
      { geo: poppyGeo, m: mPoppy, list: poppyOpen, part: 'poppy', col: function (f) { return f.v < 0.55 ? 0xe8281c : f.v < 0.7 ? 0xf0402a : 0xf26a3a; } },
      { geo: poppyPodGeo, m: mHead, list: poppyOpen, part: 'poppypod', col: function () { return 0x8aa86a; } }, { geo: poppyStamGeo, m: mHead, list: poppyOpen, part: 'poppystam', col: function () { return 0x2a1e26; } },
      { geo: poppyBudGeo, m: mStem, list: poppyBuds, part: 'poppybud' },
      { geo: daisyGeo, m: mDaisy, list: daisies, part: 'daisy' }, { geo: daisyMidGeo, m: mFloret, list: daisies, part: 'daisymid' }, { geo: daisyBractGeo, m: mSunLeaf, list: daisies, part: 'daisybract' },
      { geo: lavGeo, m: mHead, list: lav, part: 'lav', col: function (f) { return f.v < 0.5 ? 0x6e4cb8 : f.v < 0.85 ? 0x7a58c4 : 0x6444a8; } },
      { geo: lavTopGeo, m: mHead, list: lav, part: 'lavtop', col: function (f) { return f.v < 0.5 ? 0xa48ae6 : 0xb49cf0; } },
      { geo: lavLeafGeo, m: mLavLeaf, list: lav, part: 'lavleaf' }, { geo: lavStemGeo, m: mLavLeaf, list: lav, part: 'stem' }
    ].map(function (F) {
      F.im = new THREE.InstancedMesh(F.geo, F.m, Math.max(1, F.list.length)); F.im.castShadow = true; F.im.frustumCulled = false; scene.add(F.im);
      if (F.col) { var col = new THREE.Color(); F.list.forEach(function (f, i) { F.im.setColorAt(i, col.set(F.col(f))); }); }
      return F;
    });
  })();
  var sfM = new THREE.Matrix4(), sfQ = new THREE.Quaternion(), sfE = new THREE.Euler(), sfV = new THREE.Vector3(), sfS = new THREE.Vector3(), sfB = new THREE.Vector3();
  function summerFlowersPlace(show) {
    var key = SUMMER_FLOWERS.map(function (f) { return show && springFlowerOK(f) ? 1 : 0; }).join('');
    if (key === summerFlowerShown) return; summerFlowerShown = key;
    summerFlowerMesh.forEach(function (F) {
      F.list.forEach(function (rec, i) {
        var f = rec.f || rec, k = key[SUMMER_FLOWERS.indexOf(f)] === '1' ? 1 : 0;
        if (f.kind === 'lav') sfE.set(f.tilt, f.rot, 0, 'YXZ'); else sfE.set(f.tilt, f.rot, f.tilt * 0.6);   // (each stem leans its own way; lavender fans out)
        sfQ.setFromEuler(sfE); sfB.set(f.x, f.y, f.z);
        if (F.part === 'stem') { sfV.copy(sfB); sfS.set(k, f.h * k, k); }
        else if (F.part === 'sunleaf') { sfV.set(0, f.h * rec.at, 0).applyQuaternion(sfQ).add(sfB); sfE.set(0, rec.a, -0.35); sfQ.setFromEuler(sfE); sfS.setScalar(k * rec.s); }
        else {
          sfV.set(0, f.h, 0).applyQuaternion(sfQ).add(sfB);
          if (F.part === 'disc' || F.part === 'sunpetals' || F.part === 'bracts' || F.part === 'rim' || F.part === 'sunback') { sfE.set(0.12, f.rot, 0); sfQ.setFromEuler(sfE); sfS.setScalar(k * (0.9 + f.v * 0.3)); }   // (sunflowers turn their faces toward the sun)
          else if (F.part === 'lav' || F.part === 'lavtop') { sfV.set(0, f.h - 0.13, 0).applyQuaternion(sfQ).add(sfB); sfS.setScalar(k * 1.15); }
          else if (F.part === 'lavleaf') { sfV.copy(sfB); sfE.set(0.75 + f.v * 0.5, f.rot + 0.4, 0, 'YXZ'); sfQ.setFromEuler(sfE); sfS.setScalar(k * (0.8 + f.v * 0.4)); }   // (narrow leaves splaying out at its foot)
          else if (F.part === 'poppybud') { sfE.set(f.tilt + 0.95, f.rot, 0); sfQ.setFromEuler(sfE); sfS.setScalar(k * 1.5); }   // (a bud nodding on its hooked stem)
          else sfS.setScalar(k * (F.part.indexOf('poppy') === 0 ? 1.5 : 1.6));
        }
        sfM.compose(sfV, sfQ, sfS); F.im.setMatrixAt(i, sfM);
      });
      F.im.instanceMatrix.needsUpdate = true; if (F.im.instanceColor) F.im.instanceColor.needsUpdate = true;
    });
  }
  // ===== fireflies on summer evenings =====
  var summerFireflies = (function () {
    var N = 140, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), seeds = [];
    for (var i = 0; i < N; i++) seeds.push({ x: (springHash(i * 4.3 + 9) - 0.5) * 30, z: (springHash(i * 6.1 + 3) - 0.5) * 30, h: 0.3 + springHash(i * 2.9) * 1.4, w: springHash(i * 8.8) * 6.28, b: 0.6 + springHash(i * 1.1) * 0.9 });
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var pts = new THREE.Points(g, new THREE.PointsMaterial({ map: dawnGlowTex, size: 0.34, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    var halo = new THREE.Points(g, new THREE.PointsMaterial({ map: dawnGlowTex, size: 1.1, vertexColors: true, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));   // (and a soft glow round each one)
    halo.frustumCulled = false; pts.add(halo);
    pts.frustumCulled = false; pts.visible = false; pts.userData.seeds = seeds; scene.add(pts); return pts;
  })();
  function summerFirefliesMove(night) {
    var a = summerFireflies.geometry.attributes.position, c = summerFireflies.geometry.attributes.color, S = summerFireflies.userData.seeds, cx = cam.target.x, cz = cam.target.z, t = state.time;
    S.forEach(function (s, i) {
      var x = cx + (((s.x + Math.sin(t * 0.13 + s.w) * 2) % 30) + 45) % 30 - 15, z = cz + (((s.z + Math.cos(t * 0.11 + s.w) * 2) % 30) + 45) % 30 - 15;
      var y = Math.max(groundHeight(x, z), WATER_Y) + s.h + Math.sin(t * 0.9 + s.w) * 0.25;
      a.setXYZ(i, x, y, z);
      var glow = Math.max(0, Math.sin(t * s.b + s.w * 3)) * night; glow = glow * glow;   // (each one blinks slowly on and off)
      c.setXYZ(i, Math.min(1, glow * 1.2), Math.min(1, glow * 1.4), glow * 0.45);
    });
    a.needsUpdate = c.needsUpdate = true;
  }
  // ===== long, bright summer days: a deep blue sky, warm golden sunshine, and lusher grass =====
  var SUMMER_SKY = new THREE.Color(0x3f9ef0), SUMMER_SUN = new THREE.Color(0xffd890), SUMMER_GRASS = new THREE.Color(0.78, 0.94, 0.66), SUMMER_GROUND = new THREE.Color(0.88, 0.98, 0.8), summerPlain = new THREE.Color(1, 1, 1);
  var summerBaseSky = updateSky;
  updateSky = function () {
    var night = summerBaseSky.apply(this, arguments);
    if (summerNow()) {
      var day = Math.max(0, 1 - night * 1.6);                           // (strongest at midday, fading out toward dusk)
      scene.background.lerp(SUMMER_SKY, 0.55 * day); scene.fog.color.copy(scene.background);
      sun.color.lerp(SUMMER_SUN, 0.45 * day); sun.intensity *= 1 + 0.3 * day; hemi.intensity *= 1 + 0.12 * day;
    }
    return night;
  };
  // ===== dragonflies darting over the pond =====
  var summerDragonflies = (function () {
    var list = [], mBody = [0x2a8ad0, 0x30b0a0, 0xd04a30, 0x7a50c0].map(function (c) { return new THREE.MeshStandardMaterial({ color: c, metalness: 0.5, roughness: 0.3 }); });
    var mWing = new THREE.MeshStandardMaterial({ color: 0xdff2ff, transparent: true, opacity: 0.45, side: THREE.DoubleSide, roughness: 0.1, metalness: 0.3, depthWrite: false });
    for (var i = 0; i < 6; i++) {
      var G = new THREE.Group();
      var tail = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.004, 0.16, 6), mBody[i % 4]); tail.rotation.x = Math.PI / 2; tail.position.z = -0.08; G.add(tail);
      var thorax = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), mBody[i % 4]); thorax.scale.set(1, 1, 1.5); G.add(thorax);
      [-1, 1].forEach(function (s) { var eye = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), mBody[i % 4]); eye.position.set(s * 0.011, 0.004, 0.028); G.add(eye); });
      var wings = [];
      [0.006, -0.02].forEach(function (z, r) { [-1, 1].forEach(function (s) { var w = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.026), mWing); w.position.set(s * 0.068, 0.006, z); w.rotation.x = -Math.PI / 2; G.add(w); wings.push({ m: w, s: s, r: r }); }); });
      G.scale.setScalar(2.6); G.visible = false; scene.add(G);
      list.push({ g: G, wings: wings, ph: springHash(i * 5.3 + 2) * 6.28, sp: 0.6 + springHash(i * 2.7) * 0.6, dart: 0 });
    }
    return list;
  })();
  function summerDragonfliesMove(on) {
    var t = state.time;
    summerDragonflies.forEach(function (D, i) {
      if (D.g.visible !== on) D.g.visible = on;
      if (!on) return;
      var a = t * 0.35 * D.sp + D.ph, r = LAKE_R * (0.35 + 0.35 * Math.sin(a * 0.7 + i));   // (zipping about over the water, hovering, then darting off again)
      var hover = Math.sin(t * 0.8 + D.ph) > 0.3 ? 0.15 : 1, x = LAKE_X + Math.cos(a * hover) * r, z = LAKE_Z + Math.sin(a * 1.3 * hover) * r * 0.8, y = WATER_Y + 0.35 + Math.sin(t * 1.7 + i) * 0.15;
      var dx = x - D.g.position.x, dz = z - D.g.position.z;
      D.g.position.set(x, y, z); if (Math.abs(dx) + Math.abs(dz) > 1e-4) D.g.rotation.y = Math.atan2(dx, dz);
      D.wings.forEach(function (w) { w.m.rotation.y = w.s * Math.sin(t * 60 + w.r * 1.5 + D.ph) * 0.35; });   // (wings a blur)
    });
  }
  // ===== big fluffy summer clouds, drifting slowly across the blue =====
  var summerClouds = (function () {
    function cloudTex(seed) {                                          // (heaped, sunlit puffs, bright on top and soft grey-blue underneath)
      var c = document.createElement('canvas'); c.width = 512; c.height = 256; var g = c.getContext('2d');
      var puffs = [];
      for (var i = 0; i < 26; i++) { var u = springHash(seed * 13 + i * 1.7), v = springHash(seed * 7 + i * 2.9); puffs.push([90 + u * 330, 150 - Math.sin(u * Math.PI) * (40 + v * 60) + v * 20, 34 + springHash(seed + i * 3.1) * 46]); }
      puffs.sort(function (a, b) { return b[1] - a[1]; });
      puffs.forEach(function (p) {
        var gr = g.createRadialGradient(p[0] - p[2] * 0.25, p[1] - p[2] * 0.35, p[2] * 0.1, p[0], p[1], p[2]);
        gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.55, 'rgba(250,252,255,0.95)'); gr.addColorStop(0.85, 'rgba(214,226,242,0.75)'); gr.addColorStop(1, 'rgba(200,214,236,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(p[0], p[1], p[2], 0, Math.PI * 2); g.fill();
      });
      var base = g.createLinearGradient(0, 150, 0, 210); base.addColorStop(0, 'rgba(190,206,230,0)'); base.addColorStop(1, 'rgba(255,255,255,0)');
      var t = new THREE.CanvasTexture(c); return t;
    }
    var list = [];
    for (var i = 0; i < 9; i++) {
      var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex(i + 1), fog: false, depthWrite: false, transparent: true, opacity: 0.95 }));
      var w = 34 + springHash(i * 2.3) * 30; s.scale.set(w, w * 0.5, 1); s.renderOrder = -1; s.visible = false; scene.add(s);
      list.push({ s: s, a: i / 9 * Math.PI * 2 + springHash(i) * 0.5, r: 90 + springHash(i * 5.1) * 60, y: 32 + springHash(i * 3.3) * 22 });
    }
    return list;
  })();
  function summerCloudsMove(on) {
    var t = state.time, cx = camera.position.x, cz = camera.position.z;
    summerClouds.forEach(function (C) {
      if (C.s.visible !== on) C.s.visible = on;
      if (!on) return;
      var a = C.a + t * 0.004; C.s.position.set(cx + Math.cos(a) * C.r, C.y, cz + Math.sin(a) * C.r);
    });
  }
  // ===== bees busy over the sunflowers and the lavender =====
  var summerBees = (function () {                                      // (honeybees and fat, furry bumblebees, each with its fuzzy thorax, banded abdomen, big
    //                                                                     dark eyes, elbowed antennae, six legs with pollen on the back pair, and four veined wings)
    function bandTex(cols, bands) {                                    // (stripes running round the abdomen, softened with fine hairs)
      return cpTex(64, 128, function (g, w, h) {
        bands.forEach(function (b, i) { g.fillStyle = cols[b]; g.fillRect(0, i / bands.length * h, w, h / bands.length + 1); });
        for (var k = 0; k < 900; k++) { var x = springHash(k * 1.3) * w, y = springHash(k * 2.7) * h; g.strokeStyle = 'rgba(' + (springHash(k) < 0.5 ? '255,240,200' : '30,20,10') + ',0.25)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 1.5, y + 3); g.stroke(); }
      });
    }
    function furTex(base, tip) {                                       // (a dense coat of hair, for the thorax)
      return cpTex(64, 64, function (g, w, h) { g.fillStyle = base; g.fillRect(0, 0, w, h); for (var k = 0; k < 700; k++) { var x = springHash(k * 3.1 + 1) * w, y = springHash(k * 1.9 + 2) * h; g.strokeStyle = springHash(k * 7) < 0.6 ? tip : 'rgba(40,25,10,0.5)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (springHash(k) - 0.5) * 3, y + 2.5); g.stroke(); } });
    }
    var hairTex = cpTex(64, 64, function (g, w, h) { g.clearRect(0, 0, w, h); for (var k = 0; k < 500; k++) { var x = springHash(k * 5.3) * w, y = springHash(k * 6.1) * h; g.strokeStyle = 'rgba(255,236,190,0.55)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (springHash(k * 2) - 0.5) * 2, y + 3); g.stroke(); } });
    var wingTex = cpTex(128, 64, function (g, w, h) {                  // (clear wing with dark veins and a faint rainbow sheen)
      g.clearRect(0, 0, w, h); var gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, 'rgba(220,240,255,0.55)'); gr.addColorStop(0.5, 'rgba(240,220,255,0.4)'); gr.addColorStop(1, 'rgba(220,255,236,0.5)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(60,45,30,0.85)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, 18); g.lineTo(w * 0.95, 14); g.moveTo(4, 40); g.quadraticCurveTo(w * 0.4, 30, w * 0.7, 22); g.moveTo(w * 0.3, 18); g.lineTo(w * 0.36, 42); g.moveTo(w * 0.52, 16); g.lineTo(w * 0.6, 36); g.lineTo(w * 0.8, 34); g.lineTo(w * 0.72, 17); g.stroke();
    });
    var KINDS = [
      { name: 'honey', band: bandTex(['#e8a830', '#3a2412', '#c88a20'], [0, 1, 2, 1, 0, 1, 2, 1, 1]), fur: furTex('#b88a40', 'rgba(255,220,150,0.7)'), size: 1, fat: 1 },
      { name: 'bumble', band: bandTex(['#f2c838', '#1e1612', '#fbf6ea'], [1, 0, 0, 1, 1, 1, 2, 2, 2]), fur: furTex('#e8c040', 'rgba(255,240,170,0.8)'), size: 1.25, fat: 1.25, thoraxBand: true }
    ];
    var mDark = new THREE.MeshStandardMaterial({ color: 0x1e1612, roughness: 0.55 }), mEye = new THREE.MeshStandardMaterial({ color: 0x120e10, roughness: 0.15, metalness: 0.3 });
    var mLeg = new THREE.MeshStandardMaterial({ color: 0x2a1e14, roughness: 0.7 }), mPollen = new THREE.MeshStandardMaterial({ color: 0xf0a020, roughness: 0.9 });
    var mWing = new THREE.MeshStandardMaterial({ map: wingTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, roughness: 0.15, metalness: 0.2 });
    var mHair = new THREE.MeshStandardMaterial({ map: hairTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, roughness: 1 });
    var abdGeo = new THREE.LatheGeometry([[0.0, -0.034], [0.006, -0.032], [0.013, -0.024], [0.016, -0.012], [0.016, 0.0], [0.013, 0.008], [0.008, 0.012], [0, 0.013]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 14);
    abdGeo.rotateX(Math.PI / 2);                                       // (the abdomen lies along the body, its tip at the back)
    var foreWing = (function () { var sh = new THREE.Shape(); sh.moveTo(0, 0); sh.bezierCurveTo(0.012, 0.008, 0.035, 0.01, 0.045, 0.002); sh.bezierCurveTo(0.04, -0.008, 0.015, -0.008, 0, 0); var g = new THREE.ShapeGeometry(sh, 8), uv = g.attributes.uv, p = g.attributes.position; for (var i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 0.045, (p.getY(i) + 0.01) / 0.02); g.rotateX(-Math.PI / 2); return g; })();
    var hindWing = foreWing.clone(); hindWing.scale(0.68, 1, 0.7);
    var list = [];
    for (var i = 0; i < 10; i++) {
      var K = KINDS[i % 3 === 2 ? 1 : 0], G = new THREE.Group();
      var mBand = new THREE.MeshStandardMaterial({ map: K.band, roughness: 0.75 }), mFur = new THREE.MeshStandardMaterial({ map: K.fur, roughness: 1 });
      var abd = new THREE.Mesh(abdGeo, mBand); abd.position.z = -0.012; abd.scale.set(K.fat, K.fat, 1); G.add(abd);
      var abdHair = new THREE.Mesh(abdGeo, mHair); abdHair.position.z = -0.012; abdHair.scale.set(K.fat * 1.12, K.fat * 1.12, 1.06); G.add(abdHair);
      var sting = new THREE.Mesh(new THREE.ConeGeometry(0.0018, 0.006, 4), mDark); sting.rotation.x = -Math.PI / 2; sting.position.z = -0.048; G.add(sting);
      var thorax = new THREE.Mesh(new THREE.SphereGeometry(0.012 * K.fat, 12, 10), mFur); thorax.position.z = 0.012; G.add(thorax);
      var thHair = new THREE.Mesh(new THREE.SphereGeometry(0.014 * K.fat, 12, 10), mHair); thHair.position.z = 0.012; G.add(thHair);
      var head = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 10, 8), mDark); head.scale.set(1.15, 1, 0.85); head.position.set(0, -0.001, 0.027); G.add(head);
      [-1, 1].forEach(function (s) {
        var eye = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 8, 6), mEye); eye.scale.set(0.7, 1.3, 0.9); eye.position.set(s * 0.0072, 0.001, 0.028); G.add(eye);   // (big glossy compound eyes)
        var a1 = new THREE.Mesh(new THREE.CylinderGeometry(0.0007, 0.0007, 0.01, 4), mDark); a1.position.set(s * 0.003, 0.007, 0.032); a1.rotation.set(0.5, 0, -s * 0.3); G.add(a1);   // (antennae, bent at the elbow)
        var a2 = new THREE.Mesh(new THREE.CylinderGeometry(0.0007, 0.0006, 0.011, 4), mDark); a2.position.set(s * 0.006, 0.0105, 0.039); a2.rotation.set(1.3, 0, -s * 0.2); G.add(a2);
        var mand = new THREE.Mesh(new THREE.BoxGeometry(0.0018, 0.0012, 0.004), mDark); mand.position.set(s * 0.002, -0.007, 0.033); mand.rotation.y = s * 0.4; G.add(mand);
        for (var l = 0; l < 3; l++) {                                    // (six legs, folded under, the back pair carrying pollen)
          var leg = new THREE.Group(); leg.position.set(s * 0.008, -0.008, 0.02 - l * 0.009); leg.rotation.set(0.35 * (l - 1), 0, s * 0.9); G.add(leg);
          var up = new THREE.Mesh(new THREE.CylinderGeometry(0.0009, 0.0008, 0.012, 4), mLeg); up.position.y = -0.006; leg.add(up);
          var low = new THREE.Mesh(new THREE.CylinderGeometry(0.0008, 0.0006, 0.013, 4), mLeg); low.position.set(0, -0.012, 0.004); low.rotation.x = -0.9; leg.add(low);
          if (l === 2) { var pol = new THREE.Mesh(new THREE.SphereGeometry(0.0032, 8, 6), mPollen); pol.position.set(0, -0.011, 0.002); leg.add(pol); }
        }
      });
      var wings = [-1, 1].map(function (s) {                          // (each side: a hinge on the thorax, with the fore and hind wing on it)
        var hinge = new THREE.Group(); hinge.position.set(s * 0.006, 0.011 * K.fat, 0.014); hinge.scale.x = s; G.add(hinge);
        var fw = new THREE.Mesh(foreWing, mWing); fw.rotation.y = -0.35; hinge.add(fw);
        var hw = new THREE.Mesh(hindWing, mWing); hw.position.z = -0.006; hw.rotation.y = -0.6; hinge.add(hw);
        return hinge;
      });
      G.scale.setScalar(1.45 * K.size); G.visible = false; scene.add(G);
      list.push({ g: G, wings: wings, ph: springHash(i * 3.7 + 9) * 6.28, sp: 0.8 + springHash(i * 1.3) * 0.5, f: null });
    }
    return list;
  })();
  function summerBeesMove(on) {
    var t = state.time, px = player.position.x, pz = player.position.z;
    summerBees.forEach(function (B, i) {
      if (B.g.visible !== on) B.g.visible = on;
      if (!on) { B.f = null; return; }
      if (!B.f || dist(B.f.x, B.f.z, px, pz) > 22 || Math.sin(t * 0.07 + B.ph) > 0.97) {   // (to a flower near you, and off to another now and then)
        var near = SUMMER_FLOWERS.filter(function (f) { return (f.kind === 'sun' || f.kind === 'lav') && dist(f.x, f.z, px, pz) < 16; });
        if (!near.length) { B.g.visible = false; return; }
        B.f = near[Math.floor(springHash(i * 5.9 + Math.floor(t / 9)) * near.length) % near.length];
      }
      var f = B.f, a = t * 2.2 * B.sp + B.ph, top = f.y + f.h + (f.kind === 'sun' ? 0.05 : -0.05), landed = Math.sin(t * 0.45 * B.sp + B.ph) > 0.45;
      if (landed) {                                                    // (settled on the flower a moment: on a sunflower's face, or the top of a lavender spike)
        var fx = f.kind === 'sun' ? Math.sin(f.rot) * 0.05 : 0, fz = f.kind === 'sun' ? Math.cos(f.rot) * 0.05 : 0;
        B.g.position.set(f.x + fx + Math.sin(i * 2.1) * 0.04, f.y + f.h + (f.kind === 'sun' ? 0.02 + Math.cos(i * 1.7) * 0.04 : 0.03), f.z + fz);
        B.g.rotation.set(f.kind === 'sun' ? -0.9 : 0, f.kind === 'sun' ? f.rot + Math.PI : B.ph, 0);
        B.wings.forEach(function (w, k) { w.rotation.z = (k ? -1 : 1) * (0.08 + Math.max(0, Math.sin(t * 9 + B.ph)) * 0.15); });   // (wings folded, with a flick now and then)
        return;
      }
      var x = f.x + Math.sin(a) * 0.28 + Math.sin(a * 3.1) * 0.06, z = f.z + Math.cos(a * 0.8) * 0.28, y = top + 0.12 + Math.sin(a * 2.3) * 0.1;
      B.g.position.set(x, y, z); B.g.rotation.set(Math.sin(a * 2.3) * 0.15, a + Math.PI / 2, 0);
      B.wings.forEach(function (w, k) { w.rotation.z = (k ? -1 : 1) * (0.25 + Math.sin(t * 70 + B.ph) * 0.55); });   // (a blur of beating wings)
    });
  }
  // ===== dandelion clocks in the grass, and more water lilies opening on the pond =====
  var summerClocks = (function () {                                    // (dandelions: fluffy seed clocks and golden flowers, each with a rosette of toothed leaves)
    var pts = [];
    for (var c = 0, tries = 0; c < 50 && tries < 3000; tries++) {
      var x = -ISLAND + 3 + springHash(tries * 2.9 + 501) * (ISLAND * 2 - 6), z = -ISLAND + 3 + springHash(tries * 3.7 + 211) * (ISLAND * 2 - 6);
      if (!springFlowerSpot(x, z, 0.6)) continue; c++;
      for (var k = 0; k < 4; k++) {
        var xx = x + (springHash(c * 5 + k) - 0.5) * 0.8, zz = z + (springHash(c * 7 + k) - 0.5) * 0.8;
        if (springFlowerSpot(xx, zz, 0.3)) pts.push({ x: xx, z: zz, y: groundHeight(xx, zz), h: 0.24 + springHash(c + k * 3) * 0.14, tilt: (springHash(c * 2 + k) - 0.5) * 0.3, rot: springHash(c * 3 + k) * 6.28, clock: springHash(c * 9 + k * 2) < 0.6 });
      }
    }
    // (the clock: a soft, see-through ball of fine white seed fluff, with a paler core)
    var fluffTex = cpTex(512, 256, function (g, w, h) {
      g.clearRect(0, 0, w, h);
      for (var i = 0; i < 900; i++) {
        var x = springHash(i * 1.7 + 3) * w, y = 8 + springHash(i * 2.3 + 5) * (h - 16), r = 6 + springHash(i * 3.1) * 5;
        g.strokeStyle = 'rgba(255,255,255,' + (0.75 + springHash(i) * 0.25) + ')'; g.lineWidth = 1.5;
        for (var ray = 0; ray < 9; ray++) { var a = ray / 9 * Math.PI * 2 + i; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.stroke(); }   // (each seed's little parachute, seen end on)
        g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(x, y, 0.9, 0, Math.PI * 2); g.fill();
      }
    });
    var outer = new THREE.SphereGeometry(0.05, 20, 14), inner = new THREE.SphereGeometry(0.04, 16, 12), knob = new THREE.SphereGeometry(0.006, 8, 6);
    // (the flower: a shaggy golden pompom of strap-shaped florets in three rings, with green bracts curling back underneath)
    var fl = new THREE.Shape(); fl.moveTo(-0.003, 0); fl.lineTo(0.003, 0); fl.lineTo(0.004, 0.026); fl.lineTo(0.0015, 0.029); fl.lineTo(0, 0.027); fl.lineTo(-0.0015, 0.029); fl.lineTo(-0.004, 0.026); fl.closePath();
    var flParts = [];
    [[30, 0.12, 1], [26, 0.55, 0.92], [20, 0.98, 0.78], [12, 1.4, 0.56]].forEach(function (ring, ri) { for (var i = 0; i < ring[0]; i++) { var g = new THREE.ShapeGeometry(fl, 2); g.scale(ring[2], ring[2], 1); g.rotateX(-Math.PI / 2 + ring[1]); g.rotateY(i / ring[0] * Math.PI * 2 + ri * 0.4); g.translate(0, ri * 0.004, 0); flParts.push(g); } });
    var flowerGeo = mergeSimple(flParts);
    var bracts = []; for (var bi = 0; bi < 10; bi++) { var bg = new THREE.ShapeGeometry(fl, 2); bg.scale(0.9, 0.8, 1); bg.rotateX(Math.PI / 2 + 0.5); bg.rotateY(bi / 10 * Math.PI * 2); bracts.push(bg); }
    var bractGeo = mergeSimple(bracts);
    // (a rosette leaf: long, with deep backward-pointing teeth, rising from the ground at a slant)
    var lf = new THREE.Shape(); lf.moveTo(0, -0.008);
    [[0.012, 0.03], [0.006, 0.04], [0.02, 0.075], [0.009, 0.085], [0.024, 0.12], [0.01, 0.13], [0.018, 0.16], [0, 0.19]].forEach(function (q) { lf.lineTo(q[0], q[1]); });
    [[-0.018, 0.16], [-0.01, 0.13], [-0.024, 0.12], [-0.009, 0.085], [-0.02, 0.075], [-0.006, 0.04], [-0.012, 0.03], [0, -0.008]].forEach(function (q) { lf.lineTo(q[0], q[1]); });
    var leafGeo = new THREE.ShapeGeometry(lf, 1); leafGeo.rotateX(-Math.PI / 2 + 0.45);
    var stem = new THREE.CylinderGeometry(0.0035, 0.005, 1, 5); stem.translate(0, 0.5, 0);
    var mStem = new THREE.MeshStandardMaterial({ color: 0x7aa85a, roughness: 0.8 }), mLeaf = new THREE.MeshStandardMaterial({ color: 0x4e8a3a, roughness: 0.75, side: THREE.DoubleSide });
    var mFluff = new THREE.MeshStandardMaterial({ map: fluffTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, roughness: 0.8, emissive: 0x9a9a96, emissiveMap: fluffTex });
    var mCore = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x6a6a66, transparent: true, opacity: 0.62, depthWrite: false, roughness: 0.9 });
    var mKnob = new THREE.MeshStandardMaterial({ color: 0x8a7050, roughness: 0.9 }), mGold = new THREE.MeshStandardMaterial({ color: 0xf6c020, roughness: 0.6, side: THREE.DoubleSide });
    var clocks = pts.filter(function (p) { return p.clock; }), blooms = pts.filter(function (p) { return !p.clock; });
    var parts = [
      { geo: stem, m: mStem, list: pts, at: 'stem' }, { geo: leafGeo, m: mLeaf, list: pts, at: 'leaves' },
      { geo: knob, m: mKnob, list: clocks, at: 'head' }, { geo: inner, m: mCore, list: clocks, at: 'head' }, { geo: outer, m: mFluff, list: clocks, at: 'head' },
      { geo: flowerGeo, m: mGold, list: blooms, at: 'head', big: 1.35 }, { geo: bractGeo, m: mLeaf, list: blooms, at: 'head' }
    ];
    var ims = [], m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
    parts.forEach(function (P) {
      var n = P.at === 'leaves' ? P.list.length * 5 : P.list.length, im = new THREE.InstancedMesh(P.geo, P.m, Math.max(1, n)), k = 0;
      P.list.forEach(function (p) {
        e.set(p.tilt, p.rot, 0); q.setFromEuler(e);
        if (P.at === 'stem') { v.set(p.x, p.y, p.z); m.compose(v, q, s.set(1, p.h, 1)); im.setMatrixAt(k++, m); }
        else if (P.at === 'leaves') for (var l = 0; l < 5; l++) { e.set(0, p.rot + l * 1.26 + springHash(l + p.x) * 0.3, 0); q.setFromEuler(e); v.set(p.x, p.y + 0.01, p.z); var ls = 0.85 + springHash(l * 3 + p.z) * 0.4; m.compose(v, q, s.set(ls, ls, ls)); im.setMatrixAt(k++, m); }
        else { var hs = 1.3 * (P.big || 1); v.set(0, p.h, 0).applyQuaternion(q).add(s.set(p.x, p.y, p.z)); m.compose(v, q, s.set(hs, hs, hs)); im.setMatrixAt(k++, m); }
      });
      im.castShadow = P.m !== mFluff && P.m !== mCore; im.frustumCulled = false; im.visible = false; scene.add(im); ims.push(im);
    });
    return { ims: ims, pts: pts };
  })();
  var summerLilies = (function () {                                    // (lilies opening on pads that had none)
    var out = [];
    lilyPads.forEach(function (pad, i) {
      if (springHash(i * 3.3 + 70) > 0.45) return;
      if (lilyFlowers.some(function (f) { return dist(f.position.x, f.position.z, pad.position.x, pad.position.z) < 0.5; })) return;
      var f = waterLily(pad.position.x + 0.05, pad.position.z - 0.04, springHash(i * 1.7) < 0.55); f.visible = false; lilyFlowers.push(f); out.push(f);
    });
    return out;
  })();
  // ===== every frame =====
  function updateSummer(dt) {
    var on = summerNow();
    leafBatch.material.color.copy(on ? SUMMER_LEAF : PLAIN_LEAF);
    grassMat.color.copy(on ? SUMMER_GRASS : summerPlain); terrain.material.color.copy(on ? SUMMER_GROUND : summerPlain);
    var dhr = state.minutes / 60; summerDragonfliesMove(on && !indoors && dhr > 7 && dhr < 19);
    summerCloudsMove(on && !indoors); summerBeesMove(on && !indoors && dhr > 7 && dhr < 19);
    if (summerClocks.ims[0].visible !== on) { summerClocks.ims.forEach(function (im) { im.visible = on; }); summerLilies.forEach(function (f) { f.visible = on; }); }
    if (summerFruit.visible !== on) { summerFruit.visible = on; summerStalks.visible = on; summerFruitLeaves.visible = on; }
    if (on !== summerWasOn || state.time - summerFlowerT > 2) { summerWasOn = on; summerFlowerT = state.time; summerFlowersPlace(on); }
    var hr = state.minutes / 60, dusk = hr >= 19 ? Math.min(1, (hr - 19) / 1.2) : hr < 4.5 ? 1 : hr < 5.5 ? 5.5 - hr : 0, flies = on && !indoors && dusk > 0;
    if (summerFireflies.visible !== flies) summerFireflies.visible = flies;
    if (flies) summerFirefliesMove(dusk);
  }

  // ---------- Fall on the island ----------
  // While it's Fall: the broadleaf trees and bushes turn crimson, orange, gold and russet (the pines stay green), the
  // light goes warm and golden, the grass dries toward straw, leaves come tumbling down around you, pumpkin
  // patches ripen in the meadows among their big leaves and curling vines, and clusters
  // of red-and-white toadstools and brown mushrooms come up at the feet of the trees
  function fallNow() { return seasonOf(state.day) === 2; }
  // ===== autumn colours on the trees =====
  var fallLeafTex = paintTexture(256, 256, function (g) {             // (the same round clumps of leaves as the green ones, in autumn colours)
    for (var i = 0; i < 320; i++) {
      var a = Math.random() * Math.PI * 2, r = Math.pow(Math.random(), 0.65) * 108, x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r * 0.92;
      var len = 14 + Math.random() * 14, ang = Math.random() * Math.PI * 2, sunny = Math.max(0, Math.min(1, 0.55 - ((x - 128) + (y - 128)) / 300));
      g.save(); g.translate(x, y); g.rotate(ang);
      var hue = [8, 18, 28, 38, 46][Math.floor(Math.random() * 5)] + Math.random() * 8;
      g.fillStyle = 'hsl(' + hue + ',' + (70 + Math.random() * 20) + '%,' + (34 + sunny * 24 + Math.random() * 10) + '%)';
      g.beginPath(); g.ellipse(0, 0, len / 2, len * 0.26, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(70,30,10,0.22)'; g.lineWidth = 1; g.stroke();
      g.strokeStyle = 'rgba(255,230,170,' + (0.15 + sunny * 0.3) + ')'; g.beginPath(); g.moveTo(-len / 2, 0); g.lineTo(len / 2, 0); g.stroke();
      g.restore();
    }
  });
  var fallGreenTex = leafBatch.material.map, fallLeafOrig = leafBatch.instanceColor ? leafBatch.instanceColor.array.slice() : null, fallLeafCols = null, fallShown = null;
  (function () {                                                       // (each tree its own autumn colour: scarlet maples, orange, gold, russet, and the odd one still turning)
    if (!fallLeafOrig) return;
    fallLeafCols = fallLeafOrig.slice();
    var TINTS = [[1.1, 0.5, 0.42], [1.08, 0.72, 0.5], [1.05, 0.95, 0.55], [0.9, 0.62, 0.46], [1.0, 0.82, 0.5], [0.85, 1.0, 0.6]];
    allScenery.forEach(function (t, ti) {
      var u = t.userData; if (!u.leaves) return;
      var tint = TINTS[Math.floor(springHash(ti * 3.9 + 5) * TINTS.length)];
      u.leaves.forEach(function (L) {
        if (L.batch !== leafBatch) return;
        for (var i = L.start; i < L.start + L.count; i++) {
          var shade = fallLeafOrig[i * 3 + 1], k = shade * (0.95 + springHash(i * 1.3) * 0.2), mix = springHash(i * 0.77) < 0.12 ? 0.85 : 1;   // (a few cards a shade apart)
          fallLeafCols[i * 3] = tint[0] * k * mix; fallLeafCols[i * 3 + 1] = tint[1] * k; fallLeafCols[i * 3 + 2] = tint[2] * k * (2 - mix);
        }
      });
    });
  })();
  // ===== dry leaves: maple, oak and birch, each with its veins and a few freckles, for the falling leaves =====
  var fallVeinTex = cpTex(128, 128, function (g, w, h) {
    var gr = g.createRadialGradient(64, 70, 10, 64, 64, 80); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.75, '#f2ece2'); gr.addColorStop(1, '#a89880'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(90,60,30,0.55)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(64, 128); g.lineTo(64, 4); g.stroke();   // (the midrib)
    g.lineWidth = 1.3; [[-1, 0.9], [1, 0.9], [-1, 0.55], [1, 0.55], [-1, 0.3], [1, 0.3]].forEach(function (v) { g.beginPath(); g.moveTo(64, 128 * v[1]); g.quadraticCurveTo(64 + v[0] * 26, 128 * v[1] - 22, 64 + v[0] * 56, 128 * v[1] - 40); g.stroke(); });
    g.lineWidth = 0.6; for (var k = 0; k < 40; k++) { var y = 20 + springHash(k * 3.1) * 100, sd = springHash(k) < 0.5 ? -1 : 1; g.beginPath(); g.moveTo(64 + sd * 6, y); g.lineTo(64 + sd * (14 + springHash(k * 7) * 24), y - 10); g.stroke(); }
    for (var s = 0; s < 22; s++) { g.fillStyle = 'rgba(70,40,15,' + (0.15 + springHash(s * 5.1) * 0.25) + ')'; g.beginPath(); g.arc(springHash(s * 2.3) * w, springHash(s * 4.7) * h, 1 + springHash(s) * 2.6, 0, Math.PI * 2); g.fill(); }   // (freckles of age)
  });
  function fallLeafShape(P, curl) {
    var sh = new THREE.Shape(); P.forEach(function (q, i) { if (i) sh.lineTo(q[0], q[1]); else sh.moveTo(q[0], q[1]); }); sh.closePath();
    var g = new THREE.ShapeGeometry(sh, 3), gp = g.attributes.position, uv = g.attributes.uv;
    for (var i = 0; i < gp.count; i++) { uv.setXY(i, gp.getX(i) + 0.5, gp.getY(i) + 0.5); gp.setZ(i, gp.getX(i) * gp.getX(i) * curl - gp.getY(i) * 0.06 + Math.sin(gp.getY(i) * 9) * 0.01); }   // (curled and a little wavy, as dry leaves are)
    g.computeVertexNormals(); g.scale(0.12, 0.12, 0.12); return g;
  }
  var fallLeafGeos = [
    fallLeafShape([[0, -0.5], [0.05, -0.2], [0.32, -0.28], [0.26, -0.1], [0.5, 0.05], [0.34, 0.1], [0.4, 0.32], [0.18, 0.22], [0.14, 0.5], [0, 0.32], [-0.14, 0.5], [-0.18, 0.22], [-0.4, 0.32], [-0.34, 0.1], [-0.5, 0.05], [-0.26, -0.1], [-0.32, -0.28], [-0.05, -0.2]], 0.3),   // (maple)
    fallLeafShape([[0, -0.5], [0.08, -0.35], [0.2, -0.3], [0.14, -0.15], [0.28, -0.08], [0.2, 0.06], [0.32, 0.16], [0.2, 0.28], [0.26, 0.4], [0.1, 0.45], [0, 0.5], [-0.1, 0.45], [-0.26, 0.4], [-0.2, 0.28], [-0.32, 0.16], [-0.2, 0.06], [-0.28, -0.08], [-0.14, -0.15], [-0.2, -0.3], [-0.08, -0.35]], 0.4),   // (oak, with its rounded lobes)
    fallLeafShape([[0, -0.5], [0.12, -0.32], [0.26, -0.1], [0.3, 0.1], [0.22, 0.3], [0.08, 0.46], [0, 0.5], [-0.08, 0.46], [-0.22, 0.3], [-0.3, 0.1], [-0.26, -0.1], [-0.12, -0.32]], 0.5)   // (birch: small, oval and pointed)
  ];
  var fallLeafGeo = fallLeafGeos[0];
  var fallLeafMat = new THREE.MeshStandardMaterial({ map: fallVeinTex, roughness: 0.8, side: THREE.DoubleSide });
  var FALL_COLS = [0xd8401c, 0xe86a1c, 0xf0a020, 0xe8c040, 0xb8541c, 0x9a3a1a, 0xc8781c];
  // ===== leaves tumbling down around you =====
  var fallDrift = fallLeafGeos.map(function (geo, gi) {
    var N = 40, im = new THREE.InstancedMesh(geo, fallLeafMat, N), seeds = [], col = new THREE.Color();
    for (var i = 0; i < N; i++) { var j = i * 3 + gi; seeds.push({ x: (springHash(j * 3.1 + 40) - 0.5) * 26, y: springHash(j * 5.3 + 40) * 9, z: (springHash(j * 7.7 + 40) - 0.5) * 26, s: 0.35 + springHash(j * 2.9) * 0.4, w: springHash(j * 9.1) * 6.28, spin: 1 + springHash(j * 4.4) * 2.5 }); im.setColorAt(i, col.set(FALL_COLS[j % FALL_COLS.length])); }
    im.frustumCulled = false; im.visible = false; im.castShadow = true; scene.add(im); im.userData.seeds = seeds; return im;
  });
  var fdM = new THREE.Matrix4(), fdQ = new THREE.Quaternion(), fdE = new THREE.Euler(), fdV = new THREE.Vector3(), fdS = new THREE.Vector3(1, 1, 1);
  function fallDriftMove(dt) {
    var cx = cam.target.x, cz = cam.target.z, t = state.time;
    fallDrift.forEach(function (im) {
      im.userData.seeds.forEach(function (s, i) {
        s.y -= dt * s.s; s.x += dt * (0.35 + Math.sin(t * 0.6 + s.w) * 0.4); s.z += dt * Math.cos(t * 0.45 + s.w) * 0.25;
        var wx = cx + ((s.x % 26) + 39) % 26 - 13, wz = cz + ((s.z % 26) + 39) % 26 - 13, gy = Math.max(groundHeight(wx, wz), WATER_Y);
        if (s.y < gy + 0.05) s.y = gy + 7 + springHash(i + t) * 3;      // (a leaf that lands is gone; a new one starts high up)
        fdV.set(wx + Math.sin(t * 1.3 + s.w) * 0.35, s.y, wz); fdE.set(t * s.spin + s.w, t * 0.7 * s.spin, Math.sin(t * 2 + s.w) * 0.8); fdQ.setFromEuler(fdE);   // (fluttering and spinning as it falls)
        fdM.compose(fdV, fdQ, fdS); im.setMatrixAt(i, fdM);
      });
      im.instanceMatrix.needsUpdate = true;
    });
  }
  // ===== pumpkin patches and mushrooms =====
  var FALL_PUMPKINS = [], FALL_MUSH = [], fallDecorShown = null, fallDecorT = -99, fallWasOn = null, fallMeshes = [];
  var FALL_SHOCKS = [];
  (function () {                                                       // (little groups of pumpkins round the edge of your farm)
    var fx = FARM_X + COLS * TILE / 2, fz = FARM_Z + ROWS * TILE / 2;
    for (var c = 0, tries = 0; c < 7 && tries < 3000; tries++) {
      var a = springHash(tries * 2.7 + 77) * 6.28, d = 6 + springHash(tries * 1.9 + 3) * 9, x = fx + Math.cos(a) * d, z = fz + Math.sin(a) * d;
      if (!springFlowerSpot(x, z, 0.8) || FALL_SHOCKS.some(function (q) { return dist(q.x, q.z, x, z) < 4; })) continue;
      c++; FALL_SHOCKS.push({ x: x, z: z, y: groundHeight(x, z), ry: springHash(c * 3.1) * 6.28, s: 0.9 + springHash(c * 1.7) * 0.25 });
      for (var p = 0; p < 2; p++) { var pa = springHash(c * 5 + p) * 6.28, px = x + Math.cos(pa) * 0.5, pz = z + Math.sin(pa) * 0.5; if (springFlowerSpot(px, pz, 0.2)) FALL_PUMPKINS.push({ x: px, z: pz, y: groundHeight(px, pz), s: 1.3 + springHash(c * 9 + p) * 0.5, sy: 0.8 + springHash(c * 4 + p) * 0.4, rot: springHash(c + p * 7) * 6.28, col: p ? 0xf07818 : 0xe8661a, patch: 'shock' + c + '_' + p, noVine: true }); }
    }
  })();
  (function () {
    // (where: mushrooms by the feet of broadleaf trees, pumpkins out in open meadow)
    choppable.forEach(function (t, ti) {
      var u = t.userData; if (u.gone || !u.leafy) return;
      var a = springHash(ti * 2.3 + 9) * 6.28, d = (u.solidR || 0.4) + 0.75 + springHash(ti * 1.7) * 0.5, x = u.base.x + Math.cos(a) * d, z = u.base.z + Math.sin(a) * d;
      var a2 = a + 2 + springHash(ti) * 1.5, d2 = (u.solidR || 0.4) + 0.35, mx = u.base.x + Math.cos(a2) * d2, mz = u.base.z + Math.sin(a2) * d2;
      if (springHash(ti * 5.7 + 3) < 0.22 && springFlowerSpot(mx, mz, 0.1)) {
        var red = springHash(ti * 8.1) < 0.5, n = 3 + Math.floor(springHash(ti * 2.2) * 4);
        for (var m = 0; m < n; m++) { var ma = springHash(ti * 3 + m * 1.9) * 6.28, mr = springHash(ti * 7 + m) * 0.22; FALL_MUSH.push({ x: mx + Math.cos(ma) * mr, z: mz + Math.sin(ma) * mr, y: groundHeight(mx, mz), red: red, s: 0.6 + springHash(ti + m * 2.7) * 0.7, tilt: (springHash(ti + m * 5.1) - 0.5) * 0.35, rot: springHash(m + ti * 1.1) * 6.28, tree: t }); }
      }
    });
    for (var c = 0, tries = 0; c < 16 && tries < 4000; tries++) {
      var cx = -ISLAND + 3 + springHash(tries * 6.7 + 909) * (ISLAND * 2 - 6), cz = -ISLAND + 3 + springHash(tries * 2.1 + 404) * (ISLAND * 2 - 6);
      if (!springFlowerSpot(cx, cz, 1.4)) continue; c++;
      var n2 = 4 + Math.floor(springHash(c * 3.3) * 5), patch = [];
      for (var p = 0; p < n2; p++) {
        var pa = springHash(c * 11 + p * 2.3) * 6.28, pr = 0.3 + springHash(c * 5 + p) * 0.9, px = cx + Math.cos(pa) * pr, pz = cz + Math.sin(pa) * pr;
        if (!springFlowerSpot(px, pz, 0.4) || patch.some(function (q) { return dist(q.x, q.z, px, pz) < 0.6; })) continue;
        var v = springHash(c * 9 + p * 4.1), pk = { x: px, z: pz, y: groundHeight(px, pz), s: 1.25 + springHash(c + p * 3.3) * 1.1, sy: 0.75 + springHash(c * 3 + p * 1.9) * 0.55, rot: springHash(c * 2 + p) * 6.28, col: v < 0.7 ? (v < 0.35 ? 0xf07818 : 0xe8661a) : v < 0.85 ? 0xf0e8d8 : 0xd8a040, patch: c };
        patch.push(pk); FALL_PUMPKINS.push(pk);
      }
    }
    // (a pumpkin: deep ribs, a little squat, with a dimple on top; and its gnarled, curving stem)
    var pg = new THREE.SphereGeometry(0.16, 32, 16), pp = pg.attributes.position;
    for (var i = 0; i < pp.count; i++) {
      var x = pp.getX(i), y = pp.getY(i), z = pp.getZ(i), ang = Math.atan2(z, x), rr = 1 + Math.cos(ang * 10) * 0.07 - Math.pow(Math.max(0, y / 0.16), 6) * 0.25;
      pp.setXYZ(i, x * rr, y * 0.72 - (Math.abs(y) > 0.15 ? Math.sign(y) * 0.02 : 0), z * rr);
    }
    pg.translate(0, 0.11, 0); pg.computeVertexNormals();
    var stemG = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.2, 0), new THREE.Vector3(0.006, 0.24, 0), new THREE.Vector3(0.02, 0.27, 0.004), new THREE.Vector3(0.04, 0.275, 0.01)]), 8, 0.012, 6, false);
    // (a pumpkin leaf: big, lobed and ruffled, lying out from the vine)
    var lp = [[0, 0], [0.08, 0.04], [0.16, 0.0], [0.15, 0.08], [0.2, 0.12], [0.12, 0.15], [0.1, 0.24], [0.02, 0.17], [-0.06, 0.24], [-0.08, 0.15], [-0.16, 0.12], [-0.11, 0.08], [-0.14, 0.0], [-0.07, 0.04]];
    var lsh = new THREE.Shape(); lp.forEach(function (q, k) { if (k) lsh.lineTo(q[0], q[1]); else lsh.moveTo(q[0], q[1]); }); lsh.closePath();
    var pLeaf = new THREE.ShapeGeometry(lsh, 3), plp = pLeaf.attributes.position;
    for (var j = 0; j < plp.count; j++) plp.setZ(j, Math.sin(plp.getX(j) * 40) * 0.008 + plp.getY(j) * 0.15);
    pLeaf.rotateX(-Math.PI / 2 + 0.25); pLeaf.computeVertexNormals();
    var leafStalk = new THREE.CylinderGeometry(0.005, 0.006, 0.14, 5); leafStalk.translate(0, 0.07, 0); leafStalk.rotateX(0.35);
    // (mushrooms: a stem, and a cap; toadstools red with white flecks, the others brown and velvety, with pale gills beneath)
    var spotTex = cpTex(128, 64, function (g, w, h) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); for (var k = 0; k < 40; k++) { var sx = springHash(k * 3.3) * w, sy = springHash(k * 1.7) * h * 0.8; g.fillStyle = '#c8c8c8'; g.beginPath(); g.arc(sx, sy, 2 + springHash(k) * 3, 0, Math.PI * 2); g.fill(); } });
    var redTex = cpTex(128, 64, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#c81e18'); gr.addColorStop(1, '#e85030'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (var k = 0; k < 34; k++) { var sx = springHash(k * 3.3) * w, sy = springHash(k * 1.7) * h * 0.85; g.fillStyle = '#fff8ec'; g.beginPath(); g.ellipse(sx, sy, 2.4 + springHash(k) * 2.4, 1.8 + springHash(k) * 1.6, 0, 0, Math.PI * 2); g.fill(); } });
    var capG = new THREE.SphereGeometry(0.05, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5); capG.scale(1, 0.62, 1); capG.translate(0, 0.07, 0);
    var gillG = new THREE.CircleGeometry(0.049, 16); gillG.rotateX(Math.PI / 2); gillG.translate(0, 0.069, 0);
    var mStemG = new THREE.CylinderGeometry(0.012, 0.016, 0.07, 8); mStemG.translate(0, 0.035, 0);
    var pumpTex = cpTex(256, 128, function (g, w, h) {                // (the ribs: deep grooves and glossy highlights, a few pale freckles, darker round the stem)
      for (var x = 0; x < w; x++) { var r = Math.cos(x / w * Math.PI * 2 * 10), k = 0.62 + 0.38 * Math.pow((r + 1) / 2, 0.6); g.fillStyle = 'rgb(' + Math.round(255 * k) + ',' + Math.round(250 * k) + ',' + Math.round(240 * k) + ')'; g.fillRect(x, 0, 1, h); }
      var top = g.createLinearGradient(0, 0, 0, h * 0.3); top.addColorStop(0, 'rgba(60,40,20,0.45)'); top.addColorStop(1, 'rgba(60,40,20,0)'); g.fillStyle = top; g.fillRect(0, 0, w, h);
      for (var s2 = 0; s2 < 140; s2++) { g.fillStyle = 'rgba(255,240,200,' + (0.2 + springHash(s2) * 0.3) + ')'; g.fillRect(springHash(s2 * 3.7) * w, springHash(s2 * 1.9) * h, 1.5, 3); }
      for (var x2 = 0; x2 < 10; x2++) { g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect((x2 + 0.02) / 10 * w, h * 0.25, 3, h * 0.5); }
    });
    var tendrilGeo = (function () { var pts = []; for (var q = 0; q < 40; q++) { var a = q * 0.45; pts.push(new THREE.Vector3(Math.cos(a) * 0.03 * (1 - q / 60), 0.01 + q * 0.004, Math.sin(a) * 0.03 * (1 - q / 60) + q * 0.003)); } return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.003, 4, false); })();
    var mPump = new THREE.MeshStandardMaterial({ map: pumpTex, roughness: 0.45 }), mStemP = new THREE.MeshStandardMaterial({ color: 0x6a7a3a, roughness: 0.9 });
    var mPLeaf = new THREE.MeshStandardMaterial({ color: 0x5a8a3a, roughness: 0.8, side: THREE.DoubleSide }), mVine = new THREE.MeshStandardMaterial({ color: 0x6a8a3a, roughness: 0.85 });
    var mRedCap = new THREE.MeshStandardMaterial({ map: redTex, roughness: 0.4 }), mBrownCap = new THREE.MeshStandardMaterial({ color: 0x8a5a30, roughness: 0.85 }), mWhite = new THREE.MeshStandardMaterial({ color: 0xf2ecdc, roughness: 0.8, side: THREE.DoubleSide });
    var reds = FALL_MUSH.filter(function (m) { return m.red; }), browns = FALL_MUSH.filter(function (m) { return !m.red; });
    var pleaves = []; FALL_PUMPKINS.forEach(function (pk, i) { for (var l = 0; l < 3; l++) pleaves.push({ pk: pk, a: pk.rot + l * 2.1 + springHash(i * 3 + l) * 0.8, d: 0.2 + springHash(i + l * 7) * 0.2, s: 2.2 + springHash(i * 5 + l) * 0.9 }); });
    fallMeshes = [
      { geo: pg, m: mPump, list: FALL_PUMPKINS, part: 'pumpkin', col: function (p) { return p.col; } }, { geo: stemG, m: mStemP, list: FALL_PUMPKINS, part: 'pumpkin' },
      { geo: pLeaf, m: mPLeaf, list: pleaves, part: 'pleaf', col: function (l) { return l.d > 0.36 ? 0xc8b048 : l.s > 1.75 ? 0x8aa040 : 0xffffff; } }, { geo: leafStalk, m: mVine, list: pleaves, part: 'pleaf' }, { geo: tendrilGeo, m: mVine, list: pleaves, part: 'pleaf' },
      { geo: mStemG, m: mWhite, list: FALL_MUSH, part: 'mush' }, { geo: gillG, m: mWhite, list: FALL_MUSH, part: 'mush' },
      { geo: capG, m: mRedCap, list: reds, part: 'mush' }, { geo: capG, m: mBrownCap, list: browns, part: 'mush', col: function (m) { return m.s > 1 ? 0x9a6a3a : 0x7a4a26; } },
    ].map(function (F) {
      F.im = new THREE.InstancedMesh(F.geo, F.m, Math.max(1, F.list.length)); F.im.castShadow = F.part !== 'pile'; F.im.receiveShadow = true; F.im.frustumCulled = false; F.im.visible = false; scene.add(F.im);
      if (F.col) { var col = new THREE.Color(); F.list.forEach(function (r, k) { F.im.setColorAt(k, col.set(F.col(r))); }); }
      return F;
    });
    // (the vines: one curling tube through each patch, joining its pumpkins)
    var byPatch = {}; FALL_PUMPKINS.forEach(function (pk) { (byPatch[pk.patch] = byPatch[pk.patch] || []).push(pk); });
    Object.keys(byPatch).forEach(function (k) {
      var ps = byPatch[k]; if (ps.length < 2 || ps[0].noVine) return;
      var pts = []; ps.forEach(function (pk, i) { pts.push(new THREE.Vector3(pk.x, pk.y + 0.03, pk.z)); if (i < ps.length - 1) { var q = ps[i + 1]; pts.push(new THREE.Vector3((pk.x + q.x) / 2 + (springHash(i * 3.3 + +k) - 0.5) * 0.4, Math.max(pk.y, q.y) + 0.03, (pk.z + q.z) / 2 + (springHash(i * 1.1 + +k) - 0.5) * 0.4)); } });
      var vine = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 10, 0.012, 5, false), mVine); vine.castShadow = true; vine.visible = false; scene.add(vine);
      fallMeshes.push({ vine: vine, list: ps });
    });
  })();
  (function () {                                                       // (the finer things of fall: acorns and pinecones, and bracket fungi on the trunks)
    var up = new THREE.Vector3(0, 1, 0);
    function cylBetween(a, b, r0, r1, seg) {                           // (a tapering rod from point a to point b)
      var d = new THREE.Vector3().subVectors(b, a), L = d.length(), g = new THREE.CylinderGeometry(r1, r0, L, seg || 5);
      g.translate(0, L / 2, 0); g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(up, d.normalize()))); g.translate(a.x, a.y, a.z); return g;
    }
    // (an acorn in its scaly cap; and a pinecone, its scales spiralling round in rings)
    var nutGeo = new THREE.SphereGeometry(0.013, 10, 8); nutGeo.scale(1, 1.35, 1); nutGeo.translate(0, 0.0175, 0);
    var capGeo2 = new THREE.SphereGeometry(0.0145, 10, 5, 0, Math.PI * 2, 0, Math.PI * 0.45); capGeo2.scale(1, 0.75, 1); capGeo2.translate(0, 0.026, 0);
    var cupStalk = new THREE.CylinderGeometry(0.0018, 0.0022, 0.008, 5); cupStalk.translate(0, 0.038, 0);
    var coneParts = [];
    for (var ring = 0; ring < 8; ring++) for (var sc = 0; sc < 7; sc++) {
      var ra = sc / 7 * Math.PI * 2 + ring * 0.45, rr = 0.022 * Math.sin(Math.PI * (0.15 + ring / 8 * 0.8)), sg = new THREE.ConeGeometry(0.009, 0.014, 4);
      sg.rotateZ(-1.2); sg.rotateY(-ra); sg.translate(Math.cos(ra) * rr, ring * 0.009, Math.sin(ra) * rr); coneParts.push(sg);
    }
    var pineconeGeo = mergeSimple(coneParts); pineconeGeo.rotateZ(Math.PI / 2 - 0.2); pineconeGeo.translate(0.03, 0.018, 0);   // (lying on its side)
    // (bracket fungi: three shelves stacked up the bark, each banded in rings of cream, tan and rust)
    var bandTex = cpTex(128, 128, function (g, w, h) { for (var r = 64; r > 0; r -= 5) { var k = (r / 5) % 3; g.fillStyle = k === 0 ? '#d8b078' : k === 1 ? '#b8784a' : '#ece0c4'; g.beginPath(); g.arc(64, 64, r, 0, Math.PI * 2); g.fill(); } });
    var shelves = [];
    [[0, 0.075], [0.07, 0.06], [0.13, 0.048]].forEach(function (sh) { var cg = new THREE.CylinderGeometry(sh[1], sh[1] * 0.92, 0.014, 18, 1, false, 0, Math.PI); var uv = cg.attributes.uv, cp = cg.attributes.position; for (var q = 0; q < cp.count; q++) uv.setXY(q, cp.getX(q) / (2 * sh[1]) + 0.5, cp.getZ(q) / (2 * sh[1]) + 0.5); cg.translate(0, sh[0], 0); shelves.push(cg); });
    var bracketGeo = mergeUV(shelves);
    // (where they go)
    var acorns = [], cones = [], brackets = [];
    choppable.forEach(function (t, ti) {
      var u = t.userData; if (u.gone) return;
      var n = u.leafy ? (springHash(ti * 2.9 + 1) < 0.4 ? 4 : 0) : (springHash(ti * 3.7 + 2) < 0.45 ? 3 : 0);
      for (var k = 0; k < n; k++) {
        var a = springHash(ti * 5 + k * 1.3) * 6.28, d = (u.solidR || 0.4) + 0.25 + springHash(ti + k * 2.1) * 0.6, x = u.base.x + Math.cos(a) * d, z = u.base.z + Math.sin(a) * d;
        if (!springFlowerSpot(x, z, 0.05)) continue;
        (u.leafy ? acorns : cones).push({ x: x, y: groundHeight(x, z), z: z, rx: u.leafy ? 1.4 + (springHash(k + ti) - 0.5) * 0.4 : 0, ry: springHash(k * 7 + ti) * 6.28, rz: 0, s: u.leafy ? 2.6 + springHash(k * 3 + ti) * 0.6 : 1.4 + springHash(k + ti * 3) * 0.6, tree: t });
      }
      if (u.leafy && springHash(ti * 6.1 + 4) < 0.28) {                // (shelves of fungus on the shady side of the trunk)
        var ba = springHash(ti * 8.3) * 6.28, tr = (u.solidR || 0.4) - 0.04, bh = 0.35 + springHash(ti * 2.4) * 0.4;
        brackets.push({ x: u.base.x + Math.cos(ba) * tr, y: u.base.y + bh, z: u.base.z + Math.sin(ba) * tr, rx: 0, ry: Math.atan2(-Math.sin(ba), Math.cos(ba)), rz: 0, s: 1.6 + springHash(ti * 3.3) * 0.6, tree: t, needStanding: true });
      }
    });
    var mNut = new THREE.MeshStandardMaterial({ color: 0xa8743a, roughness: 0.45 }), mCup = new THREE.MeshStandardMaterial({ color: 0x6a4a28, roughness: 0.95 }), mCone = new THREE.MeshStandardMaterial({ color: 0x7a4a26, roughness: 0.9 });
    var mBracket = new THREE.MeshStandardMaterial({ map: bandTex, roughness: 0.85 });
    [{ geo: nutGeo, m: mNut, list: acorns }, { geo: capGeo2, m: mCup, list: acorns }, { geo: cupStalk, m: mCup, list: acorns }, { geo: pineconeGeo, m: mCone, list: cones },
     { geo: bracketGeo, m: mBracket, list: brackets }
    ].forEach(function (F) {
      F.part = 'thing'; F.im = new THREE.InstancedMesh(F.geo, F.m, Math.max(1, F.list.length)); F.im.castShadow = true; F.im.receiveShadow = true; F.im.frustumCulled = false; F.im.visible = false; scene.add(F.im); fallMeshes.push(F);
    });
  })();
  // ===== geese flying south in a V across the sky, now and then =====
  var fallGeese = (function () {
    var list = [], mBody = new THREE.MeshStandardMaterial({ color: 0x6a6258, roughness: 0.8 }), mBlack = new THREE.MeshStandardMaterial({ color: 0x1e1c1a, roughness: 0.7 }), mWhite = new THREE.MeshStandardMaterial({ color: 0xf2eee6, roughness: 0.7 });
    var wingG = new THREE.PlaneGeometry(0.55, 0.16); wingG.translate(0.275, 0, 0); wingG.rotateX(-Math.PI / 2);
    for (var i = 0; i < 9; i++) {
      var G = new THREE.Group();
      var body = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), mBody); body.scale.set(0.8, 0.75, 1.8); G.add(body);
      var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.28, 6), mBlack); neck.rotation.x = Math.PI / 2 - 0.25; neck.position.set(0, 0.04, 0.28); G.add(neck);
      var head = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), mBlack); head.scale.set(0.9, 0.9, 1.3); head.position.set(0, 0.075, 0.43); G.add(head);
      var chin = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), mWhite); chin.position.set(0, 0.06, 0.42); chin.scale.set(1.05, 0.7, 0.8); G.add(chin);
      var tail = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 6), mBlack); tail.rotation.x = -Math.PI / 2; tail.position.z = -0.24; G.add(tail);
      var wings = [-1, 1].map(function (s) { var w = new THREE.Mesh(wingG, mBody); w.scale.x = s; w.position.set(s * 0.05, 0.03, 0.02); G.add(w); return w; });
      var row = Math.ceil(i / 2), side = i === 0 ? 0 : (i % 2 ? -1 : 1);
      G.scale.setScalar(2.4); G.visible = false; scene.add(G);
      list.push({ g: G, wings: wings, off: new THREE.Vector3(side * row * 1.9, (springHash(i) - 0.5) * 0.6, -row * 1.6), ph: springHash(i * 3.1) * 6.28 });
    }
    return list;
  })();
  function fallGeeseMove(on) {
    var t = state.time, cyc = (t % 150) / 150, flying = on && cyc < 0.45, p = cyc / 0.45, cx = camera.position.x, cz = camera.position.z;
    fallGeese.forEach(function (Gs) {
      if (Gs.g.visible !== flying) Gs.g.visible = flying;
      if (!flying) return;
      var lx = 120 - p * 240;                                           // (crossing from east to west, high over the island)
      Gs.g.position.set(cx + lx + Gs.off.z * -1, 30 + Gs.off.y, cz - 55 + Gs.off.x);
      Gs.g.rotation.set(0, -Math.PI / 2, 0);
      var f = Math.sin(t * 5 + Gs.ph) * 0.55; Gs.wings[0].rotation.z = -f; Gs.wings[1].rotation.z = f;
    });
  }
  var fpM = new THREE.Matrix4(), fpQ = new THREE.Quaternion(), fpE = new THREE.Euler(), fpV = new THREE.Vector3(), fpS = new THREE.Vector3();
  var fallHidden = [], fallGM = new THREE.Matrix4(), fallGP = new THREE.Vector3();
  function fallGrassUnder(spots) {                                     // (the grass blades and wildflowers under pumpkins tuck away, and come back after)
    fallHidden.forEach(function (b) {
      var t = tileMap[tileKey(Math.floor((b.p.x - FARM_X) / TILE), Math.floor((b.p.z - FARM_Z) / TILE))];
      if (t && t.soil) { (t.grass = t.grass || []).push({ i: b.i, m: b.m, f: b.f }); return; }   // (dug into soil meanwhile: it stays tucked away with that tile)
      if (b.f) { flowerHeads.setMatrixAt(b.i, b.m); flowerStems.setMatrixAt(b.i, b.m); } else grass.setMatrixAt(b.i, b.m);
    });
    fallHidden = [];
    function hide(mesh, isF) {
      for (var i = 0; i < mesh.count; i++) {
        mesh.getMatrixAt(i, fallGM); if (fallGM.elements[0] === 0 && fallGM.elements[5] === 0) continue;
        fallGP.setFromMatrixPosition(fallGM);
        for (var k = 0; k < spots.length; k++) { var sp = spots[k]; if (Math.abs(fallGP.x - sp[0]) < sp[2] && Math.abs(fallGP.z - sp[1]) < sp[2] && dist(fallGP.x, fallGP.z, sp[0], sp[1]) < sp[2]) {
          fallHidden.push({ i: i, m: fallGM.clone(), f: isF, p: fallGP.clone() }); mesh.setMatrixAt(i, hideM); if (isF) flowerStems.setMatrixAt(i, hideM); break; } }
      }
    }
    if (spots.length) { hide(grass, false); hide(flowerHeads, true); }
    grass.instanceMatrix.needsUpdate = true; flowerHeads.instanceMatrix.needsUpdate = flowerStems.instanceMatrix.needsUpdate = true;
  }
  function fallDecorPlace(show) {
    function ok(r) { var o = r.pile || r.pk || r; if (!show || !springFlowerOK(o)) return false; var t = o.tree; if (o.needStanding) return !!t && t.userData.state === 'standing'; return !t || t.userData.state === 'standing' || t.userData.state === 'regrowing'; }
    var key = fallMeshes.map(function (F) { return F.list.map(function (r) { return ok(r) ? 1 : 0; }).join(''); }).join('|');
    if (key === fallDecorShown) return; fallDecorShown = key;
    var spots = [];
    if (show) {
      FALL_PUMPKINS.forEach(function (pk) { if (ok(pk)) spots.push([pk.x, pk.z, 0.3 * pk.s + 0.1]); });
    }
    fallGrassUnder(spots);
    fallMeshes.forEach(function (F) {
      if (F.vine) { F.vine.visible = show && F.list.every(function (pk) { return springFlowerOK(pk); }); return; }
      F.im.visible = show;
      F.list.forEach(function (r, i) {
        var k = ok(r) ? 1 : 0;
        if (F.part === 'pumpkin') { fpV.set(r.x, r.y, r.z); fpE.set(0, r.rot, 0); fpS.set(k * r.s, k * r.s * (r.sy || 1), k * r.s); }
        else if (F.part === 'pleaf') { var pk = r.pk; fpV.set(pk.x + Math.cos(r.a) * r.d * pk.s, pk.y + 0.005, pk.z + Math.sin(r.a) * r.d * pk.s); fpE.set(0, -r.a + Math.PI / 2, 0); fpS.setScalar(k * r.s); k = ok(pk) ? 1 : 0; fpS.setScalar(k * r.s); }
        else if (F.part === 'mush') { fpV.set(r.x, r.y, r.z); fpE.set(r.tilt, r.rot, 0); fpS.setScalar(k * r.s); }
        else { fpV.set(r.x, r.y, r.z); fpE.set(r.rx || 0, r.ry || 0, r.rz || 0, 'YXZ'); fpS.setScalar(k * r.s); }
        fpQ.setFromEuler(fpE); fpM.compose(fpV, fpQ, fpS); F.im.setMatrixAt(i, fpM);
      });
      F.im.instanceMatrix.needsUpdate = true; if (F.im.instanceColor) F.im.instanceColor.needsUpdate = true;
    });
  }
  // ===== warm, golden autumn light, and drier grass =====
  var FALL_SKY = new THREE.Color(0x9ec2e6), FALL_SUN = new THREE.Color(0xffb468), FALL_GRASS = new THREE.Color(1.0, 0.76, 0.36), FALL_GROUND = new THREE.Color(1.0, 0.84, 0.58), FALL_MIST = new THREE.Color(0xeee0c8), FALL_FOG = [scene.fog.near, scene.fog.far];
  var fallBaseSky = updateSky;
  updateSky = function () {
    var night = fallBaseSky.apply(this, arguments);
    var mist = 0;
    if (fallNow()) {
      var day = Math.max(0, 1 - night * 1.6); scene.background.lerp(FALL_SKY, 0.35 * day); scene.fog.color.copy(scene.background); sun.color.lerp(FALL_SUN, 0.45 * day);
      var hr = state.minutes / 60; mist = hr < 5 || hr > 10 ? 0 : hr < 6 ? hr - 5 : hr < 8 ? 1 : (10 - hr) / 2;   // (a golden morning mist, burning off by mid-morning)
      scene.fog.color.lerp(FALL_MIST, 0.5 * mist);
    }
    scene.fog.near = FALL_FOG[0] - 30 * mist; scene.fog.far = FALL_FOG[1] - 55 * mist;
    return night;
  };
  // ===== every frame =====
  function updateFall(dt) {
    var on = fallNow();
    if (fallShown !== on && fallLeafCols) {                             // (the trees turn, or turn back)
      fallShown = on; leafBatch.material.map = on ? fallLeafTex : fallGreenTex; leafBatch.material.needsUpdate = true;
      leafBatch.instanceColor.array.set(on ? fallLeafCols : fallLeafOrig); leafBatch.instanceColor.needsUpdate = true;
    }
    if (on) { grassMat.color.copy(FALL_GRASS); terrain.material.color.copy(FALL_GROUND); }
    if (on !== fallWasOn || state.time - fallDecorT > 2) { fallWasOn = on; fallDecorT = state.time; fallDecorPlace(on); }
    var hr = state.minutes / 60, drift = on && !indoors && hr > 6 && hr < 19.5;
    fallDrift.forEach(function (im) { if (im.visible !== drift) im.visible = drift; });
    fallGeeseMove(on && !indoors && hr > 7 && hr < 18.5);
    if (drift) fallDriftMove(dt);
  }

  // ---------- Winter on the island ----------
  // While it's Winter: snow lies over the whole island, the broadleaf trees and bushes stand bare with snow along their
  // branches, the pines are heavy with snow, the grass is buried, snowflakes drift down all day, the
  // light goes cool and silvery, and a few snowmen stand about in their scarves and hats
  function winterNow() { return seasonOf(state.day) === 3; }
  // ===== snow-laden pines =====
  var winterNeedleTex = paintTexture(256, 128, function (g) {          // (the snow lying on a pine spray: soft, lumpy cushions along the branch, thinning toward the tips, with needle tips poking out at the edges)
    for (var pass = 0; pass < 2; pass++) for (var k = 0; k < 90; k++) {   // (a shadowy blue-grey base, then bright, rounded lumps over it)
      var t = Math.pow(Math.random(), 0.8), x = 6 + t * 232, y = 64 + t * t * 14 + (Math.random() - 0.5) * (46 - t * 30), r = (19 - t * 11) * (0.6 + Math.random() * 0.5) * (pass ? 1 : 1.15);
      var gr = g.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
      if (pass) { gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.6, '#f3f7fe'); gr.addColorStop(1, '#d6e1f0'); } else { gr.addColorStop(0, '#cbd8ea'); gr.addColorStop(1, '#b6c6dc'); }
      g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r, r * 0.8, Math.random() * 3, 0, Math.PI * 2); g.fill();
    }
    g.globalCompositeOperation = 'destination-out'; g.lineWidth = 1.8;  // (needle tips poking out through the edges of the snow)
    for (var i = 0; i < 260; i++) {
      var t2 = Math.random(), x2 = 6 + t2 * 240, y2 = 64 + t2 * t2 * 14, reach = (44 - t2 * 26) * (0.5 + Math.random() * 0.5), side = Math.random() < 0.5 ? -1 : 1, dx = 6 + Math.random() * 12;
      g.beginPath(); g.moveTo(x2 + dx * 0.55, y2 + side * reach * 0.55); g.lineTo(x2 + dx, y2 + side * reach); g.stroke();
    }
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = '#ffffff';   // (a few glints of sparkle)
    for (var sp = 0; sp < 60; sp++) g.fillRect(Math.random() * 256, Math.random() * 128, 1, 1);
  });
  var winterSnowOn = { value: 0 };                                    // (snow lying along the tops of the trunks, branches and roots: wherever the bark faces the sky)
  [barkMat, pineBarkMat, rootMat, pineRootMat].forEach(function (m) {
    var before = m.onBeforeCompile;
    m.onBeforeCompile = function (shader) {
      if (before) before.call(this, shader);
      shader.uniforms.uSnowOn = winterSnowOn;
      shader.fragmentShader = 'uniform float uSnowOn;\n' + shader.fragmentShader.replace('#include <normal_fragment_maps>', [
        '#include <normal_fragment_maps>',
        'vec3 snowUp = normalize((vec4(normal, 0.0) * viewMatrix).xyz);',   // (this bit of bark's direction in the world)
        'float snowAmt = smoothstep(0.15, 0.55, snowUp.y) * uSnowOn;',
        'diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.96, 1.0), snowAmt);'
      ].join('\n'));
    };
    m.needsUpdate = true;
  });
  // ===== the Dawn Tree in winter: snow lying on its blossom =====
  // The Dawn Tree keeps its pink blossom through Winter; snow just lies on top of it. Each card of blossom near the top
  // of its cluster takes a cap of solid snow over the part of it that faces the sky (the higher up the cluster, the
  // more of the card is covered), with a lumpy edge, and the snow doesn't glow pink. Cards lower down and underneath
  // stay as they are, and the hanging strands are just frosted where they hang from. All Winter the blossom is drawn
  // solid rather than softly see-through at its edges, which against the white snow would make it look washed out.
  // It all goes back to normal when Spring comes
  (function () {
    var nCards = blossomCards.count, up = new Float32Array(blossomCards.instanceMatrix.count), m4 = new THREE.Matrix4(), cp = new THREE.Vector3(), cq = new THREE.Quaternion(), cs = new THREE.Vector3();
    for (var i = 0; i < nCards; i++) {                                 // (how high up its own cluster each card sits: the higher, the more snow)
      blossomCards.getMatrixAt(i, m4); m4.decompose(cp, cq, cs);
      var best = null, bd = 1e9; clumps.forEach(function (c) { var d = cp.distanceTo(c.p); if (d < bd) { bd = d; best = c; } });
      up[i] = best ? (cp.y - best.p.y) / best.r : 0;
    }
    blossomCards.geometry.setAttribute('snowUp', new THREE.InstancedBufferAttribute(up, 1));
    function snowOnBlossom(m, strand) {
      var before = m.onBeforeCompile;
      m.onBeforeCompile = function (shader) {
        if (before) before.call(this, shader);
        shader.uniforms.uSnowOn = winterSnowOn;
        shader.vertexShader = (strand ? '' : 'attribute float snowUp;\n') + 'varying float vSnowUp;\nvarying float vSnowH;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' +
          (strand ? 'vSnowUp = 0.0; vSnowH = 0.0;' : 'vSnowUp = snowUp; vSnowH = ((instanceMatrix * vec4(position, 1.0)).y - instanceMatrix[3].y) / length(instanceMatrix[0].xyz);'));   // (how far up this bit of the card is, in the world)
        shader.fragmentShader = 'uniform float uSnowOn;\nvarying float vSnowUp;\nvarying float vSnowH;\n' + shader.fragmentShader
          .replace('#include <color_fragment>', '#include <color_fragment>\nfloat snowAmt = uSnowOn * ' + (strand
            ? 'smoothstep(0.84, 0.96, vUv.y) * 0.8'
            : 'smoothstep(0.05, 0.35, vSnowUp) * smoothstep(0.0, 0.08, vSnowH * 1.4 + (vSnowUp - 0.6) * 0.7 + 0.06 * sin(vUv.x * 23.0) + 0.04 * sin(vUv.x * 47.0 + 1.7))') +
            ';\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.96, 0.98, 1.0), snowAmt);\nif (uSnowOn > 0.5 && diffuseColor.a > 0.3) diffuseColor.a = 1.0;')   // (in Winter the blossom and its snow are solid, so the white snow on the ground never shows through them)
          .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance *= 1.0 - snowAmt;');
      };
      m.customProgramCacheKey = function () { return strand ? 'dawnStrandSnow' : 'dawnBlossomSnow'; };
      m.needsUpdate = true;
    }
    snowOnBlossom(blossomMat, false); snowOnBlossom(strandMat, true);
  })();
  // ===== snow lying on the pines =====
  // In Winter snow lies on top of every pine spray, only on the side that faces the sky, so seen from below the
  // branches are still green, and it can spill a little past the needles at the edges
  (function () {
    var m = needleBatch.material, before = m.onBeforeCompile;
    m.onBeforeCompile = function (shader) {
      if (before) before.call(this, shader);
      shader.uniforms.uSnowOn = winterSnowOn; shader.uniforms.uSnowMap = { value: winterNeedleTex };
      shader.vertexShader = 'varying float vSnowUp;\n' + shader.vertexShader.replace('gl_Position = projectionMatrix * mvPosition;', 'gl_Position = projectionMatrix * mvPosition;\n' +
        'vSnowUp = normalize(cross((modelMatrix * instanceMatrix * vec4(0.0, 0.0, 1.0, 0.0)).xyz, (modelMatrix * instanceMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz)).y;');   // (how much this spray's top faces the sky)
      shader.fragmentShader = 'uniform float uSnowOn;\nuniform sampler2D uSnowMap;\nvarying float vSnowUp;\n' + shader.fragmentShader.replace('#include <alphamap_fragment>', [
        'vec4 snow = texture2D(uSnowMap, vUv);',
        'float snowAmt = snow.a * uSnowOn * smoothstep(0.05, 0.35, gl_FrontFacing ? vSnowUp : -vSnowUp);',   // (only on the side we see if it's the top)
        'diffuseColor.rgb = mix(diffuseColor.rgb, snow.rgb, snowAmt);',
        'diffuseColor.a = max(diffuseColor.a, snowAmt);',
        '#include <alphamap_fragment>'].join('\n'));
    };
    m.customProgramCacheKey = function () { return 'pineSnow'; };
    m.needsUpdate = true;
  })();
  var winterShown = null;
  // ===== a snowy island: the ground and the grass =====
  var winterSnowTex, winterSnowBump;
  (function () {                                                       // (snow: built from layers of soft, seamless noise, so it has gentle drifts with blue shadows
    var N = 512, img, bmp;                                             //  in the hollows, wind ripples, a fine powdery grain and glinting crystals, and never looks tiled)
    function lattice(p, seed) { var v = []; for (var i = 0; i < p * p; i++) v.push(springHash(i * 1.618 + seed * 97.3)); return v; }
    function noise(P, seed) {                                          // (smooth noise that wraps round at the edges, P cells across)
      var L = lattice(P, seed), out = new Float32Array(N * N);
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        var fx = x / N * P, fy = y / N * P, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
        tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
        var x1 = (ix + 1) % P, y1 = (iy + 1) % P;
        var a = L[iy * P + ix] + (L[iy * P + x1] - L[iy * P + ix]) * tx, b = L[y1 * P + ix] + (L[y1 * P + x1] - L[y1 * P + ix]) * tx;
        out[y * N + x] = a + (b - a) * ty;
      }
      return out;
    }
    var drift = [noise(3, 1), noise(6, 2), noise(12, 3)], ripple = noise(24, 4), fine = [noise(64, 5), noise(128, 6)];
    var H = new Float32Array(N * N);
    for (var i = 0; i < N * N; i++) {
      var y = Math.floor(i / N), x = i % N;
      var d = drift[0][i] * 0.5 + drift[1][i] * 0.3 + drift[2][i] * 0.2;
      var r = Math.sin((x * 0.9 + y * 0.35) / N * Math.PI * 2 * 18 + ripple[i] * 9) * 0.5 + 0.5;   // (wind ripples, wandering across the drifts)
      H[i] = d * 0.8 + r * 0.06 * (0.4 + d) + fine[0][i] * 0.08 + fine[1][i] * 0.06;
    }
    var cv = document.createElement('canvas'); cv.width = cv.height = N; var g = cv.getContext('2d'); img = g.createImageData(N, N);
    var bc = document.createElement('canvas'); bc.width = bc.height = N; var bg = bc.getContext('2d'); bmp = bg.createImageData(N, N);
    for (var j = 0; j < N * N; j++) {
      var jx = j % N, jy = Math.floor(j / N), hx = H[jy * N + (jx + 1) % N] - H[jy * N + (jx + N - 1) % N], hy = H[((jy + 1) % N) * N + jx] - H[((jy + N - 1) % N) * N + jx];
      var lit = Math.max(-1, Math.min(1, (-hx - hy) * 40));             // (light from up and to the left: slopes facing it bright, the far sides in soft blue shadow)
      var shade = 0.55 + lit * 0.45, hollow = Math.max(0, 0.55 - H[j]) * 0.9;
      var R = 250 - (1 - shade) * 52 - hollow * 46, G2 = 252 - (1 - shade) * 36 - hollow * 30, B = 255 - (1 - shade) * 12 - hollow * 6;
      var grain = (fine[1][j] - 0.5) * 6; R += grain; G2 += grain; B += grain;
      if (springHash(j * 0.731) > 0.9985) { R = G2 = B = 255; }           // (a glinting crystal)
      img.data[j * 4] = Math.max(0, Math.min(255, R)); img.data[j * 4 + 1] = Math.max(0, Math.min(255, G2)); img.data[j * 4 + 2] = Math.max(0, Math.min(255, B)); img.data[j * 4 + 3] = 255;
      var hv = Math.round(H[j] * 255); bmp.data[j * 4] = bmp.data[j * 4 + 1] = bmp.data[j * 4 + 2] = hv; bmp.data[j * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0); bg.putImageData(bmp, 0, 0);
    winterSnowTex = new THREE.CanvasTexture(cv); winterSnowBump = new THREE.CanvasTexture(bc);
    [winterSnowTex, winterSnowBump].forEach(function (t) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.08, 0.08); t.anisotropy = 8; });   // (one pattern about 22 m across, so the drifts are big and soft)
  })();
  var winterGround = { map: terrain.material.map, bump: terrain.material.bumpMap, bumpScale: terrain.material.bumpScale, rough: terrain.material.roughness };
  var WINTER_GRASS = new THREE.Color(0.78, 0.72, 0.52), winterBuried = [], winterBM = new THREE.Matrix4(), winterBP = new THREE.Vector3();
  function winterBury(on) {                                            // (the grass and all the wildflowers lie buried under the snow)
    winterBuried.forEach(function (b) {
      if (b.mesh === grass || b.mesh === flowerHeads) { var t = tileMap[tileKey(Math.floor((b.p.x - FARM_X) / TILE), Math.floor((b.p.z - FARM_Z) / TILE))]; if (t && t.soil) { (t.grass = t.grass || []).push({ i: b.i, m: b.m, f: b.mesh === flowerHeads }); return; } }   // (dug into soil meanwhile: it stays tucked away with that tile)
      b.mesh.setMatrixAt(b.i, b.m); if (b.mesh === flowerHeads) flowerStems.setMatrixAt(b.i, b.m);
    });
    winterBuried = [];
    if (on) [grass, isle2Grass, isle3Grass, flowerHeads].forEach(function (mesh) {
      for (var i = 0; i < mesh.count; i++) {
        if (mesh !== flowerHeads && springHash(i * 0.917 + 3) > 0.82) continue;   // (about one tuft in six stays)
        mesh.getMatrixAt(i, winterBM); if (winterBM.elements[0] === 0 && winterBM.elements[5] === 0) continue;
        winterBuried.push({ mesh: mesh, i: i, m: winterBM.clone(), p: winterBP.setFromMatrixPosition(winterBM).clone() });
        mesh.setMatrixAt(i, hideM); if (mesh === flowerHeads) flowerStems.setMatrixAt(i, hideM);
      }
    });
    [grass, isle2Grass, isle3Grass, flowerHeads, flowerStems].forEach(function (m) { m.instanceMatrix.needsUpdate = true; });
    litterMat.visible = !on; grassMat.visible = !on;                   // (not a tuft of grass pokes through)
  }
  // ===== snowflakes =====
  var winterSnow = (function () {
    var N = 900, pos = new Float32Array(N * 3), seeds = [];
    for (var i = 0; i < N; i++) seeds.push({ x: (springHash(i * 3.3 + 7) - 0.5) * 34, y: springHash(i * 5.7 + 7) * 12, z: (springHash(i * 7.1 + 7) - 0.5) * 34, s: 0.5 + springHash(i * 2.2) * 0.6, w: springHash(i * 9.9) * 6.28 });
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var c = document.createElement('canvas'); c.width = c.height = 32; var x = c.getContext('2d'), gr = x.createRadialGradient(16, 16, 1, 16, 16, 15); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32);
    var pts = new THREE.Points(g, new THREE.PointsMaterial({ map: new THREE.CanvasTexture(c), size: 0.09, transparent: true, depthWrite: false }));
    pts.frustumCulled = false; pts.visible = false; pts.userData.seeds = seeds; scene.add(pts); return pts;
  })();
  function winterSnowMove(dt) {
    var a = winterSnow.geometry.attributes.position, S = winterSnow.userData.seeds, cx = cam.target.x, cz = cam.target.z, t = state.time;
    S.forEach(function (s, i) {
      s.y -= dt * s.s; s.x += dt * Math.sin(t * 0.4 + s.w) * 0.25; s.z += dt * Math.cos(t * 0.3 + s.w) * 0.2;
      var wx = cx + ((s.x % 34) + 51) % 34 - 17, wz = cz + ((s.z % 34) + 51) % 34 - 17, gy = Math.max(groundHeight(wx, wz), WATER_Y);
      if (s.y < gy) s.y = gy + 10 + springHash(i + t) * 2;
      a.setXYZ(i, wx + Math.sin(t * 1.1 + s.w) * 0.2, s.y, wz);
    });
    a.needsUpdate = true;
  }
  // ===== snowmen =====
  var WINTER_MEN = [], winterMenGroup = new THREE.Group(); winterMenGroup.visible = false; scene.add(winterMenGroup);
  (function () {
    var mSnow = new THREE.MeshStandardMaterial({ map: winterSnowTex, color: 0xffffff, roughness: 0.9 }), mCoal = new THREE.MeshStandardMaterial({ color: 0x1a1a1e, roughness: 0.6 });
    var mCarrot = new THREE.MeshStandardMaterial({ color: 0xf08a24, roughness: 0.6 }), mStick = new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.9 }), mHat = new THREE.MeshStandardMaterial({ color: 0x2a2228, roughness: 0.7 });
    var SCARVES = [0xd8302c, 0x3a7ac8, 0x5aa84a, 0x9a5ac8];
    for (var c = 0, tries = 0; c < 4 && tries < 3000; tries++) {
      var x = HOUSE_X - 14 + springHash(tries * 2.9 + 11) * 28, z = HOUSE_Z + 6 + springHash(tries * 4.1 + 3) * 22;
      if (!springFlowerSpot(x, z, 0.8) || WINTER_MEN.some(function (q) { return dist(q.x, q.z, x, z) < 6; })) continue;
      c++; var G = new THREE.Group(), y = groundHeight(x, z); G.position.set(x, y, z); G.rotation.y = Math.atan2(HOUSE_X - x, HOUSE_Z + 12 - z) + Math.PI + (springHash(c) - 0.5) * 0.8; winterMenGroup.add(G); WINTER_MEN.push({ x: x, z: z });
      var mScarf = new THREE.MeshStandardMaterial({ color: SCARVES[c % 4], roughness: 0.9 }), mStripe = new THREE.MeshStandardMaterial({ color: 0xf6f0e4, roughness: 0.9 });
      [[0.34, 0.3], [0.25, 0.74], [0.18, 1.066]].forEach(function (b, k) { var m = cpPart(new THREE.SphereGeometry(b[0], 20, 14), mSnow, 0, b[1], 0, 0, 0, 0, G); m.scale.set(1, k === 0 ? 0.88 : 0.92, 1); });   // (three balls packed snugly into each other)
      cpPart(new THREE.CylinderGeometry(0.36, 0.42, 0.06, 20), mSnow, 0, 0.03, 0, 0, 0, 0, G);   // (packed snow round its foot)
      [-1, 1].forEach(function (s) { cpPart(new THREE.SphereGeometry(0.022, 8, 6), mCoal, s * 0.06, 1.116, 0.16, 0, 0, 0, G); });   // (coal eyes)
      for (var m = 0; m < 5; m++) { var a = -0.55 + m * 0.275; cpPart(new THREE.SphereGeometry(0.013, 6, 4), mCoal, Math.sin(a) * 0.12, 1.024 - Math.cos(a) * 0.035, 0.158, 0, 0, 0, G); }   // (a smile)
      cpPart(new THREE.ConeGeometry(0.03, 0.17, 10), mCarrot, 0, 1.066, 0.25, Math.PI / 2, 0, 0, G);   // (carrot nose)
      [0.86, 0.74, 0.62].forEach(function (yy) { cpPart(new THREE.SphereGeometry(0.03, 8, 6), mCoal, 0, yy, 0.25 * Math.sqrt(1 - Math.pow((yy - 0.74) / 0.23, 2)) - 0.008, 0, 0, 0, G); });   // (buttons, pressed into the front of its middle)
      [-1, 1].forEach(function (s) {                                   // (stick arms, with little forked twigs at the ends)
        var arm = new THREE.Group(); arm.position.set(s * 0.22, 0.8, 0); arm.rotation.z = s * (0.7 + springHash(c * 3 + s) * 0.4); G.add(arm);
        cpPart(new THREE.CylinderGeometry(0.012, 0.016, 0.5, 6), mStick, 0, 0.25, 0, 0, 0, 0, arm);
        [-0.5, 0.5].forEach(function (f) { cpPart(new THREE.CylinderGeometry(0.006, 0.008, 0.12, 5), mStick, f * 0.04, 0.5, 0, 0, 0, f, arm); });
      });
      cpPart(new THREE.TorusGeometry(0.15, 0.045, 8, 22), mScarf, 0, 0.92, 0, Math.PI / 2, 0, 0, G);   // (a striped scarf snug round its neck, with its tail hanging down its front)
      var tail = new THREE.Group(); tail.position.set(0.1, 0.84, 0.177); tail.rotation.set(-0.57, 0, 0.1); G.add(tail);
      cpPart(new THREE.BoxGeometry(0.09, 0.2, 0.025), mScarf, 0, 0, 0, 0, 0, 0, tail);
      for (var st = 0; st < 3; st++) cpPart(new THREE.BoxGeometry(0.09, 0.02, 0.025), mStripe, 0, 0.03 - st * 0.055, 0.006, 0, 0, 0, tail);
      if (c % 2) { cpPart(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 20), mHat, 0, 1.216, 0, 0, 0, 0, G); cpPart(new THREE.CylinderGeometry(0.12, 0.13, 0.2, 18), mHat, 0, 1.316, 0, 0, 0, 0, G); cpPart(new THREE.CylinderGeometry(0.131, 0.131, 0.04, 18), mScarf, 0, 1.246, 0, 0, 0, 0, G); }   // (a top hat with a band)
      else { cpPart(new THREE.SphereGeometry(0.17, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mScarf, 0, 1.146, 0, 0, 0, 0, G); cpPart(new THREE.TorusGeometry(0.165, 0.03, 6, 20), mStripe, 0, 1.156, 0, Math.PI / 2, 0, 0, G); cpPart(new THREE.SphereGeometry(0.055, 10, 8), mStripe, 0, 1.326, 0, 0, 0, 0, G); }   // (or a bobble hat)
    }
  })();
  // ===== snow on the roofs: on everything up high that faces the sky (roofs, chimneys, lamp tops, the tops of big rocks) =====
  var winterRoofSkip = null, winterRoofT = -99;
  var wsBox = new THREE.Box3(), wsV = new THREE.Vector3(), wsM = new THREE.Matrix4(), wsC = new THREE.Vector3();
  function winterSlabOf(size, M) {                                     // (1 if a box of this size, placed by matrix M, lies flat-ish up high)
    var e = M.elements, d = [size.x * Math.hypot(e[0], e[1], e[2]), size.y * Math.hypot(e[4], e[5], e[6]), size.z * Math.hypot(e[8], e[9], e[10])];
    var order = [0, 1, 2].sort(function (a, b) { return d[a] - d[b]; });
    if (!(d[order[0]] < 0.4 * d[order[1]])) return 0;
    var k = order[0] * 4, ay = e[k + 1] / (Math.hypot(e[k], e[k + 1], e[k + 2]) || 1);
    wsBox.getCenter(wsC).applyMatrix4(M);
    return Math.abs(ay) >= 0.5 && wsC.y >= 1.4 ? 1 : 0;              // (walls stand upright, and low things are left alone)
  }
  function winterSlab(o) {                                             // (a roof tile, shingle or roof board lies flat-ish up high: its edges take snow too, so the tiles don't show through)
    var g = o.geometry; if (!g || o.userData.slabDone || !g.attributes.position) return;
    o.userData.slabDone = true; o.updateMatrixWorld(true);
    if (!g.boundingBox) g.computeBoundingBox();
    wsBox.copy(g.boundingBox); var size = wsBox.getSize(new THREE.Vector3());
    if (o.isInstancedMesh) {                                           // (each piece in a batch on its own: shingles and battens can share one box)
      var vals = new Float32Array(o.count), any = 0, im = new THREE.Matrix4();
      for (var i = 0; i < o.count; i++) { o.getMatrixAt(i, im); vals[i] = winterSlabOf(size, wsM.multiplyMatrices(o.matrixWorld, im)); any += vals[i]; }
      if (!any) return;
      o.geometry = g.clone(); o.geometry.setAttribute('snowSlab', new THREE.InstancedBufferAttribute(vals, 1));
      return;
    }
    var slab = winterSlabOf(size, o.matrixWorld);
    if (!slab) return;
    if (g.attributes.snowSlab) return;                                 // (shared with another piece that already decided)
    var arr = new Float32Array(g.attributes.position.count); arr.fill(1);
    g.setAttribute('snowSlab', new THREE.BufferAttribute(arr, 1));
  }
  function winterRoofPatch() {
    if (!winterRoofSkip) {                                             // (not on you, the ground, the grass, the trees' own foliage or the water)
      winterRoofSkip = new Set([terrain.material, grassMat, leafBatch.material, needleBatch.material, litterMat, barkMat, pineBarkMat, rootMat, pineRootMat]);
      player.traverse(function (o) { if (o.material) [].concat(o.material).forEach(function (m) { winterRoofSkip.add(m); }); });
    }
    scene.traverse(function (o) {
      if (!o.isMesh || !o.material) return;
      winterSlab(o);
      [].concat(o.material).forEach(function (m) {
        if (!m || m.userData.snowy || winterRoofSkip.has(m) || m.transparent || !(m.isMeshStandardMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial)) return;
        m.userData.snowy = true;
        var before = m.onBeforeCompile, key = before ? before.toString() : '';
        m.customProgramCacheKey = function () { return key + '|roofsnow'; };
        m.onBeforeCompile = function (shader) {
          if (before) before.call(this, shader);
          shader.uniforms.uSnowOn = winterSnowOn;
          shader.vertexShader = 'varying float vSnowY;\nvarying vec2 vSnowXZ;\nattribute float snowSlab;\nvarying float vSnowSlab;\n' + shader.vertexShader.replace('#include <project_vertex>', [
            '#include <project_vertex>',
            'vec4 snowP = vec4(transformed, 1.0);',
            '#ifdef USE_INSTANCING', 'snowP = instanceMatrix * snowP;', '#endif',
            'vec4 snowW = modelMatrix * snowP; vSnowY = snowW.y; vSnowXZ = snowW.xz; vSnowSlab = snowSlab;'
          ].join('\n'));
          shader.fragmentShader = 'uniform float uSnowOn;\nvarying float vSnowY;\nvarying vec2 vSnowXZ;\nvarying float vSnowSlab;\nfloat snowHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\nfloat snowNoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(snowHash(i), snowHash(i + vec2(1.0, 0.0)), f.x), mix(snowHash(i + vec2(0.0, 1.0)), snowHash(i + vec2(1.0, 1.0)), f.x), f.y); }\n' + shader.fragmentShader.replace('#include <normal_fragment_maps>', [
            '#include <normal_fragment_maps>',
            'vec3 roofUp = normalize((vec4(normal, 0.0) * viewMatrix).xyz);',
            'float snowPatch = snowNoise(vSnowXZ * 1.6) * 0.65 + snowNoise(vSnowXZ * 5.0) * 0.35;',   // (just a little: soft patches here and there, and a light dusting between)
            'float snowUpMin = mix(0.3, -1.5, step(0.5, vSnowSlab));',   // (on roof tiles, every side of them, so no edges show through)
            'float roofSnow = smoothstep(snowUpMin, snowUpMin + 0.3, roofUp.y) * smoothstep(1.3, 1.8, vSnowY) * uSnowOn * smoothstep(0.55, 0.6, snowPatch);',   // (solid patches with a soft edge: no tiles showing through)
            'float snowLump = snowNoise(vSnowXZ * 6.0) * 0.6 + snowNoise(vSnowXZ * 14.0) * 0.3 + snowNoise(vSnowXZ * 30.0) * 0.1;',   // (lumpy: soft mounds lit on top, blue-grey in the dips)
            'float snowLit = snowNoise(vSnowXZ * 6.0 + vec2(0.05, 0.05)) * 0.6 + snowNoise(vSnowXZ * 14.0 + vec2(0.025, 0.025)) * 0.3 + snowNoise(vSnowXZ * 30.0 + vec2(0.01, 0.01)) * 0.1;',
            'float snowShade = clamp(0.7 + (snowLump - snowLit) * 3.0 + (snowLump - 0.5) * 0.5, 0.0, 1.0);',
            'float snowEdge = smoothstep(0.55, 0.62, snowPatch) * (1.0 - smoothstep(0.62, 0.74, snowPatch));',   // (a little blue shadow round the edge of each patch, where it's thin)
            'vec3 snowCol = mix(vec3(0.74, 0.8, 0.9), vec3(0.95, 0.97, 1.0), snowShade) - snowEdge * vec3(0.12, 0.08, 0.02);',
            'diffuseColor.rgb = mix(diffuseColor.rgb, snowCol, roofSnow);',
            'float snowL0 = snowNoise(vSnowXZ * 6.0) * 0.7 + snowNoise(vSnowXZ * 14.0) * 0.3;',   // (the snow's own lumps, tilting its surface so the light picks them out)
            'float snowLx = snowNoise((vSnowXZ + vec2(0.03, 0.0)) * 6.0) * 0.7 + snowNoise((vSnowXZ + vec2(0.03, 0.0)) * 14.0) * 0.3;',
            'float snowLz = snowNoise((vSnowXZ + vec2(0.0, 0.03)) * 6.0) * 0.7 + snowNoise((vSnowXZ + vec2(0.0, 0.03)) * 14.0) * 0.3;',
            'vec3 snowTilt = (viewMatrix * vec4(-(snowLx - snowL0) * 7.0, 0.0, -(snowLz - snowL0) * 7.0, 0.0)).xyz;',
            'vec3 snowUpV = normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);',   // (a patch is lit as one smooth blanket, whatever is under it)
            'normal = normalize(mix(normal, snowUpV, roofSnow) + snowTilt * roofSnow);'
          ].join('\n')).replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.rgb = mix(gl_FragColor.rgb, snowCol * 0.97, roofSnow * 0.7);');   // (and kept bright and solid, even in shadow)
        };
        m.needsUpdate = true;
      });
    });
  }
  // ===== cool, silvery winter light =====
  var WINTER_SKY = new THREE.Color(0xc4d6ea), WINTER_SUN = new THREE.Color(0xdde8ff);
  // ===== icy edges on the pond in winter =====
  // In Winter the water right where it meets the snowy bank looks icy: pale, frosty and still, with a soft glint,
  // fading back into the open, rippling water a little way out. It comes on (and melts away) over a few seconds
  (function () {
    waterUniforms.uIce = { value: 0 };
    waterMat.fragmentShader = waterMat.fragmentShader.replace('varying float vDepth;', 'varying float vDepth;\nuniform float uIce;').replace('  gl_FragColor = vec4(col, alpha);', [
      '  if (uIce > 0.0) {',
      '    float wob = 0.03 * sin(p.x * 1.7 + p.y * 0.9) + 0.02 * sin(p.y * 3.7 - p.x * 2.9) + 0.01 * sin(p.x * 7.1 - p.y * 5.3);',   // (a soft, uneven edge)
      '    float icy = (1.0 - smoothstep(0.05, 0.22, vDepth + wob)) * uIce;',   // (only the shallow water by the bank)
      '    float frost = 0.5 + 0.25 * sin(p.x * 5.3 + sin(p.y * 3.1) * 2.0) + 0.25 * sin(p.y * 4.7 + sin(p.x * 2.3) * 2.0);',
      '    vec3 ice = mix(vec3(0.76, 0.87, 0.93), vec3(0.94, 0.97, 1.0), frost * 0.6 + (1.0 - smoothstep(0.0, 0.12, vDepth)) * 0.4);',
      '    float ifres = 0.04 + 0.96 * pow(1.0 - max(v.y, 0.0), 5.0);',
      '    ice = mix(ice, uSky, ifres * 0.25) + uSunColor * pow(max(dot(vec3(0.0, 1.0, 0.0), normalize(uSunDir + v)), 0.0), 120.0) * 0.5;',
      '    col = mix(col, ice * mix(1.0, 0.6, uNight), icy * 0.85); alpha = mix(alpha, 0.95, icy);',
      '  }',
      '  gl_FragColor = vec4(col, alpha);'].join('\n'));
  })();
  var winterBaseSky = updateSky;
  updateSky = function () {
    var night = winterBaseSky.apply(this, arguments);
    if (winterNow()) { var day = Math.max(0, 1 - night * 1.6); scene.background.lerp(WINTER_SKY, 0.55 * day); scene.fog.color.copy(scene.background); sun.color.lerp(WINTER_SUN, 0.55 * day); hemi.intensity *= 1 + 0.15 * day; }
    return night;
  };
  // ===== every frame =====
  function updateWinter(dt) {
    var on = winterNow();
    if (winterShown !== on) {                                          // (the snow comes, or melts away)
      winterShown = on;
      leafBatch.visible = !on; winterSnowOn.value = on ? 1 : 0;                                         // (the broadleaf trees and bushes lose their leaves; the pines keep theirs)
      terrain.material.map = on ? winterSnowTex : winterGround.map; terrain.material.bumpMap = on ? winterSnowBump : winterGround.bump; terrain.material.bumpScale = on ? 0.06 : winterGround.bumpScale; terrain.material.roughness = on ? 0.82 : winterGround.rough; terrain.material.vertexColors = !on; terrain.material.needsUpdate = true;
      grassMat.vertexColors = !on; grassMat.needsUpdate = true;
      winterBury(on); if (on) { winterRoofPatch(); winterRoofT = state.time; }
      winterMenGroup.visible = on;
    }
    waterUniforms.uIce.value += ((on ? 1 : 0) - waterUniforms.uIce.value) * Math.min(1, dt * 0.5);   // (the edges ice over, or thaw, over a few seconds)
    if (on) {
      if (state.time - winterRoofT > 4) { winterRoofT = state.time; winterRoofPatch(); }   // (and on anything built since, like a new coop or barn)
      grassMat.color.copy(WINTER_GRASS); terrain.material.color.setRGB(1, 1, 1);
    }
    var snowing = on && !indoors;
    if (winterSnow.visible !== snowing) winterSnow.visible = snowing;
    if (snowing) winterSnowMove(dt);
  }

  // No lone pink lily buds poking up out of the lake: only the pads and the open flowers stay
  scene.children.filter(function (o) { return o.isMesh && o.geometry === lilyPetalGeo && o.material === lilyPink; }).forEach(function (bud) { scene.remove(bud); });

  // Stamina: hitting exactly 0 is fine, you're just worn out. Only going past it, into the negatives, makes you pass out
  useStamina = function (n) {
    state.stamina -= n;
    if (state.stamina < -1e-6) state.stamina = -(2 + Math.floor(Math.random() * 4));   // (overdo it, and you go a couple of points into the negatives: -2 to -5)
    else if (state.stamina < 1e-6) state.stamina = 0;
    if (state.stamina <= 60 && !tiredWarned) { tiredWarned = true; showToast('You\'re getting tired… eat a moonbloom or head to bed 🌙', 2600); }
  };
  updateStamina = function () {
    if (ui.stamina) ui.stamina.style.width = (Math.max(0, state.stamina) / MAX_STAMINA * 100).toFixed(1) + '%';
    var stText = Math.ceil(state.stamina - 0.001) + ' / ' + MAX_STAMINA;
    if (ui.staminaNum) ui.staminaNum.style.color = state.stamina < 0 ? '#e0304a' : '';   // (shown in red while you're in the negatives)
    if (ui.staminaNum && ui.staminaNum.textContent !== stText) ui.staminaNum.textContent = stText;
    if (state.stamina < 0 && !passingOut && !sleeping) passOut();
    updateBedtime();
  };

  // ---------- Fluff & Feather's own animals, on display ----------
  // One in each of the shop's three stalls, to show you what you could take home: Blossom, a pink Glimmerwing; Marina, a
  // Sirenna; and Starla, a Lunastra. They belong to the shop, so they aren't yours to feed, pet or take home
  var abDisplay = [];
  function abDisplayFree(g) { return !glimmers.some(function (q) { return q.stall === g.stall; }); }   // (an animal of yours still in that stall from long ago comes first)
  [['glim', 'Blossom'], ['bubble', 'Marina'], ['luna', 'Starla']].forEach(function (d, k) {
    var g = glimAdd({ kind: d[0], name: d[1], stall: k, pal: 0 });     // (pal 0: the pink Glimmerwing)
    glimmers.splice(glimmers.indexOf(g), 1); g.display = true; abDisplay.push(g);
    var c = g.m.tagCv.getContext('2d'), w = 256, h = 96;               // (its little sign: its name, and that it's on display)
    c.clearRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.88)'; c.beginPath(); c.moveTo(24, 6); c.lineTo(w - 24, 6); c.quadraticCurveTo(w - 4, 6, w - 4, 26); c.lineTo(w - 4, h - 26); c.quadraticCurveTo(w - 4, h - 6, w - 24, h - 6); c.lineTo(24, h - 6); c.quadraticCurveTo(4, h - 6, 4, h - 26); c.lineTo(4, 26); c.quadraticCurveTo(4, 6, 24, 6); c.fill();
    c.strokeStyle = '#c8a8f0'; c.lineWidth = 3; c.stroke();
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#5a3d9a'; c.font = 'bold 28px Fredoka, sans-serif'; c.fillText(d[1], w / 2, 34);
    c.fillStyle = '#a07ad0'; c.font = 'bold 17px Fredoka, sans-serif'; c.fillText('✧ On display ✧', w / 2, 66);
    g.m.tagTex.needsUpdate = true;
  });

  // The clock's little sky icons, written as codes so they always show properly, however the page is read
  clockText = function (totalMinutes) {
    var hour = Math.floor(totalMinutes / 60), minute = Math.floor((totalMinutes % 60) / 10) * 10;
    var icon = hour >= 5 && hour < 8 ? '\u263C' : hour >= 8 && hour < 17 ? '\u2600' : hour >= 17 && hour < 20 ? '\u263E' : '\u2605';
    if (clock24) return icon + ' ' + twoDigits(hour) + ':' + twoDigits(minute);   // ("Game Time Hour Format" set to 24 Hour: 13:00 rather than 1:00 PM)
    var hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return icon + ' ' + hour12 + ':' + twoDigits(minute) + ' ' + (hour < 12 ? 'AM' : 'PM');
  };
  // A tree, bush or rock you've cut down or broken doesn't get in your way again until it has grown back halfway
  // Past halfway it gets in your way bit by bit as it grows, never all at once, and never while you're standing on it
  function markYoungScenery() {
    function grow(sd, regrowing, k, full) {
      var young = regrowing && k < 0.5;
      if (regrowing && k >= 0.5) sd.r = full * Math.min(1, (k - 0.5) * 2);   // (from nothing at halfway to all of it once it's fully grown)
      if (!young && sd.young && !indoors && !flying && Math.hypot(player.position.x - sd.x, player.position.z - sd.z) < full + 0.45) young = true;   // (you're right there: it waits until you step away)
      sd.young = young;
    }
    allScenery.forEach(function (t) {
      var u = t.userData, at = u.base || t.position;
      if (Math.abs(at.x - u.solid.x) > 0.5 || Math.abs(at.z - u.solid.z) > 0.5) return;   // (only the tree or bush that's really standing on this spot counts)
      grow(u.solid, u.state === 'regrowing', u.shownK, u.solidR);
    });
    mineable.forEach(function (r) { grow(r.solid, r.state === 'regrowing', r.shownK, r.solidR); });
  }
  function setSceneryCut(t, cutAt) {                                  // puts a tree or bush back to standing, or cut down at a given time
    var u = t.userData;
    if (u.gone) return;                                               // cleared for the path: it stays gone
    if (u.proxy) { scene.remove(u.proxy); u.proxy = null; }           // tidy away a tree that was mid-fall
    if (u.stump) { scene.remove(u.stump); u.stump = null; }
    u.shudderT = undefined;
    if (cutAt === null) {
      u.state = 'standing'; u.hits = 0; u.solid.r = u.solidR; u.grassHidden = false;
      setTreeGrowth(t, 1);
      showHiddenGrass(u.solid, false);
    } else {
      u.state = 'regrowing'; u.felledAt = cutAt; u.shownK = -1; u.grassHidden = false; u.hits = 0;
      u.solid.r = 0;
      setTreeGrowth(t, 0);
      showHiddenGrass(u.solid, true);
    }
  }
  function setRockBroken(r, brokeAt) {
    if (r.gone) return;                                               // cleared for the path: it stays gone
    r.shakeT = undefined;
    if (brokeAt === null) {
      r.state = 'whole'; r.hits = 0; r.solid.r = r.solidR;
      setRock(r, 1);
      showHiddenGrass(r.solid, false);
    } else {
      r.state = 'regrowing'; r.brokeAt = brokeAt; r.shownK = -1; r.grassHidden = false; r.hits = 0;
      r.solid.r = 0;
      setRock(r, 0);
      showHiddenGrass(r.solid, true);
    }
  }
  function loadGame() {
    var data = null;
    try { data = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (err) { data = null; }
    if (!data || data.v !== 1) { showToast('No saved game yet', 2200); return; }
    saveName = data.name || '';                                       // (keeping its name for the next save)
    // the clock, mana and harvests
    state.mana = data.state.mana; state.harvest = data.state.harvest;
    state.stamina = data.state.stamina === undefined ? MAX_STAMINA : Math.min(MAX_STAMINA, data.state.stamina);
    state.minutes = data.state.minutes; state.day = data.state.day; state.petalDay = data.state.petalDay;
    state.coins = data.state.coins || 0; showCoins(false);
    glimmerLoadData(data.glimmers || null);                           // your Glimmerwings (none in older saves)
    shipBin = data.shipBin || []; lastFarmDay = farmDay(); closeBin();
    // your bag
    for (var i = 0; i < BAG_SLOTS; i++) bag[i] = data.bag[i] ? { id: data.bag[i].id, count: data.bag[i].count } : null;
    selectedSlot = data.selectedSlot; hotRow = data.hotRow || 0;
    renderBag();
    // the garden
    tiles.forEach(clearTile);
    var farm = data.farm;
    if (!farm && data.tiles) {                                        // a save from before the whole island was farm land: just the garden
      farm = [];
      data.tiles.forEach(function (st, n) { if (st) { st.c = n % COLS - COLS / 2; st.r = Math.floor(n / COLS) - ROWS / 2; farm.push(st); } });
    }
    (farm || []).forEach(function (st) {
      var tile = tileByKey(st.c, st.r);
      buildSoil(tile, false);
      if (st.crop) {
        tile.crop = makeCrop(tile);
        tile.stage = st.stage; tile.growth = Math.max(Math.floor(st.growth), [0, 1, 3, 4][st.stage]); // older saves counted growth differently
        showStage(tile);
        tile.drop = place(new THREE.Mesh(dropGeo, M.drop), tile.x, 1, tile.z);
      }
      setWet(tile, st.wet);
    });
    // trees, bushes and rocks
    allScenery.forEach(function (t, n) { setSceneryCut(t, data.scenery[n] === undefined ? null : data.scenery[n]); });
    mineable.forEach(function (r, n) { setRockBroken(r, data.rocks[n] === undefined ? null : data.rocks[n]); });
    coopLoadData(data.coop || null);                                  // your coop (none in older saves)
    fbarnLoadData(data.fbarn || null);                                // your barn (likewise)
    millLoadData(data.mill || null);                                  // and your mill
    siloLoadData(data.silo || null);                                  // and your silo, with its hay
    homeMigrate(true);                                                // (anyone still at Fluff & Feather moves home, if there's room)
    tiles.forEach(function (tile) { if (tile.soil) coverGrass(tile); }); // grass stays tucked under your soil
    flushDirty();
    // and you: back outside if you were in the house, standing where you saved
    if (indoors) {
      indoors = false;
      inShop = false;
      inClinic = false;
      inBarn = false;
      inCarp = inCoop = inFbarn = false;
      scene.add(player);
      if (outsideCam) { cam.dist = outsideCam.dist; cam.pitch = outsideCam.pitch; cam.yaw = outsideCam.yaw; }
    }
    walkTarget = null;
    doorArmed = false;                                                // don't walk straight into the house if you saved by the door
    player.position.set(data.player.x, 0, data.player.z);
    facing = data.player.facing;
    cam.target.set(player.position.x, 0.8, player.position.z);
    popSound();
    showToast('Game loaded ✦');
  }
  function saveLoadSafely(what, fn) {                                  // (if saving or loading ever goes wrong, say what happened instead of doing nothing)
    try { fn(); } catch (err) { showToast((what === 'save' ? 'Saving' : 'Loading') + ' went wrong: ' + (err && err.message ? err.message : err) + '.', 9000); if (window.console) console.error(err); }
  }
  document.getElementById('btnSave').addEventListener('click', function () { saveLoadSafely('save', saveGame); focusGame(); });
  document.getElementById('btnLoad').addEventListener('click', function () { saveLoadSafely('load', loadGame); focusGame(); });

  // ---------- The fireplace in the house, in real gray brick ----------
  // The piers, the arch, the hearth and the chimney breast are laid in gray brick: each brick its own shade of gray
  // (some cooler, some warmer, a few dark), with worn, chipped edges and a little speckle, set in pale mortar that sits
  // back from the bricks, so the light catches their edges. The bricks are laid by their real size, so they're the same
  // size on every face, in courses that run level all the way round, each course offset by half a brick
  (function () {
    var BW = 0.22, BH = 0.075, TW = BW * 4, TH = BH * 4;               // (a brick, and one picture of 4 x 4 of them)
    function brickPaint(bump) {
      var cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; var g = cv.getContext('2d'), r, c, k;
      g.fillStyle = bump ? '#202020' : '#b9b6b1'; g.fillRect(0, 0, 512, 256);   // (the mortar)
      if (!bump) for (k = 0; k < 900; k++) { g.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '90,88,86' : '220,218,212') + ',.25)'; g.fillRect(Math.random() * 512, Math.random() * 256, 1.5, 1.5); }
      for (r = 0; r < 4; r++) for (c = -1; c < 5; c++) {
        var x = c * 128 + (r % 2) * 64 + 5, y = r * 64 + 5, w = 118, h = 54, sd = Math.sin(r * 12.9 + c * 78.2) * 43758.5, rr = sd - Math.floor(sd);
        if (bump) { g.fillStyle = '#d8d8d8'; } else {
          var base = 108 + Math.floor(rr * 46) - (rr > 0.9 ? 40 : 0), tint = Math.floor((rr * 7) % 3) - 1;   // (each brick its own gray, a few cooler, a few warmer, now and then a dark one)
          g.fillStyle = 'rgb(' + (base + tint * 5) + ',' + (base + 1) + ',' + (base - tint * 6 + 3) + ')';
        }
        g.beginPath(); g.moveTo(x + 3, y); g.lineTo(x + w - 2, y + 1); g.lineTo(x + w, y + 4); g.lineTo(x + w - 1, y + h - 2); g.lineTo(x + w - 4, y + h); g.lineTo(x + 2, y + h - 1); g.lineTo(x, y + h - 4); g.lineTo(x + 1, y + 3); g.closePath(); g.fill();   // (a brick, its corners a little worn)
        if (bump) continue;
        var gr = g.createLinearGradient(x, y, x, y + h); gr.addColorStop(0, 'rgba(255,255,255,.16)'); gr.addColorStop(0.25, 'rgba(255,255,255,0)'); gr.addColorStop(0.8, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.22)'); g.fillStyle = gr; g.fillRect(x, y, w, h);   // (light on its top edge, shade along its bottom)
        for (k = 0; k < 140; k++) { g.fillStyle = 'rgba(' + (Math.random() < 0.55 ? '60,58,58' : '235,233,228') + ',' + (0.15 + Math.random() * 0.25) + ')'; g.fillRect(x + Math.random() * w, y + Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 1.5); }   // (speckle in the clay)
        for (k = 0; k < 3; k++) { var ex = x + Math.random() * w, ey = Math.random() < 0.5 ? y : y + h - 3; g.fillStyle = '#9d9a95'; g.beginPath(); g.arc(ex, ey + 1.5, 2 + Math.random() * 3, 0, Math.PI * 2); g.fill(); }   // (little chips out of its edges)
      }
      var t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (!bump && renderer.outputEncoding === THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding; return t;
    }
    R.stone.map = brickPaint(false); R.stone.bumpMap = brickPaint(true); R.stone.bumpScale = 0.025; R.stone.color.set(0xffffff); R.stone.roughness = 0.92; R.stone.needsUpdate = true;
    var n = new THREE.Vector3(), wp = new THREE.Vector3();
    room.traverse(function (o) {                                       // (lay the bricks by their real size: each face takes them flat on, from wherever it is in the room)
      if (!o.isMesh || o.material !== R.stone) return;
      o.updateMatrixWorld(true); var g = o.geometry, pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv, nm = new THREE.Matrix3().getNormalMatrix(o.matrixWorld);
      for (var i = 0; i < pos.count; i++) {
        wp.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); n.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize();
        var ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
        if (ay > ax && ay > az) uv.setXY(i, wp.x / TW, wp.z / TH);        // (tops and undersides)
        else if (ax > az) uv.setXY(i, wp.z / TW, wp.y / TH);              // (faces turned sideways)
        else uv.setXY(i, wp.x / TW, wp.y / TH);                           // (faces looking into the room)
      }
      uv.needsUpdate = true;
    });
  })();

  // ---------- The farmhouse windows look out on the real island ----------
  // Like the windows at the shops, the two arched windows in your house now show the actual outside instead of a
  // painted twilight sky: each frame while you're home, the island is drawn from the spot outside that matches where
  // you're standing in the room (the room's middle lined up with the middle of the house, its door wall with the
  // house's front), with the house itself left out of the way, and the window panes show that picture. So you see the
  // real time of day and weather, the season, your farm and garden, and the sky going dark at night
  var houseViewMap = new THREE.Matrix4().makeTranslation(HOUSE_X, 0, HOUSE_Z).multiply(new THREE.Matrix4().makeRotationY(HOUSE_TURN)).multiply(new THREE.Matrix4().makeTranslation(-IN_X, 0, -IN_Z));
  var houseJoined = scene.children.filter(function (o) {             // (the house's walls and roof, joined into a few big meshes that sit right in the island)
    if (!o.isMesh || !o.geometry) return false; if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); var c = o.geometry.boundingBox.getCenter(new THREE.Vector3());
    return Math.abs(c.x - HOUSE_X) < 6 && Math.abs(c.z - HOUSE_Z) < 5 && Object.keys(houseMats).some(function (k) { return houseMats[k] === o.material; });
  });
  function drawHouseView() {
    renderer.getDrawingBufferSize(shopViewSize);
    if (shopViewTarget.width !== shopViewSize.x || shopViewTarget.height !== shopViewSize.y) shopViewTarget.setSize(shopViewSize.x, shopViewSize.y);
    siWindowMask.uniforms.uSize.value.copy(shopViewSize);
    shopViewCam.projectionMatrix.copy(camera.projectionMatrix); shopViewCam.projectionMatrixInverse.copy(camera.projectionMatrixInverse);
    shopViewCam.matrix.multiplyMatrices(houseViewMap, camera.matrixWorld);
    shopViewCam.updateMatrixWorld(true);
    house.visible = false; houseJoined.forEach(function (o) { o.visible = false; });   // (you're inside it, so its own outside walls stay out of the way)
    renderer.setRenderTarget(shopViewTarget);
    renderer.render(scene, shopViewCam);
    renderer.setRenderTarget(null);
    house.visible = true; houseJoined.forEach(function (o) { o.visible = true; });
  }
  room.traverse(function (o) { if (o.isMesh && o.material === paneMat) { o.material = siWindowMask; o.castShadow = o.receiveShadow = false; } });   // (the panes show the view)
  // The windows match inside and out: the front of the house has two square windows either side of the door and a round
  // one toward each end, so the room's front wall (the door wall) gets them too, the square ones as arched windows with
  // curtains like the others in here, and the round ones in round frames; and the room's back wall has an arched window,
  // so the back of the house gets one to match. They all look out on the real island
  function houseWindowIn(wall, x) {                                    // (an arched window like the others in the room: frame, glazing bars, deep sill, curtains)
    var wg = new THREE.Group(); wg.position.set(x, 1.85, 0.02); inWalls[wall].g.add(wg);
    var outer = winArch(WIN_W + 0.16, WIN_H + 0.16, ARCH + 0.06); outer.holes.push(winArch(WIN_W, WIN_H, ARCH));
    iPart(new THREE.ExtrudeGeometry(outer, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2 }), winFrame, 0, 0, 0, 0, 0, 0, wg);
    iPart(new THREE.ShapeGeometry(winArch(WIN_W, WIN_H, ARCH)), siWindowMask, 0, 0, 0.005, 0, 0, 0, wg).castShadow = false;
    iPart(new THREE.BoxGeometry(0.035, WIN_H + ARCH * 0.3, 0.04), winFrame, 0, 0.04, 0.04, 0, 0, 0, wg);
    [-0.18, 0.18].forEach(function (by) { iPart(new THREE.BoxGeometry(WIN_W, 0.035, 0.04), winFrame, 0, by, 0.04, 0, 0, 0, wg); });
    iPart(new THREE.BoxGeometry(WIN_W + 0.36, 0.06, 0.2), winFrame, 0, -WIN_H / 2 - 0.1, 0.1, 0, 0, 0, wg);
    iPart(new THREE.BoxGeometry(WIN_W + 0.2, 0.08, 0.05), winFrame, 0, -WIN_H / 2 - 0.16, 0.04, 0, 0, 0, wg);
    var ROD_Y = WIN_H / 2 + ARCH * 0.35 + 0.18, ROD_W = WIN_W + 0.6;
    iPart(new THREE.CylinderGeometry(0.018, 0.018, ROD_W, 8), R.gold, 0, ROD_Y, 0.16, 0, 0, Math.PI / 2, wg);
    [-1, 1].forEach(function (sd) {
      iPart(new THREE.SphereGeometry(0.04, 10, 8), R.gold, sd * ROD_W / 2, ROD_Y, 0.16, 0, 0, 0, wg);
      iPart(new THREE.BoxGeometry(0.03, 0.03, 0.14), R.gold, sd * (ROD_W / 2 - 0.1), ROD_Y, 0.09, 0, 0, 0, wg);
      var CW = 0.34, CH = ROD_Y + WIN_H / 2 + 0.3, cg = new THREE.PlaneGeometry(CW, CH, 16, 24), cp = cg.attributes.position;
      for (var ci = 0; ci < cp.count; ci++) {
        var u = cp.getX(ci) / CW + 0.5, v = 1 - (cp.getY(ci) / CH + 0.5), tie = 0.62, gather = v < tie ? 1 - 0.55 * Math.pow(v / tie, 1.6) : 0.45 + 0.4 * Math.pow((v - tie) / (1 - tie), 0.8);
        cp.setXYZ(ci, (u - 0.5) * CW * gather - sd * (1 - gather) * 0.1, cp.getY(ci), Math.sin(u * Math.PI * 6) * 0.025 * (0.6 + gather * 0.5));
      }
      cg.computeVertexNormals();
      var cx = sd * (WIN_W / 2 + 0.12);
      iPart(cg, curtainMat, cx, ROD_Y - CH / 2, 0.13, 0, 0, 0, wg);
      iPart(new THREE.TorusGeometry(0.06, 0.016, 6, 14), R.gold, cx - sd * 0.08, ROD_Y - CH * 0.62, 0.16, 0, Math.PI / 2, 0, wg);
      for (var rr = 0; rr < 4; rr++) iPart(new THREE.TorusGeometry(0.026, 0.006, 5, 10), R.gold, cx + (rr - 1.5) * 0.08, ROD_Y, 0.16, 0, Math.PI / 2, 0, wg);
    });
    var vg = new THREE.PlaneGeometry(ROD_W - 0.1, 0.2, 30, 3), vp = vg.attributes.position;
    for (var vi = 0; vi < vp.count; vi++) { var vx = vp.getX(vi), vy = vp.getY(vi); vp.setXYZ(vi, vx, vy + (vy < -0.05 ? -0.04 * Math.abs(Math.sin(vx * Math.PI / 0.27)) : 0), Math.sin(vx * 40) * 0.015); }
    vg.computeVertexNormals();
    iPart(vg, curtainMat, 0, ROD_Y - 0.06, 0.18, 0, 0, 0, wg);
    iPart(new THREE.BoxGeometry(ROD_W - 0.1, 0.025, 0.02), curtainLining, 0, ROD_Y + 0.04, 0.18, 0, 0, 0, wg);
  }
  function houseRoundIn(wall, x) {                                     // (a round window: the view, in a round painted frame with a cross of glazing bars and a little ledge)
    var wg = new THREE.Group(); wg.position.set(x, 1.85, 0.02); inWalls[wall].g.add(wg);
    iPart(new THREE.CircleGeometry(0.34, 24), siWindowMask, 0, 0, 0.005, 0, 0, 0, wg).castShadow = false;
    iPart(new THREE.TorusGeometry(0.37, 0.06, 8, 28), winFrame, 0, 0, 0.03, 0, 0, 0, wg);
    iPart(new THREE.BoxGeometry(0.035, 0.68, 0.035), winFrame, 0, 0, 0.03, 0, 0, 0, wg);
    iPart(new THREE.BoxGeometry(0.68, 0.035, 0.035), winFrame, 0, 0, 0.03, 0, 0, 0, wg);
    iPart(new THREE.BoxGeometry(0.62, 0.05, 0.16), winFrame, 0, -0.46, 0.08, 0, 0, 0, wg);
  }
  houseWindowIn('S', -1.55); houseWindowIn('S', 1.55);                // (the front wall: the door wall, seen from inside, so the outside's left is in here on the right)
  houseRoundIn('S', -2.95); houseRoundIn('S', 2.95);
  windowAt(1.05, FOOT_H + 1.35, -FRONT - 0.02, Math.PI);              // (and outside, a window in the back wall where the room's back window is)
  house.add(houseStatic.children[houseStatic.children.length - 1]);  // (the house's other still parts were joined up long ago, so this one goes straight on the house)

  // ---------- Save slots ----------
  // The title screen has five save slots. Picking one decides which slot the Save and Load buttons use (slot 1 is
  // where your game was always saved, so an old save turns up there). A slot with a game in it is loaded the moment
  // the title screen has gone; an empty one starts a new game there and saves it straight away, so it's waiting for
  // you next time. Once you're playing, your game also saves itself whenever you leave or close the page
  var afterTitle = null, slotPicked = false, saveName = '';
  window.everdawnPickSlot = function (n, fresh, name) {
    SAVE_KEY = 'everdawn-save-' + n; slotPicked = true; if (fresh) saveName = name || '';
    try { localStorage.setItem('everdawn-last-slot', String(n)); } catch (err) {}
    afterTitle = function () { saveLoadSafely(fresh ? 'save' : 'load', fresh ? function () { saveGame(true); } : loadGame); };
  };
  function autoSave() { if (slotPicked && !window.EVERDAWN_TITLE) { try { saveGame(true); } catch (err) {} } }
  window.addEventListener('pagehide', autoSave);
  document.addEventListener('visibilitychange', function () { if (document.hidden) autoSave(); });

  // ---------- Camera zoom, set by the "Adjust Camera Zoom" slider in Settings ----------
  // You can't zoom with the mouse wheel or by pinching; instead the slider sets how far the camera sits from you
  // (6 close up to 26 far away), and it's remembered. Inside a building the camera keeps its own distance, and yours
  // comes back when you step outside
  var ZOOM_KEY = 'everdawn-zoom';
  try { var zoomSaved = parseFloat(localStorage.getItem(ZOOM_KEY)); if (zoomSaved >= 6 && zoomSaved <= 26) cam.dist = zoomSaved; } catch (err) {}
  window.everdawnSetZoom = function (d) {
    d = THREE.MathUtils.clamp(d, 6, 26);
    if (indoors) { if (outsideCam) outsideCam.dist = d; } else cam.dist = d;
    try { localStorage.setItem(ZOOM_KEY, String(d)); } catch (err) {}
  };

  // ---------- Movement type, set in Settings: Walk or Jog ----------
  // Walking is your usual pace; jogging is a little quicker (about a third faster), with quicker steps to match.
  // It's remembered. Flying on your broom stays the same either way
  var WALK_SPEED = SPEED, JOG_SPEED = SPEED * 1.35, MOVE_KEY = 'everdawn-move';
  function setMove(type) { SPEED = type === 'jog' ? JOG_SPEED : WALK_SPEED; }
  try { setMove(localStorage.getItem(MOVE_KEY)); } catch (err) {}
  window.everdawnSetMove = function (type) { setMove(type); try { localStorage.setItem(MOVE_KEY, type === 'jog' ? 'jog' : 'walk'); } catch (err) {} };

  // ---------- Sprinting: hold Shift; and Strafe: hold C ----------
  // Hold Shift while you walk or jog to sprint: about two-thirds faster again, with quicker steps (and footsteps) to
  // match. Not on your broom or in the boat. On the Mouse & Keyboard page Sprint can be a key of your own instead (then
  // Shift doesn't sprint)
  var sprintHeld = false, sprintKey = null; try { sprintKey = localStorage.getItem('everdawn-sprint-key') || null; } catch (err) {}
  function isSprintKey(code) { return sprintKey ? code === sprintKey : code === 'ShiftLeft' || code === 'ShiftRight'; }
  window.everdawnSetSprintKey = function (code) { sprintKey = code || null; sprintHeld = false; };
  window.addEventListener('keydown', function (e) { if (isSprintKey(e.code)) sprintHeld = true; });
  window.addEventListener('keyup', function (e) { if (isSprintKey(e.code)) sprintHeld = false; });
  // Strafe: hold C to slow right down (to a bit under half your pace, with slower steps) for precise control, to line
  // yourself up just where you want to be. It wins over sprinting if you hold both. On the Mouse & Keyboard page Strafe
  // can be a key of your own instead (then C doesn't strafe)
  var strafeHeld = false, strafeKey = null; try { strafeKey = localStorage.getItem('everdawn-strafe-key') || null; } catch (err) {}
  window.everdawnSetStrafeKey = function (code) { strafeKey = code || null; strafeHeld = false; };
  window.addEventListener('keydown', function (e) { if (e.code === (strafeKey || 'KeyC')) strafeHeld = true; });
  window.addEventListener('keyup', function (e) { if (e.code === (strafeKey || 'KeyC')) strafeHeld = false; });
  window.addEventListener('blur', function () { sprintHeld = false; strafeHeld = false; });
  updatePlayer = (function (base) {
    return function (dt) {
      if ((!sprintHeld && !strafeHeld) || flying || inBoat) return base.apply(this, arguments);
      var s = SPEED; SPEED = s * (strafeHeld ? 0.45 : 1.7);
      try { return base.apply(this, arguments); } finally { SPEED = s; }
    };
  })(updatePlayer);

  // ---------- Game time speed, set by the "Game Time Speed" slider in Settings ----------
  // 50% is the usual pace (every 10 in-game minutes take 11 real seconds); 100% makes time on the island go twice as
  // fast, and everything in between scales smoothly. It's remembered
  var TIME_KEY = 'everdawn-time-speed', BASE_MINUTES_PER_SECOND = GAME_MINUTES_PER_SECOND;
  function setTimeSpeed(pct) { pct = THREE.MathUtils.clamp(pct, 50, 100); GAME_MINUTES_PER_SECOND = BASE_MINUTES_PER_SECOND * pct / 50; }
  try { var timeSaved = parseFloat(localStorage.getItem(TIME_KEY)); if (timeSaved >= 50 && timeSaved <= 100) setTimeSpeed(timeSaved); } catch (err) {}
  window.everdawnSetTimeSpeed = function (pct) { setTimeSpeed(pct); try { localStorage.setItem(TIME_KEY, String(THREE.MathUtils.clamp(pct, 50, 100))); } catch (err) {} };

  // ---------- Quest HUD, set by "Display Quest HUD" in Settings: Show or Hide ----------
  // A little scroll in the top-left corner of the game listing the quests you're on. There are no quests yet, so for
  // now it just says so; later, quests go in the quests list and renderQuestHud() draws them. Show is the usual
  // setting; Hide takes it away completely. It's remembered
  var QUEST_KEY = 'everdawn-quest-hud', quests = [], questShow = true;   // (each quest: { name, step }, where step is a short line on what to do next)
  try { questShow = localStorage.getItem(QUEST_KEY) !== 'hide'; } catch (err) {}
  var questStyle = document.createElement('style');
  questStyle.textContent = '.quest-hud{position:absolute;left:18px;top:18px;z-index:3;max-width:min(240px,42%);padding:8px 12px 9px;border-radius:14px;background:rgba(255,255,255,0.78);' +
    'box-shadow:0 4px 14px rgba(120,80,190,0.3),inset 0 0 0 2px #fff;color:#4a3570;font-size:.85rem;line-height:1.35;pointer-events:none}' +
    '.quest-hud[hidden]{display:none}.quest-hud b{display:block;font-size:.95rem;color:#7b4fd6;margin-bottom:3px}.quest-hud ul{margin:0;padding:0;list-style:none}' +
    '.quest-hud li{margin-top:4px}.quest-hud li span{display:block;font-size:.78rem;opacity:.8}.quest-hud .none{opacity:.7;font-style:italic}';
  document.head.appendChild(questStyle);
  var questHud = document.createElement('div'); questHud.className = 'quest-hud'; questHud.setAttribute('aria-label', 'Quests');
  canvas.parentNode.appendChild(questHud);
  function renderQuestHud() {
    questHud.innerHTML = '<b>📜 Quests</b>' + (quests.length ? '<ul></ul>' : '<div class="none">No quests yet</div>');
    var ul = questHud.querySelector('ul');
    quests.forEach(function (q) { var li = document.createElement('li'); li.textContent = '✦ ' + q.name; if (q.step) { var sp = document.createElement('span'); sp.textContent = q.step; li.appendChild(sp); } ul.appendChild(li); });
    questHud.hidden = !questShow;
  }
  renderQuestHud();
  window.everdawnSetQuestHud = function (show) { questShow = !!show; questHud.hidden = !questShow; try { localStorage.setItem(QUEST_KEY, show ? 'show' : 'hide'); } catch (err) {} };

  // ---------- Typewriter Effect, set in Settings: Disabled or Enabled ----------
  // For what people say when you talk to them. Disabled (the usual way): their words appear all at once. Enabled: they
  // appear a letter at a time, like being typed out. There's no one to talk to yet; when there is, their dialogue is
  // shown with typeText(el, text, done), which follows this setting and hands back a function that finishes the text
  // straight away (for tapping to skip). It's remembered
  var TYPE_KEY = 'everdawn-typewriter', typewriter = false, TYPE_PER_SECOND = 40;
  try { typewriter = localStorage.getItem(TYPE_KEY) === 'on'; } catch (err) {}
  function typeText(el, text, done) {
    var timer = 0, start = Date.now();
    function finish() { clearInterval(timer); el.textContent = text; if (done) { var d = done; done = null; d(); } }
    if (!typewriter) { finish(); return finish; }
    el.textContent = '';
    timer = setInterval(function () {                                   // (letters by the clock, so a busy moment never slows the typing down)
      var shown = Math.floor((Date.now() - start) / 1000 * TYPE_PER_SECOND);
      if (shown >= text.length) finish(); else el.textContent = text.slice(0, shown);
    }, 1000 / TYPE_PER_SECOND);
    return finish;
  }
  window.everdawnSetTypewriter = function (on) { typewriter = !!on; try { localStorage.setItem(TYPE_KEY, on ? 'on' : 'off'); } catch (err) {} };

  // ---------- Tile Highlight While Moving, set in Settings: Disabled or Enabled ----------
  // Enabled (the usual way): the glowing square marker shows the tile in front of you as you move about, on any open
  // ground, so you can see what you'd water, plant or dig. Disabled: there's no marker on the ground at all, for a
  // cleaner screen.
  // It's remembered
  var TILE_HL_KEY = 'everdawn-tile-highlight', tileHighlightOff = false;
  try { tileHighlightOff = localStorage.getItem(TILE_HL_KEY) === 'off'; } catch (err) {}
  cursor.material.depthTest = false; cursor.renderOrder = 5;          // (drawn on top of the grass and bushes, so it never gets lost among them...)
  player.traverse(function (o) {                                       // (...but never over her: she's drawn after it, so she stays in front)
    if (!o.isMesh) return; o.renderOrder = 6;
    [].concat(o.material).forEach(function (m) { if (m && !m.transparent) { m.transparent = true; m.needsUpdate = true; } });
  });
  window.everdawnSetTileHighlight = function (on) { tileHighlightOff = !on; if (!on) cursor.visible = false; try { localStorage.setItem(TILE_HL_KEY, on ? 'on' : 'off'); } catch (err) {} };

  // ---------- Game Time Hour Format, set in Settings: AM/PM or 24 Hour ----------
  // AM/PM (the usual way) shows the clock as 1:00 PM; 24 Hour shows it as 13:00 (and 6:00 AM as 06:00). It changes the
  // clock straight away, and it's remembered
  var CLOCK_KEY = 'everdawn-hour-format', clock24 = false;
  try { clock24 = localStorage.getItem(CLOCK_KEY) === '24'; } catch (err) {}
  ui.clock.textContent = clockText(state.minutes);
  window.everdawnSetHourFormat = function (is24) { clock24 = !!is24; ui.clock.textContent = clockText(state.minutes); try { localStorage.setItem(CLOCK_KEY, is24 ? '24' : '12'); } catch (err) {} };

  // ---------- Combat Mode, set in Settings: Default or Passive ----------
  // Default: a monster comes for you as soon as you step within its detection range. Passive: monsters leave you be
  // when you walk near them, and only turn hostile once you've struck them first. There are no monsters yet; when
  // there are, each one asks monsterWillAttack(m, dist) whether to go for you (dist: how far you are from it), and is
  // marked m.provoked = true when you hit it. It's remembered
  var COMBAT_KEY = 'everdawn-combat-mode', combatPassive = false, MONSTER_DETECT = 6;   // (how close you can get before a monster notices you, unless it has its own m.detect)
  try { combatPassive = localStorage.getItem(COMBAT_KEY) === 'passive'; } catch (err) {}
  function monsterWillAttack(m, dist) { return !!m.provoked || (!combatPassive && dist < (m.detect || MONSTER_DETECT)); }
  window.everdawnSetCombatMode = function (passive) { combatPassive = !!passive; try { localStorage.setItem(COMBAT_KEY, passive ? 'passive' : 'default'); } catch (err) {} };

  // ---------- Enable Jealousy, set in Settings: No or Yes ----------
  // No (the usual way): none of this happens. Yes: romance can cause drama. There are no townsfolk yet; when there are,
  // each dateable one is a romance record like { name, gender, dateable: true, hearts, dating, spouse, lastTalkDay }
  // and the game tells jealousyEvent() what you just did:
  //   'date'      you start dating someone while already dating (or married to) someone else
  //   'chat'      you talk to, or give a gift to, another single dateable townsperson while you're with someone
  //   'gift'      married, you give a gift to a romance candidate of the same gender as your spouse
  //   'tenHeart'  you watch a 10-heart event, once you've seen them for at least four different dateable townsfolk
  // Drama gives the people you're with the "Cold Shoulder": they're upset and won't talk to you for a while (3 days, or
  // 7 for a spouse), their hearts drop back to 8, and hearts 9 and 10 stay locked until you give them a Locket again
  // and re-watch their 10-heart event. A spouse you haven't talked to for a while also gets sad, then starts to
  // question the relationship (spouseMood). It's remembered
  var JEALOUSY_KEY = 'everdawn-jealousy', jealousyOn = false, DRAMA_CHANCE = 0.25, COLD_DAYS = 3, COLD_DAYS_SPOUSE = 7;   // (DRAMA_CHANCE: how likely a chat or gift is to be noticed)
  try { jealousyOn = localStorage.getItem(JEALOUSY_KEY) === 'yes'; } catch (err) {}
  var romance = [], tenHeartSeen = {};                                  // (all the dateable townsfolk, and whose 10-heart events you've watched)
  function partnersOf(except) { return romance.filter(function (r) { return (r.dating || r.spouse) && r !== except; }); }
  function coldShoulder(r) {                                           // (upset: no talking for a while, back down to 8 hearts, 9 and 10 locked)
    r.coldUntil = state.day + (r.spouse ? COLD_DAYS_SPOUSE : COLD_DAYS);
    r.hearts = Math.min(r.hearts || 0, 8); r.heartsLocked = true; r.locketBack = false;
  }
  function jealousyEvent(kind, who) {                                  // (returns the townsfolk who got upset, if any)
    if (!jealousyOn) return [];
    var partners = partnersOf(who), spouse = romance.filter(function (r) { return r.spouse; })[0], drama = false;
    if (kind === 'date') drama = partners.length > 0;
    else if (kind === 'chat') drama = partners.length > 0 && who && who.dateable && !who.dating && !who.spouse && Math.random() < DRAMA_CHANCE;
    else if (kind === 'gift') drama = !!spouse && who && who !== spouse && who.dateable && who.gender === spouse.gender && Math.random() < DRAMA_CHANCE;
    else if (kind === 'tenHeart') { if (who) tenHeartSeen[who.name] = true; drama = Object.keys(tenHeartSeen).length >= 4 && partners.length > 0; }
    if (!drama) return [];
    partners.forEach(coldShoulder);
    return partners;
  }
  function canTalkTo(r) { return !jealousyOn || !(r.coldUntil > state.day); }   // (no talking while they're giving you the cold shoulder)
  function maxHearts(r) { return jealousyOn && r.heartsLocked ? 8 : 10; }
  function locketGiven(r) { if (r.heartsLocked) r.locketBack = true; }   // (a Locket again: then their 10-heart event, re-watched, unlocks hearts 9 and 10)
  function tenHeartRewatched(r) { if (r.heartsLocked && r.locketBack) { r.heartsLocked = false; r.locketBack = false; } }
  function spouseMood(r) {                                             // ('happy', 'sad' after 3 days without a word, 'questioning' after 7)
    if (!jealousyOn || !r.spouse || r.lastTalkDay === undefined) return 'happy';
    var since = state.day - r.lastTalkDay;
    return since >= 7 ? 'questioning' : since >= 3 ? 'sad' : 'happy';
  }
  window.everdawnSetJealousy = function (on) { jealousyOn = !!on; try { localStorage.setItem(JEALOUSY_KEY, on ? 'yes' : 'no'); } catch (err) {} };

  // ---------- Enable Excessive Animations, set in Settings: No or Yes ----------
  // Yes (the usual way): everything moves as it always has. No: the motion that can make some people feel sick is cut
  // out. The camera stays locked on you instead of trailing behind and catching up (so it never sweeps across the
  // island after a teleport or a door), and the title screen and top bar keep still: no floating logo, light sweeps,
  // pulsing glows, twinkling stars or bouncing coin counter. It's remembered
  var MOTION_KEY = 'everdawn-excessive-anim', calmMotion = false;
  try { calmMotion = localStorage.getItem(MOTION_KEY) === 'no'; } catch (err) {}
  document.documentElement.classList.toggle('ev-calm', calmMotion);
  window.everdawnSetExcessiveAnim = function (on) { calmMotion = !on; document.documentElement.classList.toggle('ev-calm', calmMotion); try { localStorage.setItem(MOTION_KEY, on ? 'yes' : 'no'); } catch (err) {} };

  // ---------- Storage Drag & Drop, set in Settings ----------
  // Disabled (the usual way): tap something in your bag and the whole stack goes into the shipping bin's first open
  // spot, and tap it in the bin to take it back out. Enabled: tapping does nothing; you press and hold an item and drag
  // it across into the bin (and drag it from the bin back over your bag to take it out), with a copy of it following
  // your finger and the side you can drop on lighting up. It's remembered
  var STORE_KEY = 'everdawn-storage-drag', storeDrag = false, shipHintEl = shipBox.querySelector('.ship-hint'), shipHintTap = shipHintEl.textContent;
  try { storeDrag = localStorage.getItem(STORE_KEY) === 'on'; } catch (err) {}
  function storeHint() { shipHintEl.textContent = storeDrag ? 'Press and hold something in your bag, then drag it into the bin. Drag it from the bin back over your bag to take it out. Everything in the bin sells at 6 am tomorrow.' : shipHintTap; }
  storeHint();
  window.everdawnSetStorageDrag = function (on) { storeDrag = !!on; storeHint(); try { localStorage.setItem(STORE_KEY, on ? 'on' : 'off'); } catch (err) {} if (!shipBox.hidden) renderShip(); };
  [shipBagGrid, shipBinGrid].forEach(function (grid) {               // (while it's on, a plain tap doesn't move anything)
    grid.addEventListener('click', function (e) { if (storeDrag && e.target !== grid) { e.stopPropagation(); e.preventDefault(); } }, true);
  });
  var storeDragging = null;                                            // { from: 'bag' or 'bin', i, id, x, y, ghost, el }
  function storeIndex(grid, el) { while (el && el.parentNode !== grid) el = el.parentNode; return el ? Array.prototype.indexOf.call(grid.children, el) : -1; }
  function storeOver(x, y, grid) { var r = grid.parentNode.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }
  function storeClear() { shipBagGrid.parentNode.classList.remove('store-drop'); shipBinGrid.parentNode.classList.remove('store-drop'); }
  [[shipBagGrid, 'bag'], [shipBinGrid, 'bin']].forEach(function (pair) {
    pair[0].addEventListener('pointerdown', function (e) {
      if (!storeDrag) return;
      var i = storeIndex(pair[0], e.target), el = pair[0].children[i];
      if (i < 0 || !el || el.tagName !== 'BUTTON') return;
      var it = pair[1] === 'bag' ? bag[i] : shipBin[i]; if (!it) return;
      e.preventDefault();
      storeDragging = { from: pair[1], i: i, id: it.id, x: e.clientX, y: e.clientY, ghost: null, el: el };
    });
  });
  window.addEventListener('pointermove', function (e) {
    var d = storeDragging; if (!d) return;
    if (!d.ghost) {
      if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) < 6) return;
      d.ghost = document.createElement('div'); d.ghost.className = 'drag-ghost'; d.ghost.appendChild(itemPicture(d.id)); document.body.appendChild(d.ghost);
      d.el.classList.add('dragging');
    }
    d.ghost.style.left = e.clientX + 'px'; d.ghost.style.top = e.clientY + 'px';
    var target = d.from === 'bag' ? shipBinGrid : shipBagGrid; storeClear();
    if (storeOver(e.clientX, e.clientY, target)) target.parentNode.classList.add('store-drop');
  });
  function storeEnd(e, cancel) {
    var d = storeDragging; if (!d) return; storeDragging = null; storeClear();
    if (d.ghost) document.body.removeChild(d.ghost); d.el.classList.remove('dragging');
    if (cancel || !d.ghost) return;
    if (d.from === 'bag' && storeOver(e.clientX, e.clientY, shipBinGrid)) {
      var it = bag[d.i]; if (it && (isTool(it.id) || !ITEMS[it.id].price)) { showToast('Tools can\'t go in the shipping bin', 1800); return; }
      shipItem(d.i);
    } else if (d.from === 'bin' && storeOver(e.clientX, e.clientY, shipBagGrid)) unshipItem(d.i);
  }
  window.addEventListener('pointerup', function (e) { storeEnd(e, false); });
  window.addEventListener('pointercancel', function (e) { storeEnd(e, true); });
  (function () { var css = document.createElement('style');            // (the side you can drop on lights up, and the slots don't scroll the page while you drag)
    css.textContent = '.ship .ship-cols > div { border-radius: 14px; transition: box-shadow .15s, background .15s; } .ship .ship-cols > div.store-drop { background: rgba(255,210,240,.25); box-shadow: 0 0 0 3px #ffd27a inset; } .ship.store-drag .slot { touch-action: none; }';
    document.head.appendChild(css); })();
  var storeBaseRender = renderShip;
  renderShip = function () { storeBaseRender(); shipBox.classList.toggle('store-drag', storeDrag); };

  // Full screen: the game fills the whole screen. On computers and Android it also asks the browser for its own full
  // screen, which hides the browser bars. On an iPad or iPhone it never does: there, Safari (which every iPad browser
  // is built on) turns the keyboard off in its full screen, silently dropping every letter and number key (only the
  // arrows, space and a few others get through), so I, T, E, Q, F and 1-4 would stop working. So on those the game
  // just fills the whole browser window instead, and the keyboard keeps working
  var btnFull = document.getElementById('btnFull');
  var appleTouch = /iPad|iPhone|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);   // (an iPad says it's a Mac, but has a touch screen)
  function realFullscreen() { return document.fullscreenElement || document.webkitFullscreenElement; }
  function setFullScreen(on) {
    document.body.classList.toggle('full', on);
    btnFull.innerHTML = on ? '✕ Exit full screen <kbd>F</kbd>' : '⛶ Full screen <kbd>F</kbd>';
    var root = document.documentElement;
    try {
      if (on && !realFullscreen() && !appleTouch) {
        var ask = root.requestFullscreen || root.webkitRequestFullscreen;
        if (ask) { var asked = ask.call(root); if (asked && asked.catch) asked.catch(function () {}); }
      } else if (!on && realFullscreen()) {
        var leave = document.exitFullscreen || document.webkitExitFullscreen;
        if (leave) { var left = leave.call(document); if (left && left.catch) left.catch(function () {}); }
      }
    } catch (err) { /* the browser said no: the game still fills the window */ }
    setTimeout(resize, 50); setTimeout(placeToasts, 150);
  }
  function fullscreenChanged() { if (!realFullscreen() && document.body.classList.contains('full')) setFullScreen(false); } // pressed Esc
  document.addEventListener('fullscreenchange', fullscreenChanged);
  document.addEventListener('webkitfullscreenchange', fullscreenChanged);
  btnFull.addEventListener('click', function () { setFullScreen(!document.body.classList.contains('full')); focusGame(); });
  // In full screen the hotbar sits higher (above the phone's or tablet's home bar), so the messages and the little
  // action buttons (Sit in the boat, Take hay...) are lifted to just above wherever the hotbar really is
  function placeToasts() {
    var toast = document.getElementById('toast'), bar = document.querySelector('.hotbar'), full = document.body.classList.contains('full');
    var acts = document.querySelectorAll('.sleep-btn');
    if (!toast || !bar || !full) { if (toast) toast.style.bottom = ''; for (var i = 0; i < acts.length; i++) acts[i].style.bottom = ''; return; }
    var gap = toast.offsetParent ? toast.offsetParent.getBoundingClientRect().bottom - bar.getBoundingClientRect().top + 10 : 84;
    toast.style.bottom = Math.max(84, Math.round(gap)) + 'px';
    var actGap = Math.max(84, Math.round(gap)) + toast.offsetHeight + 12;
    for (var j = 0; j < acts.length; j++) acts[j].style.bottom = Math.max(130, actGap) + 'px';
  }
  var fsBaseToast = showToast;
  showToast = function () { var r = fsBaseToast.apply(this, arguments); placeToasts(); return r; };
  window.addEventListener('resize', function () { setTimeout(placeToasts, 120); });
  document.addEventListener('fullscreenchange', function () { setTimeout(placeToasts, 120); });
  document.addEventListener('webkitfullscreenchange', function () { setTimeout(placeToasts, 120); });
  // In full screen, menus sit beside the button column when there's room, so the buttons (Bag, Teleport...) stay
  // tappable and can close the menu they opened. On a narrow screen there isn't room: the buttons fade while a menu is
  // open, and a tap anywhere outside the menu closes it instead
  var ctlBox = document.querySelector('.controls');
  function layoutMenus() {
    var b = document.body;
    if (!b.classList.contains('full') || !ctlBox) { b.classList.remove('menu-side'); return; }
    var r = ctlBox.getBoundingClientRect(), space = window.innerWidth - r.left + 10, side = window.innerWidth - space >= 330;
    b.style.setProperty('--ctl-space', Math.round(space) + 'px');
    if (b.classList.contains('menu-side') !== side) b.classList.toggle('menu-side', side);
  }
  function placeMenus() {                                            // on a narrow screen, keep the open menu clear of the row of buttons under it
    var b = document.body;
    if (!b.classList.contains('full') || b.classList.contains('menu-side') || !b.classList.contains('menu-open') || !ctlBox) return;
    var r = ctlBox.getBoundingClientRect(), tb = document.querySelector('.topbar');
    b.style.setProperty('--menu-bottom', Math.round(window.innerHeight - r.top + 8) + 'px');
    b.style.setProperty('--menu-top', Math.round((tb ? tb.getBoundingClientRect().bottom : 50) + 8) + 'px');   // (below the stats, which can wrap onto two lines)
  }
  window.addEventListener('resize', function () { setTimeout(function () { layoutMenus(); placeMenus(); }, 60); });
  window.addEventListener('orientationchange', function () { setTimeout(layoutMenus, 300); });
  btnFull.addEventListener('click', function () { setTimeout(layoutMenus, 120); });
  window.addEventListener('keydown', function (e) { if (e.code === 'KeyF') setTimeout(layoutMenus, 120); });
  document.addEventListener('fullscreenchange', function () { setTimeout(layoutMenus, 120); });
  document.addEventListener('webkitfullscreenchange', function () { setTimeout(layoutMenus, 120); });
  window.addEventListener('keydown', function (e) { if (e.code === 'KeyF' && !e.repeat) setFullScreen(!document.body.classList.contains('full')); });

  // ---------- The Dawn Tree's blossoms, more true to life ----------
  // Real cherry blossom: soft white-to-blush flowers with notched petals, deeper pink at their hearts with little
  // stamens, in loose clusters with leaves and gaps between them rather than one solid pink mass; the canopy shaded
  // darker underneath and in its depths and brightest on top where the sun falls, and only a soft glow of its own
  (function () {
    var cv = blossomTex.image, g = cv.getContext('2d'), W = cv.width;
    g.clearRect(0, 0, W, W);
    var CL = []; for (var c = 0; c < 9; c++) { var ca = Math.random() * Math.PI * 2, cr = c === 0 ? 0 : 40 + Math.random() * 52; CL.push([128 + Math.cos(ca) * cr, 128 + Math.sin(ca) * cr * 0.9, 30 + Math.random() * 22]); }   // (loose clusters, with gaps between)
    function inCluster() { var k = CL[Math.floor(Math.random() * CL.length)], a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * k[2]; return [k[0] + Math.cos(a) * r, k[1] + Math.sin(a) * r, k]; }
    for (var l = 0; l < 70; l++) {                                    // (fresh young leaves peeking out among the flowers)
      var lp = inCluster(); g.save(); g.translate(lp[0], lp[1]); g.rotate(Math.random() * 6.28);
      g.fillStyle = 'hsl(' + (80 + Math.random() * 30) + ',' + (30 + Math.random() * 20) + '%,' + (28 + Math.random() * 14) + '%)';
      g.beginPath(); g.moveTo(-9, 0); g.quadraticCurveTo(0, -5, 9, 0); g.quadraticCurveTo(0, 5, -9, 0); g.fill(); g.restore();
    }
    for (var i = 0; i < 260; i++) {                                    // (the flowers, back to front)
      var fp = inCluster(), x = fp[0], y = fp[1], sz = 5.5 + Math.random() * 5, spin = Math.random() * 6.28;
      var edge = Math.hypot(x - fp[2][0], y - fp[2][1]) / fp[2][2], lit = Math.max(0, Math.min(1, 0.6 - ((x - 128) + (y - 128)) / 260 + (1 - edge) * 0.15));
      var hue = 335 + Math.random() * 18, sat = 60 + Math.random() * 30, lo = 70 + lit * 14 + Math.random() * 6;
      for (var k = 0; k < 5; k++) {                                    // (five rounded petals, each with a little notch at its tip, blushing deeper towards the middle)
        var pa = spin + k / 5 * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        g.save(); g.translate(x, y); g.rotate(pa);
        var pg = g.createLinearGradient(0, 0, sz, 0); pg.addColorStop(0, 'hsl(' + hue + ',' + (sat + 15) + '%,' + (lo - 16) + '%)'); pg.addColorStop(0.55, 'hsl(' + hue + ',' + sat + '%,' + lo + '%)'); pg.addColorStop(1, 'hsl(' + hue + ',' + (sat - 15) + '%,' + Math.min(97, lo + 10) + '%)');
        g.fillStyle = pg; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(sz * 0.3, -sz * 0.5, sz * 0.95, -sz * 0.45, sz, -sz * 0.1); g.lineTo(sz * 0.86, 0); g.lineTo(sz, sz * 0.1); g.bezierCurveTo(sz * 0.95, sz * 0.45, sz * 0.3, sz * 0.5, 0, 0); g.fill();
        g.restore();
      }
      g.fillStyle = 'hsl(' + (340 + Math.random() * 10) + ',60%,' + (42 + lit * 10) + '%)'; g.beginPath(); g.arc(x, y, sz * 0.22, 0, Math.PI * 2); g.fill();   // (its deep pink heart...)
      g.fillStyle = 'rgba(255,236,170,0.9)'; for (var st = 0; st < 5; st++) { var sa = Math.random() * 6.28, sr = sz * (0.25 + Math.random() * 0.15); g.beginPath(); g.arc(x + Math.cos(sa) * sr, y + Math.sin(sa) * sr, 0.9, 0, Math.PI * 2); g.fill(); }   // (...and pale gold stamens)
    }
    blossomTex.needsUpdate = true;
    var sv = strandTex.image, sg = sv.getContext('2d'); sg.clearRect(0, 0, sv.width, sv.height);   // (the hanging strands: soft trailing sprays of pale blossom, thinning towards their tips)
    for (var y = 4; y < 252; y += 5) {
      var f = y / 256, n2 = Math.max(1, Math.round(4 * (1 - f * 0.8)));
      for (var k2 = 0; k2 < n2; k2++) {
        var bx = 32 + (Math.random() - 0.5) * 30 * (1 - f * 0.6), by = y + Math.random() * 4, bs = 5.5 * (1 - f * 0.55) * (0.7 + Math.random() * 0.5);
        for (var pt = 0; pt < 5; pt++) { var pa2 = pt / 5 * Math.PI * 2 + Math.random(); sg.fillStyle = 'hsl(' + (330 + Math.random() * 20) + ',' + (55 + Math.random() * 25) + '%,' + (80 + Math.random() * 10 - f * 6) + '%)'; sg.beginPath(); sg.ellipse(bx + Math.cos(pa2) * bs * 0.5, by + Math.sin(pa2) * bs * 0.5, bs * 0.5, bs * 0.35, pa2, 0, Math.PI * 2); sg.fill(); }
        sg.fillStyle = 'hsl(340,60%,55%)'; sg.beginPath(); sg.arc(bx, by, bs * 0.18, 0, Math.PI * 2); sg.fill();
      }
    }
    strandTex.needsUpdate = true;
    blossomMat.emissive.set(0x5a2a4a); strandMat.emissive.set(0x3a1a30);   // (a soft glow of their own, not a neon one)
    var m4 = new THREE.Matrix4(), pos = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), col = new THREE.Color();
    for (var n = 0; n < blossomCards.count; n++) {                      // (each card a touch smaller, so light shows between the clusters, and shaded by where it sits in the canopy)
      blossomCards.getMatrixAt(n, m4); m4.decompose(pos, q, sc); sc.multiplyScalar(0.82); m4.compose(pos, q, sc); blossomCards.setMatrixAt(n, m4);
      var best = null, bd = 1e9; clumps.forEach(function (cl) { var d = pos.distanceTo(cl.p); if (d < bd) { bd = d; best = cl; } });
      var up = (pos.y - best.p.y) / best.r, out = bd / best.r, high = (pos.y - 3.5) / 3.5;
      var shade = 0.6 + Math.max(0, Math.min(1, 0.45 + up * 0.5)) * 0.32 + Math.min(1, out) * 0.12 + Math.max(0, Math.min(1, high)) * 0.12 + (Math.random() - 0.5) * 0.06;
      col.setRGB(Math.min(1, shade * 1.04), shade * 0.97, shade); blossomCards.setColorAt(n, col);
    }
    blossomCards.instanceMatrix.needsUpdate = true; if (blossomCards.instanceColor) blossomCards.instanceColor.needsUpdate = true;
  })();

  // Only draw what you can see: every batch of grass, leaves, flowers and stones gets a sphere round all its pieces, and
  // each frame a batch that's off screen, or so far off it's lost in the haze, is skipped. Batches whose pieces move
  // (a tree regrowing, soil being tilled) get their sphere worked out again. Indoors everything stays on, so the
  // windows still show the whole island
  var cullList = [], cullFrustum = new THREE.Frustum(), cullPV = new THREE.Matrix4(), cullM = new THREE.Matrix4(), cullV = new THREE.Vector3(), cullBox = new THREE.Box3(), cullWasIndoors = null;
  function cullMeasure(c) {
    var o = c.o; o.updateWorldMatrix(true, false); cullBox.makeEmpty();   // (with everything it sits in placed first, so a batch inside a group, like the Dawn Tree's blossoms, is measured where it really is)
    for (var i = 0; i < o.count; i++) { o.getMatrixAt(i, cullM); cullV.setFromMatrixPosition(cullM).applyMatrix4(o.matrixWorld); cullBox.expandByPoint(cullV); }
    if (cullBox.isEmpty()) { c.r = -1; return; }
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    cullBox.getBoundingSphere(c.s);
    c.s.radius += o.geometry.boundingSphere.radius * 2 + 1;            // room for each piece's own size
    c.ver = o.instanceMatrix.version; c.cnt = o.count;
  }
  scene.traverse(function (o) { if (o.isInstancedMesh) cullList.push({ o: o, s: new THREE.Sphere(), ver: -1, cnt: -1, far: o.geometry.boundingSphere && o.geometry.boundingSphere.radius > 1 ? 120 : 80 }); });
  cullList.forEach(function (c) { if (!c.o.geometry.boundingSphere) c.o.geometry.computeBoundingSphere(); c.far = c.o.geometry.boundingSphere.radius > 1 ? 120 : 80; cullMeasure(c); });
  var cullTurn = 0;
  function cullScene() {
    if (indoors) {                                                     // inside: put everything back on
      if (cullWasIndoors !== true) { for (var a = 0; a < cullList.length; a++) cullList[a].o.layers.set(0); cullWasIndoors = true; }
      return;
    }
    cullWasIndoors = false;
    camera.updateMatrixWorld();
    cullPV.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    cullFrustum.setFromProjectionMatrix(cullPV);
    var redo = 0;
    for (var i = 0; i < cullList.length; i++) {
      var c = cullList[i];
      if ((c.ver !== c.o.instanceMatrix.version || c.cnt !== c.o.count) && redo < 2 && (i + cullTurn) % 3 === 0) { cullMeasure(c); redo++; }   // re-measure a few changed batches a frame
      var show = c.r !== -1 && cullFrustum.intersectsSphere(c.s) && c.s.center.distanceTo(camera.position) - c.s.radius < c.far;
      c.o.layers.set(show ? 0 : 1);
    }
    cullTurn++;
  }
  setTimeout(function () { if (!mapBase) mapBase = drawMapBase(); }, 2500);   // get the world map ready in the background, so it opens straight away

  state.coins = 100000; showCoins(false);                              // a new game starts with 100,000 Star Coins (loading a save gives you the coins you saved with)
  var clock = new THREE.Clock();
  cam.target.set(player.position.x, 0.8, player.position.z);

  function frame() {
    var dt = Math.min(clock.getDelta(), 0.05);
    state.time += dt;
    updateClock(dt);
    var night = updateSky();
    updatePlayer(dt);
    if (!flying) updateDoors();
    updateSleepButton();
    updateStamina();
    updateShipping(dt);
    updateShop(dt);
    updateBarnShop();
    updateGlimmers(dt);
    updateGlimButton();
    updateBridge(state.time, night);
    updateInterior(dt, state.time);
    updateCarpenter(state.time, night);
    updateCoop(dt, night);
    updateFbarn(dt, night);
    updateMill(dt, night);
    updateSilo(dt, night);
    updateBoatButton();
    updateSpring(dt);
    updateSummer(dt);
    updateFall(dt);
    updateWinter(dt);
    updateCrops(dt, night);
    updateWorld(dt, night);
    updateEffects(dt);
    updateCamera(dt);
    updateClinicInterior(state.time);
    cullScene();
    var menuUp = (bagUi.box && !bagUi.box.hidden) || binOpen || shopOpen || barnShopOpen || glimNaming || carpShopOpen || coopPlacing;   // a menu is open: in full screen the button column steps aside, so taps on the menu don't land on the buttons behind it
    if (document.body.classList.contains('menu-open') !== menuUp) { document.body.classList.toggle('menu-open', menuUp); placeMenus(); }
    if (indoors && !inShop && !inClinic && !inBarn && !inCarp && !inCoop && !inFbarn) { camera.updateMatrixWorld(); drawHouseView(); }   // (your own house: its windows look out too)
    if (inShop) { camera.updateMatrixWorld(); drawShopView(); }
    if (inClinic) { camera.updateMatrixWorld(); drawClinicView(); }
    if (inBarn) { camera.updateMatrixWorld(); drawBarnView(); }
    if (inCarp) { camera.updateMatrixWorld(); drawCarpView(); }
    if (inCoop) { camera.updateMatrixWorld(); drawCoopView(); }
    if (inFbarn) { camera.updateMatrixWorld(); drawFbarnView(); }
    renderer.render(indoors ? (inFbarn ? fbarnScene : inCoop ? coopScene : inCarp ? carpScene : inBarn ? abScene : inClinic ? clinicScene : inShop ? shopScene : interiorScene) : scene, camera); // inside the house, the shop or the clinic, only that room is drawn
  }
  // ---------- The title screen, in 3D ----------
  // While the title screen is up, the real you floats in the dawn sky over it: your own witch, her arm raised with a
  // wand of dark wood wound with gold, a pink ribbon and a glowing crystal with a star turning above it, magic pouring
  // off it in sparkles. A ring of runes and soft light turns beneath her feet, and Blossom the Glimmerwing, Marina the
  // Sirenna and Starla the Lunastra float about her, bobbing and turning. When you press Play they all go back where
  // they belong, just as they were
  var title3d = (function () {
    var host = document.getElementById('evTitle'); if (!host || !window.EVERDAWN_TITLE) return null;
    var cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity 1.2s ease';
    host.insertBefore(cv, host.querySelector('.ev-ui'));
    var R3 = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
    R3.outputEncoding = renderer.outputEncoding; R3.toneMapping = renderer.toneMapping; R3.toneMappingExposure = renderer.toneMappingExposure; R3.physicallyCorrectLights = renderer.physicallyCorrectLights;
    var TS = new THREE.Scene(), cam3 = new THREE.PerspectiveCamera(28, 1, 0.05, 60);
    var skyTex = new THREE.CanvasTexture(host.querySelector('canvas')); if (renderer.outputEncoding === THREE.sRGBEncoding) skyTex.encoding = THREE.sRGBEncoding;
    TS.background = skyTex;                                            // (the painted dawn sky, behind her)
    TS.add(new THREE.HemisphereLight(0xfff4f8, 0x6a4a9a, 0.38));
    var key = new THREE.DirectionalLight(0xfff6ee, 0.55); key.position.set(2.5, 4, 5); TS.add(key);
    var rim = new THREE.DirectionalLight(0xffb0e0, 0.32); rim.position.set(-4, 2.5, -3); TS.add(rim);
    var fillL = new THREE.PointLight(0xffe0a0, 0.3, 3); TS.add(fillL);   // (the wand's light, falling on her)
    TS.add(new THREE.AmbientLight(0xd8c8f0, 0.08));
    try {                                                              // (a picture of your own Dawn Tree, taken once, for the floating island in the sky)
      var shotCv = document.createElement('canvas'), SR = new THREE.WebGLRenderer({ canvas: shotCv, antialias: true, alpha: true, preserveDrawingBuffer: true });
      SR.outputEncoding = renderer.outputEncoding; SR.toneMapping = renderer.toneMapping; SR.toneMappingExposure = renderer.toneMappingExposure; SR.physicallyCorrectLights = renderer.physicallyCorrectLights; SR.setClearColor(0x000000, 0);
      var shotScene = new THREE.Scene(), treeParent = tree.parent || scene; shotScene.add(tree);
      shotScene.add(new THREE.HemisphereLight(0xfff4f8, 0x6a4a9a, 0.75)); var shotKey = new THREE.DirectionalLight(0xfff0f6, 0.8); shotKey.position.set(TREE_X - 6, 10, TREE_Z + 12); shotScene.add(shotKey); shotScene.add(new THREE.AmbientLight(0xe8d8ff, 0.2));
      tree.updateMatrixWorld(true); var tbox = new THREE.Box3();
      tree.traverse(function (o) { if (o.isMesh && o.geometry) { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); tbox.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } });
      var tc = tbox.getCenter(new THREE.Vector3()), tsz = tbox.getSize(new THREE.Vector3()), tw = Math.max(tsz.x, tsz.z) * 1.45, th = tsz.y * 1.7; tc.y = tbox.min.y + th * 0.5 - tsz.y * 0.05;   // (with room all round for the blossom, which hangs well beyond the branches)
      var SW = 640, SH = Math.round(Math.min(1.6, Math.max(0.5, th / tw * 1.08)) * SW); SR.setPixelRatio(1); SR.setSize(SW, SH, false);
      var scam = new THREE.PerspectiveCamera(24, SW / SH, 0.1, 400), fit = Math.max(th * 0.56 / Math.tan(12 * Math.PI / 180), tw * 0.56 / Math.tan(12 * Math.PI / 180) / (SW / SH));
      scam.position.set(tc.x, tc.y + th * 0.12, tc.z + fit); scam.lookAt(tc); scam.updateMatrixWorld(true);
      SR.render(shotScene, scam);
      var base = new THREE.Vector3(TREE_X, 0, TREE_Z).project(scam);
      window.EVERDAWN_TREE_IMG = { img: shotCv, bx: (base.x + 1) / 2, by: (1 - base.y) / 2, aspect: SH / SW };
      treeParent.add(tree); SR.dispose();
    } catch (err) { if (tree && !tree.parent) scene.add(tree); }
    // (you, borrowed from the island for a moment)
    var saved = { parent: player.parent, pos: player.position.clone(), rot: player.rotation.clone(), vis: player.visible, axe: axeArm.visible, body: body.rotation.clone(), bodyPos: body.position.clone(),
      limbs: [wl.armL, wl.armR, wl.legs[0], wl.legs[1], wl.head, wl.hairBack, wl.tip].map(function (o) { return o.rotation.clone(); }), chibi: wl.chibi.position.clone(), broom: wl.broom.visible, ride: wl.rideBroom.visible };
    var me = new THREE.Group(); TS.add(me); me.add(player);
    player.position.set(0, 0, 0); player.rotation.set(0, 0.18, 0); player.visible = true; body.position.set(0, 0, 0); body.rotation.set(0, 0, 0);
    axeArm.visible = false; wl.armR.visible = true; wl.broom.visible = false; wl.rideBroom.visible = false;   // (floating on her own, held up by the magic ring beneath her)
    wl.mFace.map = wl.mFace.emissiveMap = wl.faces[2]; wl.mFace.needsUpdate = true;   // (eyes closed, smiling with joy)
    saved.broomRot = wl.rideBroom.rotation.clone(); saved.broomPos = wl.rideBroom.position.clone(); wl.rideBroom.rotation.y += Math.PI / 2; wl.rideBroom.position.z += 0.06;
    player.updateMatrixWorld(true); var broomBox = new THREE.Box3().setFromObject(wl.rideBroom);   // (where the broom lies, so Starla can ride on the back of it)
    // (her wand, in her raised right hand)
    var wand = new THREE.Group(); wand.position.set(0, -0.3, 0.02); wl.armR.add(wand);
    var wood = new THREE.MeshToonMaterial({ color: 0x4a2c1a }), gold = new THREE.MeshStandardMaterial({ color: 0xe8b84a, metalness: 0.8, roughness: 0.3, emissive: 0x6a4410, emissiveIntensity: 0.4 });
    var stick = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.013, 0.42, 10), wood); stick.position.y = -0.17; wand.add(stick);
    for (var gw = 0; gw < 9; gw++) { var gr = new THREE.Mesh(new THREE.TorusGeometry(0.0125 - gw * 0.0004, 0.0026, 6, 16), gold); gr.rotation.set(Math.PI / 2 + 0.35, 0, gw * 0.7); gr.position.y = -0.02 - gw * 0.035; wand.add(gr); }
    var grip = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 12), gold); grip.position.y = 0.0; wand.add(grip);
    var crystalMat = new THREE.MeshPhysicalMaterial({ color: 0xc89aff, emissive: 0x8a4ae0, emissiveIntensity: 0.9, roughness: 0.05, metalness: 0.1, clearcoat: 1, transparent: true, opacity: 0.92, flatShading: true });
    var crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.036, 0), crystalMat); crystal.scale.set(1, 1.7, 1); crystal.position.y = -0.42; wand.add(crystal);
    var cup = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.03, 5, 1, true), gold); cup.rotation.x = Math.PI; cup.position.y = -0.38; wand.add(cup);
    var ribMat = new THREE.MeshToonMaterial({ color: 0xff8cc6, side: THREE.DoubleSide }), ribbons = [];
    [-1, 1].forEach(function (sd) { var rb = new THREE.Mesh(new THREE.PlaneGeometry(0.018, 0.13, 1, 6), ribMat); rb.geometry.translate(0, -0.065, 0); rb.position.set(sd * 0.008, -0.33, 0.01); rb.rotation.z = sd * 0.5; wand.add(rb); ribbons.push(rb); });
    var bow = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.005, 6, 12), ribMat); bow.position.set(0, -0.33, 0.012); wand.add(bow);
    var starShape = new THREE.Shape(); for (var sp = 0; sp < 10; sp++) { var sr = sp % 2 ? 0.018 : 0.045, sa = sp / 10 * Math.PI * 2 + Math.PI / 2; if (sp) starShape.lineTo(Math.cos(sa) * sr, Math.sin(sa) * sr); else starShape.moveTo(Math.cos(sa) * sr, Math.sin(sa) * sr); }
    var star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.005, bevelSegments: 2 }), new THREE.MeshStandardMaterial({ color: 0xfff0a0, emissive: 0xffc840, emissiveIntensity: 1.2, metalness: 0.4, roughness: 0.3 }));
    star.geometry.center(); star.position.y = -0.52; wand.add(star);
    function glowSprite(col, size, op) { var sp2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); sp2.scale.set(size, size, 1); return sp2; }
    var tipGlow = glowSprite(0xffd8a0, 0.5, 0.85); tipGlow.position.y = -0.48; wand.add(tipGlow);
    var tipGlow2 = glowSprite(0xffffff, 0.16, 1); tipGlow2.position.y = -0.52; wand.add(tipGlow2);
    var crysGlow = glowSprite(0xc890ff, 0.2, 0.8); crysGlow.position.y = -0.42; wand.add(crysGlow);
    // (a ring of light and runes under her feet)
    var ring = new THREE.Group(); ring.position.y = -0.06; me.add(ring);
    var ringMat = new THREE.MeshBasicMaterial({ color: 0xffe0a0, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    [[0.42, 0.012], [0.34, 0.007], [0.5, 0.004]].forEach(function (rr) { var m = new THREE.Mesh(new THREE.RingGeometry(rr[0] - rr[1], rr[0] + rr[1], 72), ringMat); m.rotation.x = -Math.PI / 2; ring.add(m); });
    for (var rn = 0; rn < 8; rn++) { var rs = new THREE.Mesh(new THREE.CircleGeometry(0.022, 4), ringMat); rs.rotation.x = -Math.PI / 2; var ra = rn / 8 * Math.PI * 2; rs.position.set(Math.cos(ra) * 0.38, 0, Math.sin(ra) * 0.38); ring.add(rs); }
    var under = glowSprite(0xff9ad8, 1.3, 0.4); under.position.y = 0.05; me.add(under);
    // (a little puff of cloud for Marina to ride)
    var puffMat = new THREE.MeshToonMaterial({ color: 0xfff2fa, emissive: 0xffd0ec, emissiveIntensity: 0.25 });
    function puffCloud(tint) {                                         // (a little puff of cloud for an animal to ride)
      var c = new THREE.Group(); TS.add(c);
      [[0, 0, 0, 0.17], [-0.15, -0.02, 0.02, 0.12], [0.15, -0.02, -0.02, 0.13], [-0.05, 0.05, -0.08, 0.12], [0.07, -0.05, 0.1, 0.11], [-0.24, -0.05, -0.02, 0.08], [0.25, -0.05, 0.03, 0.08]].forEach(function (p) {
        var pf = new THREE.Mesh(new THREE.SphereGeometry(p[3], 20, 14), puffMat); pf.position.set(p[0], p[1] - 0.1, p[2]); pf.scale.y = 0.7; c.add(pf);
      });
      var cg = glowSprite(tint, 0.9, 0.3); cg.position.y = -0.08; c.add(cg); return c;
    }
    var cloudSeat = puffCloud(0x9ae0d0), cloudSeat2 = puffCloud(0xc8b0ff);
    // (your three animals from Fluff & Feather's stalls, borrowed too)
    var pets = [];
    (abDisplay || []).forEach(function (d, k) {
      var r = d.m.root, keep = { r: r, parent: r.parent, pos: r.position.clone(), rot: r.rotation.clone(), scl: r.scale.clone(), vis: r.visible };
      r.visible = true; r.rotation.order = 'YXZ'; r.scale.multiplyScalar(d.kind === 'glim' ? 0.62 : d.kind === 'luna' ? 1.15 : 1.4);
      if (d.kind === 'luna') cloudSeat2.add(r);          // (Starla, on her own little cloud)
      else if (d.kind === 'bubble') cloudSeat.add(r);   // (Marina, on her own little cloud)
      else TS.add(r);
      keep.tags = []; r.traverse(function (o) { if (o.material && o.material.map && o.material.map === d.m.tagTex && o.visible) { o.visible = false; keep.tags.push(o); } });   // (no "On display" signs out here)
      pets.push({ d: d, keep: keep, k: k, glow: (function () { var gs = glowSprite([0xff9ad8, 0x9ae0d0, 0xc8b0ff][k], 0.7, 0.22); TS.add(gs); return gs; })() });
    });
    // (sparkles pouring off the wand)
    var sparks = [], sparkCols = [0xfff0b0, 0xffb0e0, 0xd0b8ff, 0xffffff, 0xa8f0ff];
    for (var sk = 0; sk < 90; sk++) { var s3 = glowSprite(sparkCols[sk % 5], 0.06, 0); s3.userData = { life: 99 }; TS.add(s3); sparks.push(s3); }
    var orbit = []; for (var ob = 0; ob < 18; ob++) { var o3 = glowSprite(sparkCols[ob % 5], 0.05, 0.9); TS.add(o3); orbit.push(o3); }
    var tipW = new THREE.Vector3(), palmW = new THREE.Vector3(), t3 = 0, shown = false;
    function size() { var w = cv.clientWidth || window.innerWidth, h = cv.clientHeight || window.innerHeight; R3.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); R3.setSize(w, h, false); cam3.aspect = w / h; cam3.fov = w / h < 0.8 ? 40 : 28; cam3.updateProjectionMatrix(); }
    size(); window.addEventListener('resize', size);
    function draw(dt) {
      t3 += dt;
      var tall = cam3.aspect < 0.8;
      skyTex.needsUpdate = true;
      cam3.position.set(0, 0.95, tall ? 7 : 6.1); cam3.lookAt(0, tall ? 0.92 : 0.97, 0);
      me.position.set(0, 0.12 + Math.sin(t3 * 1.1) * 0.05, 0);
      wl.chibi.position.y = 0; wl.head.rotation.set(0.05, 0.12, Math.sin(t3 * 0.8) * 0.05);
      wl.armR.rotation.set(-0.55, 0.15, -2.05 + Math.sin(t3 * 1.4) * 0.07);   // (her wand held up and out to the side, mid-spell)
      wl.armL.rotation.set(-0.35, 0, 0.62 + Math.sin(t3 * 1.2) * 0.06);   // (her other hand held out gracefully)
      var swing = Math.sin(t3 * 1.6) * 0.1;                               // (floating like a dancer: one leg kicked up behind her, the other pointed down, fluttering gently)
      wl.legs[0].rotation.set(0.75 + swing, 0, -0.22); wl.legs[1].rotation.set(-0.18 - swing * 0.5, 0, 0.08); wl.legs[0].userData.shin.rotation.x = wl.legs[1].userData.shin.rotation.x = 0; wl.chibi.rotation.set(0, 0, 0);
      wl.hairBack.rotation.x = 0.12 + Math.sin(t3 * 1.5) * 0.05; wl.tip.rotation.z = Math.sin(t3 * 1.7) * 0.06;
      player.rotation.y = 0.12 + Math.sin(t3 * 0.4) * 0.06;               // (turned toward you)
      me.rotation.z = Math.sin(t3 * 0.7) * 0.04; me.rotation.x = Math.sin(t3 * 0.9) * 0.03;   // (gliding, rising and dipping)
      cloudSeat.position.set(0.5, 0.3 + Math.sin(t3 * 1.2 + 2) * 0.04, 0.42); cloudSeat2.position.set(-0.5, 0.2 + Math.sin(t3 * 1.1) * 0.04, 0.45);   // (all bunched up together: Marina and Starla on clouds tucked right against her sides) cloudSeat2.rotation.y = Math.sin(t3 * 0.45 + 1) * 0.15; cloudSeat.rotation.y = Math.sin(t3 * 0.5) * 0.15;
      star.rotation.z += dt * 1.2; star.rotation.y = Math.sin(t3) * 0.4; crystal.rotation.y += dt * 0.8;
      var pulse = 0.75 + Math.sin(t3 * 4) * 0.25; tipGlow.material.opacity = 0.6 + pulse * 0.3; tipGlow.scale.setScalar(0.42 + pulse * 0.14); crysGlow.material.opacity = 0.5 + pulse * 0.3;
      ribbons.forEach(function (rb, k) { rb.rotation.z = (k ? 0.5 : -0.5) + Math.sin(t3 * 3 + k) * 0.25; rb.rotation.x = Math.sin(t3 * 2.4 + k) * 0.3; });
      ring.rotation.y = t3 * 0.4; under.material.opacity = 0.45 + Math.sin(t3 * 2) * 0.1;
      TS.updateMatrixWorld(true); star.getWorldPosition(tipW); fillL.position.copy(tipW); fillL.intensity = 0.22 + pulse * 0.14;
      sparks.forEach(function (sp3) {                                    // (sparkles: born at the star, drifting out and down in curls, fading)
        var u = sp3.userData;
        if (u.life >= u.max || u.life === 99) { if (Math.random() < dt * 14) { u.life = 0; u.max = 1.4 + Math.random() * 1.8; sp3.position.copy(tipW); u.v = new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.2) * 0.35, (Math.random() - 0.3) * 0.4); u.a = Math.random() * 6.28; u.sz = 0.06 + Math.random() * 0.09; } else { sp3.material.opacity = 0; return; } }
        u.life += dt; u.a += dt * 3; u.v.y -= dt * 0.12;
        sp3.position.x += (u.v.x + Math.cos(u.a) * 0.12) * dt; sp3.position.y += u.v.y * dt; sp3.position.z += (u.v.z + Math.sin(u.a) * 0.12) * dt;
        var f = 1 - u.life / u.max; sp3.material.opacity = f * (0.6 + 0.4 * Math.sin(u.life * 18)); sp3.scale.setScalar(u.sz * (0.5 + f));
      });
      orbit.forEach(function (o3, k) {                                   // (a slow halo of sparkles circling her)
        var a = t3 * 0.6 + k / orbit.length * Math.PI * 2;
        o3.position.set(Math.cos(a) * 0.62, 0.55 + Math.sin(a * 2 + k) * 0.18 + me.position.y, Math.sin(a) * 0.62);
        o3.material.opacity = 0.35 + 0.45 * Math.sin(t3 * 3 + k); o3.scale.setScalar(0.035 + 0.02 * Math.sin(t3 * 2 + k));
      });
      pets.forEach(function (p) {                                        // (your animals, floating round her)
        var r = p.d.m.root, k = p.k;
        if (p.d.kind === 'glim') {                                       // (Blossom flutters round the wand)
          var ga = t3 * 1.1; wl.armL.localToWorld(palmW.set(0, -0.3, 0.04));
          r.position.set(palmW.x + 0.06, palmW.y + 0.02 + Math.abs(Math.sin(ga * 2)) * 0.03, palmW.z + 0.16); r.rotation.set(0.1, -0.35 + Math.sin(ga) * 0.25, Math.sin(ga * 2) * 0.12);   // (Blossom bobbing just above her open palm, like she's showing her off)
          var m = p.d.m; if (m.wings) m.wings.forEach(function (w) { if (w.pv) w.pv.rotation.z = w.s * (0.35 + Math.sin(t3 * 22 + (w.up ? 0 : 0.5)) * 0.5); });
        } else if (p.d.kind === 'luna' || p.d.kind === 'bubble') {           // (Starla and Marina on their clouds: just a little life in them)
          try { (p.d.kind === 'luna' ? lunaAnimate : bubbleAnimate)(p.d, dt, t3, false); } catch (err) {}
          if (p.d.kind === 'luna') { r.position.set(0, -0.08, 0); r.rotation.set(-0.3 + Math.sin(t3 * 1.3) * 0.05, 0.55 + Math.sin(t3 * 0.5) * 0.1, 0.06); }   // (Starla snuggled up at her side, gazing up at her)
          else { r.position.set(0, -0.08, 0); r.rotation.set(-0.18 + Math.sin(t3 * 0.9) * 0.04, -0.55 + Math.sin(t3 * 0.6) * 0.1, -0.05); }   // (Marina snuggled up at her other side, looking up at her)
          r.updateMatrixWorld(true); r.getWorldPosition(p.glow.position); p.glow.position.y += 0.08; return;
        } else {
          var side = k === 1 ? 1 : -1;
          r.position.set(side * 0.7, 0.18 + Math.sin(t3 * 1.3 + k * 2) * 0.06 + me.position.y * 0.6, 0.25 + k * 0.05); r.rotation.set(Math.sin(t3 * 0.9 + k) * 0.05, -side * 0.45 + Math.sin(t3 * 0.5 + k) * 0.2, Math.sin(t3 * 1.1 + k) * 0.06);
          try { (p.d.kind === 'luna' ? lunaAnimate : bubbleAnimate)(p.d, dt, t3, false); r.position.set(side * 0.7, 0.18 + Math.sin(t3 * 1.3 + k * 2) * 0.06 + me.position.y * 0.6, 0.25 + k * 0.05); } catch (err) {}
        }
        p.glow.position.copy(r.position); p.glow.position.y += 0.08;
      });
      R3.render(TS, cam3);
      if (!shown) { shown = true; cv.style.opacity = 1; }
    }
    function finish() {                                                  // (Play: everyone goes back where they belong, just as they were)
      window.removeEventListener('resize', size);
      wl.armR.remove(wand);
      if (saved.parent) saved.parent.add(player); else scene.add(player);
      player.position.copy(saved.pos); player.rotation.copy(saved.rot); player.visible = saved.vis; body.rotation.copy(saved.body); body.position.copy(saved.bodyPos);
      [wl.armL, wl.armR, wl.legs[0], wl.legs[1], wl.head, wl.hairBack, wl.tip].forEach(function (o, k) { o.rotation.copy(saved.limbs[k]); });
      wl.mFace.map = wl.mFace.emissiveMap = wl.faces[0]; wl.mFace.needsUpdate = true; wl.blink = false;
      wl.chibi.position.copy(saved.chibi); wl.rideBroom.rotation.copy(saved.broomRot); wl.rideBroom.position.copy(saved.broomPos); axeArm.visible = saved.axe; wl.broom.visible = saved.broom; wl.rideBroom.visible = saved.ride;
      pets.forEach(function (p) { var kp = p.keep; kp.tags.forEach(function (o) { o.visible = true; }); (kp.parent || abRoom).add(kp.r); kp.r.position.copy(kp.pos); kp.r.rotation.copy(kp.rot); kp.r.scale.copy(kp.scl); kp.r.visible = kp.vis; });
      setTimeout(function () { R3.dispose(); if (R3.forceContextLoss) R3.forceContextLoss(); }, 1300);
    }
    return { draw: draw, finish: finish };
  })();
  var everdawnFrame = frame;                                          // (while the title screen is up, the island waits: no time passes and nothing moves)
  var titleFrames = 0;
  frame = function () {
    if (window.EVERDAWN_TITLE) { var tdt = Math.min(clock.getDelta(), 0.05); if (title3d) title3d.draw(tdt); if (titleFrames++ % 40 === 0) renderer.render(scene, camera); return; }   // (the island just ticks over now and then behind it, to get everything warmed up)
    if (title3d) { title3d.finish(); title3d = null; }
    if (afterTitle) { var at = afterTitle; afterTitle = null; at(); }   // (then into the save slot you picked)
    everdawnFrame();
  };
  renderer.setAnimationLoop(frame);
});

// ---------- Starting up ----------
// Join the three parts back into one game (so they share the same variables, just as if they were one file) and run it
function startGame(THREE) {
  if (EVERDAWN_PARTS.length !== 3) { showToast('Part of the game is missing: check that script.js, script2.js and script3.js are all there.', 60000); return; }
  var src = EVERDAWN_PARTS.map(function (part) { var t = part.toString(); return t.slice(t.indexOf('{') + 1, t.lastIndexOf('}')); }).join('\n');
  new Function('THREE', src)(THREE);
}

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
    '#evTitle.gone{opacity:0;transform:scale(1.08);pointer-events:none}' +
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
    '#evTitle .ev-setbody{box-sizing:border-box;padding:14px 16px}#evTitle .ev-srow{display:flex;flex-direction:column;gap:8px;padding:6px 2px 12px;border-bottom:1px solid rgba(255,220,250,.18)}' +
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
    setTimeout(function () { alive = false; root.remove(); window.removeEventListener('resize', resize); }, 1200);
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
  } }, { name: 'Mouse & Keyboard', build: function (body) {          // (Mouse & Keyboard: which keys interact, use your tools and place items, move you about, cast spells, sprint and strafe)
    body.innerHTML = '';
    var stops = [];
    keyGrabStop = function () { stops.forEach(function (f) { f(); }); };   // (leaving the page stops waiting for a key)
    [['Interact', 'everdawn-interact', 'everdawnSetInteract', 'E/Space-bar'], ['Use Tool/Place Item', 'everdawn-use-key', 'everdawnSetUseKey', 'E/Space-bar'], ['Move Up', 'everdawn-move-up', 'everdawnSetMoveUp', 'W/Up Arrow'], ['Move Down', 'everdawn-move-down', 'everdawnSetMoveDown', 'S/Down Arrow'], ['Move Right', 'everdawn-move-right', 'everdawnSetMoveRight', 'D/Right Arrow'], ['Move Left', 'everdawn-move-left', 'everdawnSetMoveLeft', 'A/Left Arrow'], ['Spell Casting', 'everdawn-spell-key', 'everdawnSetSpellKey', 'Q'], ['Sprint', 'everdawn-sprint-key', 'everdawnSetSprintKey', 'Shift'], ['Strafe', 'everdawn-strafe-key', 'everdawnSetStrafeKey', 'C']].forEach(function (row, n) {
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
  } }], setPage = 0, keyGrab = false, keyGrabStop = null;
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
  function closeSettings() { if (keyGrabStop) keyGrabStop(); sett.classList.remove('open'); btnRow.style.visibility = ''; hint.style.visibility = ''; optBtn.focus(); }
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
    if (e.target === optBtn) return; if (root.isConnected && ready && (e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter')) { e.preventDefault(); openSlots(); } }, true);
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
