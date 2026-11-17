import * as THREE from 'three';

export class EffectManager {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
  }

  spawnSpark(pos) {
    const geo = new THREE.SphereGeometry(0.15, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    this.scene.add(mesh);
    this.particles.push({ mesh, life: 0.5, velocity: new THREE.Vector3((Math.random()-0.5)*5, 5, (Math.random()-0.5)*5) });
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.mesh.position.addScaledVector(p.velocity, dt);
      p.velocity.y -= 9.8 * dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
  }
}
