#!/usr/bin/env node
/**
 * CLI command: lint
 * Checks all stored snippets for validation issues and reports them.
 */

const { loadSnippets } = require('../storage');
const { lintAll } = require('../lint');

/**
 * Format a single lint result for console output.
 * @param {number} index
 * @param {object} snippet
 * @param {string[]} issues
 * @returns {string}
 */
function formatLintResult(index, snippet, issues) {
  const title = snippet && snippet.title ? snippet.title : `<snippet #${index}>`;
  const header = `  [${index}] "${title}"`;
  const lines = issues.map(issue => `       - ${issue}`);
  return [header, ...lines].join('\n');
}

/**
 * Format a summary line for the lint run.
 * @param {number} total - total number of snippets checked
 * @param {number} invalidCount - number of snippets with issues
 * @returns {string}
 */
function formatSummary(total, invalidCount) {
  const validCount = total - invalidCount;
  return `  Summary: ${validCount} passed, ${invalidCount} failed (${total} total)`;
}

/**
 * Main lint command handler.
 * @param {string[]} _args - unused
 * @param {object} options
 * @param {string} [options.vaultPath] - custom vault path
 * @param {function} [options.log] - output function (defaults to console.log)
 */
async function cmdLint(_args = [], options = {}) {
  const log = options.log || console.log;
  const snippets = await loadSnippets(options.vaultPath);

  if (snippets.length === 0) {
    log('No snippets found in vault.');
    return { valid: 0, invalid: 0 };
  }

  const results = lintAll(snippets);

  if (results.size === 0) {
    log(`✔  All ${snippets.length} snippet(s) passed validation.`);
    return { valid: snippets.length, invalid: 0 };
  }

  log(`✖  Found issues in ${results.size} of ${snippets.length} snippet(s):\n`);
  for (const [index, issues] of results) {
    log(formatLintResult(index, snippets[index], issues));
  }
  log('');
  log(formatSummary(snippets.length, results.size));

  return { valid: snippets.length - results.size, invalid: results.size };
}

module.exports = { cmdLint, formatLintResult, formatSummary };
