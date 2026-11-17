export class TrafficManager {
  constructor(vehicleManager, spawnPoints) {
    this.vm = vehicleManager;
    this.trafficCars = [];
    
    // Spawn a few traffic cars at spawn points
    const colors = [0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0x64748b];
    for (let i = 0; i < 8 && i < spawnPoints.length; i++) {
      const pt = spawnPoints[i];
      const color = colors[i % colors.length];
      const car = this.vm.spawnCar(pt.x, pt.z, color, false);
      car.aiSpeed = 6 + (i % 3) * 3;
      car.aiDir = i % 2 === 0 ? 1 : -1;
      this.trafficCars.push(car);
    }
  }

  update(dt) {
    for (const car of this.trafficCars) {
      car.mesh.position.z += car.aiSpeed * car.aiDir * dt;
      if (car.mesh.position.z > 500) car.mesh.position.z = -500;
      if (car.mesh.position.z < -500) car.mesh.position.z = 500;
      car.box.setFromObject(car.mesh);
    }
  }
}
