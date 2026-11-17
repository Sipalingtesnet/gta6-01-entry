export class Hud {
  constructor() {
    this.container = document.createElement('div');
    this.container.style.cssText = 'position:fixed;inset:0;pointer-events:none;color:#fff;font-family:sans-serif;font-weight:bold;text-shadow:1px 1px 2px #000;';
    
    // Top-left: Cash & Wanted
    this.topLeft = document.createElement('div');
    this.topLeft.style.cssText = 'position:absolute;top:20px;left:20px;font-size:24px;';
    this.container.appendChild(this.topLeft);

    // Top-right: Mission info
    this.topRight = document.createElement('div');
    this.topRight.style.cssText = 'position:absolute;top:20px;right:20px;text-align:right;font-size:18px;max-width:350px;';
    this.container.appendChild(this.topRight);

    // Bottom-right: Minimap
    this.minimap = document.createElement('canvas');
    this.minimap.width = 160;
    this.minimap.height = 160;
    this.minimap.style.cssText = 'position:absolute;bottom:20px;right:20px;border:3px solid #fff;border-radius:50%;background:#0284c7;box-shadow:0 4px 12px rgba(0,0,0,0.5);';
    this.container.appendChild(this.minimap);
    this.ctx = this.minimap.getContext('2d');

    // Bottom-left: Controls info
    this.bottomLeft = document.createElement('div');
    this.bottomLeft.style.cssText = 'position:absolute;bottom:20px;left:20px;font-size:16px;background:rgba(0,0,0,0.6);padding:10px;border-radius:8px;';
    this.bottomLeft.innerHTML = 'CONTROLS: WASD/Arrows to Move/Drive<br>E: Enter/Exit Car | F: Punch/Shoot | ESC: Pause';
    this.container.appendChild(this.bottomLeft);

    document.body.appendChild(this.container);
  }

  update({ cash, wanted, mission, speed, playerPos, trafficCars, policeCars, missionPos }) {
    const stars = '★'.repeat(wanted) + '☆'.repeat(5 - wanted);
    this.topLeft.innerHTML = `CASH: $${cash.toLocaleString()}<br><span style="color:#facc15">${stars}</span>`;
    
    if (mission) {
      this.topRight.innerHTML = `<div style="color:#facc15">${mission.title}</div><div style="font-size:14px;font-weight:normal">${mission.desc}</div>`;
    } else {
      this.topRight.innerHTML = `<div style="color:#22c55e">ALL MISSIONS COMPLETE</div>`;
    }

    // Fully rendered minimap
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 160, 160);
    
    // Water background
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, 160, 160);

    // City grid / roads on minimap
    ctx.fillStyle = '#475569';
    ctx.fillRect(20, 0, 120, 160);
    ctx.fillRect(0, 20, 160, 120);

    const scale = 0.5;
    const cx = 80;
    const cz = 80;

    // Mission marker
    if (missionPos) {
      const mx = cx + (missionPos.x - playerPos.x) * scale;
      const mz = cz + (missionPos.z - playerPos.z) * scale;
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(mx, mz, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Traffic cars
    if (trafficCars) {
      ctx.fillStyle = '#10b981';
      for (const tc of trafficCars) {
        const tx = cx + (tc.mesh.position.x - playerPos.x) * scale;
        const tz = cz + (tc.mesh.position.z - playerPos.z) * scale;
        ctx.fillRect(tx - 2, tz - 2, 4, 4);
      }
    }

    // Police cars
    if (policeCars) {
      for (const pc of policeCars) {
        const px = cx + (pc.mesh.position.x - playerPos.x) * scale;
        const pz = cz + (pc.mesh.position.z - playerPos.z) * scale;
        ctx.fillStyle = Math.floor(Date.now() / 250) % 2 === 0 ? '#3b82f6' : '#ef4444';
        ctx.beginPath();
        ctx.arc(px, pz, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Player dot (center)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cz, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}
