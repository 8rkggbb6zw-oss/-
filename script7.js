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
    function follow() {
      R.position.y = (flying || inBoat) ? 0.37 - hipY : 0;              // (sitting on her broom or in the boat: her hips where the chibi's seat was)
      var t = state.time, L0 = w.legs[0].rotation, L1 = w.legs[1].rotation;
      var calm = (flying || inBoat || window.EVERDAWN_TITLE) ? 0 : Math.max(0, 1 - (Math.abs(L0.x) + Math.abs(L1.x) + Math.abs(L0.z) + Math.abs(L1.z)) * 3);   // (standing still: how much to settle into a relaxed, natural stance)
      pose(B.hips, E(0, 0.05 * calm, -0.03 * calm)); pose(B.spine, E(0, -0.03 * calm, 0.022 * calm)); pose(B.chest, E(Math.sin(t * 1.7) * 0.012, -0.02 * calm, 0.012 * calm));   // (her weight on her left leg, her hips tilting a little, and breathing)
      for (var k = 0; k < 2; k++) {                                     // (legs: k 0 her left, 1 her right, as with the chibi's; standing still, her right knee softens)
        var leg = w.legs[k], up = k ? B.rightUpperLeg : B.leftUpperLeg, low = k ? B.rightLowerLeg : B.leftLowerLeg;
        pose(up, E(leg.rotation.x - (k ? 0.08 : 0.01) * calm, leg.rotation.y + (k ? -0.12 : 0.04) * calm, leg.rotation.z + (k ? 0.025 : 0.03) * calm)); pose(low, E(leg.userData.shin.rotation.x + (k ? 0.17 : 0.02) * calm, 0, 0));
      }
      pose(B.leftShoulder, E(0, 0, -0.06 * calm)); pose(B.rightShoulder, E(0, 0, 0.06 * calm));   // (shoulders relaxed)
      [[w.armL, B.leftUpperArm, B.leftLowerArm, B.leftHand, 1], [w.armR, B.rightUpperArm, B.rightLowerArm, B.rightHand, -1]].forEach(function (a) {   // (arms: hanging close at her sides, then swinging as the chibi's do, elbows softly bent)
        var r = a[0].rotation, s = a[4];
        pose(a[1], E(r.x + 0.04 * calm, r.y, r.z).multiply(E(0, 0, -s * (DOWN + 0.13 * calm))));
        pose(a[2], E(0, -s * (0.15 + 0.17 * calm + 0.45 * Math.max(0, -r.x)), 0));
        pose(a[3], E(0, -s * 0.1 * calm, -s * 0.14 * calm));            // (wrists softly turned in)
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
  decorDefaults = (function (base) { return function () { base(); giveCloset(); }; })(decorDefaults);
  decorSaveData = (function (base) { return function () { var d = base(); d.closetGiven = true; return d; }; })(decorSaveData);
  decorLoadData = (function (base) { return function (d) { base(d); if (d && !d.closetGiven) giveCloset(); }; })(decorLoadData);
});
