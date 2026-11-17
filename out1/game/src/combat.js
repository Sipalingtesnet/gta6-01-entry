import * as THREE from 'three';

export class CombatManager {
  constructor(scene) {
    this.scene = scene;
    this.cooldown = 0;
    this.bullets = [];
  }

  update(dt) {
    if (this.cooldown > 0) this.cooldown -= dt;
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.life -= dt;
      b.mesh.position.addScaledVector(b.dir, 40 * dt);
      if (b.life <= 0) {
        this.scene.remove(b.mesh);
        this.bullets.splice(i, 1);
      }
    }
  }

  shoot(origin, dir) {
    if (this.cooldown > 0) return false;
    this.cooldown = 0.2;
    const geo = new THREE.SphereGeometry(0.1, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(origin);
    this.scene.add(mesh);
    this.bullets.push({ mesh, dir, life: 1.0 });
    return true;
  }
}
