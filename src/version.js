import { loadSnippets } from './storage.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Read the current package version from package.json
 */
export function getPackageVersion() {
  try {
    const pkgPath = join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return pkg.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/**
 * Collect vault metadata for the version/info output
 */
export async function getVaultInfo(vaultPath) {
  try {
    const snippets = await loadSnippets(vaultPath);
    const tagSet = new Set();
    for (const s of snippets) {
      (s.tags || []).forEach(t => tagSet.add(t));
    }
    return {
      snippetCount: snippets.length,
      tagCount: tagSet.size,
      vaultPath,
    };
  } catch {
    return { snippetCount: 0, tagCount: 0, vaultPath };
  }
}

/**
 * Format version and vault info as a human-readable string
 */
export function formatVersionInfo(version, vaultInfo) {
  const lines = [
    `snippet-vault v${version}`,
    `Vault : ${vaultInfo.vaultPath}`,
    `Snippets: ${vaultInfo.snippetCount}`,
    `Tags    : ${vaultInfo.tagCount}`,
  ];
  return lines.join('\n');
}
