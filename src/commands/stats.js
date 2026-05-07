#!/usr/bin/env node
/**
 * `snippet-vault stats` command
 * Prints vault statistics to stdout.
 */

const { loadSnippets } = require('../storage');
const { computeStats, formatStats } = require('../stats');

async function cmdStats(argv) {
  const snippets = await loadSnippets();
  const stats = computeStats(snippets);

  if (argv.includes('--json')) {
    // Machine-readable output
    const { byTag, ...rest } = stats; // byTag can be large; include only on request
    const output = argv.includes('--full') ? stats : rest;
    process.stdout.write(JSON.stringify(output, null, 2) + '\n');
    return;
  }

  console.log(formatStats(stats));
}

module.exports = { cmdStats };
