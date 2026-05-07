const fs = require('fs');
const path = require('path');
const { addSnippet, loadSnippets, saveSnippets } = require('./storage');
const { parseTags } = require('./tags');

/**
 * Parse snippets from a JSON string/buffer.
 * Returns an array of snippet objects or throws on invalid input.
 */
function fromJSON(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    throw new Error('Invalid JSON: ' + e.message);
  }
  if (!Array.isArray(data)) {
    throw new Error('Expected a JSON array of snippets');
  }
  return data.map((item, i) => {
    if (typeof item.title !== 'string' || !item.title.trim()) {
      throw new Error(`Snippet at index ${i} is missing a valid "title"`);
    }
    if (typeof item.code !== 'string' || !item.code.trim()) {
      throw new Error(`Snippet at index ${i} is missing valid "code"`);
    }
    return {
      title: item.title.trim(),
      code: item.code.trim(),
      description: typeof item.description === 'string' ? item.description.trim() : '',
      tags: parseTags(Array.isArray(item.tags) ? item.tags.join(',') : (item.tags || '')),
    };
  });
}

/**
 * Parse snippets from a Markdown string exported by toMarkdown().
 * Each snippet block starts with "## <title>" and contains fenced code.
 */
function fromMarkdown(raw) {
  const snippets = [];
  const blocks = raw.split(/^## /m).slice(1);
  for (const block of blocks) {
    const lines = block.split('\n');
    const title = lines[0].trim();
    const descMatch = block.match(/\*\*Description:\*\*\s*(.+)/);
    const tagsMatch = block.match(/\*\*Tags:\*\*\s*(.+)/);
    const codeMatch = block.match(/```[\w]*\n([\s\S]*?)```/);
    if (!title || !codeMatch) continue;
    snippets.push({
      title,
      code: codeMatch[1].trimEnd(),
      description: descMatch ? descMatch[1].trim() : '',
      tags: parseTags(tagsMatch ? tagsMatch[1].trim() : ''),
    });
  }
  return snippets;
}

/**
 * Import snippets from a file path, merging into the vault.
 * Returns { added, skipped } counts.
 */
function importSnippets(filePath, { overwrite = false } = {}) {
  const ext = path.extname(filePath).toLowerCase();
  const raw = fs.readFileSync(filePath, 'utf8');
  const incoming = ext === '.md' ? fromMarkdown(raw) : fromJSON(raw);

  const existing = loadSnippets();
  const existingTitles = new Set(existing.map(s => s.title.toLowerCase()));

  let added = 0;
  let skipped = 0;

  for (const snippet of incoming) {
    const key = snippet.title.toLowerCase();
    if (existingTitles.has(key) && !overwrite) {
      skipped++;
      continue;
    }
    if (existingTitles.has(key) && overwrite) {
      const idx = existing.findIndex(s => s.title.toLowerCase() === key);
      existing[idx] = { ...existing[idx], ...snippet };
    } else {
      existing.push({ id: Date.now() + added, ...snippet });
      existingTitles.add(key);
    }
    added++;
  }

  saveSnippets(existing);
  return { added, skipped };
}

module.exports = { fromJSON, fromMarkdown, importSnippets };
