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

  // Bright sunny/sunset coastal lighting base & ground
  const groundGeo = new THREE.PlaneGeometry(1400, 1400);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  ground.receiveShadow = true;
  scene.add(ground);

  // Ocean (west side) - bright vibrant teal/blue
  const oceanGeo = new THREE.PlaneGeometry(700, 1400);
  const oceanMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.9 });
  const ocean = new THREE.Mesh(oceanGeo, oceanMat);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(-500, 0, 0);
  scene.add(ocean);

  // Beach strip - bright golden sand
  const beachGeo = new THREE.PlaneGeometry(70, 1400);
  const beachMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.8 });
  const beach = new THREE.Mesh(beachGeo, beachMat);
  beach.rotation.x = -Math.PI / 2;
  beach.position.set(-150, 0.01, 0);
  scene.add(beach);

  // Roads grid - distinct light asphalt with clear yellow center stripes
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  const blockSize = 90;
  const roadWidth = 18;
  const gridCount = 6;

  for (let x = -gridCount; x <= gridCount; x++) {
    const rx = x * (blockSize + roadWidth);
    const roadGeo = new THREE.PlaneGeometry(roadWidth, (gridCount * 2 + 1) * (blockSize + roadWidth));
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(rx, 0.02, 0);
    road.receiveShadow = true;
    scene.add(road);

    const lineGeo = new THREE.PlaneGeometry(1.0, (gridCount * 2 + 1) * (blockSize + roadWidth));
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(rx, 0.04, 0);
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

    const lineGeo = new THREE.PlaneGeometry((gridCount * 2 + 1) * (blockSize + roadWidth), 1.0);
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(0, 0.04, rz);
    scene.add(line);
  }

  // Bright, colorful Sun-soaked architectural buildings
  const bColors = [0xffedd5, 0xfed7aa, 0xfde68a, 0xbae6fd, 0xc7d2fe, 0xfbcfe8, 0x93c5fd, 0x86efac, 0xfca5a5];
  
  for (let gx = -gridCount + 1; gx <= gridCount; gx++) {
    for (let gz = -gridCount + 1; gz <= gridCount; gz++) {
      const cx = (gx - 0.5) * (blockSize + roadWidth) - roadWidth / 2;
      const cz = (gz - 0.5) * (blockSize + roadWidth) - roadWidth / 2;
      
      if (cx - blockSize / 2 < -110) continue;

      const bWidth = blockSize - 10;
      const bDepth = blockSize - 10;
      const bHeight = rng.range(30, 90);
      
      const bColor = bColors[rng.int(0, bColors.length - 1)];
      const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
      const bMat = new THREE.MeshStandardMaterial({ color: bColor, roughness: 0.4, metalness: 0.2 });
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
  for (let z = -600; z <= 600; z += 35) {
    const trunkGeo = new THREE.CylinderGeometry(0.9, 1.4, 14, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0xa16207 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(-120, 7, z);
    scene.add(trunk);

    const leavesGeo = new THREE.SphereGeometry(5, 6, 6);
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.set(-120, 15, z);
    scene.add(leaves);
  }

  return { buildings, spawnPoints, ground };
}
