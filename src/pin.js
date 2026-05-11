/**
 * Pin/unpin snippets for quick access.
 * Pinned snippets are surfaced first in search results and listings.
 */

/**
 * Pin a snippet by id.
 * @param {object[]} snippets
 * @param {string} id
 * @returns {object[]}
 */
function pinSnippet(snippets, id) {
  const snippet = snippets.find((s) => s.id === id);
  if (!snippet) throw new Error(`Snippet not found: ${id}`);
  if (snippet.pinned) return snippets; // already pinned
  return snippets.map((s) => (s.id === id ? { ...s, pinned: true } : s));
}

/**
 * Unpin a snippet by id.
 * @param {object[]} snippets
 * @param {string} id
 * @returns {object[]}
 */
function unpinSnippet(snippets, id) {
  const snippet = snippets.find((s) => s.id === id);
  if (!snippet) throw new Error(`Snippet not found: ${id}`);
  if (!snippet.pinned) return snippets; // already unpinned
  return snippets.map((s) =>
    s.id === id ? { ...s, pinned: false } : s
  );
}

/**
 * Return all pinned snippets.
 * @param {object[]} snippets
 * @returns {object[]}
 */
function getPinned(snippets) {
  return snippets.filter((s) => s.pinned === true);
}

/**
 * Sort snippets so pinned ones appear first, preserving relative order.
 * @param {object[]} snippets
 * @returns {object[]}
 */
function sortWithPinnedFirst(snippets) {
  const pinned = snippets.filter((s) => s.pinned);
  const rest = snippets.filter((s) => !s.pinned);
  return [...pinned, ...rest];
}

module.exports = { pinSnippet, unpinSnippet, getPinned, sortWithPinnedFirst };
