import { loadSnippets } from './storage.js';

/**
 * Serialize snippets to JSON format.
 * @param {object[]} snippets
 * @returns {string}
 */
export function toJSON(snippets) {
  return JSON.stringify(snippets, null, 2);
}

/**
 * Serialize snippets to Markdown format.
 * @param {object[]} snippets
 * @returns {string}
 */
export function toMarkdown(snippets) {
  if (snippets.length === 0) return '# Snippet Vault Export\n\n_No snippets found._\n';

  const lines = ['# Snippet Vault Export', ''];

  for (const snippet of snippets) {
    lines.push(`## ${snippet.title}`);
    if (snippet.description) lines.push(`> ${snippet.description}`);
    if (snippet.tags && snippet.tags.length > 0) {
      lines.push(`**Tags:** ${snippet.tags.map(t => `\`${t}\``).join(', ')}`);
    }
    lines.push('');
    const lang = snippet.language || '';
    lines.push(`\`\`\`${lang}`);
    lines.push(snippet.code);
    lines.push('```');
    lines.push(`_Added: ${new Date(snippet.createdAt).toLocaleDateString()}_`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Export all snippets (or a filtered subset) to a given format.
 * @param {'json'|'markdown'} format
 * @param {object[]} [snippets] - optional pre-filtered list
 * @returns {string}
 */
export function exportSnippets(format, snippets) {
  const data = snippets ?? loadSnippets();
  if (format === 'json') return toJSON(data);
  if (format === 'markdown') return toMarkdown(data);
  throw new Error(`Unsupported export format: "${format}". Use "json" or "markdown".`);
}
