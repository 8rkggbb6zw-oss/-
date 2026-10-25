// Everdawn, part 4 of 4 (see the note at the top of script.js). This file holds you, the player: the character you made
// in VRoid Studio (Witch.vrm, next to the game's files), loaded in and brought to life. script3.js joins it on after the
// other parts, so it shares all their variables

EVERDAWN_PARTS.push(function (THREE) {
  // ---------- You: your own VRoid character ----------
  // Your character is loaded from Witch.vrm, a VRoid model (VRM 1.0), with three.js's GLTFLoader (loaded in index.html).
  // Until she's arrived (or if she can't be loaded), the little chibi witch stands in. The chibi is still there once
  // she has, unseen: she is what walks, flies, sits in the boat and poses on the title screen, and every joint of your
  // character follows hers, so all of that carries on just as before. She blinks when the chibi blinks and smiles (eyes
  // closed, "happy") when the chibi beams; her tools are held in her right hand; and her broom is still the one she rides
  var MODEL_URLS = [window.EVERDAWN_MODEL_URL, 'https://raw.githubusercontent.com/8rkggbb6zw-oss/-/claude/coding-conversation-f08c0n/Witch.vrm',
    'https://cdn.jsdelivr.net/gh/8rkggbb6zw-oss/-@claude/coding-conversation-f08c0n/Witch.vrm'].filter(Boolean);
  var you = null;
  (function load(n) {
    if (!THREE.GLTFLoader || n >= MODEL_URLS.length) { if (window.console) console.warn('Everdawn: your character could not be loaded, so the chibi witch stands in'); return; }
    new THREE.GLTFLoader().load(MODEL_URLS[n], function (gltf) { try { you = dressUp(gltf); } catch (err) { if (window.console) console.error(err); } }, undefined, function () { load(n + 1); });
  })(0);

  function dressUp(gltf) {
    var w = wl, chibi = w.chibi, root = gltf.scene, json = gltf.parser.json, vrm = json.extensions && json.extensions.VRMC_vrm;
    if (!vrm) throw new Error('not a VRM 1.0 model');
    var R = new THREE.Group(); R.add(root); chibi.add(R);
    root.updateMatrixWorld(true);

    // ---- her materials: soft cel shading that the world's light and shade fall on (rather than flat, always-bright
    // colour), with her eyes kept clear and bright ----
    var GRAD = new THREE.DataTexture(new Uint8Array([150, 150, 150, 255, 215, 215, 215, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
    GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter; GRAD.needsUpdate = true;
    var meshes = [];
    root.traverse(function (o) {
      if (!o.isMesh) return;
      o.frustumCulled = false; o.castShadow = true; o.receiveShadow = true; meshes.push(o);
      var mats = Array.isArray(o.material) ? o.material : [o.material];
      mats = mats.map(function (m) {
        if (/Eye(Iris|Highlight|White)/.test(m.name)) return m;           // (her eyes, as bright as ever)
        var t = new THREE.MeshToonMaterial({ name: m.name, color: m.color, map: m.map, gradientMap: GRAD, transparent: m.transparent, alphaTest: m.alphaTest, side: m.side, depthWrite: m.depthWrite, opacity: m.opacity,
          emissive: 0xffffff, emissiveMap: m.map, emissiveIntensity: 0.18, skinning: m.skinning, morphTargets: m.morphTargets, morphNormals: m.morphNormals });   // (a gentle glow, so she never looks grey in the shade; and bending with her bones and her expressions)
        return t;
      });
      o.material = mats.length === 1 ? mats[0] : mats;
      if (/Face|Eye|Brow|Lash/.test(o.name) || (o.material && /Eye|Brow|Lash|Eyeline/.test(o.material.name || ''))) o.renderOrder = 2;
    });

    // ---- her bones ----
    var nodeNames = json.nodes.map(function (n) { return THREE.PropertyBinding.sanitizeNodeName(n.name || ''); });
    function bone(name) { var hb = vrm.humanoid.humanBones[name]; return hb ? root.getObjectByName(nodeNames[hb.node]) : null; }
    var B = {}; Object.keys(vrm.humanoid.humanBones).forEach(function (k) { B[k] = bone(k); });
    var rest = new Map(), rootQi = root.getWorldQuaternion(new THREE.Quaternion()).invert();
    function remember(o) { if (!o || rest.has(o)) return; rest.set(o, { local: o.quaternion.clone(), model: rootQi.clone().multiply(o.getWorldQuaternion(new THREE.Quaternion())) }); }
    Object.keys(B).forEach(function (k) { remember(B[k]); });
    var skirtRoots = [], hairRoots = [];
    root.traverse(function (o) {
      if (/^J_Sec_[LR]_(Coat)?Skirt\w*?0_01$/.test(o.name) || /^J_Sec_[LR]_(Coat)?Skirt(Front|Back|Side\d?)_01$/.test(o.name)) { remember(o); skirtRoots.push(o); }
      if (/^J_Sec_Hair1_\d+$/.test(o.name)) { remember(o); hairRoots.push(o); }   // (the first joint of each lock of her hair)
    });
    var qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), ea = new THREE.Euler();
    function pose(o, delta) {                                          // (turn a bone by delta, a turn measured along her own straight-up axes)
      if (!o) return; var r = rest.get(o); if (!r) return;
      qa.copy(r.model).invert().multiply(delta).multiply(r.model);
      o.quaternion.copy(r.local).multiply(qa);
    }
    function E(x, y, z) { return new THREE.Quaternion().setFromEuler(ea.set(x, y, z)); }
    var hipY = B.leftUpperLeg ? B.leftUpperLeg.getWorldPosition(new THREE.Vector3()).y - R.getWorldPosition(new THREE.Vector3()).y : 0.88;

    // ---- her face: blinking, and smiling ----
    var faceMeshes = {};
    function exprMeshes(name) {
      var e = vrm.expressions && vrm.expressions.preset && vrm.expressions.preset[name], out = [];
      if (!e || !e.morphTargetBinds) return out;
      e.morphTargetBinds.forEach(function (b) {
        var node = root.getObjectByName(nodeNames[b.node]); if (!node) return;
        node.traverse(function (m) { if (m.isMesh && m.morphTargetInfluences) out.push([m, b.index, b.weight]); });
      });
      return out;
    }
    ['blink', 'happy'].forEach(function (n) { faceMeshes[n] = exprMeshes(n); });
    function express(name, v) { (faceMeshes[name] || []).forEach(function (b) { if (b[1] < b[0].morphTargetInfluences.length) b[0].morphTargetInfluences[b[1]] = b[2] * v; }); }
    function shape(name, v) { meshes.forEach(function (m) { var i = m.morphTargetDictionary && m.morphTargetDictionary[name]; if (i !== undefined) m.morphTargetInfluences[i] = v; }); }   // (one of VRoid's own face shapes, by name)
    function smile(v) { shape('Fcl_EYE_Joy', v); shape('Fcl_BRW_Joy', v * 0.8); shape('Fcl_MTH_Fun', v); }   // (eyes closed, smiling with her lips closed)

    // ---- your tools, in her right hand ----
    var armLen = B.rightUpperArm && B.rightHand ? B.rightUpperArm.getWorldPosition(new THREE.Vector3()).distanceTo(B.rightHand.getWorldPosition(new THREE.Vector3())) : 0.43;
    var TOOL = armLen / 0.3; axeArm.scale.setScalar(TOOL);               // (your tools, grown to suit her)
    axeArm.children[0].visible = axeArm.children[1].visible = false;    // (the chibi's sleeve and hand on the tool arm)

    // ---- hide the chibi witch, all but her flying broom ----
    chibi.traverse(function (o) { if (!o.isMesh) return; for (var p = o; p; p = p.parent) if (p === w.rideBroom || p === R) return; o.visible = false; });

    // ---- every time she's drawn: her joints follow the chibi's ----
    var DOWN = 1.3, v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), q1 = new THREE.Quaternion(), q2 = new THREE.Quaternion(), look = '';
    var lastT = 0, lastPhase = 0, stride = 0, pace = 1;
    function follow() {
      R.position.y = (flying || inBoat) ? 0.37 - hipY : 0;              // (sitting on her broom or in the boat: her hips where the chibi's seat was)
      var t = state.time, L0 = w.legs[0].rotation, L1 = w.legs[1].rotation;
      var calm = (flying || inBoat || window.EVERDAWN_TITLE) ? 0 : Math.max(0, 1 - (Math.abs(L0.x) + Math.abs(L1.x) + Math.abs(L0.z) + Math.abs(L1.z)) * 3);   // (standing still: how much to settle into a relaxed, natural stance)
      // (walking: her arms swing opposite to her legs, each arm forward as the other leg steps, a moment behind it so they
      // trail and follow through; they swing further forward than back, the elbow bending more on the way forward, and
      // further when she jogs or runs. Her hips turn with the leg that steps and her shoulders turn back against them.
      // The swing eases in as she sets off and settles as she stops, rather than snapping)
      var dt = Math.min(0.1, Math.max(0, t - lastT)), dp = w.phase - lastPhase; lastT = t; lastPhase = w.phase;
      var walking = dp > 0 && !flying && !inBoat && !window.EVERDAWN_TITLE;
      if (walking && dt > 0) pace += (Math.min(2, Math.max(0.6, dp / dt / 10)) - pace) * (1 - Math.exp(-dt * 4));
      stride += ((walking ? 1 : 0) - stride) * (1 - Math.exp(-dt * (walking ? 9 : 6)));
      var ph = w.phase, swing = stride * (0.75 + 0.3 * pace), sw = Math.sin(ph - 0.35), el = Math.sin(ph - 0.75);   // (sw: the right arm forward, -1 to 1, the left arm the opposite; el: the forearms, a little later still)
      pose(B.hips, E(0, 0.05 * calm - 0.15 * Math.sin(ph) * stride, -0.03 * calm)); pose(B.spine, E(0, -0.03 * calm + 0.07 * Math.sin(ph) * stride, 0.022 * calm)); pose(B.chest, E(Math.sin(t * 1.7) * 0.012, -0.02 * calm + 0.07 * Math.sin(ph) * stride, 0.012 * calm));   // (her weight on her left leg, her hips tilting a little, and breathing)
      for (var k = 0; k < 2; k++) {                                     // (legs: k 0 her left, 1 her right, as with the chibi's; standing still, her right knee softens)
        var leg = w.legs[k], up = k ? B.rightUpperLeg : B.leftUpperLeg, low = k ? B.rightLowerLeg : B.leftLowerLeg;
        pose(up, E(leg.rotation.x - (k ? 0.08 : 0.01) * calm, leg.rotation.y + (k ? -0.12 : 0.04) * calm, leg.rotation.z + (k ? 0.025 : 0.03) * calm)); pose(low, E(leg.userData.shin.rotation.x + (k ? 0.17 : 0.02) * calm, 0, 0));
      }
      [[w.armL, B.leftShoulder, B.leftUpperArm, B.leftLowerArm, B.leftHand, 1], [w.armR, B.rightShoulder, B.rightUpperArm, B.rightLowerArm, B.rightHand, -1]].forEach(function (a) {   // (arms: hanging close at her sides, then swinging as she walks, elbows softly bent)
        var r = a[0].rotation, s = a[5], f = -s * sw, fe = -s * el;     // (f: this arm forward, -1 to 1)
        var x = r.x * (1 - stride) - swing * (f > 0 ? 0.4 : 0.28) * f;   // (walking, her own swing takes over from the chibi's)
        pose(a[1], E(0, -s * 0.07 * f * swing, -s * 0.06 * calm));      // (shoulders relaxed, rolling a little with the swing)
        pose(a[2], E(x + 0.04 * calm, r.y, r.z).multiply(E(0, 0, -s * (DOWN + 0.13 * calm - 0.06 * stride))));   // (held a touch out from her sides as she walks, clear of her hips)
        pose(a[3], E(0, -s * (0.15 + 0.17 * calm + 0.45 * Math.max(0, -r.x) * (1 - stride) + swing * (0.12 + 0.3 * Math.max(0, fe) + 0.08 * pace)), 0));
        pose(a[4], E(0, -s * (0.1 * calm + swing * (0.06 - 0.08 * fe)), -s * (0.14 * calm + 0.1 * stride)));   // (wrists softly turned in; walking, her hands trail behind the swing)
      });
      ['Index', 'Middle', 'Ring', 'Little'].forEach(function (f, n) { ['Proximal', 'Intermediate', 'Distal'].forEach(function (j) {   // (fingers gently curled, a little more towards her little finger)
        var c = 0.3 + 0.12 * calm + n * 0.05 * calm; pose(B['left' + f + j], E(0, 0, -c)); pose(B['right' + f + j], E(0, 0, c));
      }); });
      var hr = w.head.rotation; pose(B.neck, E(hr.x * 0.4, hr.y * 0.4, hr.z * 0.4)); pose(B.head, E(hr.x * 0.6 + 0.04 * calm, hr.y * 0.6 + 0.05 * calm, hr.z * 0.6 + 0.05 * calm));   // (her head tipped a touch to one side)
      skirtRoots.forEach(function (o) {                                  // (her skirt swinging out of her legs' way as she walks)
        var leg = w.legs[/_L_/.test(o.name) ? 0 : 1], x = leg.rotation.x, front = /Front/.test(o.name), back = /Back/.test(o.name);
        pose(o, E(front ? Math.min(0, x) * 0.85 : back ? Math.max(0, x) * 0.85 : x * 0.4, 0, 0));
      });
      hairRoots.forEach(function (o) { pose(o, E(Math.max(-0.05, w.hairBack.rotation.x) * 0.6, 0, 0)); });   // (her hair swaying)
      var want = w.mFace.map === w.faces[2] ? 'happy' : w.mFace.map === w.faces[1] ? 'blink' : '';
      if (want !== look) { express('blink', want === 'blink' ? 1 : 0); smile(want === 'happy' ? 1 : 0); look = want; }
    }
    function afterFollow() {
      if (axeArm.visible && B.rightUpperArm) {                           // (holding a tool: her right arm reaches along the tool arm, her hand round the handle)
        B.rightUpperArm.getWorldPosition(v1); body.worldToLocal(v2.copy(v1)); axeArm.position.copy(v2);
        axeArm.updateMatrixWorld(true);
        var dir = v2.set(0, -1, 0).transformDirection(axeArm.matrixWorld), r = rest.get(B.rightUpperArm), parent = B.rightUpperArm.parent;
        var restDir = B.rightLowerArm.position.clone().normalize();
        q1.setFromUnitVectors(restDir.applyQuaternion(r.model).applyQuaternion(root.getWorldQuaternion(q2)).normalize(), dir);
        q1.multiply(root.getWorldQuaternion(q2)).multiply(r.model);     // (where her arm should point, in the world)
        B.rightUpperArm.quaternion.copy(parent.getWorldQuaternion(q2).invert().multiply(q1));
        B.rightLowerArm.quaternion.copy(rest.get(B.rightLowerArm).local);
        B.rightUpperArm.updateMatrixWorld(true);
      }
      [[w.armL, B.leftHand], [w.armR, B.rightHand]].forEach(function (p) {   // (the chibi's hidden hands kept where hers are, for anything held in them, like the title screen's wand)
        if (!p[1]) return; p[1].getWorldPosition(v1); chibi.worldToLocal(v1);
        p[0].position.copy(v1).sub(v2.set(0, -0.3, 0.02).applyEuler(p[0].rotation));
      });
    }
    R.updateMatrixWorld = function (force) { follow(); THREE.Object3D.prototype.updateMatrixWorld.call(this, force); afterFollow(); };
    return { root: R, bones: B, meshes: meshes, express: express };
  }

  // ---------- A modern black closet in the farmhouse ----------
  // A tall, sleek wardrobe in satin black against the right-hand wall past the end of the bed, standing on slim black
  // legs with brass tips: two tall doors over a pair of drawers, each set apart by a fine shadow gap, with long, slim
  // brass bar pulls on the doors and short ones on the drawers, a crisp top that overhangs a touch, and a woven basket
  // on top. It's decor like the TV, so in Decor Mode it can be moved, turned or put away; saves from before it was
  // added get it in its spot (or in your house storage if that spot is taken)
  function buildCloset() {
    var g = new THREE.Group(), W = 1.2, D = 0.58, H = 2.15, L = 0.13, F = D / 2;
    var matte = rMat(0x1b1b1f, { roughness: 0.6 }), satin = rMat(0x2c2c31, { roughness: 0.3, metalness: 0.22 }), gap = rMat(0x060607, { roughness: 1 }), brass = rMat(0xcaa76c, { metalness: 0.85, roughness: 0.28 });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) {          // (slim, slightly splayed legs with brass tips)
      var leg = decorMesh(new THREE.CylinderGeometry(0.016, 0.01, L, 10), matte, c[0] * (W / 2 - 0.07), L / 2, c[1] * (F - 0.07), g); leg.rotation.set(c[1] * 0.08, 0, -c[0] * 0.08);
      decorMesh(new THREE.CylinderGeometry(0.0105, 0.0105, 0.022, 10), brass, c[0] * (W / 2 - 0.065), 0.011, c[1] * (F - 0.065), g);
    });
    decorMesh(new THREE.BoxGeometry(W, 0.03, D), matte, 0, L + 0.015, 0, g);   // (its body: the base...)
    [-1, 1].forEach(function (s) { decorMesh(new THREE.BoxGeometry(0.026, H - L, D), matte, s * (W / 2 - 0.013), L + (H - L) / 2, 0, g); });   // (...sides...)
    decorMesh(new THREE.BoxGeometry(W + 0.024, 0.036, D + 0.024), matte, 0, H - 0.018, 0.006, g);   // (...a crisp top, overhanging a touch...)
    decorMesh(new THREE.BoxGeometry(W - 0.02, H - L, 0.016), matte, 0, L + (H - L) / 2, -F + 0.008, g);   // (...and a back)
    decorMesh(new THREE.BoxGeometry(W - 0.05, H - L - 0.05, 0.01), gap, 0, L + (H - L) / 2, F - 0.024, g);   // (the dark gaps round every door and drawer)
    var iw = W - 0.052, x0 = -iw / 2, DRW = 0.2, by = L + 0.03 + 0.006;
    [0, 1].forEach(function (k) {                                       // (two drawers along the bottom...)
      var dy = by + k * (DRW + 0.006) + DRW / 2;
      decorMesh(new THREE.BoxGeometry(iw, DRW, 0.022), satin, 0, dy, F - 0.011, g);
      decorMesh(new THREE.BoxGeometry(0.18, 0.012, 0.014), brass, 0, dy + 0.02, F + 0.024, g);   // (...with short brass pulls)
      [-0.08, 0.08].forEach(function (x) { var st = new THREE.CylinderGeometry(0.004, 0.004, 0.024, 8); st.rotateX(Math.PI / 2); decorMesh(st, brass, x, dy + 0.02, F + 0.012, g); });
    });
    var dy0 = by + 2 * (DRW + 0.006), dh = H - 0.036 - 0.006 - dy0, dw = iw / 2 - 0.003;
    [-1, 1].forEach(function (s) {                                       // (two tall doors above them...)
      decorMesh(new THREE.BoxGeometry(dw, dh, 0.022), satin, s * (dw / 2 + 0.003), dy0 + dh / 2, F - 0.011, g);
      var hx = s * 0.045, hy = dy0 + dh * 0.45;                          // (...each with a long, slim brass bar pull near the middle)
      decorMesh(new THREE.BoxGeometry(0.012, 0.56, 0.014), brass, hx, hy, F + 0.03, g);
      [hy - 0.25, hy + 0.25].forEach(function (y) { var st = new THREE.CylinderGeometry(0.005, 0.005, 0.03, 8); st.rotateX(Math.PI / 2); decorMesh(st, brass, hx, y, F + 0.013, g); });
    });
    var weave = rMat(0xb98e5c, { roughness: 0.9 }), weave2 = rMat(0x9c7444, { roughness: 0.9 });   // (a woven basket on top)
    decorMesh(new THREE.CylinderGeometry(0.17, 0.15, 0.2, 20, 1, true), weave, 0.24, H + 0.1, 0, g).material.side = THREE.DoubleSide;
    for (var r = 0; r < 4; r++) decorMesh(new THREE.TorusGeometry(0.155 + r * 0.005, 0.008, 5, 24).rotateX(Math.PI / 2), weave2, 0.24, H + 0.03 + r * 0.05, 0, g);
    decorMesh(new THREE.CylinderGeometry(0.15, 0.15, 0.01, 20), weave2, 0.24, H + 0.005, 0, g);
    return g;
  }
  DECOR.decor_closet = { name: 'Black Closet', icon: '👗', w: 1.2, d: 0.6, bumps: [[-0.3, 0, 0.34], [0.3, 0, 0.34]], make: buildCloset };
  ITEMS.decor_closet = { name: 'Black Closet', icon: '👗', info: 'Furniture for your house. Inside, press ' + everdawnKeyName(decorKey || 'KeyG') + ' for Decor Mode to place it.' };
  var CLOSET_X = ROOM_W / 2 - 0.3, CLOSET_Z = 1.75;                    // (where it starts: against the right-hand wall, past the end of the bed, facing into the room)
  function giveCloset() { if (decorFits('decor_closet', CLOSET_X, CLOSET_Z, 1)) decorPut({ id: 'decor_closet', x: CLOSET_X, z: CLOSET_Z, rot: 1 }); else storeAdd('decor_closet', 1); }
  giveCloset();
  decorDefaults = (function (base) { return function () { base(); giveCloset(); closetReset(); }; })(decorDefaults);
  decorSaveData = (function (base) { return function () { var d = base(); d.closetGiven = true; d.closet = { items: closetItems.map(function (c) { return c && { id: c.id, count: c.count }; }), worn: Object.assign({}, worn) }; return d; }; })(decorSaveData);
  decorLoadData = (function (base) { return function (d) {
    base(d); if (!d) return;
    if (!d.closetGiven) giveCloset();
    closetReset(); var c = d.closet;                                   // (what's in your closet, and what you're wearing)
    if (c) {
      (c.items || []).forEach(function (it, i) { if (it && i < CLOSET_SLOTS && isClothes(it.id)) closetItems[i] = { id: it.id, count: Math.max(1, it.count | 0) }; });
      OUTFIT.forEach(function (s) { var id = c.worn && c.worn[s[0]]; if (id && isClothes(id)) worn[s[0]] = id; });
    }
  }; })(decorLoadData);

  // ---------- The closet: your clothes, and what you're wearing ----------
  // Stand in front of the closet and press Interact (✕ / A / B) to open it. On the left: you, in a live picture, with
  // your outfit slots round you (Hat, Necklace, Shirt and Pants down one side, Belt, Socks and Shoes down the other).
  // On the right: the closet, laid out like your bag but for clothes only, and under it any clothes in your bag. Tap
  // clothes in your bag to put them away; tap clothes in the closet to put them on (whatever was in that slot goes back
  // in); tap something you're wearing to take it off. A dress goes in the Shirt slot, and while you wear one, no pants.
  // Clothes are any item with a slot: 'hat', 'necklace', 'shirt', 'dress', 'pants', 'belt', 'socks' or 'shoes' (give
  // Thread & Thimble's clothes one in CLOTH_STOCK). What's in the closet and what you wear are saved with your house
  var CLOSET_SLOTS = 24, OUTFIT = [['hat', 'Hat', '🎩'], ['necklace', 'Necklace', '📿'], ['shirt', 'Shirt', '👕'], ['pants', 'Pants', '👖'], ['belt', 'Belt', '🪢'], ['socks', 'Socks', '🧦'], ['shoes', 'Shoes', '👟']];
  var closetItems = [], worn = {}, closetOpen = false;
  function closetReset() { closetItems = []; for (var i = 0; i < CLOSET_SLOTS; i++) closetItems.push(null); worn = {}; OUTFIT.forEach(function (s) { worn[s[0]] = null; }); }
  closetReset();
  CLOTH_STOCK.forEach(function (c) { if (ITEMS[c.id] && c.slot) ITEMS[c.id].slot = c.slot; });   // (the shop's clothes, and the slot each one goes in)
  function isClothes(id) { return !!(ITEMS[id] && ITEMS[id].slot && /^(hat|necklace|shirt|dress|pants|belt|socks|shoes)$/.test(ITEMS[id].slot)); }
  function slotFor(id) { var s = ITEMS[id].slot; return s === 'dress' ? 'shirt' : s; }
  function wearingDress() { return !!(worn.shirt && ITEMS[worn.shirt] && ITEMS[worn.shirt].slot === 'dress'); }
  function closetAdd(id) {                                            // (into the closet: with others of its kind, or the first empty space)
    for (var i = 0; i < CLOSET_SLOTS; i++) if (closetItems[i] && closetItems[i].id === id) { closetItems[i].count++; return true; }
    for (i = 0; i < CLOSET_SLOTS; i++) if (!closetItems[i]) { closetItems[i] = { id: id, count: 1 }; return true; }
    showToast('👗 Your closet is full.', 1800); return false;
  }
  function closetTake(i) { var c = closetItems[i]; if (!c) return null; if (--c.count <= 0) closetItems[i] = null; return c.id; }
  (function () { var st = document.createElement('style'); st.textContent =
    '.inventory.ev-closet{width:min(780px,96%);max-height:94%;overflow-y:auto}' +
    '.ev-cl-cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:14px;align-items:start}@media (max-width:620px){.ev-cl-cols{grid-template-columns:1fr}}' +
    '.ev-cl-me{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:center;padding:10px;border-radius:18px;background:linear-gradient(180deg,#f3e9ff,#ffeaf4)}' +
    '.ev-cl-side{display:flex;flex-direction:column;gap:8px}.ev-cl-pic{position:relative;height:min(52vh,340px);border-radius:14px;overflow:hidden;background:radial-gradient(ellipse at 50% 35%,#fff7fb,#ead8ff 70%,#d9c4f7)}' +
    '.ev-cl-pic canvas{position:absolute;inset:0;width:100%!important;height:100%!important;display:block;background:transparent!important;box-shadow:none!important;border-radius:0!important}' +
    '.ev-oslot{display:flex;flex-direction:column;align-items:center;gap:2px;font:600 .66rem Fredoka,system-ui,sans-serif;color:#6b56a0}' +
    '.ev-oslot .slot{width:54px;height:54px;font-size:1.7rem}.ev-oslot .slot.ph span{opacity:.3;filter:grayscale(1)}.ev-oslot .slot.locked{opacity:.45}' +
    '.ev-cl-grid{grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:6px!important}.ev-cl-grid .slot{font-size:1.5rem}' +
    '.ev-cl-bag{grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:6px!important;margin-top:4px}.ev-cl-info{min-height:1.3em;margin:8px 0 0;font-size:.8rem;color:#6b56a0;text-align:center}' +
    '.ev-closet h4{margin:0 0 6px;color:#7b4fd6;font-size:.9rem}.ev-cl-none{grid-column:1/-1;font-size:.78rem;opacity:.7;margin:4px 0}';
    document.head.appendChild(st); })();
  var clBox = document.createElement('div'); clBox.className = 'inventory ev-closet'; clBox.hidden = true;
  clBox.innerHTML = '<div class="inv-head"><b>👗 Closet</b><button type="button" class="inv-close" aria-label="Close the closet">✕</button></div>' +
    '<div class="ev-cl-cols"><div class="ev-cl-me"><div class="ev-cl-side ev-cl-l"></div><div class="ev-cl-pic"></div><div class="ev-cl-side ev-cl-r"></div></div>' +
    '<div><h4>Your closet</h4><div class="inv-grid ev-cl-grid"></div><h4 style="margin-top:12px">Clothes in your bag</h4><div class="inv-grid ev-cl-bag"></div></div></div><p class="ev-cl-info"></p>';
  canvas.parentNode.appendChild(clBox);
  var clLeft = clBox.querySelector('.ev-cl-l'), clRight = clBox.querySelector('.ev-cl-r'), clGrid = clBox.querySelector('.ev-cl-grid'), clBag = clBox.querySelector('.ev-cl-bag'), clInfo = clBox.querySelector('.ev-cl-info'), clPic = clBox.querySelector('.ev-cl-pic');
  clBox.querySelector('.inv-close').addEventListener('click', function () { closeCloset(); focusGame(); });
  clBox.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
  function say(txt) { clInfo.textContent = txt || ''; }
  function slotButton(id, count, tip, act) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'slot' + (id ? '' : ' empty');
    if (id) { b.appendChild(itemPicture(id)); if (count > 1) { var c = document.createElement('span'); c.className = 'count'; c.textContent = count; b.appendChild(c); } }
    if (tip) { b.title = tip; b.setAttribute('aria-label', tip); b.addEventListener('pointerenter', function () { say(tip); }); b.addEventListener('focus', function () { say(tip); }); }
    if (act) b.addEventListener('click', act);
    return b;
  }
  var clSeen = '';
  function bagClothes() { return bag.map(function (it) { return it && isClothes(it.id) ? it.id + it.count : ''; }).join(); }
  function renderCloset() {
    if (!closetOpen) return;
    clSeen = bagClothes();
    clLeft.innerHTML = ''; clRight.innerHTML = '';
    OUTFIT.forEach(function (s, n) {                                    // (your outfit, round you)
      var id = worn[s[0]], lock = s[0] === 'pants' && wearingDress(), wrap = document.createElement('div'); wrap.className = 'ev-oslot';
      var b = id ? slotButton(id, 1, ITEMS[id].name + ': tap to take it off', function () { takeOff(s[0]); }) : slotButton(null, 0, lock ? 'Not with a dress' : s[1] + ': empty', null);
      if (!id) { b.classList.add('ph'); var ph = document.createElement('span'); ph.textContent = lock ? '🚫' : s[2]; b.appendChild(ph); if (lock) b.classList.add('locked'); }
      wrap.appendChild(b); var lb = document.createElement('span'); lb.textContent = s[1]; wrap.appendChild(lb);
      (n < 4 ? clLeft : clRight).appendChild(wrap);
    });
    clGrid.innerHTML = '';
    closetItems.forEach(function (c, i) { clGrid.appendChild(c ? slotButton(c.id, c.count, ITEMS[c.id].name + ': tap to wear it', function () { putOn(i); }) : slotButton(null)); });
    clBag.innerHTML = ''; var any = false;
    bag.forEach(function (it, i) { if (!it || !isClothes(it.id)) return; any = true; clBag.appendChild(slotButton(it.id, it.count, ITEMS[it.id].name + ': tap to put it in your closet', function () { stow(i); })); });
    if (!any) { var p = document.createElement('p'); p.className = 'ev-cl-none'; p.textContent = 'No clothes in your bag. Thread & Thimble sells them!'; clBag.appendChild(p); }
  }
  function stow(i) {                                                  // (from your bag into the closet)
    var it = bag[i]; if (!it || !isClothes(it.id)) return;
    if (!closetAdd(it.id)) return;
    if (--it.count <= 0) { bag[i] = null; if (selectedSlot === i) selectedSlot = -1; }
    renderBag(); renderCloset(); popSound();
  }
  function putOn(i) {                                                 // (from the closet onto you)
    var c = closetItems[i]; if (!c) return;
    var s = slotFor(c.id);
    if (s === 'pants' && wearingDress()) { showToast('👗 You can\'t wear pants with a dress.', 1800); return; }
    var id = closetTake(i), off = worn[s];
    worn[s] = id; if (off) closetAdd(off);
    if (ITEMS[id].slot === 'dress' && worn.pants) { closetAdd(worn.pants); worn.pants = null; }   // (a dress: no pants with it)
    renderCloset(); popSound();
  }
  function takeOff(s) { var id = worn[s]; if (!id) return; if (!closetAdd(id)) return; worn[s] = null; renderCloset(); popSound(); }

  // (the live picture of you: drawn in its own little window, with soft light, while the closet is open)
  var pr = null;
  function portrait() {
    if (!closetOpen) return;
    requestAnimationFrame(portrait);
    var w = clPic.clientWidth, h = clPic.clientHeight; if (!w || !h) return;
    if (!pr) {
      var R3 = new THREE.WebGLRenderer({ antialias: true, alpha: true }); R3.setClearColor(0x000000, 0);
      R3.outputEncoding = renderer.outputEncoding; R3.toneMapping = renderer.toneMapping; R3.toneMappingExposure = renderer.toneMappingExposure; R3.physicallyCorrectLights = renderer.physicallyCorrectLights;
      var S = new THREE.Scene(); S.add(new THREE.HemisphereLight(0xfff4f8, 0x8a6ab4, 0.75));
      var key = new THREE.DirectionalLight(0xfff6ee, 0.75); key.position.set(1.5, 3, 4); S.add(key);
      var rim = new THREE.DirectionalLight(0xffc0e6, 0.35); rim.position.set(-3, 2, -2); S.add(rim);
      pr = { R: R3, S: S, cam: new THREE.PerspectiveCamera(24, 1, 0.05, 30) };
    }
    if (pr.R.domElement.parentNode !== clPic) clPic.appendChild(pr.R.domElement);
    pr.R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); pr.R.setSize(w, h, false);
    var fit = 1.76, cam = pr.cam; cam.aspect = w / h; cam.position.set(0, 0.85, fit * 0.5 / Math.tan(12 * Math.PI / 180) / Math.min(1, cam.aspect * 1.9)); cam.lookAt(0, 0.83, 0); cam.updateProjectionMatrix();   // (all of you, filling the picture)
    var parent = player.parent, pos = player.position.clone(), rot = player.rotation.clone(), vis = player.visible;   // (you, borrowed for a moment, facing out at yourself)
    pr.S.add(player); player.position.set(0, 0, 0); player.rotation.set(0, 0, 0); player.visible = true;
    try { pr.R.render(pr.S, cam); } finally { (parent || scene).add(player); player.position.copy(pos); player.rotation.copy(rot); player.visible = vis; }
  }

  function closetSpot() {                                             // (the spot in front of the closet's doors, in the room's own terms, or null if it isn't in the room)
    var p = decorPlaced.filter(function (q) { return q.id === 'decor_closet'; })[0]; if (!p) return null;
    var a = -p.rot * Math.PI / 2; return { x: p.x + Math.sin(a) * 0.75, z: p.z + Math.cos(a) * 0.75 };
  }
  function nearCloset(r) {
    if (!inFarmhouse() || decorMode || flying) return false;
    var s = closetSpot(); return !!s && dist(player.position.x - IN_X, player.position.z - IN_Z, s.x, s.z) < (r || 0.75);
  }
  function openCloset() { if (closetOpen) return; toggleBag(false); closetOpen = true; menuOpenedAt = Date.now(); walkTarget = null; clBox.hidden = false; say('Tap clothes in your bag to put them away, tap clothes in your closet to wear them.'); renderCloset(); portrait(); }
  function closeCloset() { closetOpen = false; clBox.hidden = true; }
  window.addEventListener('keydown', function (e) { if (e.code === 'Escape' && closetOpen) closeCloset(); });
  var clBtn = document.createElement('button'); clBtn.type = 'button'; clBtn.className = 'sleep-btn ship-btn'; canvas.parentNode.appendChild(clBtn);   // (pops up when you're in front of it)
  function showClosetKey() { clBtn.innerHTML = '👗 Closet <kbd>' + (interactKey ? everdawnKeyName(interactKey) : 'E') + '</kbd>'; }
  showClosetKey(); clBtn.addEventListener('click', function () { openCloset(); focusGame(); });
  somethingOpen = (function (base) { return function () { return closetOpen || base.apply(this, arguments); }; })(somethingOpen);
  interact = (function (base) { return function () {
    if (closetOpen) { if (!menuJustOpened()) closeCloset(); return; }
    if (nearCloset() && !somethingOpen()) { openCloset(); return; }
    return base.apply(this, arguments);
  }; })(interact);
  updatePlayer = (function (base) { return function (dt) {
    var r = base.apply(this, arguments);
    if (closetOpen && !nearCloset(1.8)) closeCloset();                 // (it stays open until you walk away)
    var show = nearCloset() && !closetOpen && !somethingOpen(); if (clBtn.classList.contains('show') !== show) { clBtn.classList.toggle('show', show); if (show) showClosetKey(); }
    if (closetOpen && bagClothes() !== clSeen) renderCloset();        // (clothes came into your bag while it was open)
    return r;
  }; })(updatePlayer);
  window.everdawnCloset = { open: openCloset, close: closeCloset, add: closetAdd, worn: function () { return Object.assign({}, worn); } };   // (for anything else that needs it, like testing)
});
