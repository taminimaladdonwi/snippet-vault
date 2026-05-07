/**
 * Fuzzy search module for snippet-vault
 * Provides fuzzy matching against snippet titles, tags, and descriptions
 */

/**
 * Compute a simple fuzzy match score between a query and a target string.
 * Returns a score >= 0 (higher is better), or -1 if no match.
 */
function fuzzyScore(query, target) {
  if (!query || !target) return -1;
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  if (t.includes(q)) return 100 + (q.length / t.length) * 50;

  let qi = 0;
  let score = 0;
  let lastMatchIndex = -1;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += lastMatchIndex !== -1 ? (ti - lastMatchIndex === 1 ? 5 : 1) : 1;
      lastMatchIndex = ti;
      qi++;
    }
  }

  if (qi < q.length) return -1;
  return score;
}

/**
 * Score a snippet against a query across all searchable fields.
 * @param {object} snippet
 * @param {string} query
 * @returns {number} best score across fields, or -1 if no match
 */
function scoreSnippet(snippet, query) {
  const fields = [
    { value: snippet.title, weight: 3 },
    { value: snippet.description || '', weight: 2 },
    { value: (snippet.tags || []).join(' '), weight: 2 },
    { value: snippet.language || '', weight: 1 },
  ];

  let best = -1;
  for (const { value, weight } of fields) {
    const s = fuzzyScore(query, value);
    if (s >= 0) {
      best = Math.max(best, s * weight);
    }
  }
  return best;
}

/**
 * Search snippets using fuzzy matching.
 * @param {object[]} snippets - array of snippet objects
 * @param {string} query - search query
 * @param {object} [options]
 * @param {number} [options.limit=10] - max results to return
 * @returns {object[]} matched snippets sorted by relevance
 */
function searchSnippets(snippets, query, { limit = 10 } = {}) {
  if (!query || !query.trim()) return snippets.slice(0, limit);

  const results = snippets
    .map((snippet) => ({ snippet, score: scoreSnippet(snippet, query.trim()) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ snippet }) => snippet);

  return results;
}

module.exports = { fuzzyScore, scoreSnippet, searchSnippets };
