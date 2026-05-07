/**
 * Tag management utilities for snippet-vault
 */

/**
 * Normalize a tag string: lowercase, trim, replace spaces with hyphens
 * @param {string} tag
 * @returns {string}
 */
function normalizeTag(tag) {
  return tag.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * Parse a comma-separated tag string into an array of normalized tags
 * @param {string} tagString
 * @returns {string[]}
 */
function parseTags(tagString) {
  if (!tagString || typeof tagString !== 'string') return [];
  return tagString
    .split(',')
    .map(normalizeTag)
    .filter(Boolean);
}

/**
 * Get all unique tags across all snippets
 * @param {object[]} snippets
 * @returns {string[]}
 */
function getAllTags(snippets) {
  const tagSet = new Set();
  for (const snippet of snippets) {
    if (Array.isArray(snippet.tags)) {
      snippet.tags.forEach(tag => tagSet.add(tag));
    }
  }
  return Array.from(tagSet).sort();
}

/**
 * Filter snippets that match ALL of the provided tags
 * @param {object[]} snippets
 * @param {string[]} tags
 * @returns {object[]}
 */
function filterByTags(snippets, tags) {
  if (!tags || tags.length === 0) return snippets;
  const normalized = tags.map(normalizeTag);
  return snippets.filter(snippet =>
    Array.isArray(snippet.tags) &&
    normalized.every(tag => snippet.tags.includes(tag))
  );
}

/**
 * Add tags to a snippet, avoiding duplicates
 * @param {object} snippet
 * @param {string[]} newTags
 * @returns {object}
 */
function addTagsToSnippet(snippet, newTags) {
  const existing = Array.isArray(snippet.tags) ? snippet.tags : [];
  const normalized = newTags.map(normalizeTag).filter(Boolean);
  const merged = Array.from(new Set([...existing, ...normalized]));
  return { ...snippet, tags: merged };
}

/**
 * Remove a tag from a snippet
 * @param {object} snippet
 * @param {string} tag
 * @returns {object}
 */
function removeTagFromSnippet(snippet, tag) {
  const normalized = normalizeTag(tag);
  const tags = Array.isArray(snippet.tags)
    ? snippet.tags.filter(t => t !== normalized)
    : [];
  return { ...snippet, tags };
}

module.exports = {
  normalizeTag,
  parseTags,
  getAllTags,
  filterByTags,
  addTagsToSnippet,
  removeTagFromSnippet,
};
