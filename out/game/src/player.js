import * as THREE from 'three';

export class Player {
  constructor(scene) {
    this.mesh = new THREE.Group();
    
    // Body / Torso
    const bodyGeo = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.7 });
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    this.bodyMesh.position.y = 1.0;
    this.bodyMesh.castShadow = true;
    this.mesh.add(this.bodyMesh);

    // Head
    const headGeo = new THREE.SphereGeometry(0.25, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.5 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.8;
    head.castShadow = true;
    this.mesh.add(head);

    scene.add(this.mesh);

    this.position = this.mesh.position;
    this.velocity = new THREE.Vector3();
    this.rotation = 0;
    this.speed = 6.0;
    this.inCar = false;
    this.currentCar = null;
  }

  update(dt, input, buildings) {
    if (this.inCar) return;

    let moveX = 0;
    let moveZ = 0;

    if (input.isDown('KeyW') || input.isDown('ArrowUp')) moveZ -= 1;
    if (input.isDown('KeyS') || input.isDown('ArrowDown')) moveZ += 1;
    if (input.isDown('KeyA') || input.isDown('ArrowLeft')) moveX -= 1;
    if (input.isDown('KeyD') || input.isDown('ArrowRight')) moveX += 1;

    if (moveX !== 0 || moveZ !== 0) {
      const angle = Math.atan2(moveX, moveZ);
      this.rotation = angle;
      this.mesh.rotation.y = angle;

      const vx = Math.sin(angle) * this.speed;
      const vz = Math.cos(angle) * this.speed;

      // Simple collision against buildings
      const nextX = this.position.x + vx * dt;
      const nextZ = this.position.z + vz * dt;

      let collides = false;
      const pBox = new THREE.Box3(
        new THREE.Vector3(nextX - 0.4, 0, nextZ - 0.4),
        new THREE.Vector3(nextX + 0.4, 2, nextZ + 0.4)
      );

      for (const b of buildings) {
        if (b.box.intersectsBox(pBox)) {
          collides = true;
          break;
        }
      }

      if (!collides) {
        this.position.x = nextX;
        this.position.z = nextZ;
      }
    }
  }

  enterVehicle(car) {
    this.inCar = true;
    this.currentCar = car;
    this.mesh.visible = false;
  }

  exitVehicle() {
    this.inCar = false;
    if (this.currentCar) {
      this.position.copy(this.currentCar.mesh.position).add(new THREE.Vector3(2.5, 0, 0));
      this.currentCar = null;
    }
    this.mesh.visible = true;
  }
}
