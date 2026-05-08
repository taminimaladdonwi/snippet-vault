/**
 * Lint/validate snippets for common issues.
 */

const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 120;
const MAX_TAG_COUNT = 20;
const MAX_CODE_LENGTH = 50000;

/**
 * Validate a single snippet object.
 * Returns an array of issue strings (empty = valid).
 * @param {object} snippet
 * @returns {string[]}
 */
function lintSnippet(snippet) {
  const issues = [];

  if (!snippet || typeof snippet !== 'object') {
    return ['Snippet must be a non-null object'];
  }

  // Title checks
  if (!snippet.title || typeof snippet.title !== 'string') {
    issues.push('Missing or invalid title');
  } else {
    const t = snippet.title.trim();
    if (t.length < MIN_TITLE_LENGTH) {
      issues.push(`Title is too short (min ${MIN_TITLE_LENGTH} chars)`);
    }
    if (t.length > MAX_TITLE_LENGTH) {
      issues.push(`Title is too long (max ${MAX_TITLE_LENGTH} chars)`);
    }
  }

  // Code checks
  if (!snippet.code || typeof snippet.code !== 'string') {
    issues.push('Missing or invalid code');
  } else {
    if (snippet.code.trim().length === 0) {
      issues.push('Code must not be empty');
    }
    if (snippet.code.length > MAX_CODE_LENGTH) {
      issues.push(`Code exceeds maximum length (${MAX_CODE_LENGTH} chars)`);
    }
  }

  // Tags checks
  if (snippet.tags !== undefined) {
    if (!Array.isArray(snippet.tags)) {
      issues.push('Tags must be an array');
    } else {
      if (snippet.tags.length > MAX_TAG_COUNT) {
        issues.push(`Too many tags (max ${MAX_TAG_COUNT})`);
      }
      snippet.tags.forEach((tag, i) => {
        if (typeof tag !== 'string' || tag.trim().length === 0) {
          issues.push(`Tag at index ${i} is invalid`);
        }
      });
    }
  }

  // Language check (optional but must be string if present)
  if (snippet.language !== undefined && typeof snippet.language !== 'string') {
    issues.push('Language must be a string');
  }

  return issues;
}

/**
 * Lint all snippets in an array.
 * Returns a map of index -> issues array (only for snippets with issues).
 * @param {object[]} snippets
 * @returns {Map<number, string[]>}
 */
function lintAll(snippets) {
  const results = new Map();
  if (!Array.isArray(snippets)) return results;
  snippets.forEach((snippet, index) => {
    const issues = lintSnippet(snippet);
    if (issues.length > 0) {
      results.set(index, issues);
    }
  });
  return results;
}

module.exports = { lintSnippet, lintAll };
