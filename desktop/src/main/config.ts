import path from 'path';
import fs from 'fs';

export interface DesktopConfig {
  apiUrl: string;
}

function loadDotEnv(): void {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

export function readConfig(): DesktopConfig {
  loadDotEnv();
  return {
    apiUrl:
      process.env.MEETING_SCRIBE_API_URL?.replace(/\/$/, '') ??
      'http://localhost:3001',
  };
}
