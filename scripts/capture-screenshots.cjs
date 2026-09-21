const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const outDir = path.join(__dirname, '..', 'docs', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const liveId = process.argv[2];
const scheduledId = process.argv[3];

async function shot(page, name, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForTimeout(900);
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log('saved', file);
}

(async () => {
  if (!liveId) {
    console.error('Uso: node scripts/capture-screenshots.cjs <meetingIdComTranscricao> [meetingIdAgendada]');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });

  await shot(page, '01-reunioes', 'http://localhost:3000/');
  await shot(page, '02-nova-reuniao', 'http://localhost:3000/meetings/new');
  await shot(page, '03-calendarios', 'http://localhost:3000/settings');
  await shot(page, '04-transcricao', `http://localhost:3000/meetings/${liveId}`);

  // Captura: injeta trechos coloridos (headless não grava áudio real)
  await page.goto(`http://localhost:3000/sessions/${liveId}/capture`, {
    waitUntil: 'networkidle',
    timeout: 60_000,
  });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const section = document.querySelector('section');
    if (!section) return;
    const empty = section.querySelector('p.text-sm, p');
    // Monta cards no estilo da UI
    const wrap = document.createElement('div');
    wrap.className = 'space-y-3';
    wrap.innerHTML = `
      <article class="rounded-2xl border border-line bg-panel p-5 shadow-soft" style="border-left:3px solid #0F766E">
        <span class="text-sm font-semibold" style="color:#0F766E">Ana Costa</span>
        <p class="mt-1.5 text-[15px] text-ink-soft">Bom dia — vamos começar a daily.</p>
      </article>
      <article class="rounded-2xl border border-line bg-panel p-5 shadow-soft" style="border-left:3px solid #1D4ED8">
        <span class="text-sm font-semibold" style="color:#1D4ED8">Carlos Mendes</span>
        <p class="mt-1.5 text-[15px] text-ink-soft">Pode ser. Eu abri o Meet na aba do Chrome.</p>
      </article>
      <article class="rounded-2xl border border-line bg-panel p-5 shadow-soft" style="border-left:3px solid #B45309">
        <span class="text-sm font-semibold" style="color:#B45309">Participante</span>
        <p class="mt-1.5 text-[15px] text-ink-soft">Áudio da aba compartilhado — trechos a cada ~5s.</p>
      </article>`;
    const heading = section.querySelector('h2');
    section.innerHTML = '';
    if (heading) section.appendChild(heading);
    else {
      const h = document.createElement('h2');
      h.className = 'text-lg font-medium text-white';
      h.textContent = 'Transcrição em tempo real';
      section.appendChild(h);
    }
    section.appendChild(wrap);
  });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(outDir, '05-captura-ao-vivo.png'),
    fullPage: true,
  });
  console.log('saved captura');

  // Modal alerta (UI clara — alinhado ao MeetingAlertModal)
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div style="position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(14,22,37,.4);padding:16px;backdrop-filter:blur(2px)">
        <div style="width:100%;max-width:32rem;border-radius:16px;border:1px solid #E2E8EF;background:#fff;padding:32px;box-shadow:0 12px 40px rgba(14,22,37,.1)">
          <p style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#0F766E;margin:0;font-weight:600">Reunião detectada · MEET</p>
          <h2 style="margin:8px 0 0;font-size:24px;color:#0E1625;font-weight:600">Daily Sync — Produto</h2>
          <p style="margin:8px 0 0;font-size:14px;color:#5A6A7A">Começa em 3 min. Deseja participar e iniciar a transcrição em tempo real?</p>
          <div style="margin-top:28px;display:flex;flex-wrap:wrap;gap:10px">
            <span style="border-radius:12px;background:#0F766E;padding:10px 16px;font-size:14px;color:#fff;font-weight:600">Participar e transcrever</span>
            <span style="border-radius:12px;border:1px solid #E2E8EF;padding:10px 16px;font-size:14px;color:#0E1625;font-weight:600">Só transcrever</span>
            <span style="border-radius:12px;border:1px solid #E2E8EF;padding:10px 16px;font-size:14px;color:#0E1625;font-weight:600">Só abrir reunião</span>
            <span style="border-radius:12px;padding:10px 16px;font-size:14px;color:#5A6A7A">Agora não</span>
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
  console.log('done →', outDir);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
