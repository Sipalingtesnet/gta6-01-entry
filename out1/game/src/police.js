import * as THREE from 'three';

export class PoliceManager {
  constructor(scene, vehicleManager) {
    this.scene = scene;
    this.vm = vehicleManager;
    this.wantedLevel = 0;
    this.policeCars = [];
  }

  setWanted(level) {
    this.wantedLevel = Math.max(0, Math.min(5, level));
    if (this.wantedLevel > 0 && this.policeCars.length === 0) {
      // Spawn police cruiser
      const pCar = this.vm.spawnCar(0, -50, 0x1e3a8a, false);
      pCar.isPolice = true;
      this.policeCars.push(pCar);
    } else if (this.wantedLevel === 0) {
      for (const pc of this.policeCars) {
        this.scene.remove(pc.mesh);
      }
      this.policeCars = [];
    }
  }

  update(dt, playerPos) {
    if (this.wantedLevel === 0) return;

    for (const pc of this.policeCars) {
      // Chase player position
      const dir = new THREE.Vector3().subVectors(playerPos, pc.mesh.position);
      const dist = dir.length();
      dir.normalize();

      pc.mesh.rotation.y = Math.atan2(dir.x, dir.z);
      if (dist > 6) {
        pc.mesh.position.addScaledVector(dir, 14 * dt);
      }
      pc.box.setFromObject(pc.mesh);
    }
  }
}
