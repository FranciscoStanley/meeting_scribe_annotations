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
      <article class="rounded-xl border border-white/10 bg-ink-900 p-4" style="border-left:3px solid #38bdf8">
        <span class="text-xs font-medium" style="color:#38bdf8">Ana Costa</span>
        <p class="mt-1 text-slate-100">Bom dia — vamos começar a daily.</p>
      </article>
      <article class="rounded-xl border border-white/10 bg-ink-900 p-4" style="border-left:3px solid #a78bfa">
        <span class="text-xs font-medium" style="color:#a78bfa">Carlos Mendes</span>
        <p class="mt-1 text-slate-100">Pode ser. Eu abri o Meet na aba do Chrome.</p>
      </article>
      <article class="rounded-xl border border-white/10 bg-ink-900 p-4" style="border-left:3px solid #34d399">
        <span class="text-xs font-medium" style="color:#34d399">Participante</span>
        <p class="mt-1 text-slate-100">Áudio da aba compartilhado — trechos a cada ~5s.</p>
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

  // Modal alerta (texto alinhado ao MeetingAlertModal atual)
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.evaluate((sid) => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div style="position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);padding:16px">
        <div style="width:100%;max-width:32rem;border-radius:16px;border:1px solid rgba(255,255,255,.1);background:#121a2f;padding:24px;box-shadow:0 25px 50px rgba(0,0,0,.45)">
          <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8fb4ff;margin:0">Reunião detectada · MEET</p>
          <h2 style="margin:8px 0 0;font-size:24px;color:#fff">Daily Sync — Produto</h2>
          <p style="margin:8px 0 0;font-size:14px;color:#cbd5e1">Começa em 3 min. Deseja participar e iniciar a transcrição em tempo real?</p>
          <div style="margin-top:24px;display:flex;flex-wrap:wrap;gap:12px">
            <span style="border-radius:12px;background:#5b8cff;padding:8px 16px;font-size:14px;color:#fff">Participar e transcrever</span>
            <span style="border-radius:12px;border:1px solid rgba(255,255,255,.2);padding:8px 16px;font-size:14px;color:#fff">Só transcrever</span>
            <span style="border-radius:12px;border:1px solid rgba(255,255,255,.2);padding:8px 16px;font-size:14px;color:#fff">Só abrir reunião</span>
            <span style="border-radius:12px;padding:8px 16px;font-size:14px;color:#94a3b8">Agora não</span>
          </div>
        </div>
      </div>`;
    document.body.appendChild(root);
  }, scheduledId || liveId);
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
