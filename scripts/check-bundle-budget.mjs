// Presupuesto de 500 KB en la primera carga del sitio público (CLAUDE.md, no negociable).
// Mide el JS compartido por todas las páginas (gzip, como reporta Next) — las
// dependencias pesadas de una sola ruta (ej. MapLibre en /impacto) van aparte
// vía next/dynamic y no cuentan para este piso común.
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const BUDGET_BYTES = 500 * 1024;
const NEXT_DIR = path.resolve('.next');

const manifest = JSON.parse(readFileSync(path.join(NEXT_DIR, 'build-manifest.json'), 'utf-8'));
const files = [...manifest.rootMainFiles, ...manifest.polyfillFiles];

let total = 0;
for (const file of files) {
  const raw = readFileSync(path.join(NEXT_DIR, file));
  const size = gzipSync(raw, { level: 9 }).length;
  total += size;
}

const totalKB = (total / 1024).toFixed(1);
const budgetKB = (BUDGET_BYTES / 1024).toFixed(0);

if (total > BUDGET_BYTES) {
  console.error(`✗ Presupuesto de bundle excedido: ${totalKB} KB (gzip) > ${budgetKB} KB`);
  process.exit(1);
}

console.log(`✓ Presupuesto de bundle: ${totalKB} KB (gzip) / ${budgetKB} KB`);
