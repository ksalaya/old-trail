import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const TARGETS = ['index.html', 'src', 'public', 'electron', 'dist'];
const SKIP_DIRS = new Set(['node_modules', '.git']);
const SKIP_FILES = new Set(['manifest.webmanifest']);
const PATTERN = /https?:\/\//i;

const findings = [];

async function walk(entry) {
  const full = path.join(ROOT, entry);
  let stats;
  try {
    stats = await readdir(full, { withFileTypes: true });
  } catch {
    return;
  }
  for (const dirent of stats) {
    if (SKIP_DIRS.has(dirent.name)) continue;
    const rel = path.join(entry, dirent.name);
    if (dirent.isDirectory()) {
      await walk(rel);
    } else if (!SKIP_FILES.has(dirent.name)) {
      const filePath = path.join(ROOT, rel);
      const contentRaw = await readFile(filePath, 'utf8').catch(() => null);
      const content = contentRaw
        ? contentRaw.replace(/http:\\/\\/www\\.w3\\.org\\/2000\\/svg/g, '')
        : null;
      if (!content) continue;
      if (PATTERN.test(content)) {
        findings.push(rel);
      }
    }
  }
}

for (const target of TARGETS) {
  await walk(target);
}

if (findings.length) {
  console.error('Offline audit failed. http(s) references found in:');
  findings.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log('Offline audit passed.');
