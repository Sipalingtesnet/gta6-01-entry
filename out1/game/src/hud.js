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
    this.minimap.style.cssText = 'position:absolute;bottom:20px;right:20px;border:3px solid #fff;border-radius:50%;background:#1e293b;';
    this.container.appendChild(this.minimap);
    this.ctx = this.minimap.getContext('2d');

    // Bottom-left: Speed / Controls info
    this.bottomLeft = document.createElement('div');
    this.bottomLeft.style.cssText = 'position:absolute;bottom:20px;left:20px;font-size:16px;background:rgba(0,0,0,0.5);padding:10px;border-radius:8px;';
    this.bottomLeft.innerHTML = 'CONTROLS: WASD / Arrows to Move/Drive<br>E: Enter/Exit Car | F: Punch/Shoot | ESC: Pause';
    this.container.appendChild(this.bottomLeft);

    document.body.appendChild(this.container);
  }

  update({ cash, wanted, mission, speed }) {
    const stars = '★'.repeat(wanted) + '☆'.repeat(5 - wanted);
    this.topLeft.innerHTML = `CASH: $${cash.toLocaleString()}<br><span style="color:#facc15">${stars}</span>`;
    
    if (mission) {
      this.topRight.innerHTML = `<div style="color:#facc15">${mission.title}</div><div style="font-size:14px;font-weight:normal">${mission.desc}</div>`;
    } else {
      this.topRight.innerHTML = `<div style="color:#22c55e">ALL MISSIONS COMPLETE</div>`;
    }

    // Render minimap
    this.ctx.clearRect(0, 0, 160, 160);
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, 160, 160);
    // Player dot
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.beginPath();
    this.ctx.arc(80, 80, 5, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
