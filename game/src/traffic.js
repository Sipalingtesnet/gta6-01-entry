export class TrafficManager {
  constructor(vehicleManager, spawnPoints) {
    this.vm = vehicleManager;
    this.trafficCars = [];
    
    const colors = [0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0x64748b, 0xef4444, 0x06b6d4];
    for (let i = 0; i < 12 && i < spawnPoints.length; i++) {
      const pt = spawnPoints[i];
      const color = colors[i % colors.length];
      const car = this.vm.spawnCar(pt.x, pt.z + (i * 15), color, false);
      car.aiSpeed = 8 + (i % 4) * 4;
      car.aiDir = i % 2 === 0 ? 1 : -1;
      this.trafficCars.push(car);
    }
  }

  update(dt) {
    for (const car of this.trafficCars) {
      car.mesh.position.z += car.aiSpeed * car.aiDir * dt;
      if (car.mesh.position.z > 600) car.mesh.position.z = -600;
      if (car.mesh.position.z < -600) car.mesh.position.z = 600;
      car.box.setFromObject(car.mesh);
    }
  }
}
