import fs from 'node:fs';
import path from 'node:path';
import { searchSnippets } from '../search.js';
import { filterByTags } from '../tags.js';
import { loadSnippets } from '../storage.js';
import { exportSnippets } from '../export.js';

const FORMATS = ['json', 'markdown'];
const EXT_MAP = { json: '.json', markdown: '.md' };

/**
 * CLI command: export snippets to a file.
 *
 * Usage:
 *   snippet-vault export [--format json|markdown] [--output <file>]
 *                        [--query <text>] [--tags <t1,t2>]
 *
 * @param {string[]} args  - positional args (unused)
 * @param {object}  flags  - parsed flag map
 */
export async function cmdExport(args, flags = {}) {
  const format = (flags.format || flags.f || 'json').toLowerCase();

  if (!FORMATS.includes(format)) {
    console.error(`Error: unsupported format "${format}". Choose: ${FORMATS.join(', ')}.`);
    process.exit(1);
  }

  let snippets = loadSnippets();

  if (flags.tags || flags.t) {
    const rawTags = (flags.tags || flags.t).split(',');
    snippets = filterByTags(snippets, rawTags);
  }

  if (flags.query || flags.q) {
    snippets = searchSnippets(snippets, flags.query || flags.q);
  }

  const content = exportSnippets(format, snippets);

  const defaultName = `snippets${EXT_MAP[format]}`;
  const outputPath = flags.output || flags.o || defaultName;
  const resolved = path.resolve(outputPath);

  fs.writeFileSync(resolved, content, 'utf8');
  console.log(`Exported ${snippets.length} snippet(s) to ${resolved} (${format})`);
}
