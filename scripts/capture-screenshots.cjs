const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const outDir = path.join(__dirname, '..', 'docs', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const liveId = process.argv[2];
const nextId = process.argv[3];

async function shot(page, name, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForTimeout(800);
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log('saved', file);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });

  await shot(page, '01-reunioes', 'http://localhost:3000/');
  await shot(page, '02-nova-reuniao', 'http://localhost:3000/meetings/new');
  await shot(page, '03-calendarios', 'http://localhost:3000/settings');
  if (liveId) {
    await shot(
      page,
      '04-transcricao',
      `http://localhost:3000/meetings/${liveId}`,
    );
    await shot(
      page,
      '05-captura-ao-vivo',
      `http://localhost:3000/sessions/${liveId}/capture`,
    );
  }
  if (nextId) {
    // Trigger alert UI by injecting modal-like state isn't easy; capture upcoming meeting via home is enough
  }

  // Overlay alert modal for README (inject DOM matching MeetingAlertModal)
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div style="position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);padding:16px">
        <div style="width:100%;max-width:32rem;border-radius:16px;border:1px solid rgba(255,255,255,.1);background:#121a2f;padding:24px;box-shadow:0 25px 50px rgba(0,0,0,.45)">
          <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8fb4ff;margin:0">Reunião detectada · TEAMS</p>
          <h2 style="margin:8px 0 0;font-size:24px;color:#fff">Daily Sync — Produto</h2>
          <p style="margin:8px 0 0;font-size:14px;color:#cbd5e1">Começa em 3 min. Deseja participar com transcrição em tempo real?</p>
          <div style="margin-top:24px;display:flex;flex-wrap:wrap;gap:12px">
            <span style="border-radius:12px;background:#5b8cff;padding:8px 16px;font-size:14px;color:#fff">Iniciar transcrição</span>
            <span style="border-radius:12px;border:1px solid rgba(91,140,255,.4);padding:8px 16px;font-size:14px;color:#8fb4ff">Abrir no Teams (desktop)</span>
            <span style="border-radius:12px;border:1px solid rgba(255,255,255,.2);padding:8px 16px;font-size:14px;color:#fff">Abrir no navegador</span>
          </div>
        </div>
      </div>`;
    document.body.appendChild(root);
  });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(outDir, '06-alerta-reuniao.png'),
    fullPage: true,
  });
  console.log('saved alerta');

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
