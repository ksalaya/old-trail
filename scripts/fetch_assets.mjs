import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'scripts', 'assets.manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const baseUrl = manifest.baseUrl;
const files = manifest.files || [];
const outputDir = path.join(root, 'public', 'assets', 'images');

await mkdir(outputDir, { recursive: true });

const fetchFile = async (filename) => {
  const target = path.join(outputDir, filename);
  try {
    await stat(target);
    return { filename, status: 'skipped' };
  } catch {
    // continue
  }
  const url = baseUrl + filename;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  await writeFile(target, Buffer.from(arrayBuffer));
  return { filename, status: 'downloaded' };
};

const results = [];
for (const file of files) {
  results.push(await fetchFile(file));
}

const summary = results.reduce(
  (acc, item) => {
    acc[item.status] += 1;
    return acc;
  },
  { downloaded: 0, skipped: 0 }
);

console.log(`Assets downloaded: ${summary.downloaded}, skipped: ${summary.skipped}`);
