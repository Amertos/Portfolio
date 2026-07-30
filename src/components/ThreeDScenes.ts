import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import type { SceneSetupFn } from './ThreeDCanvas';

// ─── Tween helpers ───────────────────────────────────────────────────────

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const easeOutElastic = (t: number) => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};
const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ─── Scene 1: System Architecture ─── Cloud Stack ─────────────────────────
// Floating multi-tier cloud infrastructure with service nodes, connection
// network, and data-flow particles. Clean, architectural, and alive.

export const setupSystemArchitecture: SceneSetupFn = (scene, camera, size, renderer) => {
  scene.background = new THREE.Color(0x050508);

  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight.position.set(5, 8, 6);
  scene.add(dirLight);

  const group = new THREE.Group();
  scene.add(group);

  // ── Layer definitions ──
  // Five floating tiers: each has a ring platform, service nodes, and
  // distinct hue. Stacked along Y from bottom (infra) to top (client).
  const LAYER_COUNT = 5;
  const layerDefs = [
    { label: 'Infra',  y: -1.8, hue: 0.52, radius: 2.4, count: 3 },
    { label: 'DB',     y: -0.9, hue: 0.55, radius: 2.1, count: 3 },
    { label: 'Backend', y: 0,   hue: 0.58, radius: 1.8, count: 3 },
    { label: 'API',    y: 0.9,  hue: 0.61, radius: 1.5, count: 3 },
    { label: 'Client', y: 1.8,  hue: 0.64, radius: 1.2, count: 3 },
  ] as const;

  // ── Helper: evenly spaced positions on a circle ──
  const ringPositions = (n: number, r: number, yOff: number) => {
    const out: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      out.push(new THREE.Vector3(Math.cos(a) * r, yOff, Math.sin(a) * r));
    }
    return out;
  };

  // ── Build platforms & nodes ──
  type NodeInfo = { mesh: THREE.Mesh; basePos: THREE.Vector3; offset: THREE.Vector3; hue: number; layer: number };
  const nodes: NodeInfo[] = [];
  const platforms: { mesh: THREE.Mesh; wire: THREE.LineSegments; baseY: number; radius: number }[] = [];
  const connections: { line: THREE.Line; a: number; b: number }[] = [];

  layerDefs.forEach((layer, li) => {
    const r = layer.radius;
    const hue = layer.hue;
    const col = new THREE.Color().setHSL(hue, 0.6, 0.35);

    // ── Platform ring (torus) ──
    const ringGeo = new THREE.TorusGeometry(r, 0.025, 12, 64);
    const ringMat = new THREE.MeshPhysicalMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.35,
      metalness: 0.6,
      roughness: 0.2,
      clearcoat: 0.3,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = layer.y;
    ringMesh.rotation.x = Math.PI / 2;
    group.add(ringMesh);

    // ── Platform wireframe ring ──
    const wireEdge = new THREE.EdgesGeometry(new THREE.TorusGeometry(r * 1.02, 0.03, 6, 32));
    const wireMat = new THREE.LineBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.7, 0.5),
      transparent: true,
      opacity: 0.08,
    });
    const wireLine = new THREE.LineSegments(wireEdge, wireMat);
    wireLine.position.y = layer.y;
    wireLine.rotation.x = Math.PI / 2;
    group.add(wireLine);

    platforms.push({ mesh: ringMesh, wire: wireLine, baseY: layer.y, radius: r });

    // ── Service nodes (3 per layer, evenly spaced on the ring) ──
    const positions = ringPositions(layer.count, r * 0.7, layer.y);
    positions.forEach((pos) => {
      const sz = 0.08 + Math.random() * 0.06;
      const nodeCol = new THREE.Color().setHSL(hue + Math.random() * 0.04 - 0.02, 0.8, 0.55);
      const nodeMat = new THREE.MeshPhysicalMaterial({
        color: nodeCol,
        emissive: nodeCol,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.85,
        metalness: 0.3,
        roughness: 0.2,
      });
      const nodeGeo = new THREE.SphereGeometry(sz, 12, 12);
      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.copy(pos);
      group.add(mesh);

      nodes.push({
        mesh,
        basePos: pos.clone(),
        offset: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 4
        ),
        hue,
        layer: li,
      });
    });
  });

  // ── Build connection network ──
  // Intra-layer: connect adjacent nodes on the same layer (forms a ring per layer)
  // Inter-layer: connect nodes of adjacent layers
  for (let li = 0; li < LAYER_COUNT; li++) {
    const layerNodes = nodes.filter((n) => n.layer === li);
    for (let i = 0; i < layerNodes.length; i++) {
      const a = nodes.indexOf(layerNodes[i]);
      const b = nodes.indexOf(layerNodes[(i + 1) % layerNodes.length]);
      const geo = new THREE.BufferGeometry().setFromPoints([
        layerNodes[i].basePos,
        layerNodes[(i + 1) % layerNodes.length].basePos,
      ]);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(layerDefs[li].hue, 0.6, 0.5),
        transparent: true,
        opacity: 0.04,
      });
      const line = new THREE.Line(geo, mat);
      group.add(line);
      connections.push({ line, a, b });
    }
  }
  for (let li = 0; li < LAYER_COUNT - 1; li++) {
    const lower = nodes.filter((n) => n.layer === li);
    const upper = nodes.filter((n) => n.layer === li + 1);
    for (let i = 0; i < Math.min(lower.length, upper.length); i++) {
      const a = nodes.indexOf(lower[i]);
      const b = nodes.indexOf(upper[i]);
      const geo = new THREE.BufferGeometry().setFromPoints([lower[i].basePos, upper[i].basePos]);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL((layerDefs[li].hue + layerDefs[li + 1].hue) / 2, 0.5, 0.4),
        transparent: true,
        opacity: 0.03,
      });
      const line = new THREE.Line(geo, mat);
      group.add(line);
      connections.push({ line, a, b });
    }
  }

  // ── Data flow particles (80, traveling along connections) ──
  const FLOW_COUNT = 80;
  const flowPos = new Float32Array(FLOW_COUNT * 3);
  const flowData: { connIdx: number; progress: number; speed: number; hue: number }[] = [];
  for (let i = 0; i < FLOW_COUNT; i++) {
    const ci = Math.floor(Math.random() * connections.length);
    flowData.push({
      connIdx: ci,
      progress: Math.random(),
      speed: 0.3 + Math.random() * 0.5,
      hue: 0.5 + Math.random() * 0.2,
    });
  }
  const flowColors = new Float32Array(FLOW_COUNT * 3);
  flowData.forEach((fd, i) => {
    const c = new THREE.Color().setHSL(fd.hue, 0.9, 0.7);
    flowColors[i * 3] = c.r;
    flowColors[i * 3 + 1] = c.g;
    flowColors[i * 3 + 2] = c.b;
  });
  const flowGeo = new THREE.BufferGeometry();
  flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3));
  flowGeo.setAttribute('color', new THREE.BufferAttribute(flowColors, 3));
  const flowMat = new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const flowPoints = new THREE.Points(flowGeo, flowMat);
  group.add(flowPoints);

  // ── Ambient particles (200, subtle curtain) ──
  const AMB_COUNT = 200;
  const ambPos = new Float32Array(AMB_COUNT * 3);
  for (let i = 0; i < AMB_COUNT; i++) {
    ambPos[i * 3] = (Math.random() - 0.5) * 8;
    ambPos[i * 3 + 1] = (Math.random() - 0.5) * 6;
    ambPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  const ambGeo = new THREE.BufferGeometry();
  ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));
  const ambMat = new THREE.PointsMaterial({
    size: 0.01,
    color: 0x4488ff,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const amb = new THREE.Points(ambGeo, ambMat);
  group.add(amb);

  // ── Wireframe bounding box ──
  const boxSize = 3.6;
  const boxGeo = new THREE.BoxGeometry(boxSize, boxSize * 1.1, boxSize * 0.9);
  const boxEdges = new THREE.EdgesGeometry(boxGeo);
  const boxLineMat = new THREE.LineBasicMaterial({
    color: 0x224488,
    transparent: true,
    opacity: 0.04,
  });
  const boxWire = new THREE.LineSegments(boxEdges, boxLineMat);
  group.add(boxWire);

  const targetZ = size.width < 500 ? 8 : 6;

  // ── Bloom ──
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.35, 0.3, 0.85);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  return {
    animate: (time, mouseX, mouseY, clickedAt) => {
      const t = time * 0.001;
      const clickElapsed = clickedAt > 0 ? (time - clickedAt) * 0.001 : 99;
      const isBurst = clickElapsed < 2.5;
      const burst = isBurst ? easeOutElastic(1 - clickElapsed / 2.5) : 0;
      const hover = clamp(Math.abs(mouseX) + Math.abs(mouseY));

      // ── Camera ──
      const camZ = isBurst ? targetZ + burst * 2.5 : targetZ + Math.sin(t * 0.3) * 0.1;
      camera.position.z = lerp(camera.position.z, camZ, 0.05);
      camera.position.x = lerp(camera.position.x, mouseX * 0.3, 0.02);
      camera.position.y = lerp(camera.position.y, -mouseY * 0.3, 0.02);
      camera.lookAt(0, 0, 0);

      // ── Group rotation ──
      const spin = isBurst ? 0.3 + burst * 2 : 0.08 + hover * 0.04;
      group.rotation.x = Math.sin(t * 0.06) * 0.04 + mouseY * 0.03;
      group.rotation.y = t * spin + mouseX * 0.04;

      // ── Platforms ──
      platforms.forEach((pl, i) => {
        const s = isBurst ? 1 + burst * 2.5 * (1 - i / LAYER_COUNT) : 1 + Math.sin(t * 0.4 + i) * 0.02;
        pl.mesh.scale.set(s, s, s);
        pl.wire.scale.copy(pl.mesh.scale);
        const tilt = isBurst ? burst * 0.3 * (i % 2 === 0 ? 1 : -1) : hover * 0.02;
        pl.mesh.rotation.z += tilt * 0.005;
        pl.wire.rotation.z = pl.mesh.rotation.z;
        const mat = pl.mesh.material as THREE.MeshPhysicalMaterial;
        mat.emissiveIntensity = isBurst ? 0.2 + burst * 2.5 : 0.15 + hover * 0.2 + Math.sin(t * 0.5 + i) * 0.05;
        mat.opacity = isBurst ? 0.35 - burst * 0.2 : 0.3 + hover * 0.1;
      });

      // ── Nodes ──
      nodes.forEach((node, i) => {
        const mat = node.mesh.material as THREE.MeshPhysicalMaterial;
        if (isBurst) {
          const delay = (i / nodes.length) * 0.3;
          const phase = clamp((burst - delay) / (1 - delay));
          const dir = new THREE.Vector3(node.offset.x, node.offset.y, node.offset.z).normalize();
          const dist = 1 + phase * 3.5;
          node.mesh.position.x = node.basePos.x + dir.x * dist;
          node.mesh.position.y = node.basePos.y + dir.y * dist;
          node.mesh.position.z = node.basePos.z + dir.z * dist;
          const sc = 1 + phase * 1.5;
          node.mesh.scale.set(sc, sc, sc);
          const flashCol = new THREE.Color().setHSL(node.hue + burst * 0.1, 0.9, 0.6 + phase * 0.3);
          mat.color.copy(flashCol);
          mat.emissive.copy(flashCol);
          mat.emissiveIntensity = 0.4 + phase * 4;
          mat.opacity = 0.85 - phase * 0.3;
        } else {
          const hoverPull = 0.15 + hover * 0.15;
          node.mesh.position.x = node.basePos.x + mouseX * hoverPull + Math.sin(t * 0.2 + i * 0.7) * 0.03;
          node.mesh.position.y = node.basePos.y + Math.sin(t * 0.3 + i * 0.5) * 0.03 + mouseY * hoverPull;
          node.mesh.position.z = node.basePos.z + Math.sin(t * 0.15 + i) * 0.03;
          node.mesh.scale.set(1, 1, 1);
          const pulseCol = new THREE.Color().setHSL(
            node.hue + Math.sin(t * 0.2 + i) * 0.02,
            0.7,
            0.5 + hover * 0.15
          );
          mat.color.copy(pulseCol);
          mat.emissive.copy(pulseCol);
          mat.emissiveIntensity = 0.3 + hover * 0.5 + Math.sin(t + i) * 0.1;
          mat.opacity = 0.75 + hover * 0.15;
        }
      });

      // ── Connections ──
      connections.forEach((conn, ci) => {
        const pA = nodes[conn.a].mesh.position;
        const pB = nodes[conn.b].mesh.position;
        const pos = conn.line.geometry.attributes.position;
        pos.setXYZ(0, pA.x, pA.y, pA.z);
        pos.setXYZ(1, pB.x, pB.y, pB.z);
        pos.needsUpdate = true;
        const mat = conn.line.material as THREE.LineBasicMaterial;
        if (isBurst) {
          mat.opacity = 0.04 + burst * 0.5;
          mat.color.setHSL(0.55 + burst * 0.1, 0.9, 0.4 + burst * 0.5);
        } else {
          mat.opacity = 0.03 + Math.sin(t * 0.5 + ci) * 0.02 + hover * 0.03;
        }
      });

      // ── Data flow particles ──
      const fPos = flowGeo.attributes.position.array as Float32Array;
      flowData.forEach((fd, i) => {
        if (isBurst) {
          const angle = t * 2 + fd.connIdx * 0.5;
          const r = 0.5 + burst * 5;
          fPos[i * 3] = Math.cos(angle + i) * r;
          fPos[i * 3 + 1] = Math.sin(angle * 1.3 + i) * r * 0.5;
          fPos[i * 3 + 2] = Math.sin(angle * 0.7 + i) * r;
        } else {
          fd.progress += fd.speed * 0.004 * (1 + hover);
          if (fd.progress >= 1) {
            fd.progress = 0;
            fd.connIdx = Math.floor(Math.random() * connections.length);
          }
          const conn = connections[fd.connIdx];
          const p1 = nodes[conn.a].mesh.position;
          const p2 = nodes[conn.b].mesh.position;
          fPos[i * 3] = lerp(p1.x, p2.x, fd.progress);
          fPos[i * 3 + 1] = lerp(p1.y, p2.y, fd.progress);
          fPos[i * 3 + 2] = lerp(p1.z, p2.z, fd.progress);
        }
      });
      flowGeo.attributes.position.needsUpdate = true;
      flowMat.opacity = isBurst ? 0.3 + burst * 0.5 : 0.5 + hover * 0.15;
      flowMat.size = isBurst ? 0.035 + burst * 0.08 : 0.035;

      // ── Ambient particles ──
      const aPos = ambGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < AMB_COUNT; i++) {
        const i3 = i * 3;
        if (isBurst) {
          aPos[i3] += Math.sin(t * 2 + i) * burst * 0.08;
          aPos[i3 + 1] += Math.cos(t * 1.5 + i * 0.5) * burst * 0.08;
          aPos[i3 + 2] += Math.sin(t * 1.7 + i * 0.3) * burst * 0.08;
        } else {
          aPos[i3] += Math.sin(t * 0.05 + i * 0.3) * 0.002;
          aPos[i3 + 1] += Math.cos(t * 0.04 + i * 0.2) * 0.002;
          aPos[i3 + 2] += Math.sin(t * 0.03 + i * 0.4) * 0.002;
          if (Math.abs(aPos[i3]) > 4) aPos[i3] *= -0.5;
          if (Math.abs(aPos[i3 + 1]) > 3) aPos[i3 + 1] *= -0.5;
          if (Math.abs(aPos[i3 + 2]) > 3) aPos[i3 + 2] *= -0.5;
        }
      }
      ambGeo.attributes.position.needsUpdate = true;
      ambMat.opacity = isBurst ? 0.05 + burst * 0.4 : 0.06 + hover * 0.04;

      // ── Bounding box ──
      boxWire.rotation.x = t * 0.02;
      boxWire.rotation.y = t * 0.03;
      boxLineMat.opacity = isBurst ? 0.04 + burst * 0.2 : 0.03 + Math.sin(t * 0.2) * 0.01 + hover * 0.02;

      // ── Bloom ──
      bloom.strength = isBurst
        ? 0.35 + burst * 2
        : 0.25 + hover * 0.2 + Math.sin(t * 0.4) * 0.04;
    },
    cleanup: () => {
      platforms.forEach((pl) => {
        (pl.mesh.material as THREE.Material).dispose();
        (pl.wire.material as THREE.Material).dispose();
        pl.mesh.geometry.dispose();
        pl.wire.geometry.dispose();
      });
      nodes.forEach((n) => { n.mesh.geometry.dispose(); (n.mesh.material as THREE.Material).dispose(); });
      connections.forEach((c) => { c.line.geometry.dispose(); (c.line.material as THREE.Material).dispose(); });
      flowGeo.dispose(); flowMat.dispose();
      ambGeo.dispose(); ambMat.dispose();
      boxWire.geometry.dispose(); boxGeo.dispose(); boxLineMat.dispose();
    },
    composer,
  };
};

// ─── Scene 2: Cyber Defense ─── Neon Fortress ────────────────────────────

export const setupCyberDefense: SceneSetupFn = (scene, camera, size, renderer) => {
  scene.background = new THREE.Color(0x050508);

  const ambient = new THREE.AmbientLight(0x222222, 0.5);
  scene.add(ambient);
  const greenLight = new THREE.DirectionalLight(0x00ff88, 2.5);
  greenLight.position.set(4, 6, 5);
  scene.add(greenLight);
  const backLight = new THREE.DirectionalLight(0x00ccaa, 1.0);
  backLight.position.set(-4, -2, -5);
  scene.add(backLight);

  const group = new THREE.Group();
  scene.add(group);

  // ── Core sphere ──
  const sphereGeo = new THREE.SphereGeometry(1.2, 48, 48);
  const sphereMat = new THREE.MeshPhysicalMaterial({
    color: 0x00cc88,
    emissive: 0x00ff88,
    emissiveIntensity: 0.15,
    transparent: true,
    opacity: 0.15,
    metalness: 0.4,
    roughness: 0.3,
    clearcoat: 0.6,
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  group.add(sphere);

  // ── Wireframe sphere ──
  const wireSphere = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.SphereGeometry(1.2, 20, 20)),
    new THREE.LineBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.15 })
  );
  group.add(wireSphere);

  // ── 6 Orbiting rings at different angles ──
  const ringList: { mesh: THREE.Mesh; speed: number; axis: THREE.Vector3; phase: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const r = 1.6 + i * 0.25;
    const geo = new THREE.TorusGeometry(r, 0.015, 8, 64);
    const hue = 0.35 + i * 0.04;
    const col = new THREE.Color().setHSL(hue, 0.9, 0.5);
    const mat = new THREE.MeshBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0.2,
    });
    const mesh = new THREE.Mesh(geo, mat);
    const axis = new THREE.Vector3(
      Math.sin(i * 1.2),
      Math.cos(i * 1.5),
      Math.sin(i * 0.8)
    ).normalize();
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), axis);
    group.add(mesh);
    ringList.push({ mesh, speed: 0.2 + i * 0.1, axis, phase: i * 0.5 });
  }

  // ── Pulse ring ──
  const pulseGeo = new THREE.RingGeometry(0.15, 0.3, 64);
  const pulseMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const pulse = new THREE.Mesh(pulseGeo, pulseMat);
  group.add(pulse);

  // ── Shockwave ring ──
  const shockGeo = new THREE.RingGeometry(0.4, 0.5, 64);
  const shockMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const shockMesh = new THREE.Mesh(shockGeo, shockMat);
  shockMesh.rotation.x = -Math.PI / 2;
  group.add(shockMesh);

  // ── 400 Scanning particles ──
  const SCAN_COUNT = 400;
  const scanPos = new Float32Array(SCAN_COUNT * 3);
  const scanBase = new Float32Array(SCAN_COUNT * 3);
  const scanColors = new Float32Array(SCAN_COUNT * 3);
  for (let i = 0; i < SCAN_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 1.4 + Math.random() * 1.5;
    scanBase[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    scanBase[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    scanBase[i * 3 + 2] = r * Math.cos(phi);
    scanPos[i * 3] = scanBase[i * 3];
    scanPos[i * 3 + 1] = scanBase[i * 3 + 1];
    scanPos[i * 3 + 2] = scanBase[i * 3 + 2];
    const c = new THREE.Color().setHSL(0.35 + Math.random() * 0.1, 0.9, 0.5 + Math.random() * 0.4);
    scanColors[i * 3] = c.r;
    scanColors[i * 3 + 1] = c.g;
    scanColors[i * 3 + 2] = c.b;
  }
  const scanGeo = new THREE.BufferGeometry();
  scanGeo.setAttribute('position', new THREE.BufferAttribute(scanPos, 3));
  scanGeo.setAttribute('color', new THREE.BufferAttribute(scanColors, 3));
  const scanMat = new THREE.PointsMaterial({
    size: 0.025,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const scans = new THREE.Points(scanGeo, scanMat);
  group.add(scans);

  // ── Digital rain particles ──
  const RAIN_COUNT = 100;
  const rainPos = new Float32Array(RAIN_COUNT * 3);
  const rainSpeed = new Float32Array(RAIN_COUNT);
  for (let i = 0; i < RAIN_COUNT; i++) {
    rainPos[i * 3] = (Math.random() - 0.5) * 6;
    rainPos[i * 3 + 1] = (Math.random() - 0.5) * 6;
    rainPos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    rainSpeed[i] = 0.5 + Math.random() * 1.5;
  }
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rainMat = new THREE.PointsMaterial({
    size: 0.015,
    color: 0x00ff88,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
  });
  const rain = new THREE.Points(rainGeo, rainMat);
  group.add(rain);

  const targetZ = size.width < 500 ? 7.5 : 6;

  // ── Bloom ──
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.5, 0.3, 0.85);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  return {
    animate: (time, mouseX, mouseY, clickedAt) => {
      const t = time * 0.001;
      const clickElapsed = clickedAt > 0 ? (time - clickedAt) * 0.001 : 99;
      const isShock = clickElapsed < 3.0;
      const shock = isShock ? easeOutCubic(1 - clickElapsed / 3.0) : 0;
      const hover = clamp(Math.abs(mouseX) + Math.abs(mouseY));

      // ── Camera ──
      const z = isShock ? targetZ + shock * 3 : targetZ + Math.sin(t * 0.3) * 0.1;
      camera.position.z = lerp(camera.position.z, z, 0.05);
      camera.position.x = lerp(camera.position.x, mouseX * 0.5, 0.02);
      camera.position.y = lerp(camera.position.y, -mouseY * 0.5, 0.02);
      camera.lookAt(0, 0, 0);

      // ── Group ──
      const speedMult = isShock ? 2 + shock * 5 : 1 + hover * 2;
      group.rotation.x = mouseY * 0.1 * speedMult * 0.3;
      group.rotation.y = t * 0.15 * speedMult + mouseX * 0.15;

      // ── Sphere ──
      sphereMat.opacity = 0.1 + Math.sin(t * 2) * 0.05 + hover * 0.08;
      sphereMat.emissiveIntensity = isShock ? 0.5 + shock * 3 : 0.15 + hover * 0.5;
      const sp = isShock ? 1 + Math.sin(t * 40) * 0.06 * shock : 1;
      sphere.scale.set(sp, sp, sp);
      sphere.rotation.x = t * 0.1;
      sphere.rotation.z = t * 0.05;

      // ── Rings ──
      ringList.forEach((ring, i) => {
        const rs = isShock ? 0.05 * ring.speed + shock * 0.2 : 0.008 * ring.speed * (1 + hover * 4);
        ring.mesh.rotation.x += rs;
        ring.mesh.rotation.y += rs * 0.3;
        const expand = isShock ? 1 + shock * 3.5 * (i + 1) * 0.3 : 1;
        ring.mesh.scale.set(expand, expand, expand);
        const mat = ring.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = isShock ? Math.max(0, 0.15 - shock * 0.3) : 0.1 + hover * 0.12;
        mat.color.setHSL(0.35 + i * 0.04 + Math.sin(t * 0.3 + i) * 0.02, 0.9, 0.4 + hover * 0.3);
      });

      // ── Pulse ──
      const ps = isShock ? 1 + shock * 5 + Math.sin(t * 30) * 0.3 * shock : 1 + Math.sin(t * 2.5) * 0.4 + hover * 0.3;
      pulse.scale.set(ps, ps, ps);
      pulseMat.opacity = isShock ? 0.5 + Math.sin(t * 40) * 0.3 : 0.2 + Math.sin(t * 2.5) * 0.2 + hover * 0.2;

      // ── Shockwave ──
      if (isShock) {
        const ws = 1 + shock * 8;
        shockMesh.scale.set(ws, ws, ws);
        shockMat.opacity = shock * 0.9;
      } else {
        shockMesh.scale.set(1, 1, 1);
        shockMat.opacity = 0;
      }

      // ── Scanning particles ──
      const spPos = scanGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < SCAN_COUNT; i++) {
        const i3 = i * 3;
        if (isShock) {
          const dir = new THREE.Vector3(scanBase[i3], scanBase[i3 + 1], scanBase[i3 + 2]).normalize();
          const dist = 2 + shock * 6;
          spPos[i3] = dir.x * dist;
          spPos[i3 + 1] = dir.y * dist;
          spPos[i3 + 2] = dir.z * dist;
        } else {
          const a = t * 0.3 + i * 0.05;
          spPos[i3] = scanBase[i3] + Math.sin(a) * 0.3 + mouseX * 0.2;
          spPos[i3 + 1] = scanBase[i3 + 1] + Math.cos(a * 0.7) * 0.3 + mouseY * 0.2;
          spPos[i3 + 2] = scanBase[i3 + 2] + Math.sin(t * 0.2 + i) * 0.2;
        }
      }
      scanGeo.attributes.position.needsUpdate = true;
      scanMat.size = isShock ? 0.02 + shock * 0.08 : 0.025 + hover * 0.02;

      // ── Rain ──
      const rPos = rainGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < RAIN_COUNT; i++) {
        rPos[i * 3 + 1] -= rainSpeed[i] * 0.01;
        if (rPos[i * 3 + 1] < -3) rPos[i * 3 + 1] = 3;
        rPos[i * 3] += mouseX * 0.002;
      }
      rainGeo.attributes.position.needsUpdate = true;

      // ── Bloom ──
      bloom.strength = isShock ? 0.5 + shock * 2 : 0.4 + hover * 0.3 + Math.sin(t * 0.8) * 0.05;
    },
    cleanup: () => {
      sphereMat.dispose(); sphereGeo.dispose();
      (wireSphere.material as THREE.Material).dispose();
      pulseGeo.dispose(); pulseMat.dispose();
      shockGeo.dispose(); shockMat.dispose();
      ringList.forEach((r) => { r.mesh.geometry.dispose(); (r.mesh.material as THREE.Material).dispose(); });
      scanGeo.dispose(); scanMat.dispose();
      rainGeo.dispose(); rainMat.dispose();
    },
    composer,
  };
};

// ─── Scene 3: Agent Loops ─── Neural Rings ───────────────────────────────
// Concentric neuron rings with structured connections, data pulses, and
// a powerful cascade-on-click effect. Clean geometric neural topology.

export const setupAgentLoops: SceneSetupFn = (scene, camera, size, renderer) => {
  scene.background = new THREE.Color(0x050508);

  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);
  const blueLight = new THREE.DirectionalLight(0x6699ff, 2.0);
  blueLight.position.set(3, 5, 6);
  scene.add(blueLight);
  const purpleLight = new THREE.DirectionalLight(0x8844ff, 1.0);
  purpleLight.position.set(-3, -2, -5);
  scene.add(purpleLight);

  const group = new THREE.Group();
  scene.add(group);

  // ── Ring definitions ──
  // 5 concentric neuron rings at increasing radii, each tilted differently.
  const RING_COUNT = 5;
  const NODES_PER_RING = 8;
  const ringDefs = [
    { radius: 0.8,  hue: 0.55, tiltX: 0.0,   tiltZ: 0.0   },
    { radius: 1.3,  hue: 0.60, tiltX: 0.25,  tiltZ: 0.15  },
    { radius: 1.8,  hue: 0.65, tiltX: 0.0,   tiltZ: 0.3   },
    { radius: 2.3,  hue: 0.70, tiltX: -0.2,  tiltZ: 0.1   },
    { radius: 2.8,  hue: 0.75, tiltX: 0.15,  tiltZ: -0.2  },
  ] as const;

  // ── Helper: evenly-spaced points on a ring ──
  const ringPos = (r: number, yOff: number, tiltX: number, tiltZ: number) => {
    const out: { pos: THREE.Vector3; angle: number }[] = [];
    for (let i = 0; i < NODES_PER_RING; i++) {
      const a = (i / NODES_PER_RING) * Math.PI * 2;
      const p = new THREE.Vector3(Math.cos(a) * r, yOff, Math.sin(a) * r);
      p.applyAxisAngle(new THREE.Vector3(1, 0, 0), tiltX);
      p.applyAxisAngle(new THREE.Vector3(0, 0, 1), tiltZ);
      out.push({ pos: p, angle: a });
    }
    return out;
  };

  type NeurInfo = { mesh: THREE.Mesh; basePos: THREE.Vector3; offset: THREE.Vector3; hue: number; ringIdx: number; nodeIdx: number };
  const nodes: NeurInfo[] = [];
  const ringMeshes: THREE.Mesh[] = [];
  const connections: { line: THREE.Line; a: number; b: number }[] = [];

  // ── Build rings & nodes ──
  ringDefs.forEach((rd, ri) => {
    const r = rd.radius;
    const hue = rd.hue;
    const col = new THREE.Color().setHSL(hue, 0.7, 0.3);

    // Ring loop (torus)
    const torusGeo = new THREE.TorusGeometry(r, 0.015, 10, 64);
    const torusMat = new THREE.MeshPhysicalMaterial({
      color: col,
      emissive: new THREE.Color().setHSL(hue, 0.8, 0.3),
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.2 + ri * 0.04,
      metalness: 0.5,
      roughness: 0.2,
    });
    const ringMesh = new THREE.Mesh(torusGeo, torusMat);
    ringMesh.rotation.x = Math.PI / 2 + rd.tiltX;
    ringMesh.rotation.z = rd.tiltZ;
    group.add(ringMesh);
    ringMeshes.push(ringMesh);

    // Nodes on this ring
    const positions = ringPos(r, 0, rd.tiltX, rd.tiltZ);
    positions.forEach((p, ni) => {
      const sz = 0.06 + (RING_COUNT - ri) * 0.015;
      const nodeHue = hue + ni * 0.01;
      const nodeCol = new THREE.Color().setHSL(nodeHue, 0.9, 0.55);
      const mat = new THREE.MeshPhysicalMaterial({
        color: nodeCol,
        emissive: nodeCol,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.9,
        metalness: 0.2,
        roughness: 0.15,
      });
      const geo = new THREE.SphereGeometry(sz, 10, 10);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(p.pos);
      group.add(mesh);

      nodes.push({
        mesh,
        basePos: p.pos.clone(),
        offset: new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5
        ),
        hue: nodeHue,
        ringIdx: ri,
        nodeIdx: ni,
      });
    });
  });

  // ── Build connections ──
  for (let ri = 0; ri < RING_COUNT; ri++) {
    const ringN = nodes.filter((n) => n.ringIdx === ri);
    for (let i = 0; i < ringN.length; i++) {
      const a = nodes.indexOf(ringN[i]);
      const b = nodes.indexOf(ringN[(i + 1) % ringN.length]);
      const geo = new THREE.BufferGeometry().setFromPoints([ringN[i].basePos, ringN[(i + 1) % ringN.length].basePos]);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(ringDefs[ri].hue, 0.6, 0.5),
        transparent: true,
        opacity: 0.04,
      });
      const line = new THREE.Line(geo, mat);
      group.add(line);
      connections.push({ line, a, b });
    }
  }
  for (let ri = 0; ri < RING_COUNT - 1; ri++) {
    const lower = nodes.filter((n) => n.ringIdx === ri);
    const upper = nodes.filter((n) => n.ringIdx === ri + 1);
    for (let i = 0; i < Math.min(lower.length, upper.length); i++) {
      const a = nodes.indexOf(lower[i]);
      const b = nodes.indexOf(upper[i]);
      const geo = new THREE.BufferGeometry().setFromPoints([lower[i].basePos, upper[i].basePos]);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL((ringDefs[ri].hue + ringDefs[ri + 1].hue) / 2, 0.5, 0.45),
        transparent: true,
        opacity: 0.03,
      });
      const line = new THREE.Line(geo, mat);
      group.add(line);
      connections.push({ line, a, b });
    }
  }

  // ── Central pulsating core ──
  const coreGeo = new THREE.SphereGeometry(0.2, 16, 16);
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: 0x6699ff,
    emissive: 0x6699ff,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.7,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // ── Wireframe icosahedron shell ──
  const icoGeo = new THREE.IcosahedronGeometry(3.3, 0);
  const icoEdge = new THREE.EdgesGeometry(icoGeo);
  const icoMat = new THREE.LineBasicMaterial({
    color: 0x4466aa,
    transparent: true,
    opacity: 0.03,
  });
  const icoWire = new THREE.LineSegments(icoEdge, icoMat);
  group.add(icoWire);

  // ── Data pulse particles ──
  const PULSE_COUNT = 60;
  const pulsePos = new Float32Array(PULSE_COUNT * 3);
  const pulseCol = new Float32Array(PULSE_COUNT * 3);
  const pulseData: { connIdx: number; progress: number; speed: number; hue: number }[] = [];
  for (let i = 0; i < PULSE_COUNT; i++) {
    const ci = Math.floor(Math.random() * connections.length);
    const h = 0.55 + Math.random() * 0.25;
    pulseData.push({ connIdx: ci, progress: Math.random(), speed: 0.2 + Math.random() * 0.4, hue: h });
    const c = new THREE.Color().setHSL(h, 0.9, 0.7);
    pulseCol[i * 3] = c.r;
    pulseCol[i * 3 + 1] = c.g;
    pulseCol[i * 3 + 2] = c.b;
  }
  const pulseGeo = new THREE.BufferGeometry();
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
  pulseGeo.setAttribute('color', new THREE.BufferAttribute(pulseCol, 3));
  const pulseMat = new THREE.PointsMaterial({
    size: 0.03,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const pulses = new THREE.Points(pulseGeo, pulseMat);
  group.add(pulses);

  // ── Orbital energy mist ──
  const MIST_COUNT = 150;
  const mistPos = new Float32Array(MIST_COUNT * 3);
  const mistCol = new Float32Array(MIST_COUNT * 3);
  const mistData: { radius: number; speed: number; phase: number; yOff: number; hue: number }[] = [];
  for (let i = 0; i < MIST_COUNT; i++) {
    const r = 1 + Math.random() * 3;
    const a = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 4;
    const h = 0.5 + Math.random() * 0.3;
    mistPos[i * 3] = Math.cos(a) * r;
    mistPos[i * 3 + 1] = y;
    mistPos[i * 3 + 2] = Math.sin(a) * r;
    const c = new THREE.Color().setHSL(h, 0.8, 0.5);
    mistCol[i * 3] = c.r;
    mistCol[i * 3 + 1] = c.g;
    mistCol[i * 3 + 2] = c.b;
    mistData.push({ radius: r, speed: 0.08 + Math.random() * 0.15, phase: a, yOff: y, hue: h });
  }
  const mistGeo = new THREE.BufferGeometry();
  mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
  mistGeo.setAttribute('color', new THREE.BufferAttribute(mistCol, 3));
  const mistMat = new THREE.PointsMaterial({
    size: 0.018,
    vertexColors: true,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const mist = new THREE.Points(mistGeo, mistMat);
  group.add(mist);

  // ── Burst particles ──
  const BURST_COUNT = 250;
  const burstPos = new Float32Array(BURST_COUNT * 3);
  const burstVel = new Float32Array(BURST_COUNT * 3);
  for (let i = 0; i < BURST_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const spd = 0.1 + Math.random() * 0.25;
    burstVel[i * 3] = Math.sin(phi) * Math.cos(theta) * spd;
    burstVel[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * spd;
    burstVel[i * 3 + 2] = Math.cos(phi) * spd;
  }
  const burstGeo = new THREE.BufferGeometry();
  burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPos, 3));
  const burstMat = new THREE.PointsMaterial({
    size: 0.04,
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });
  const burst = new THREE.Points(burstGeo, burstMat);
  group.add(burst);

  const targetZ = size.width < 500 ? 8 : 6.5;

  // ── Bloom ──
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.5, 0.3, 0.85);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  return {
    animate: (time, mouseX, mouseY, clickedAt) => {
      const t = time * 0.001;
      const clickElapsed = clickedAt > 0 ? (time - clickedAt) * 0.001 : 99;
      const isCascade = clickElapsed < 2.5;
      const cascade = isCascade ? easeOutElastic(1 - clickElapsed / 2.5) : 0;
      const hover = clamp(Math.abs(mouseX) + Math.abs(mouseY));

      // ── Camera ──
      const z = isCascade ? targetZ + cascade * 2 : targetZ + Math.sin(t * 0.3) * 0.1;
      camera.position.z = lerp(camera.position.z, z, 0.05);
      camera.position.x = lerp(camera.position.x, mouseX * 0.35, 0.02);
      camera.position.y = lerp(camera.position.y, -mouseY * 0.35, 0.02);
      camera.lookAt(0, 0, 0);

      // ── Group rotation ──
      const spin = isCascade ? 0.3 + cascade * 2 : 0.1 + hover * 0.05;
      group.rotation.x = Math.sin(t * 0.05) * 0.03 + mouseY * 0.03;
      group.rotation.y = t * spin + mouseX * 0.04;

      // ── Ring loops ──
      ringMeshes.forEach((rm, ri) => {
        const rd = ringDefs[ri];
        const s = isCascade ? 1 + cascade * 1.5 * (1 - ri / RING_COUNT) : 1 + Math.sin(t * 0.3 + ri) * 0.015;
        rm.scale.set(s, s, s);
        const mat = rm.material as THREE.MeshPhysicalMaterial;
        mat.emissiveIntensity = isCascade ? 0.3 + cascade * 3 : 0.2 + hover * 0.25 + Math.sin(t * 0.4 + ri) * 0.05;
        mat.opacity = isCascade ? (0.2 + ri * 0.04) - cascade * 0.15 : 0.2 + ri * 0.04 + hover * 0.04;
      });

      // ── Nodes ──
      nodes.forEach((node, i) => {
        const mat = node.mesh.material as THREE.MeshPhysicalMaterial;
        if (isCascade) {
          const ringDelay = (RING_COUNT - 1 - node.ringIdx) / RING_COUNT * 0.4;
          const nodeOffset = node.nodeIdx / NODES_PER_RING * 0.1;
          const delay = ringDelay + nodeOffset;
          const phase = clamp((cascade - delay) / (1 - delay));
          const dir = node.offset.clone().normalize();
          const dist = 0.5 + phase * 4;
          node.mesh.position.x = node.basePos.x + dir.x * dist;
          node.mesh.position.y = node.basePos.y + dir.y * dist;
          node.mesh.position.z = node.basePos.z + dir.z * dist;
          const sc = 1 + phase * 2;
          node.mesh.scale.set(sc, sc, sc);
          const flashCol = new THREE.Color().setHSL(node.hue + cascade * 0.15, 0.9, 0.5 + phase * 0.4);
          mat.color.copy(flashCol);
          mat.emissive.copy(flashCol);
          mat.emissiveIntensity = 0.6 + phase * 5;
          mat.opacity = 0.9 - phase * 0.3;
        } else {
          const hPull = 0.12 + hover * 0.12;
          node.mesh.position.x = node.basePos.x + mouseX * hPull + Math.sin(t * 0.2 + i * 0.5) * 0.03;
          node.mesh.position.y = node.basePos.y + Math.sin(t * 0.25 + i * 0.3) * 0.03 + mouseY * hPull;
          node.mesh.position.z = node.basePos.z + Math.sin(t * 0.15 + i * 0.7) * 0.03;
          node.mesh.scale.set(1, 1, 1);
          const pulseHue = node.hue + Math.sin(t * 0.2 + i) * 0.02;
          const pulseCol = new THREE.Color().setHSL(pulseHue, 0.8, 0.5 + hover * 0.15);
          mat.color.copy(pulseCol);
          mat.emissive.copy(pulseCol);
          mat.emissiveIntensity = 0.4 + hover * 0.5 + Math.sin(t + i * 0.5) * 0.1;
          mat.opacity = 0.85 + hover * 0.1;
        }
      });

      // ── Connections ──
      connections.forEach((conn, ci) => {
        const pA = nodes[conn.a].mesh.position;
        const pB = nodes[conn.b].mesh.position;
        const pos = conn.line.geometry.attributes.position;
        pos.setXYZ(0, pA.x, pA.y, pA.z);
        pos.setXYZ(1, pB.x, pB.y, pB.z);
        pos.needsUpdate = true;
        const mat = conn.line.material as THREE.LineBasicMaterial;
        if (isCascade) {
          mat.opacity = 0.04 + cascade * 0.6;
          mat.color.setHSL(0.6 + cascade * 0.15, 0.9, 0.4 + cascade * 0.5);
        } else {
          mat.opacity = 0.03 + Math.sin(t * 0.4 + ci) * 0.02 + hover * 0.03;
        }
      });

      // ── Central core ──
      const cPulse = isCascade ? 1 + Math.sin(t * 30) * 0.8 * cascade : 1 + Math.sin(t * 3) * 0.15 + hover * 0.1;
      core.scale.setScalar(cPulse);
      coreMat.opacity = isCascade ? 0.3 + cascade * 0.6 : 0.5 + Math.sin(t * 2) * 0.1 + hover * 0.1;
      coreMat.emissiveIntensity = isCascade ? 0.5 + cascade * 4 : 0.6 + hover * 0.4 + Math.sin(t * 2) * 0.1;

      // ── Icosahedron shell ──
      icoWire.rotation.x = t * 0.03;
      icoWire.rotation.y = t * 0.04;
      icoMat.opacity = isCascade ? 0.03 + cascade * 0.2 : 0.025 + Math.sin(t * 0.15) * 0.01 + hover * 0.01;

      // ── Pulse particles ──
      const pPos = pulseGeo.attributes.position.array as Float32Array;
      pulseData.forEach((pd, i) => {
        if (isCascade) {
          const a = t * 3 + pd.connIdx;
          const r = 0.5 + cascade * 6;
          pPos[i * 3] = Math.cos(a + i * 0.1) * r;
          pPos[i * 3 + 1] = Math.sin(a * 1.2) * r * 0.5;
          pPos[i * 3 + 2] = Math.sin(a * 0.8 + i * 0.1) * r;
        } else {
          pd.progress += pd.speed * 0.005 * (1 + hover);
          if (pd.progress >= 1) {
            pd.progress = 0;
            pd.connIdx = Math.floor(Math.random() * connections.length);
          }
          const conn = connections[pd.connIdx];
          if (!conn) return;
          const p1 = nodes[conn.a].mesh.position;
          const p2 = nodes[conn.b].mesh.position;
          pPos[i * 3] = lerp(p1.x, p2.x, pd.progress);
          pPos[i * 3 + 1] = lerp(p1.y, p2.y, pd.progress);
          pPos[i * 3 + 2] = lerp(p1.z, p2.z, pd.progress);
        }
      });
      pulseGeo.attributes.position.needsUpdate = true;
      pulseMat.opacity = isCascade ? 0.3 + cascade * 0.5 : 0.5 + hover * 0.15;
      pulseMat.size = isCascade ? 0.03 + cascade * 0.06 : 0.03;

      // ── Mist particles ──
      const mPos = mistGeo.attributes.position.array as Float32Array;
      mistData.forEach((md, i) => {
        const a = t * md.speed + md.phase;
        if (isCascade) {
          const r = md.radius + cascade * 3;
          mPos[i * 3] = Math.cos(a + cascade) * r;
          mPos[i * 3 + 1] = md.yOff + Math.sin(a * 2 + cascade * 2) * r * 0.2;
          mPos[i * 3 + 2] = Math.sin(a + cascade) * r;
        } else {
          mPos[i * 3] = Math.cos(a) * md.radius + mouseX * 0.2;
          mPos[i * 3 + 1] = md.yOff + Math.sin(a * 1.3) * 0.2 + mouseY * 0.2;
          mPos[i * 3 + 2] = Math.sin(a) * md.radius;
        }
      });
      mistGeo.attributes.position.needsUpdate = true;
      mistMat.opacity = isCascade ? 0.1 + cascade * 0.4 : 0.2 + hover * 0.08;

      // ── Burst particles ──
      const bPos = burstGeo.attributes.position.array as Float32Array;
      if (isCascade) {
        burstMat.opacity = cascade * 0.8;
        for (let i = 0; i < BURST_COUNT; i++) {
          const i3 = i * 3;
          bPos[i3] += burstVel[i3] * cascade * 3;
          bPos[i3 + 1] += burstVel[i3 + 1] * cascade * 3;
          bPos[i3 + 2] += burstVel[i3 + 2] * cascade * 3;
        }
      } else {
        burstMat.opacity *= 0.95;
        for (let i = 0; i < BURST_COUNT; i++) {
          bPos[i * 3] *= 0.95;
          bPos[i * 3 + 1] *= 0.95;
          bPos[i * 3 + 2] *= 0.95;
        }
      }
      burstGeo.attributes.position.needsUpdate = true;

      // ── Bloom ──
      bloom.strength = isCascade ? 0.5 + cascade * 2.5 : 0.4 + hover * 0.25;
    },
    cleanup: () => {
      ringMeshes.forEach((rm) => { rm.geometry.dispose(); (rm.material as THREE.Material).dispose(); });
      nodes.forEach((n) => { n.mesh.geometry.dispose(); (n.mesh.material as THREE.Material).dispose(); });
      connections.forEach((c) => { c.line.geometry.dispose(); (c.line.material as THREE.Material).dispose(); });
      core.geometry.dispose(); coreMat.dispose();
      icoGeo.dispose(); icoWire.geometry.dispose(); icoMat.dispose();
      pulseGeo.dispose(); pulseMat.dispose();
      mistGeo.dispose(); mistMat.dispose();
      burstGeo.dispose(); burstMat.dispose();
    },
    composer,
  };
};

// ─── Scene 4: Algorithmic Base ─── Binary Tree Network ────────────────────
// A dramatic 4-level binary tree with vibrant nodes, level separator rings,
// central axis beam, dual orbital rings per node, flow particles, and a
// powerful tree-cascade click effect. Gold→cyan color gradient.

export const setupAlgorithmicBase: SceneSetupFn = (scene, camera, size, renderer) => {
  scene.background = new THREE.Color(0x050508);

  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffeedd, 2.5);
  dirLight.position.set(5, 7, 6);
  scene.add(dirLight);
  const backLight = new THREE.DirectionalLight(0x4488ff, 1.0);
  backLight.position.set(-3, -1, -5);
  scene.add(backLight);

  const group = new THREE.Group();
  scene.add(group);

  // ── Tree structure ──
  // 15 nodes across 4 levels: gold root → warm amber → teal → cyan leaves
  const treeData = [
    { level: 0, idxIn: 0, val: 'MAX' },
    { level: 1, idxIn: 0, val: '84' }, { level: 1, idxIn: 1, val: '62' },
    { level: 2, idxIn: 0, val: '42' }, { level: 2, idxIn: 1, val: '18' },
    { level: 2, idxIn: 2, val: '31' }, { level: 2, idxIn: 3, val: '27' },
    { level: 3, idxIn: 0, val: '12' }, { level: 3, idxIn: 1, val: '08' },
    { level: 3, idxIn: 2, val: '15' }, { level: 3, idxIn: 3, val: '06' },
    { level: 3, idxIn: 4, val: '22' }, { level: 3, idxIn: 5, val: '09' },
    { level: 3, idxIn: 6, val: '14' }, { level: 3, idxIn: 7, val: '05' },
  ] as const;

  const levelH = 0.7;
  const baseW = 3.0;

  // Parent-child connections
  const pairs: [number, number][] = [
    [0, 1], [0, 2],
    [1, 3], [1, 4], [2, 5], [2, 6],
    [3, 7], [3, 8], [4, 9], [4, 10], [5, 11], [5, 12], [6, 13], [6, 14],
  ];

  // ── Node type ──
  interface TreeNode {
    basePos: THREE.Vector3;
    offset: THREE.Vector3;
    mesh: THREE.Mesh;
    ring1: THREE.Mesh;
    ring2: THREE.Mesh;
    glow: THREE.Mesh;
    level: number;
    val: string;
    isRoot: boolean;
    hue: number;
    sz: number;
  }
  const nodes: TreeNode[] = [];
  const lines: THREE.Line[] = [];

  // ── Floating level separator rings ──
  const levelRings: THREE.Mesh[] = [];
  const levelColors = [0xff8844, 0xffaa44, 0x44ccaa, 0x44ddff];
  for (let lvl = 0; lvl < 4; lvl++) {
    const y = lvl * -levelH + 1.0;
    const r = 1.0 + lvl * 0.15;
    const geo = new THREE.TorusGeometry(r, 0.008, 6, 48);
    const mat = new THREE.MeshBasicMaterial({
      color: levelColors[lvl],
      transparent: true,
      opacity: 0.035,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = y;
    mesh.rotation.x = Math.PI / 2;
    group.add(mesh);
    levelRings.push(mesh);
  }

  // ── Central axis beam ──
  const axisHeight = 2.4;
  const axisGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 1.3, 0),
    new THREE.Vector3(0, -1.1, 0),
  ]);
  const axisMat = new THREE.LineBasicMaterial({
    color: 0x5599cc,
    transparent: true,
    opacity: 0.04,
  });
  const axisLine = new THREE.Line(axisGeo, axisMat);
  group.add(axisLine);

  // ── Build tree nodes ──
  treeData.forEach((item, i) => {
    const cnt = Math.pow(2, item.level);
    const w = baseW * Math.pow(0.55, item.level);
    const x = (item.idxIn / (cnt - 1 || 1)) * w - w / 2;
    const y = -item.level * levelH + 1.0;
    const z = (item.idxIn % 2 === 0 ? -1 : 1) * item.level * 0.08;

    const pos = new THREE.Vector3(x, y, z);
    const isRoot = i === 0;

    // Node size: root large, diminishing down
    const sz = isRoot ? 0.42 : 0.28 - item.level * 0.04;

    // Color: gold root → warm amber → teal → cyan leaves
    const hue = 0.10 + item.level * 0.12;
    const lightness = isRoot ? 0.55 : 0.45 - item.level * 0.03;
    const baseCol = new THREE.Color().setHSL(hue, 0.8, lightness);

    // Core sphere — bigger, more emissive
    const geo = new THREE.SphereGeometry(sz, 24, 24);
    const mat = new THREE.MeshPhysicalMaterial({
      color: baseCol,
      emissive: new THREE.Color().setHSL(hue, 0.9, lightness * 0.8),
      emissiveIntensity: isRoot ? 0.6 : 0.35,
      transparent: true,
      opacity: isRoot ? 0.75 : 0.55,
      metalness: 0.3,
      roughness: 0.15,
      clearcoat: 0.2,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    group.add(mesh);

    // Inner glow (additive sphere)
    const gGeo = new THREE.SphereGeometry(sz * 0.6, 10, 10);
    const gMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.9, lightness),
      transparent: true,
      opacity: isRoot ? 0.6 : 0.35,
      blending: THREE.AdditiveBlending,
    });
    const gMesh = new THREE.Mesh(gGeo, gMat);
    gMesh.position.copy(pos);
    group.add(gMesh);

    // Orbital ring 1 (horizontal)
    const ring1Geo = new THREE.TorusGeometry(sz * 1.8, 0.012, 8, 32);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.7, 0.6),
      transparent: true,
      opacity: isRoot ? 0.3 : 0.15,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.position.copy(pos);
    group.add(ring1);

    // Orbital ring 2 (tilted)
    const ring2Geo = new THREE.TorusGeometry(sz * 1.5, 0.01, 8, 32);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue + 0.1, 0.7, 0.5),
      transparent: true,
      opacity: isRoot ? 0.2 : 0.1,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.position.copy(pos);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.z = Math.PI / 4;
    group.add(ring2);

    nodes.push({
      basePos: pos.clone(),
      offset: new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 5
      ),
      mesh,
      ring1,
      ring2,
      glow: gMesh,
      level: item.level,
      val: item.val,
      isRoot,
      hue,
      sz,
    });
  });

  // ── Tree connections (parent→child) ──
  // Also create data-bus connections between siblings at same level
  const siblingLines: THREE.Line[] = [];
  pairs.forEach(([pIdx, cIdx]) => {
    const lvl = nodes[pIdx].level;
    const hue = 0.10 + lvl * 0.12;
    const edgeCol = new THREE.Color().setHSL(hue, 0.6, 0.45);
    const geo = new THREE.BufferGeometry().setFromPoints([nodes[pIdx].mesh.position, nodes[cIdx].mesh.position]);
    const mat = new THREE.LineBasicMaterial({ color: edgeCol, transparent: true, opacity: 0.08 });
    const line = new THREE.Line(geo, mat);
    group.add(line);
    lines.push(line);
  });

  // ── Sibling data-bus connections ──
  for (let lvl = 1; lvl <= 2; lvl++) {
    const lvlNodes = nodes.filter((n) => n.level === lvl).sort((a, b) => a.basePos.x - b.basePos.x);
    for (let i = 0; i < lvlNodes.length - 1; i += 2) {
      const geo = new THREE.BufferGeometry().setFromPoints([lvlNodes[i].mesh.position, lvlNodes[i + 1].mesh.position]);
      const mat = new THREE.LineBasicMaterial({
        color: 0x4488aa,
        transparent: true,
        opacity: 0.03,
      });
      const line = new THREE.Line(geo, mat);
      group.add(line);
      siblingLines.push(line);
    }
  }

  // ── Flow particles (100) ──
  const ALL_EDGES = [...pairs];
  const FLOW_COUNT = 100;
  const flowPos = new Float32Array(FLOW_COUNT * 3);
  const flowColArr = new Float32Array(FLOW_COUNT * 3);
  const flowData: { edgeIdx: number; progress: number; speed: number; hue: number; reverse: boolean }[] = [];
  for (let i = 0; i < FLOW_COUNT; i++) {
    const ei = Math.floor(Math.random() * ALL_EDGES.length);
    const h = 0.08 + Math.random() * 0.35;
    flowData.push({
      edgeIdx: ei,
      progress: Math.random(),
      speed: 0.15 + Math.random() * 0.35,
      hue: h,
      reverse: Math.random() > 0.5,
    });
    const c = new THREE.Color().setHSL(h, 0.9, 0.7);
    flowColArr[i * 3] = c.r;
    flowColArr[i * 3 + 1] = c.g;
    flowColArr[i * 3 + 2] = c.b;
  }
  const flowGeo = new THREE.BufferGeometry();
  flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3));
  flowGeo.setAttribute('color', new THREE.BufferAttribute(flowColArr, 3));
  const flowMat = new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const flowPoints = new THREE.Points(flowGeo, flowMat);
  group.add(flowPoints);

  // ── Burst particles (60) ──
  const BURST_COUNT = 60;
  const burstPos = new Float32Array(BURST_COUNT * 3);
  const burstVel = new Float32Array(BURST_COUNT * 3);
  for (let i = 0; i < BURST_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const spd = 0.06 + Math.random() * 0.18;
    burstVel[i * 3] = Math.sin(phi) * Math.cos(theta) * spd;
    burstVel[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * spd;
    burstVel[i * 3 + 2] = Math.cos(phi) * spd;
  }
  const burstGeo = new THREE.BufferGeometry();
  burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPos, 3));
  const burstMat = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xffddaa,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });
  const burst = new THREE.Points(burstGeo, burstMat);
  group.add(burst);

  // ── Ambient star particles (400) ──
  const AMB_COUNT = 400;
  const ambPos = new Float32Array(AMB_COUNT * 3);
  const ambColors = new Float32Array(AMB_COUNT * 3);
  for (let i = 0; i < AMB_COUNT; i++) {
    ambPos[i * 3] = (Math.random() - 0.5) * 8;
    ambPos[i * 3 + 1] = (Math.random() - 0.5) * 6;
    ambPos[i * 3 + 2] = (Math.random() - 0.5) * 7;
    const h = 0.08 + Math.random() * 0.35;
    const c = new THREE.Color().setHSL(h, 0.6, 0.4);
    ambColors[i * 3] = c.r;
    ambColors[i * 3 + 1] = c.g;
    ambColors[i * 3 + 2] = c.b;
  }
  const ambGeo = new THREE.BufferGeometry();
  ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));
  ambGeo.setAttribute('color', new THREE.BufferAttribute(ambColors, 3));
  const ambMat = new THREE.PointsMaterial({
    size: 0.012,
    vertexColors: true,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const amb = new THREE.Points(ambGeo, ambMat);
  group.add(amb);

  // ── Wireframe dodecahedron shell ──
  const dodecGeo = new THREE.DodecahedronGeometry(3.2);
  const dodecEdge = new THREE.EdgesGeometry(dodecGeo);
  const dodecMat = new THREE.LineBasicMaterial({
    color: 0x4488cc,
    transparent: true,
    opacity: 0.04,
  });
  const dodecWire = new THREE.LineSegments(dodecEdge, dodecMat);
  group.add(dodecWire);

  const targetZ = size.width < 500 ? 6.5 : 4.8;

  // ── Bloom ──
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.45, 0.3, 0.85);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  return {
    animate: (time, mouseX, mouseY, clickedAt) => {
      const t = time * 0.001;
      const clickElapsed = clickedAt > 0 ? (time - clickedAt) * 0.001 : 99;
      const isCascade = clickElapsed < 2.8;
      const cascade = isCascade ? easeOutElastic(1 - clickElapsed / 2.8) : 0;
      const hover = clamp(Math.abs(mouseX) + Math.abs(mouseY));

      // ── Camera ──
      const z = isCascade ? targetZ + cascade * 2.8 : targetZ + Math.sin(t * 0.3) * 0.08;
      camera.position.z = lerp(camera.position.z, z, 0.05);
      camera.position.x = lerp(camera.position.x, mouseX * 0.35, 0.02);
      camera.position.y = lerp(camera.position.y, -mouseY * 0.35, 0.02);
      camera.lookAt(0, 0, 0);

      // ── Group rotation ──
      const spin = isCascade ? 0.15 + cascade * 2.5 : 0.06 + hover * 0.05;
      group.rotation.x = Math.sin(t * 0.04) * 0.04 + mouseY * 0.04;
      group.rotation.y = t * spin + mouseX * 0.05 * (1 + hover);

      // ── Level separator rings ──
      levelRings.forEach((lr, i) => {
        const speed = isCascade ? 0.03 + cascade * 0.5 : 0.008 + hover * 0.015;
        lr.rotation.z += speed * (i % 2 === 0 ? 1 : -1);
        const mat = lr.material as THREE.MeshBasicMaterial;
        mat.opacity = isCascade ? 0.035 + cascade * 0.25 : 0.025 + hover * 0.03 + Math.sin(t * 0.2 + i) * 0.01;
      });

      // ── Central axis ──
      axisMat.opacity = isCascade ? 0.04 + cascade * 0.25 : 0.03 + hover * 0.02;

      // ── Dodecahedron shell ──
      dodecWire.rotation.x = t * 0.04 + cascade * 0.5;
      dodecWire.rotation.y = t * 0.05 + cascade * 0.3;
      dodecMat.opacity = isCascade ? 0.04 + cascade * 0.2 : 0.03 + hover * 0.02 + Math.sin(t * 0.15) * 0.01;

      // ── Nodes ──
      nodes.forEach((node, i) => {
        const mat = node.mesh.material as THREE.MeshPhysicalMaterial;
        const float = Math.sin(t * 0.25 + i * 0.6) * 0.04;
        const sway = Math.sin(t * 0.3 + i) * hover * 0.08;

        if (isCascade) {
          // Ripple cascade: root first, then level-by-level
          const levelDelay = node.level * 0.3;
          const nodeOffset = (i % 2) * 0.06;
          const delay = levelDelay + nodeOffset;
          const phase = clamp((cascade - delay) / (1 - delay + 0.01));

          const dir = node.offset.clone().normalize();
          const dist = 0.8 + phase * 4;
          node.mesh.position.x = node.basePos.x + dir.x * dist;
          node.mesh.position.y = node.basePos.y + dir.y * dist - phase * 0.5;
          node.mesh.position.z = node.basePos.z + dir.z * dist;
          const sc = 1 + phase * 1.5;
          node.mesh.scale.set(sc, sc, sc);

          mat.opacity = (node.isRoot ? 0.75 : 0.55) * (1 - phase * 0.6);
          mat.emissiveIntensity = (node.isRoot ? 0.6 : 0.35) + phase * 4;
          const flashHue = node.hue + phase * 0.15;
          const flashLight = (node.isRoot ? 0.55 : 0.45 - node.level * 0.03) + phase * 0.3;
          const flashCol = new THREE.Color().setHSL(flashHue, 0.9, flashLight);
          mat.color.copy(flashCol);
          mat.emissive.copy(flashCol);

          // Glow follows
          node.glow.position.copy(node.mesh.position);
          const gp = 1 + Math.sin(t * 10 + i) * phase * 0.6;
          node.glow.scale.setScalar(gp);
          const gMat = node.glow.material as THREE.MeshBasicMaterial;
          gMat.opacity = (node.isRoot ? 0.6 : 0.35) * (1 - phase * 0.4);
          gMat.color.setHSL(flashHue, 0.9, flashLight);

          // Rings spin
          node.ring1.position.copy(node.mesh.position);
          node.ring1.rotation.x += 0.1 * (1 + phase * 10);
          node.ring1.rotation.z += 0.05 * (1 + phase * 10);
          const r1m = node.ring1.material as THREE.MeshBasicMaterial;
          r1m.opacity = (node.isRoot ? 0.3 : 0.15) * (1 - phase * 0.5);

          node.ring2.position.copy(node.mesh.position);
          node.ring2.rotation.x += 0.08 * (1 + phase * 8);
          node.ring2.rotation.y += 0.12 * (1 + phase * 8);
          const r2m = node.ring2.material as THREE.MeshBasicMaterial;
          r2m.opacity = (node.isRoot ? 0.2 : 0.1) * (1 - phase * 0.5);
        } else {
          // Normal hover state — tree sways like branches in wind
          const hPullX = hover * 0.15;
          const hPullY = hover * 0.08;
          node.mesh.position.x = node.basePos.x + sway + mouseX * hPullX;
          node.mesh.position.y = node.basePos.y + float + Math.sin(t * 0.15 + i * 0.4) * 0.02 + mouseY * hPullY;
          node.mesh.position.z = node.basePos.z + Math.sin(t * 0.12 + i * 0.8) * 0.03 + mouseX * 0.06;
          node.mesh.scale.set(1, 1, 1);

          mat.opacity = (node.isRoot ? 0.75 : 0.55) + hover * 0.1;
          mat.emissiveIntensity = (node.isRoot ? 0.6 : 0.35) + hover * 0.35;

          // Pulsing color per node
          const pulseHue = node.hue + Math.sin(t * 0.2 + i * 0.5) * 0.02;
          const pulseLight = (node.isRoot ? 0.55 : 0.45 - node.level * 0.03) + hover * 0.1;
          const pulseCol = new THREE.Color().setHSL(pulseHue, 0.8, pulseLight);
          mat.color.copy(pulseCol);
          mat.emissive.copy(new THREE.Color().setHSL(pulseHue, 0.9, pulseLight * 0.8));

          // Glow pulses independently
          node.glow.position.copy(node.mesh.position);
          const gp = 1 + Math.sin(t * 1.5 + i * 1.2) * 0.2;
          node.glow.scale.setScalar(gp);
          const gMat = node.glow.material as THREE.MeshBasicMaterial;
          gMat.opacity = (node.isRoot ? 0.6 : 0.35) + Math.sin(t * 2 + i) * 0.08 + hover * 0.1;

          // Ring 1 orbits (horizontal)
          node.ring1.position.copy(node.mesh.position);
          node.ring1.position.y += Math.sin(t * (0.2 + i * 0.05) + i) * 0.04;
          node.ring1.rotation.x += 0.015 * (1 + hover * 3);
          node.ring1.rotation.z += 0.01 * (1 + hover * 3);
          const r1m = node.ring1.material as THREE.MeshBasicMaterial;
          r1m.opacity = (node.isRoot ? 0.3 : 0.15) + Math.sin(t + i * 0.7) * 0.04 + hover * 0.06;

          // Ring 2 orbits (tilted)
          node.ring2.position.copy(node.mesh.position);
          node.ring2.position.x += Math.cos(t * (0.15 + i * 0.03) + i) * 0.03;
          node.ring2.rotation.x += 0.012 * (1 + hover * 2.5);
          node.ring2.rotation.y += 0.02 * (1 + hover * 2.5);
          const r2m = node.ring2.material as THREE.MeshBasicMaterial;
          r2m.opacity = (node.isRoot ? 0.2 : 0.1) + Math.sin(t * 0.8 + i) * 0.03 + hover * 0.04;
        }
      });

      // ── Connections ──
      lines.forEach((line, idx) => {
        const [pIdx, cIdx] = pairs[idx];
        const p1 = nodes[pIdx].mesh.position;
        const p2 = nodes[cIdx].mesh.position;
        const pos = line.geometry.attributes.position;
        pos.setXYZ(0, p1.x, p1.y, p1.z);
        pos.setXYZ(1, p2.x, p2.y, p2.z);
        pos.needsUpdate = true;
        const mat = line.material as THREE.LineBasicMaterial;
        if (isCascade) {
          const delay = Math.max(nodes[pIdx].level, nodes[cIdx].level) * 0.3;
          const phase = clamp((cascade - delay) / (1 - delay + 0.01));
          mat.opacity = 0.08 * (1 - phase * 0.7) + phase * 0.5;
          mat.color.setHSL(0.12 + cascade * 0.2, 0.8, 0.3 + cascade * 0.5);
        } else {
          mat.opacity = 0.05 + Math.sin(t * 0.5 + idx) * 0.025 + hover * 0.03;
          const connHue = 0.10 + nodes[pIdx].level * 0.12 + Math.sin(t * 0.15 + idx) * 0.02;
          mat.color.setHSL(connHue, 0.6, 0.4 + hover * 0.1);
        }
      });

      // ── Sibling lines ──
      siblingLines.forEach((line, idx) => {
        const pos = line.geometry.attributes.position;
        const mat = line.material as THREE.LineBasicMaterial;
        if (isCascade) {
          mat.opacity = 0.03 + cascade * 0.3;
          mat.color.setHSL(0.12 + cascade * 0.15, 0.7, 0.35 + cascade * 0.3);
        } else {
          mat.opacity = 0.02 + Math.sin(t * 0.4 + idx) * 0.01 + hover * 0.015;
        }
      });

      // ── Flow particles ──
      const fPos = flowGeo.attributes.position.array as Float32Array;
      flowData.forEach((fd, i) => {
        if (isCascade) {
          const a = t * 2.5 + fd.edgeIdx * 0.3;
          const r = 0.5 + cascade * 6;
          fPos[i * 3] = Math.cos(a + i * 0.15) * r;
          fPos[i * 3 + 1] = Math.sin(a * 1.2 + i * 0.1) * r * 0.4;
          fPos[i * 3 + 2] = Math.sin(a * 0.7 + i * 0.1) * r;
        } else {
          fd.progress += fd.speed * 0.006 * (1 + hover);
          if (fd.progress >= 1) fd.progress = 0;
          const [pA, pB] = fd.reverse
            ? [pairs[fd.edgeIdx][1], pairs[fd.edgeIdx][0]]
            : pairs[fd.edgeIdx];
          const p1 = nodes[pA].mesh.position;
          const p2 = nodes[pB].mesh.position;
          fPos[i * 3] = lerp(p1.x, p2.x, fd.progress);
          fPos[i * 3 + 1] = lerp(p1.y, p2.y, fd.progress);
          fPos[i * 3 + 2] = lerp(p1.z, p2.z, fd.progress);
        }
      });
      flowGeo.attributes.position.needsUpdate = true;
      flowMat.opacity = isCascade ? 0.3 + cascade * 0.6 : 0.5 + hover * 0.15;
      flowMat.size = isCascade ? 0.035 + cascade * 0.08 : 0.035;

      // ── Burst particles ──
      const bPos = burstGeo.attributes.position.array as Float32Array;
      if (isCascade) {
        burstMat.opacity = cascade * 0.9;
        for (let i = 0; i < BURST_COUNT; i++) {
          const i3 = i * 3;
          bPos[i3] += burstVel[i3] * cascade * 4;
          bPos[i3 + 1] += burstVel[i3 + 1] * cascade * 4;
          bPos[i3 + 2] += burstVel[i3 + 2] * cascade * 4;
        }
      } else {
        burstMat.opacity *= 0.94;
        for (let i = 0; i < BURST_COUNT; i++) {
          bPos[i * 3] *= 0.94;
          bPos[i * 3 + 1] *= 0.94;
          bPos[i * 3 + 2] *= 0.94;
        }
      }
      burstGeo.attributes.position.needsUpdate = true;

      // ── Ambient stars ──
      const aPos = ambGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < AMB_COUNT; i++) {
        const i3 = i * 3;
        if (isCascade) {
          aPos[i3] += Math.sin(t * 2 + i) * cascade * 0.06;
          aPos[i3 + 1] += Math.cos(t * 1.5 + i * 0.5) * cascade * 0.06;
          aPos[i3 + 2] += Math.sin(t * 1.8 + i * 0.3) * cascade * 0.06;
        } else {
          aPos[i3] += Math.sin(t * 0.04 + i * 0.3) * 0.002;
          aPos[i3 + 1] += Math.cos(t * 0.03 + i * 0.2) * 0.002;
          aPos[i3 + 2] += Math.sin(t * 0.05 + i * 0.4) * 0.002;
          if (Math.abs(aPos[i3]) > 4) aPos[i3] *= -0.5;
          if (Math.abs(aPos[i3 + 1]) > 3) aPos[i3 + 1] *= -0.5;
          if (Math.abs(aPos[i3 + 2]) > 3.5) aPos[i3 + 2] *= -0.5;
        }
      }
      ambGeo.attributes.position.needsUpdate = true;
      ambMat.opacity = isCascade ? 0.08 + cascade * 0.35 : 0.1 + hover * 0.04;

      // ── Bloom ──
      bloom.strength = isCascade
        ? 0.45 + cascade * 2.2
        : 0.35 + hover * 0.25 + Math.sin(t * 0.4) * 0.05;
    },
    cleanup: () => {
      nodes.forEach((n) => {
        n.mesh.geometry.dispose(); (n.mesh.material as THREE.Material).dispose();
        n.ring1.geometry.dispose(); (n.ring1.material as THREE.Material).dispose();
        n.ring2.geometry.dispose(); (n.ring2.material as THREE.Material).dispose();
        n.glow.geometry.dispose(); (n.glow.material as THREE.Material).dispose();
      });
      lines.forEach((l) => { l.geometry.dispose(); (l.material as THREE.Material).dispose(); });
      siblingLines.forEach((l) => { l.geometry.dispose(); (l.material as THREE.Material).dispose(); });
      levelRings.forEach((lr) => { lr.geometry.dispose(); (lr.material as THREE.Material).dispose(); });
      axisLine.geometry.dispose(); axisMat.dispose();
      flowGeo.dispose(); flowMat.dispose();
      burstGeo.dispose(); burstMat.dispose();
      ambGeo.dispose(); ambMat.dispose();
      dodecWire.geometry.dispose(); dodecGeo.dispose(); dodecMat.dispose();
    },
    composer,
  };
};
