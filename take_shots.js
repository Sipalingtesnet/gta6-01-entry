const { chromium } = require('/home/hatch/workspace/makefun/gta6-01-work-nur/shot-tools/node_modules/playwright-core');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader']
  });
  
  const shots = [
    { name: '1-cover-chase.jpg', query: '?shot=chase' },
    { name: '2-drive.jpg', query: '?shot=drive' },
    { name: '3-foot.jpg', query: '?shot=foot' },
    { name: '4-mission.jpg', query: '?shot=mission' }
  ];

  for (const s of shots) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.goto(`http://localhost:8080/${s.query}`);
    await page.waitForTimeout(3000);
    const shotPath = path.join('/home/hatch/workspace/makefun/gta6-01-entry/screenshots', s.name);
    await page.screenshot({ path: shotPath, quality: 85, type: 'jpeg' });
    console.log(`Captured ${s.name}`);
    await page.close();
  }

  await browser.close();
})();
