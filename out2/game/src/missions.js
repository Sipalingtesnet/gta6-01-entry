import * as THREE from 'three';

export class MissionManager {
  constructor() {
    this.missions = [
      { id: 1, title: "THE PICKUP", desc: "Drive to the marked dock warehouse and deliver the package.", cash: 1500, done: false, pos: new THREE.Vector3(40, 0, 80) },
      { id: 2, title: "THE MARKED CAR", desc: "Steal the marked sports car from the guarded lot and reach the chop shop.", cash: 3000, done: false, pos: new THREE.Vector3(-40, 0, -100) },
      { id: 3, title: "THE LONG WAY HOME", desc: "Lose your wanted level and return safely to the safehouse.", cash: 5000, done: false, pos: new THREE.Vector3(120, 0, 120) }
    ];
    this.currentIndex = 0;
  }

  getCurrent() {
    return this.missions[this.currentIndex] || null;
  }

  completeCurrent() {
    const m = this.getCurrent();
    if (m) {
      m.done = true;
      this.currentIndex++;
      return m.cash;
    }
    return 0;
  }
}
