import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const src = path.join(root, 'src', 'renderer', 'index.html');
const dest = path.join(root, 'dist', 'renderer', 'index.html');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
