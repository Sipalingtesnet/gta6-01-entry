export class CombatManager {
  constructor(scene) {
    this.scene = scene;
    this.cooldown = 0;
  }

  update(dt) {
    if (this.cooldown > 0) this.cooldown -= dt;
  }

  shoot() {
    if (this.cooldown > 0) return false;
    this.cooldown = 0.25;
    return true;
  }
}
