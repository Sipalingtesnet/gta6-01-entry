import * as THREE from 'three';

export class VehicleManager {
  constructor(scene) {
    this.vehicles = [];
    this.scene = scene;
  }

  spawnCar(x, z, color = 0xef4444, isPlayerCar = false) {
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(2.0, 0.8, 4.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.5 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    // Roof / Cabin
    const roofGeo = new THREE.BoxGeometry(1.6, 0.6, 2.2);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.2 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 1.2, -0.2);
    roof.castShadow = true;
    group.add(roof);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f2937 });
    
    const wheelPositions = [
      [-1.0, 0.4, 1.4], [1.0, 0.4, 1.4],
      [-1.0, 0.4, -1.4], [1.0, 0.4, -1.4]
    ];

    const wheels = [];
    for (const pos of wheelPositions) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(...pos);
      group.add(wheel);
      wheels.push(wheel);
    }

    group.position.set(x, 0, z);
    this.scene.add(group);

    const car = {
      mesh: group,
      speed: 0,
      maxSpeed: 28.0,
      acceleration: 12.0,
      braking: 18.0,
      steering: 0,
      maxSteer: 0.6,
      rotation: 0,
      isPlayerCar,
      wheels,
      box: new THREE.Box3()
    };

    car.box.setFromObject(group);
    this.vehicles.push(car);
    return car;
  }

  updateCar(car, dt, input, buildings) {
    if (!car.isPlayerCar) return;

    let accel = 0;
    let steer = 0;

    if (input.isDown('KeyW') || input.isDown('ArrowUp')) accel += 1;
    if (input.isDown('KeyS') || input.isDown('ArrowDown')) accel -= 1;
    if (input.isDown('KeyA') || input.isDown('ArrowLeft')) steer += 1;
    if (input.isDown('KeyD') || input.isDown('ArrowRight')) steer -= 1;

    if (accel > 0) {
      car.speed = Math.min(car.maxSpeed, car.speed + car.acceleration * dt);
    } else if (accel < 0) {
      car.speed = Math.max(-car.maxSpeed * 0.4, car.speed - car.braking * dt);
    } else {
      car.speed *= 0.96; // friction
    }

    if (Math.abs(car.speed) > 0.5) {
      car.rotation += steer * car.maxSteer * (car.speed / car.maxSpeed) * dt;
      car.mesh.rotation.y = car.rotation;
    }

    const vx = Math.sin(car.rotation) * car.speed;
    const vz = Math.cos(car.rotation) * car.speed;

    car.mesh.position.x += vx * dt;
    car.mesh.position.z += vz * dt;
    car.box.setFromObject(car.mesh);
  }
}
