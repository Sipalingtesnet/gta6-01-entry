export class SaveManager {
  constructor() {
    this.key = 'sunset_bay_save_v1';
  }

  load() {
    try {
      const data = localStorage.getItem(this.key);
      if (data) return JSON.parse(data);
    } catch {}
    return { cash: 500, missionIndex: 0 };
  }

  save(cash, missionIndex) {
    try {
      localStorage.setItem(this.key, JSON.stringify({ cash, missionIndex }));
    } catch {}
  }
}
