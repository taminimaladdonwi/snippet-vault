'use strict';

const { loadSnippets, saveSnippets, removeSnippet } = require('../storage');
const { findDuplicates, resolveDuplicates } = require('../dedupe');

/**
 * Format a duplicate group for display.
 * @param {{ group: object[] }} param0
 * @param {number} index
 * @returns {string}
 */
function formatGroup({ group }, index) {
  const lines = [`Duplicate group #${index + 1} (${group.length} snippets):`];
  for (const s of group) {
    const tags = s.tags && s.tags.length ? `[${s.tags.join(', ')}]` : '[no tags]';
    lines.push(`  • ${s.id}  "${s.title}"  ${tags}`);
    lines.push(`    ${s.code.slice(0, 80).replace(/\n/g, ' ')}${s.code.length > 80 ? '…' : ''}`);
  }
  return lines.join('\n');
}

/**
 * dedupe command — find and optionally remove duplicate snippets.
 * @param {string[]} args  CLI args: [--auto] [--dry-run]
 */
async function cmdDedupe(args = []) {
  const autoFix = args.includes('--auto');
  const dryRun = args.includes('--dry-run');
  const threshold = 0.85;

  const snippets = loadSnippets();

  if (snippets.length === 0) {
    console.log('Vault is empty — nothing to deduplicate.');
    return;
  }

  const groups = findDuplicates(snippets, threshold);

  if (groups.length === 0) {
    console.log(`No duplicates found among ${snippets.length} snippet(s).`);
    return;
  }

  console.log(`Found ${groups.length} duplicate group(s):\n`);
  groups.forEach((g, i) => console.log(formatGroup(g, i) + '\n'));

  if (!autoFix && !dryRun) {
    console.log('Run with --auto to automatically remove lower-quality duplicates.');
    console.log('Run with --dry-run to preview which snippets would be removed.');
    return;
  }

  const toRemove = resolveDuplicates(groups);

  if (dryRun) {
    console.log('Dry-run: the following snippets would be removed:');
    for (const s of toRemove) {
      console.log(`  - ${s.id}  "${s.title}"`);
    }
    return;
  }

  // --auto: actually remove
  let removed = 0;
  for (const s of toRemove) {
    const updated = removeSnippet(s.id);
    if (updated !== null) removed++;
  }

  console.log(`Removed ${removed} duplicate snippet(s).`);
}

module.exports = { formatGroup, cmdDedupe };
