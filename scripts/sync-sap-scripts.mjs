#!/usr/bin/env node
/**
 * Sincroniza copias vendorizadas de Skills_SAP (submódulo en vendor/skills-sap)
 * hacia src/lib/sap-scripts/vendor/, para que Vite pueda importarlas con `?raw`
 * (Astro/Vite no permite importar libremente fuera de la raíz del proyecto,
 * y el submódulo no viaja al build de GitHub Pages salvo checkout explícito).
 *
 * Uso: npm run sync:sap-scripts
 *
 * Para actualizar a una versión más nueva de Skills_SAP:
 *   git submodule update --remote vendor/skills-sap
 *   npm run sync:sap-scripts
 *   git add vendor/skills-sap src/lib/sap-scripts/vendor
 *   git commit
 */
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SUBMODULE_DIR = join(ROOT, 'vendor', 'skills-sap');
const DEST_ROOT = join(ROOT, 'src', 'lib', 'sap-scripts', 'vendor');

// Cada entrada vendoriza un archivo fuente del submódulo hacia src/lib/sap-scripts/vendor.
const MANIFEST = [
  {
    source: 'scripts/modelo_base/config.py',
    dest: 'modelo_base/config.py',
  },
  {
    source: 'scripts/modelo_base/backend_modelo_base.py',
    dest: 'modelo_base/backend_modelo_base.py',
  },
];

function commitHash() {
  return execSync('git rev-parse HEAD', { cwd: SUBMODULE_DIR }).toString().trim();
}

function header(sourcePath, commit) {
  return (
    '# ══════════════════════════════════════════════════════════════════════\n' +
    '# ARCHIVO VENDORIZADO — NO EDITAR DIRECTAMENTE\n' +
    `# Fuente: github.com/fcocarrascob/Skills_SAP @ ${commit}\n` +
    `#         ${sourcePath}\n` +
    '# Para actualizar: git submodule update --remote vendor/skills-sap\n' +
    '#                  && npm run sync:sap-scripts\n' +
    '# ══════════════════════════════════════════════════════════════════════\n\n'
  );
}

const commit = commitHash();

for (const { source, dest } of MANIFEST) {
  const srcPath = join(SUBMODULE_DIR, source);
  const destPath = join(DEST_ROOT, dest);
  const content = readFileSync(srcPath, 'utf-8');

  mkdirSync(dirname(destPath), { recursive: true });
  writeFileSync(destPath, header(source, commit) + content, 'utf-8');
  console.log(`Vendorizado: ${source} -> src/lib/sap-scripts/vendor/${dest}`);
}

console.log(`\nOK — sincronizado desde commit ${commit}.`);
