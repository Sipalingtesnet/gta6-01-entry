import * as THREE from 'three';

export class PedestrianManager {
  constructor(scene) {
    this.pedestrians = [];
    const pedGeo = new THREE.CapsuleGeometry(0.3, 1.0, 4, 8);
    const pedMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });

    for (let i = 0; i < 15; i++) {
      const mesh = new THREE.Mesh(pedGeo, pedMat);
      const x = -90 + (i % 5) * 40;
      const z = -300 + i * 45;
      mesh.position.set(x, 0.8, z);
      mesh.castShadow = true;
      scene.add(mesh);

      this.pedestrians.push({
        mesh,
        speed: 2.0,
        dir: i % 2 === 0 ? 1 : -1,
        minZ: z - 40,
        maxZ: z + 40
      });
    }
  }

  update(dt) {
    for (const p of this.pedestrians) {
      p.mesh.position.z += p.speed * p.dir * dt;
      if (p.mesh.position.z > p.maxZ || p.mesh.position.z < p.minZ) {
        p.dir *= -1;
      }
    }
  }
}
