const path = require('path');
const { importSnippets } = require('../import');

/**
 * CLI command: import snippets from a JSON or Markdown file.
 *
 * Usage:
 *   snippet-vault import <file> [--overwrite]
 */
function cmdImport(args) {
  const filePath = args.find(a => !a.startsWith('--'));
  const overwrite = args.includes('--overwrite');

  if (!filePath) {
    console.error('Usage: snippet-vault import <file.json|file.md> [--overwrite]');
    process.exit(1);
  }

  const resolved = path.resolve(process.cwd(), filePath);
  const ext = path.extname(resolved).toLowerCase();

  if (ext !== '.json' && ext !== '.md') {
    console.error('Error: Only .json and .md files are supported for import.');
    process.exit(1);
  }

  let result;
  try {
    result = importSnippets(resolved, { overwrite });
  } catch (err) {
    console.error('Import failed: ' + err.message);
    process.exit(1);
  }

  console.log(`Import complete: ${result.added} added, ${result.skipped} skipped.`);
  if (result.skipped > 0) {
    console.log('Tip: use --overwrite to replace existing snippets with the same title.');
  }
}

module.exports = { cmdImport };
