import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function ensureFile(exampleRel, targetRel, extraLines = []) {
  const example = path.join(root, exampleRel);
  const target = path.join(root, targetRel);
  if (fs.existsSync(target)) {
    if (extraLines.length) {
      let content = fs.readFileSync(target, 'utf8');
      let changed = false;
      for (const line of extraLines) {
        const key = line.split('=')[0];
        if (key && !content.includes(`${key}=`)) {
          content += `\n${line}`;
          changed = true;
        }
      }
      if (changed) fs.writeFileSync(target, content.trimEnd() + '\n');
    }
    return;
  }
  if (fs.existsSync(example)) {
    let content = fs.readFileSync(example, 'utf8');
    if (extraLines.length) {
      content = content.trimEnd() + '\n' + extraLines.join('\n') + '\n';
    }
    fs.writeFileSync(target, content);
    console.log(`[bootstrap] Criado ${targetRel}`);
  } else {
    fs.writeFileSync(target, extraLines.join('\n') + '\n');
    console.log(`[bootstrap] Criado ${targetRel} (mínimo)`);
  }
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
  const compose = path.join(root, 'docker-compose.yml');
  if (!fs.existsSync(compose)) return false;
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
  console.log('[bootstrap] Subindo Whisper via Docker (opcional, mais rápido)…');
  const up = spawnSync('docker', ['compose', 'up', '-d', 'whisper'], {
    cwd: root,
    shell: true,
    stdio: 'inherit',
  });
  return up.status === 0;
}

ensureFile('backend/.env.example', 'backend/.env', [
  'STT_PROVIDER=local',
  'STT_LOCAL_MODEL=Xenova/whisper-tiny',
]);
ensureFile('frontend/.env.example', 'frontend/.env.local', [
  'NEXT_PUBLIC_API_URL=http://localhost:3001',
  'NEXT_PUBLIC_WS_URL=http://localhost:3001',
]);
ensureFile('desktop/.env.example', 'desktop/.env', [
  'MEETING_SCRIBE_API_URL=http://localhost:3001',
]);

// Preferir Whisper local zero-config; Docker só se o usuário quiser STT_BASE_URL
const envPath = path.join(root, 'backend', '.env');
let envContent = fs.readFileSync(envPath, 'utf8');
if (!envContent.includes('STT_PROVIDER=')) {
  envContent += '\nSTT_PROVIDER=local\nSTT_LOCAL_MODEL=Xenova/whisper-tiny\n';
  fs.writeFileSync(envPath, envContent);
}

const skipDocker =
  process.argv.includes('--skip-docker') ||
  process.env.npm_lifecycle_event === 'postinstall';

const dockerOk = skipDocker ? false : tryDockerWhisper();
if (dockerOk && !/^STT_BASE_URL=.+/m.test(envContent.replace(/^#.*STT_BASE_URL.*/gm, ''))) {
  // Só ativa remoto se Docker subiu e ainda não há URL (comentado não conta)
  if (!envContent.match(/^STT_BASE_URL=http/m)) {
    envContent = envContent.replace(
      /^#?\s*STT_BASE_URL=.*$/m,
      'STT_BASE_URL=http://localhost:8080/v1',
    );
    if (!envContent.includes('STT_BASE_URL=http://localhost:8080/v1')) {
      envContent += '\nSTT_BASE_URL=http://localhost:8080/v1\n';
    }
    fs.writeFileSync(envPath, envContent);
    console.log('[bootstrap] STT_BASE_URL apontando para Docker Whisper.');
  }
}

run('npm', ['run', 'build', '-w', '@meeting-scribe/shared']);
run('npm', ['run', 'prisma:generate', '-w', '@meeting-scribe/backend']);
run('npm', ['run', 'prisma:migrate:deploy', '-w', '@meeting-scribe/backend']);

console.log('[bootstrap] Pronto. Use: npm run dev');
