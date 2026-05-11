const { loadSnippets, saveSnippets } = require('../storage');
const { pinSnippet, unpinSnippet, getPinned } = require('../pin');

/**
 * Format a single pinned snippet for display.
 * @param {object} snippet
 * @returns {string}
 */
function formatPinned(snippet) {
  const tags = snippet.tags && snippet.tags.length ? `  [${snippet.tags.join(', ')}]` : '';
  return `  📌 ${snippet.id}  ${snippet.title}${tags}`;
}

/**
 * Handle the `pin` command.
 * Usage:
 *   pin <id>        — pin a snippet
 *   pin --unpin <id> — unpin a snippet
 *   pin --list       — list all pinned snippets
 */
async function cmdPin(args, options = {}) {
  const vaultPath = options.vaultPath;
  const snippets = await loadSnippets(vaultPath);

  // --list flag
  if (args.includes('--list')) {
    const pinned = getPinned(snippets);
    if (pinned.length === 0) {
      console.log('No pinned snippets.');
    } else {
      console.log(`Pinned snippets (${pinned.length}):`);
      pinned.forEach((s) => console.log(formatPinned(s)));
    }
    return;
  }

  // --unpin flag
  const unpinIndex = args.indexOf('--unpin');
  if (unpinIndex !== -1) {
    const id = args[unpinIndex + 1];
    if (!id) {
      console.error('Error: provide a snippet id to unpin.');
      process.exitCode = 1;
      return;
    }
    try {
      const updated = unpinSnippet(snippets, id);
      await saveSnippets(vaultPath, updated);
      console.log(`Unpinned snippet: ${id}`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
    }
    return;
  }

  // pin <id>
  const id = args[0];
  if (!id) {
    console.error('Usage: snippet-vault pin <id> | --unpin <id> | --list');
    process.exitCode = 1;
    return;
  }

  try {
    const updated = pinSnippet(snippets, id);
    await saveSnippets(vaultPath, updated);
    console.log(`Pinned snippet: ${id}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exitCode = 1;
  }
}

module.exports = { cmdPin, formatPinned };
