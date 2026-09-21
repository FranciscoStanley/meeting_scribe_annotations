import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templatePath = path.join(root, '.env.template');
const rootEnvPath = path.join(root, '.env');

function parseEnv(content) {
  /** @type {Record<string, string>} */
  const map = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    map[key] = value;
  }
  return map;
}

function writeEnvFile(targetRel, keys, env) {
  const target = path.join(root, targetRel);
  const lines = keys.map((key) => `${key}=${env[key] ?? ''}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, lines.join('\n') + '\n');
  console.log(`[bootstrap] Atualizado ${targetRel}`);
}

function run(cmd, args, cwd = root) {
  console.log(`[bootstrap] ${cmd} ${args.join(' ')}`);
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`Comando falhou: ${cmd} ${args.join(' ')}`);
  }
}

function tryDockerWhisper() {
  const docker = spawnSync('docker', ['info'], {
    shell: true,
    stdio: 'ignore',
  });
  if (docker.status !== 0) {
    console.log(
      '[bootstrap] Docker indisponível — usando Whisper local (Node).',
    );
    return false;
  }
  console.log('[bootstrap] Subindo Whisper via Docker (opcional)…');
  const up = spawnSync('docker', ['compose', 'up', '-d', 'whisper'], {
    cwd: root,
    shell: true,
    stdio: 'inherit',
  });
  return up.status === 0;
}

if (!fs.existsSync(templatePath)) {
  throw new Error('Arquivo .env.template não encontrado na raiz do projeto.');
}

if (!fs.existsSync(rootEnvPath)) {
  fs.copyFileSync(templatePath, rootEnvPath);
  console.log('[bootstrap] Criado .env a partir de .env.template');
  console.log('[bootstrap] Ajuste segredos em .env se precisar (OAuth, etc.).');
} else {
  console.log('[bootstrap] .env já existe — mantido.');
}

const env = parseEnv(fs.readFileSync(rootEnvPath, 'utf8'));

writeEnvFile('backend/.env', [
  'DATABASE_URL',
  'PORT',
  'CORS_ORIGIN',
  'STT_PROVIDER',
  'STT_LOCAL_MODEL',
  'STT_BASE_URL',
  'STT_API_KEY',
  'STT_MODEL',
  'MEETING_ALERT_MINUTES',
  'CALENDAR_ICS_URLS',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'MICROSOFT_CLIENT_ID',
  'MICROSOFT_CLIENT_SECRET',
  'MICROSOFT_REDIRECT_URI',
  'MICROSOFT_TENANT',
], env);

writeEnvFile('frontend/.env.local', [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_WS_URL',
  'API_INTERNAL_URL',
], env);

writeEnvFile('desktop/.env', ['MEETING_SCRIBE_API_URL'], env);

const skipDocker =
  process.argv.includes('--skip-docker') ||
  process.env.npm_lifecycle_event === 'postinstall';

const dockerOk = skipDocker ? false : tryDockerWhisper();
if (dockerOk && !env.STT_BASE_URL) {
  let content = fs.readFileSync(rootEnvPath, 'utf8');
  if (!/^STT_BASE_URL=http/m.test(content)) {
    content = content.replace(
      /^STT_BASE_URL=.*$/m,
      'STT_BASE_URL=http://localhost:8080/v1',
    );
    fs.writeFileSync(rootEnvPath, content);
    writeEnvFile(
      'backend/.env',
      [
        'DATABASE_URL',
        'PORT',
        'CORS_ORIGIN',
        'STT_PROVIDER',
        'STT_LOCAL_MODEL',
        'STT_BASE_URL',
        'STT_API_KEY',
        'STT_MODEL',
        'MEETING_ALERT_MINUTES',
        'CALENDAR_ICS_URLS',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'GOOGLE_REDIRECT_URI',
        'MICROSOFT_CLIENT_ID',
        'MICROSOFT_CLIENT_SECRET',
        'MICROSOFT_REDIRECT_URI',
        'MICROSOFT_TENANT',
      ],
      parseEnv(content),
    );
    console.log('[bootstrap] STT_BASE_URL → Whisper Docker (localhost:8080).');
  }
}

run('npm', ['run', 'build', '-w', '@meeting-scribe/shared']);
run('npm', ['run', 'prisma:generate', '-w', '@meeting-scribe/backend']);
run('npm', ['run', 'prisma:migrate:deploy', '-w', '@meeting-scribe/backend']);

console.log('[bootstrap] Pronto. Use: npm run dev  |  docker compose up --build');
