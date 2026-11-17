import * as THREE from 'three';

export class SeededRNG {
  constructor(seed = 1337) {
    this.s = seed % 2147483647;
    if (this.s <= 0) this.s += 2147483646;
  }
  next() {
    this.s = (this.s * 16807) % 2147483647;
    return (this.s - 1) / 2147483646;
  }
  range(min, max) { return min + this.next() * (max - min); }
  int(min, max) { return Math.floor(this.range(min, max + 1)); }
}

export function createWorld(scene, seed = 42) {
  const rng = new SeededRNG(seed);
  const buildings = [];
  const spawnPoints = [];

  // Ground / Ocean base
  const groundGeo = new THREE.PlaneGeometry(1200, 1200);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x181e24, roughness: 0.9 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  ground.receiveShadow = true;
  scene.add(ground);

  // Ocean (west side)
  const oceanGeo = new THREE.PlaneGeometry(600, 1200);
  const oceanMat = new THREE.MeshStandardMaterial({ color: 0x0c4a6e, roughness: 0.2, metalness: 0.8 });
  const ocean = new THREE.Mesh(oceanGeo, oceanMat);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(-450, 0, 0);
  scene.add(ocean);

  // Beach strip
  const beachGeo = new THREE.PlaneGeometry(60, 1200);
  const beachMat = new THREE.MeshStandardMaterial({ color: 0xd4b483, roughness: 0.9 });
  const beach = new THREE.Mesh(beachGeo, beachMat);
  beach.rotation.x = -Math.PI / 2;
  beach.position.set(-135, 0.01, 0);
  scene.add(beach);

  // Roads grid
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x22262d, roughness: 0.8 });
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

  const blockSize = 80;
  const roadWidth = 16;
  const gridCount = 6;

  for (let x = -gridCount; x <= gridCount; x++) {
    const rx = x * (blockSize + roadWidth);
    const roadGeo = new THREE.PlaneGeometry(roadWidth, (gridCount * 2 + 1) * (blockSize + roadWidth));
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(rx, 0.02, 0);
    road.receiveShadow = true;
    scene.add(road);

    const lineGeo = new THREE.PlaneGeometry(0.8, (gridCount * 2 + 1) * (blockSize + roadWidth));
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(rx, 0.03, 0);
    scene.add(line);
  }

  for (let z = -gridCount; z <= gridCount; z++) {
    const rz = z * (blockSize + roadWidth);
    const roadGeo = new THREE.PlaneGeometry((gridCount * 2 + 1) * (blockSize + roadWidth), roadWidth);
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.02, rz);
    road.receiveShadow = true;
    scene.add(road);

    const lineGeo = new THREE.PlaneGeometry((gridCount * 2 + 1) * (blockSize + roadWidth), 0.8);
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(0, 0.03, rz);
    scene.add(line);
  }

  // Buildings in blocks
  const bColors = [0xffedd5, 0xfed7aa, 0xfde68a, 0xbae6fd, 0xc7d2fe, 0xfbcfe8, 0x475569, 0x334155, 0x1e293b];
  
  for (let gx = -gridCount + 1; gx <= gridCount; gx++) {
    for (let gz = -gridCount + 1; gz <= gridCount; gz++) {
      const cx = (gx - 0.5) * (blockSize + roadWidth) - roadWidth / 2;
      const cz = (gz - 0.5) * (blockSize + roadWidth) - roadWidth / 2;
      
      if (cx - blockSize / 2 < -100) continue;

      const bWidth = blockSize - 12;
      const bDepth = blockSize - 12;
      const bHeight = rng.range(25, 75);
      
      const bColor = bColors[rng.int(0, bColors.length - 1)];
      const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
      const bMat = new THREE.MeshStandardMaterial({ color: bColor, roughness: 0.5, metalness: 0.1 });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(cx + roadWidth / 2, bHeight / 2, cz + roadWidth / 2);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      scene.add(bMesh);
      
      buildings.push({
        box: new THREE.Box3().setFromObject(bMesh),
        mesh: bMesh
      });

      spawnPoints.push(new THREE.Vector3(cx - bWidth / 2 - 4, 0, cz - bDepth / 2 - 4));
    }
  }

  // Palms along beach
  for (let z = -500; z <= 500; z += 40) {
    const trunkGeo = new THREE.CylinderGeometry(0.8, 1.2, 12, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x854d0e });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(-110, 6, z);
    scene.add(trunk);

    const leavesGeo = new THREE.SphereGeometry(4, 6, 6);
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.set(-110, 13, z);
    scene.add(leaves);
  }

  return { buildings, spawnPoints, ground };
}
