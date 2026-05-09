/**
 * Deduplication utilities for snippet-vault.
 * Identifies duplicate or near-duplicate snippets based on content similarity.
 */

'use strict';

const { fuzzyScore } = require('./search');

/**
 * Normalize snippet code for comparison (strip whitespace, lowercase).
 * @param {string} code
 * @returns {string}
 */
function normalizeCode(code) {
  return code.replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Compute a similarity ratio between two code strings (0–1).
 * Uses character-level overlap heuristic.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function codeSimilarity(a, b) {
  const na = normalizeCode(a);
  const nb = normalizeCode(b);
  if (na === nb) return 1;
  if (!na || !nb) return 0;

  // Dice coefficient over bigrams
  const bigrams = (s) => {
    const set = new Map();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s.slice(i, i + 2);
      set.set(bg, (set.get(bg) || 0) + 1);
    }
    return set;
  };

  const ba = bigrams(na);
  const bb = bigrams(nb);
  let intersection = 0;
  for (const [bg, count] of ba) {
    if (bb.has(bg)) {
      intersection += Math.min(count, bb.get(bg));
    }
  }
  const total = (na.length - 1) + (nb.length - 1);
  return total === 0 ? 0 : (2 * intersection) / total;
}

/**
 * Find groups of duplicate/near-duplicate snippets.
 * @param {object[]} snippets
 * @param {number} threshold  similarity threshold (default 0.85)
 * @returns {{ group: object[] }[]}
 */
function findDuplicates(snippets, threshold = 0.85) {
  const visited = new Set();
  const groups = [];

  for (let i = 0; i < snippets.length; i++) {
    if (visited.has(i)) continue;
    const group = [snippets[i]];
    for (let j = i + 1; j < snippets.length; j++) {
      if (visited.has(j)) continue;
      const sim = codeSimilarity(snippets[i].code, snippets[j].code);
      if (sim >= threshold) {
        group.push(snippets[j]);
        visited.add(j);
      }
    }
    if (group.length > 1) {
      visited.add(i);
      groups.push({ group });
    }
  }

  return groups;
}

/**
 * From each duplicate group keep the snippet with the most tags / longest description.
 * @param {{ group: object[] }[]} groups
 * @returns {object[]} snippets to remove (all but the best in each group)
 */
function resolveDuplicates(groups) {
  const toRemove = [];
  for (const { group } of groups) {
    const sorted = [...group].sort((a, b) => {
      const tagDiff = (b.tags || []).length - (a.tags || []).length;
      if (tagDiff !== 0) return tagDiff;
      return (b.description || '').length - (a.description || '').length;
    });
    toRemove.push(...sorted.slice(1));
  }
  return toRemove;
}

module.exports = { normalizeCode, codeSimilarity, findDuplicates, resolveDuplicates };
