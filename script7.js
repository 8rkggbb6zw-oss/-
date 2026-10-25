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
        ['Index', 'Middle', 'Ring', 'Little'].forEach(function (f, n) { ['Proximal', 'Intermediate', 'Distal'].forEach(function (j, k) { pose(B['right' + f + j], E(0, 0, k ? 1.05 : 0.95 + n * 0.05)); }); });   // (her fingers closed round what she holds)
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
  // ---- your own clothes designs, for sale at Thread & Thimble ----
  // Each is drawn by you (in Procreate) and kept here as a picture (img), shown in the shop, your bag, the closet and its
  // outfit slots; icon is the emoji used where only text fits, like the messages that pop up
  CLOTH_STOCK.push({ id: 'cloth_choker', name: 'Heart Choker', icon: '💜', price: 350, info: 'A black choker with a purple heart at the front.', slot: 'necklace', hold: heartChoker,
    img: 'data:image/png;base64,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' });
  CLOTH_STOCK.forEach(function (c) {                                   // (the shop's clothes, the slot each one goes in, and its picture)
    if (!ITEMS[c.id]) ITEMS[c.id] = { name: c.name, icon: c.icon, info: c.info };
    if (c.slot) ITEMS[c.id].slot = c.slot;
    if (c.img) { ITEMS[c.id].img = c.img; ITEMS[c.id].fill = 84; }
  });
  // ---- holding your clothes: picked in your hotbar, she holds it up in her hand (hold: what to make for it) ----
  function heartChoker() {                                             // (the Heart Choker: a black band hanging from her fingers, its purple heart at the bottom, facing out)
    var g = new THREE.Group(), R = 0.042, W = 0.014;
    var band = new THREE.Mesh(new THREE.CylinderGeometry(R, R, W, 40, 1, true), new THREE.MeshStandardMaterial({ color: 0x120a10, roughness: 0.55, side: THREE.DoubleSide }));
    band.rotation.x = Math.PI / 2; band.position.y = -R; g.add(band);
    var heart = new THREE.Shape();                                     // (a heart, point down)
    heart.moveTo(0, -0.5); heart.bezierCurveTo(0.12, -0.32, 0.5, -0.06, 0.5, 0.18); heart.bezierCurveTo(0.5, 0.42, 0.3, 0.52, 0.18, 0.5);
    heart.bezierCurveTo(0.08, 0.48, 0.02, 0.42, 0, 0.34); heart.bezierCurveTo(-0.02, 0.42, -0.08, 0.48, -0.18, 0.5);
    heart.bezierCurveTo(-0.3, 0.52, -0.5, 0.42, -0.5, 0.18); heart.bezierCurveTo(-0.5, -0.06, -0.12, -0.32, 0, -0.5);
    var hg = new THREE.ExtrudeGeometry(heart, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.06, bevelSegments: 4, curveSegments: 16 });
    var h = new THREE.Mesh(hg, new THREE.MeshStandardMaterial({ color: 0x8650d4, roughness: 0.3, metalness: 0.1, emissive: 0x3a1670, emissiveIntensity: 0.35 }));
    h.scale.setScalar(0.036); h.position.set(0, -2 * R + 0.004, W / 2 + 0.002); g.add(h);
    var rim = new THREE.Mesh(hg, new THREE.MeshStandardMaterial({ color: 0x3b1460, roughness: 0.5 }));   // (its dark purple outline)
    rim.scale.set(0.041, 0.041, 0.02); rim.position.set(0, -2 * R + 0.004, W / 2); g.add(rim);
    g.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
    return g;
  }
  pickupModel = (function (base) {
    return function (item) {
      var c = CLOTH_STOCK.filter(function (s) { return s.id === item && s.hold; })[0];
      if (!c) return base.apply(this, arguments);
      var up = new THREE.Group(); up.rotation.x = 1.05; if (you) up.position.set(0, 0.08, -0.025); else up.position.y = 0.03;   // (undoes the arm's angle, so it hangs straight down from her fingers, or the chibi's hand)
      up.add(c.hold()); return up;
    };
  })(pickupModel);
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
